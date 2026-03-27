const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// 1. SETUP PATHS
const sourcePath = process.argv[2];
if (!sourcePath) process.exit(1);

const dir = path.dirname(sourcePath);
const className = 'Main_' + Math.random().toString(36).substring(7);
const javaFilePath = path.join(dir, `${className}.java`);

const userCode = fs.readFileSync(sourcePath, 'utf-8');
const lines = userCode.split('\n');
const instrumentedLines = [];

// 2. HEADER
// Key improvements vs original:
//   - Redirects System.out to a ByteArrayOutputStream so user print output is captured
//   - Writes trace JSON to System.err (separate channel)
//   - Output format matches Python tracer: call_stack + stdout field
//   - Streams one JSON object per line (not batched at end)
//   - Handles: int[], double[], ArrayList, LinkedList, HashMap, primitive types
const header = `
import java.util.*;
import java.io.*;

public class ${className} {

    // ── STDOUT CAPTURE ────────────────────────────────────────────────────
    // Redirect System.out so user println() calls are captured per step
    static ByteArrayOutputStream _outBuf = new ByteArrayOutputStream();
    static PrintStream _origOut = System.out;

    static String flushCaptured() {
        String val = _outBuf.toString();
        _outBuf.reset();
        return val;
    }

    // ── TRACER ────────────────────────────────────────────────────────────
    static class Trace {

        static String escapeJson(String val) {
            if (val == null) return "null";
            return val
                .replace("\\\\", "\\\\\\\\")
                .replace("\\"",  "\\\\\\"")
                .replace("\\n",  "\\\\n")
                .replace("\\r",  "\\\\r")
                .replace("\\t",  "\\\\t");
        }

        // Serialize any object to a display string
        static String serialize(Object val) {
            if (val == null) return "null";
            if (val instanceof int[])     return Arrays.toString((int[])val);
            if (val instanceof double[])  return Arrays.toString((double[])val);
            if (val instanceof float[])   return Arrays.toString((float[])val);
            if (val instanceof long[])    return Arrays.toString((long[])val);
            if (val instanceof boolean[]) return Arrays.toString((boolean[])val);
            if (val instanceof char[])    return Arrays.toString((char[])val);
            if (val instanceof Object[])  return Arrays.deepToString((Object[])val);
            if (val instanceof Collection) return val.toString();
            if (val instanceof Map)        return val.toString();
            return String.valueOf(val);
        }

        // Build the variables JSON object string
        static String varsJson(Map<String, Object> scope) {
            StringBuilder sb = new StringBuilder("{");
            int i = 0;
            for (String k : scope.keySet()) {
                sb.append("\\"").append(k).append("\\":\\"")
                  .append(escapeJson(serialize(scope.get(k)))).append("\\"");
                if (i++ < scope.size() - 1) sb.append(",");
            }
            sb.append("}");
            return sb.toString();
        }

        // Emit one trace step as a JSON line to System.err
        // Format matches Python tracer: {line, variables, call_stack, stdout}
        static void log(int line, String funcName, Map<String, Object> scope) {
            String captured = escapeJson(flushCaptured());
            String vj = varsJson(scope);

            System.err.println(
                "{\\"line\\":" + line +
                ",\\"variables\\":" + vj +
                ",\\"call_stack\\":[{\\"function\\":\\"" + funcName + "\\"" +
                ",\\"line\\":" + line +
                ",\\"variables\\":" + vj + "}]" +
                ",\\"stdout\\":\\"" + captured + "\\"}"
            );
            System.err.flush();
        }
    }

    public static void main(String[] args) {
        // Redirect System.out to capture user print calls
        System.setOut(new PrintStream(_outBuf));

        Map<String, Object> _scope = new LinkedHashMap<>();
        try {
`;

