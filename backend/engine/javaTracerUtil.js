const instrumentJava = (code) => {
    const helperFields = `
    static ByteArrayOutputStream _outBuf = new ByteArrayOutputStream();
    static PrintStream _origOut = System.out;
    static String flushCaptured() {
        String val = _outBuf.toString();
        _outBuf.reset();
        return val;
    }
    static class Trace {
        static String escapeJson(String val) {
            if (val == null) return "null";
            return val.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", "\\\\n").replace("\\r", "\\\\r").replace("\\t", "\\\\t");
        }
        static String serialize(Object val) {
            if (val == null) return "null";
            if (val instanceof int[]) return Arrays.toString((int[])val);
            if (val instanceof double[]) return Arrays.toString((double[])val);
            if (val instanceof float[]) return Arrays.toString((float[])val);
            if (val instanceof long[]) return Arrays.toString((long[])val);
            if (val instanceof boolean[]) return Arrays.toString((boolean[])val);
            if (val instanceof char[]) return Arrays.toString((char[])val);
            if (val instanceof Object[]) return Arrays.deepToString((Object[])val);
            if (val instanceof Collection) return val.toString();
            if (val instanceof Map) return val.toString();
            return String.valueOf(val);
        }
        static String varsJson(Map<String, Object> scope) {
            StringBuilder sb = new StringBuilder("{");
            int i = 0;
            for (String k : scope.keySet()) {
                sb.append("\\"").append(k).append("\\":\\"").append(escapeJson(serialize(scope.get(k)))).append("\\"");
                if (i++ < scope.size() - 1) sb.append(",");
            }
            sb.append("}");
            return sb.toString();
        }
        static void log(int line, String funcName, Map<String, Object> scope) {
            String captured = escapeJson(flushCaptured());
            String vj = varsJson(scope);
            _origOut.println("{\\"line\\":" + line + ",\\"variables\\":" + vj + ",\\"call_stack\\":[{\\"function\\":\\"" + funcName + "\\",\\"line\\":" + line + ",\\"variables\\":" + vj + "}],\\"stdout\\":\\"" + captured + "\\"}");
            _origOut.flush();
        }
    }
`;

    const mainInit = `
        System.setOut(new PrintStream(_outBuf));
        Map<String, Object> _scope = new LinkedHashMap<>();
        try {
`;

    const mainCleanup = `
        } catch (Exception e) {
            _origOut.println("{\\"line\\":0,\\"variables\\":{},\\"call_stack\\":[],\\"stdout\\":\\"\\",\\"error\\":true,\\"errorMessage\\":\\"" + Trace.escapeJson(e.getMessage()) + "\\"}");
        } finally {
            String _final = flushCaptured();
            if (!_final.isEmpty()) _origOut.println("{\\"line\\":0,\\"variables\\":{},\\"call_stack\\":[],\\"stdout\\":\\"" + Trace.escapeJson(_final) + "\\"}");
            System.setOut(_origOut);
        }
`;

    const lines = code.split('\n');
    const instrumentedLines = [];
    const declRegex = /^\s*(?:(?:ArrayList|LinkedList|HashMap|List|Map)\s*<[^>]+>|(?:int|double|String|boolean|float|char|long)(?:\[\])*)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*[=;({]/;
    const assignRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\[.*?\]\s*)?=[^=]/;
    let pendingVars = [];

    const hasClass = code.includes('class ');
    const hasMain = code.includes('public static void main');

    if (hasClass && hasMain) {
        let inMain = false;
        let mainBraceCount = 0;

        lines.forEach((line, idx) => {
            const ln = idx + 1;
            const trimmed = line.trim();

            if (trimmed.includes('public static void main')) {
                inMain = true;
                instrumentedLines.push(line);
                return;
            }

            if (inMain) {
                if (trimmed.includes('{')) {
                    if (mainBraceCount === 0) {
                        instrumentedLines.push(line);
                        instrumentedLines.push(mainInit);
                        mainBraceCount++;
                        return;
                    }
                    mainBraceCount++;
                }
                if (trimmed.includes('}')) {
                    mainBraceCount--;
                    if (mainBraceCount === 0) {
                        instrumentedLines.push(mainCleanup);
                        instrumentedLines.push(line);
                        inMain = false;
                        return;
                    }
                }

                instrumentedLines.push(line);
                if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) return;
                
                const declMatch = trimmed.match(declRegex);
                if (declMatch) pendingVars.push(declMatch[1]);
                else {
                    const asgn = trimmed.match(assignRegex);
                    if (asgn) pendingVars.push(asgn[1]);
                }

                if (trimmed.endsWith(';') || trimmed.endsWith('{')) {
                    while (pendingVars.length > 0) {
                        const v = pendingVars.shift();
                        instrumentedLines.push(`try { _scope.put("${v}", ${v}); } catch(Exception _e) {}`);
                    }
                    instrumentedLines.push(`Trace.log(${ln}, "main", _scope);`);
                }
            } else {
                instrumentedLines.push(line);
            }
        });

        let result = instrumentedLines.join('\n');
        const lastBraceIdx = result.lastIndexOf('}');
        return `import java.util.*;\nimport java.io.*;\n` + result.slice(0, lastBraceIdx) + helperFields + result.slice(lastBraceIdx);
    } else {
        const header = `import java.util.*;\nimport java.io.*;\npublic class Main {\n${helperFields}\npublic static void main(String[] args) {\n${mainInit}`;
        const footer = `\n${mainCleanup}\n}\n}`;
        
        lines.forEach((line, idx) => {
            const ln = idx + 1;
            const trimmed = line.trim();
            instrumentedLines.push(line);
            const declMatch = trimmed.match(declRegex);
            if (declMatch) pendingVars.push(declMatch[1]);
            else {
                const asgn = trimmed.match(assignRegex);
                if (asgn) pendingVars.push(asgn[1]);
            }
            if (trimmed.endsWith(';') || trimmed.endsWith('{')) {
                while (pendingVars.length > 0) {
                    const v = pendingVars.shift();
                    instrumentedLines.push(`try { _scope.put("${v}", ${v}); } catch(Exception _e) {}`);
                }
                instrumentedLines.push(`Trace.log(${ln}, "main", _scope);`);
            }
        });
        return header + instrumentedLines.join('\n') + footer;
    }
};

module.exports = { instrumentJava };
