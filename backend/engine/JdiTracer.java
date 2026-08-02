/*
 * CodeViz JDI Tracer (Java)
 * =========================
 * Launches the user's compiled `Main` class under the Java Debug Interface
 * (com.sun.jdi, ships with the JDK) and emits one JSON step per source line,
 * matching the exact shape produced by the Python / GDB tracers:
 *
 *     {"line", "variables", "call_stack", "stdout", "hits"}
 *
 * - Real debugger => accurate call stack, locals, recursion.
 * - Arrays are emitted as real JSON arrays so the frontend Canvas can render
 *   them (not opaque toString() blobs).
 * - The traced program's own stdout/stderr is forwarded as {"stdout": ...}
 *   steps on dedicated reader threads, keeping the JSON trace clean.
 *
 * Compile:  javac -g Main.java  &&  javac -cp <tools> JdiTracer.java
 * Run:      java JdiTracer          (launches "Main" itself)
 */

import com.sun.jdi.*;
import com.sun.jdi.connect.*;
import com.sun.jdi.event.*;
import com.sun.jdi.request.*;

import java.util.*;

public class JdiTracer {

    static final int MAX_STEPS = 4000;
    static final Object OUT_LOCK = new Object();
    static final Map<Integer, Integer> lineHits = new HashMap<>();
    static int stepCount = 0;

    // ---- Minimal JSON helpers (no external deps) --------------------------

