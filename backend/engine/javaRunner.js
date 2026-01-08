const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// 1. SETUP PATHS
const sourcePath = process.argv[2]; 
if (!sourcePath) process.exit(1);

const dir = path.dirname(sourcePath);
const className = "Main_" + Math.random().toString(36).substring(7);
const javaFilePath = path.join(dir, `${className}.java`);

const userCode = fs.readFileSync(sourcePath, 'utf-8');
const lines = userCode.split('\n');
const instrumentedLines = [];

// 2. HEADER
const header = `
import java.util.*;

public class ${className} {
    static class Trace {
        static List<Map<String, Object>> history = new ArrayList<>();
        
        private static String escape(String val) {
            if (val == null) return "null";
            return val.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"");
        }

        public static void log(int line, Map<String, Object> scope) {
            Map<String, String> safeVars = new HashMap<>();
            for (String key : scope.keySet()) {
                Object val = scope.get(key);
                
                if (val == null) safeVars.put(key, "null");
                else if (val instanceof int[]) safeVars.put(key, Arrays.toString((int[])val));
                else if (val instanceof double[]) safeVars.put(key, Arrays.toString((double[])val));
                else if (val instanceof boolean[]) safeVars.put(key, Arrays.toString((boolean[])val));
                else if (val instanceof char[]) safeVars.put(key, Arrays.toString((char[])val));
                else if (val instanceof Object[]) safeVars.put(key, Arrays.deepToString((Object[])val));
                else safeVars.put(key, String.valueOf(val));
            }

            Map<String, Object> frame = new HashMap<>();
            frame.put("line", line);
            
            Map<String, Object> stackFrame = new HashMap<>();
            stackFrame.put("name", "main");
            stackFrame.put("variables", safeVars);
            
            List<Map<String, Object>> stack = new ArrayList<>();
            stack.add(stackFrame);
            frame.put("stack", stack);
            
            history.add(frame);
        }
        
        public static void printJson() {
            StringBuilder sb = new StringBuilder();
            sb.append("{ \\"trace\\": [");
            for (int i = 0; i < history.size(); i++) {
                Map<String, Object> step = history.get(i);
                sb.append("{ \\"line\\": ").append(step.get("line")).append(", ");
                sb.append("\\"stack\\": [ { \\"name\\": \\"main\\", \\"variables\\": {");
                
                Object stackObj = step.get("stack");
                List<Map<String, Object>> stackList = (List<Map<String, Object>>) stackObj;
                Map<String, Object> frameMap = stackList.get(0);
                Map<String, String> vars = (Map<String, String>) frameMap.get("variables");

                int v = 0;
                for (String k : vars.keySet()) {
                    sb.append("\\"").append(k).append("\\": \\"")
                      .append(escape(vars.get(k))).append("\\"");
                    if (v < vars.size() - 1) sb.append(", ");
                    v++;
                }
                sb.append("} } ] }");
                if (i < history.size() - 1) sb.append(", ");
            }
            sb.append("], \\"output\\": \\"\\" }");
            System.out.println(sb.toString());
        }
    }

    public static void main(String[] args) {
        Map<String, Object> _scope = new HashMap<>();
        try {
`;

// 3. PARSING LOGIC (Level 17: Break Support)
const declRegex = /(?:int|double|String|boolean|float|char|long)(?:\[\])*(?:\[\])?\s+([a-zA-Z0-9_]+)\s*=/;
const assignRegex = /([a-zA-Z0-9_]+)\s*=[^=]/;

let pendingVars = [];

lines.forEach((line, idx) => {
    const ln = idx + 1;
    const trimmed = line.trim();
    
    // 1. Detect Variables
    if (!trimmed.startsWith("//")) {
        const declMatch = trimmed.match(declRegex);
        if (declMatch) pendingVars.push(declMatch[1]);
        
        const assignMatch = trimmed.match(assignRegex);
        if (assignMatch && !declMatch) pendingVars.push(assignMatch[1]);
    }

    // 2. ⚡️ SPECIAL CASE: BREAK / CONTINUE
    // If we see a break, we inject the log BEFORE the line so it gets highlighted
    if (trimmed.startsWith("break") || trimmed.startsWith("continue")) {
        instrumentedLines.push(`Trace.log(${ln}, _scope);`);
        instrumentedLines.push(line); // Original break comes AFTER
        return;
    }

    // 3. Normal Lines: Add Original Code First
    instrumentedLines.push(line);

    // 4. Inject Tracer for Standard Lines
    const isStatementEnd = trimmed.endsWith(";");
    const isBlockStart = trimmed.endsWith("{");

    // Safeguards
    const startsWithControl = 
        trimmed.startsWith("for") || 
        trimmed.startsWith("while") || 
        trimmed.startsWith("if") || 
        trimmed.startsWith("else") ||
        trimmed.startsWith("do") ||
        trimmed.startsWith("try") ||
        trimmed.startsWith("switch");

    const isDataBlock = trimmed.includes("=") && trimmed.endsWith("{") && !startsWithControl;

    const isIgnoredKeyword = 
        trimmed.startsWith("return") || 
        trimmed.startsWith("package") || 
        trimmed.startsWith("import") || 
        trimmed.startsWith("class") || 
        trimmed.startsWith("interface") || 
        trimmed.startsWith("try") || 
        trimmed.startsWith("catch") || 
        trimmed.startsWith("finally") ||
        trimmed.includes("void main");

    if ((isStatementEnd || (isBlockStart && !isDataBlock)) && !isIgnoredKeyword) {
        // Flush pending variables
        while(pendingVars.length > 0) {
            const v = pendingVars.shift();
            instrumentedLines.push(`_scope.put("${v}", ${v});`);
        }
        instrumentedLines.push(`Trace.log(${ln}, _scope);`);
    }
});

const footer = `
        } catch (Exception e) { e.printStackTrace(); }
        Trace.printJson();
    }
}
`;

// 4. EXECUTE
fs.writeFileSync(javaFilePath, header + instrumentedLines.join('\n') + footer);

try {
    execSync(`javac -Xlint:unchecked "${javaFilePath}"`); 
    const output = execSync(`java -cp "${dir}" ${className}`).toString();
    console.log(output);
} catch (e) {
    const err = e.stderr ? e.stderr.toString() : e.message;
    console.log(JSON.stringify({ trace: [], error: "Java Compilation Error:\n" + err }));
} finally {
    try { fs.unlinkSync(javaFilePath); fs.unlinkSync(path.join(dir, `${className}.class`)); } catch(e) {}
}