// 3. PARSE & INSTRUMENT USER CODE
// Detects variable declarations and assignments, injects scope update + log calls
// Supports: int, double, String, boolean, float, char, long,
//           int[], double[], ArrayList, LinkedList, HashMap
const declRegex = /^\s*(?:(?:ArrayList|LinkedList|HashMap|List|Map)\s*<[^>]+>|(?:int|double|String|boolean|float|char|long)(?:\[\])*)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[=;({]/;
const assignRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\[.*?\]\s*)?=[^=]/;

let pendingVars = [];

lines.forEach((line, idx) => {
    const ln = idx + 1;
    const trimmed = line.trim();

    // Special case: break/continue — log BEFORE the line so the step is visible
    if (trimmed.startsWith('break') || trimmed.startsWith('continue')) {
        instrumentedLines.push(`Trace.log(${ln}, "main", _scope);`);
        instrumentedLines.push(line);
        return;
    }

    // Push original line first
    instrumentedLines.push(line);

    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    // Detect variable declarations
    if (!trimmed.startsWith('//')) {
        const declMatch = trimmed.match(declRegex);
        if (declMatch) pendingVars.push(declMatch[1]);
        else {
            const asgn = trimmed.match(assignRegex);
            if (asgn) pendingVars.push(asgn[1]);
        }
    }

    const isStatementEnd = trimmed.endsWith(';');
    const isBlockStart = trimmed.endsWith('{');

    const isControl = /^(for|while|if|else|do|try|switch|catch|finally)\b/.test(trimmed);
    const isDataBlock = trimmed.includes('=') && trimmed.endsWith('{') && !isControl;

    const isIgnored =
        trimmed.startsWith('return') ||
        trimmed.startsWith('package') ||
        trimmed.startsWith('import') ||
        trimmed.startsWith('public ') ||
        trimmed.startsWith('private ') ||
        trimmed.startsWith('protected ') ||
        trimmed.startsWith('class ') ||
        trimmed.startsWith('interface ') ||
        trimmed.startsWith('try') ||
        trimmed.startsWith('catch') ||
        trimmed.startsWith('finally') ||
        trimmed.includes('void main');

    if ((isStatementEnd || (isBlockStart && !isDataBlock)) && !isIgnored) {
        // Flush detected variables into _scope
        while (pendingVars.length > 0) {
            const v = pendingVars.shift();
            // Wrap in try-catch in case the variable isn't in scope yet
            instrumentedLines.push(
                `try { _scope.put("${v}", ${v}); } catch(Exception _e) {}`
            );
        }
        instrumentedLines.push(`Trace.log(${ln}, "main", _scope);`);
    }
});

const footer = `
        } catch (Exception e) {
            String _errMsg = "Runtime Error: " + e.getMessage();
            System.err.println(
                "{\\"line\\":0,\\"variables\\":{},\\"call_stack\\":[]" +
                ",\\"stdout\\":\\"\\",\\"error\\":true,\\"errorMessage\\":\\"" +
                Trace.escapeJson(_errMsg) + "\\"}"
            );
            System.err.flush();
        } finally {
            // Flush any remaining captured output
            String _final = flushCaptured();
            if (!_final.isEmpty()) {
                System.err.println(
                    "{\\"line\\":0,\\"variables\\":{},\\"call_stack\\":[]" +
                    ",\\"stdout\\":\\"" + Trace.escapeJson(_final) + "\\"}"
                );
                System.err.flush();
            }
            System.setOut(_origOut);
        }
    }
}
`;

// 4. WRITE, COMPILE, RUN
fs.writeFileSync(javaFilePath, header + instrumentedLines.join('\n') + footer);

let classFile = null;

try {
    // Compile
    const compile = spawnSync('javac', ['-Xlint:none', javaFilePath], {
        timeout: 15000,
        encoding: 'utf-8',
    });

    if (compile.status !== 0) {
        process.stdout.write(
            JSON.stringify({
                line: 0, variables: {}, call_stack: [], stdout: '',
                error: true,
                errorMessage: 'Java Compilation Error:\n' + (compile.stderr || '')
            }) + '\n'
        );
        return;
    }

    classFile = path.join(dir, `${className}.class`);

    // Run with 5-second timeout
    const run = spawnSync('java', ['-cp', dir, className], {
        timeout: 5000,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
    });

    if (run.error && run.error.code === 'ETIMEDOUT') {
        process.stdout.write(
            JSON.stringify({
                line: 0, variables: {}, call_stack: [],
                stdout: 'Execution timed out (5s limit)', error: true
            }) + '\n'
        );
        return;
    }

    // Each line of stderr is one trace step — forward to stdout for the controller
    const traceLines = (run.stderr || '').trim().split('\n').filter(Boolean);
    traceLines.forEach(l => process.stdout.write(l + '\n'));

    // Runtime crash with no trace output
    if (run.status !== 0 && traceLines.length === 0) {
        process.stdout.write(
            JSON.stringify({
                line: 0, variables: {}, call_stack: [],
                stdout: 'Runtime error: ' + (run.stderr || ''), error: true
            }) + '\n'
        );
    }

} catch (e) {
    process.stdout.write(
        JSON.stringify({
            line: 0, variables: {}, call_stack: [],
            stdout: '', error: true, errorMessage: e.message
        }) + '\n'
    );
} finally {
    try { if (fs.existsSync(javaFilePath)) fs.unlinkSync(javaFilePath); } catch (_) { }
    try { if (classFile && fs.existsSync(classFile)) fs.unlinkSync(classFile); } catch (_) { }
    // Clean up any extra .class files (inner classes etc.)
    try {
        fs.readdirSync(dir)
            .filter(f => f.startsWith(className) && f.endsWith('.class'))
            .forEach(f => fs.unlinkSync(path.join(dir, f)));
    } catch (_) { }
}