    static String esc(String s) {
        if (s == null) return "";
        StringBuilder b = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':  b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n");  break;
                case '\r': b.append("\\r");  break;
                case '\t': b.append("\\t");  break;
                default:
                    if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
                    else b.append(c);
            }
        }
        return b.toString();
    }

    static void emit(String json) {
        synchronized (OUT_LOCK) {
            System.out.println(json);
            System.out.flush();
        }
    }

    static void emitStdout(String text) {
        emit("{\"line\":0,\"variables\":{},\"call_stack\":[],\"stdout\":\"" + esc(text) + "\\n\"}");
    }

    // ---- Value -> JSON ----------------------------------------------------

    static String valueToJson(Value v, int depth) {
        if (v == null) return "null";
        if (depth > 4) return "\"" + esc(v.toString()) + "\"";
        try {
            if (v instanceof IntegerValue) return Integer.toString(((IntegerValue) v).value());
            if (v instanceof LongValue)    return Long.toString(((LongValue) v).value());
            if (v instanceof ShortValue)   return Short.toString(((ShortValue) v).value());
            if (v instanceof ByteValue)    return Byte.toString(((ByteValue) v).value());
            if (v instanceof DoubleValue)  return Double.toString(((DoubleValue) v).value());
            if (v instanceof FloatValue)   return Float.toString(((FloatValue) v).value());
            if (v instanceof BooleanValue) return Boolean.toString(((BooleanValue) v).value());
            if (v instanceof CharValue)    return "\"" + esc(String.valueOf(((CharValue) v).value())) + "\"";
            if (v instanceof StringReference) return "\"" + esc(((StringReference) v).value()) + "\"";

            if (v instanceof ArrayReference) {
                ArrayReference arr = (ArrayReference) v;
                int n = Math.min(arr.length(), 200);
                StringBuilder b = new StringBuilder("[");
                for (int i = 0; i < n; i++) {
                    if (i > 0) b.append(",");
                    b.append(valueToJson(arr.getValue(i), depth + 1));
                }
                b.append("]");
                return b.toString();
            }

            if (v instanceof ObjectReference) {
                ObjectReference obj = (ObjectReference) v;
                String tn = obj.referenceType().name();
                // Common List types -> JSON array via reflection-free field read
                if (tn.startsWith("java.util.ArrayList")) {
                    String arr = tryReadArrayListElements(obj, depth);
                    if (arr != null) return arr;
                }
                // Fallback: string form
                return "\"" + esc(obj.type().name() + "@" + obj.uniqueID()) + "\"";
            }

            return "\"" + esc(v.toString()) + "\"";
        } catch (Exception e) {
            return "\"<unreadable>\"";
        }
    }

    static String tryReadArrayListElements(ObjectReference obj, int depth) {
        try {
            ReferenceType rt = obj.referenceType();
            Field elementData = null, sizeField = null;
            for (Field f : rt.allFields()) {
                if (f.name().equals("elementData")) elementData = f;
                if (f.name().equals("size")) sizeField = f;
            }
            if (elementData == null || sizeField == null) return null;
            Value ed = obj.getValue(elementData);
            int size = ((IntegerValue) obj.getValue(sizeField)).value();
            if (!(ed instanceof ArrayReference)) return null;
            ArrayReference arr = (ArrayReference) ed;
            int n = Math.min(size, 200);
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < n; i++) {
                if (i > 0) b.append(",");
                b.append(valueToJson(arr.getValue(i), depth + 1));
            }
            b.append("]");
            return b.toString();
        } catch (Exception e) {
            return null;
        }
    }

    static boolean isUserType(ReferenceType rt) {
        String n = rt.name();
        return n.equals("Main") || n.startsWith("Main$") || n.startsWith("Main.");
    }

    static String frameVarsJson(StackFrame frame) {
        StringBuilder b = new StringBuilder("{");
        try {
            List<LocalVariable> vars = frame.visibleVariables();
            Map<LocalVariable, Value> values = frame.getValues(vars);
            boolean first = true;
            for (LocalVariable lv : vars) {
                if (!first) b.append(",");
                first = false;
                b.append("\"").append(esc(lv.name())).append("\":")
                 .append(valueToJson(values.get(lv), 0));
            }
        } catch (AbsentInformationException e) {
            // compiled without -g for this frame; skip
        } catch (Exception e) {
            // ignore
        }
        b.append("}");
        return b.toString();
    }

    static void handleStep(StepEvent ev) {
        try {
            Location loc = ev.location();
            if (!isUserType(loc.declaringType())) return;
            int line = loc.lineNumber();
            if (line < 0) return;

            lineHits.merge(line, 1, Integer::sum);

            ThreadReference thread = ev.thread();
            List<StackFrame> frames = thread.frames();

            // Build call stack (bottom = main, top = innermost), user frames only
            List<String> stackEntries = new ArrayList<>();
            String topVars = "{}";
            for (StackFrame f : frames) {
                Location fl = f.location();
                if (!isUserType(fl.declaringType())) continue;
                String vars = frameVarsJson(f);
                String entry = "{\"function\":\"" + esc(fl.method().name())
                        + "\",\"line\":" + fl.lineNumber()
                        + ",\"variables\":" + vars + "}";
                stackEntries.add(entry);
            }
            // frames() is top-first; reverse for bottom-first
            Collections.reverse(stackEntries);
            if (!stackEntries.isEmpty()) {
                // top frame vars = last element's variables — re-extract from frame 0
                for (StackFrame f : frames) {
                    if (isUserType(f.location().declaringType())) {
                        topVars = frameVarsJson(f);
                        break;
                    }
                }
            }

            StringBuilder cs = new StringBuilder("[");
            for (int i = 0; i < stackEntries.size(); i++) {
                if (i > 0) cs.append(",");
                cs.append(stackEntries.get(i));
            }
            cs.append("]");

            emit("{\"line\":" + line
                    + ",\"variables\":" + topVars
                    + ",\"call_stack\":" + cs.toString()
                    + ",\"stdout\":\"\",\"hits\":" + lineHits.get(line) + "}");
        } catch (IncompatibleThreadStateException | RuntimeException e) {
            // ignore this step
        }
    }

    // ---- Launch + event loop ---------------------------------------------

    public static void main(String[] args) throws Exception {
        VirtualMachineManager vmm = Bootstrap.virtualMachineManager();
        LaunchingConnector connector = vmm.defaultConnector();

        Map<String, Connector.Argument> cargs = connector.defaultArguments();
        cargs.get("main").setValue("Main");
        cargs.get("options").setValue("-cp /home/runner/code");
        Connector.Argument suspend = cargs.get("suspend");
        if (suspend != null) suspend.setValue("true");

        VirtualMachine vm = connector.launch(cargs);
        final Process proc = vm.process();

        // Forward the traced program's stdout / stderr as stdout steps
        Thread outT = pipe(proc.getInputStream());
        Thread errT = pipe(proc.getErrorStream());
        outT.start();
        errT.start();

        EventRequestManager erm = vm.eventRequestManager();
        ClassPrepareRequest cpr = erm.createClassPrepareRequest();
        cpr.addClassFilter("Main");
        cpr.setSuspendPolicy(EventRequest.SUSPEND_ALL);
        cpr.enable();

        EventQueue queue = vm.eventQueue();
        boolean running = true;
        while (running) {
            EventSet set;
            try {
                set = queue.remove();
            } catch (VMDisconnectedException e) {
                break;
            }
            for (Event event : set) {
                if (event instanceof ClassPrepareEvent) {
                    ClassPrepareEvent cpe = (ClassPrepareEvent) event;
                    if (isUserType(cpe.referenceType())) {
                        StepRequest sr = erm.createStepRequest(
                                cpe.thread(),
                                StepRequest.STEP_LINE,
                                StepRequest.STEP_INTO);
                        sr.addClassFilter("Main*");
                        sr.setSuspendPolicy(EventRequest.SUSPEND_ALL);
                        sr.enable();
                    }
                } else if (event instanceof StepEvent) {
                    if (stepCount++ < MAX_STEPS) {
                        handleStep((StepEvent) event);
                    } else {
                        running = false;
                    }
                } else if (event instanceof VMDeathEvent
                        || event instanceof VMDisconnectEvent) {
                    running = false;
                }
            }
            if (running) {
                set.resume();
            }
        }

        try { proc.waitFor(); } catch (InterruptedException ignore) {}
        try { outT.join(500); errT.join(500); } catch (InterruptedException ignore) {}
    }

    static Thread pipe(final java.io.InputStream in) {
        return new Thread(() -> {
            try (java.io.BufferedReader r =
                         new java.io.BufferedReader(new java.io.InputStreamReader(in))) {
                String line;
                while ((line = r.readLine()) != null) {
                    emitStdout(line);
                }
            } catch (Exception ignore) {}
        });
    }
}
