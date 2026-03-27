const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// 1. SETUP PATHS
const sourcePath = process.argv[2];
if (!sourcePath) process.exit(1);

const dir = path.dirname(sourcePath);
const execName = 'cpp_exec_' + Math.random().toString(36).substring(7);
const sourceFile = path.join(dir, `${execName}.cpp`);
const exePath = path.join(dir, execName);

const userCode = fs.readFileSync(sourcePath, 'utf-8');
const lines = userCode.split('\n');
const instrumentedLines = [];

// 2. HEADER — injected tracer struct
// Key improvements vs original:
//   - Redirects std::cout into a buffer so user print output is captured
//   - Writes trace JSON to std::cerr (separate channel from stdout)
//   - Output format matches Python tracer: call_stack + stdout field
//   - Streams one JSON object per line (not batched at end)
//   - Supports std::vector<int/double/string> and raw int[] arrays
const header = `
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include <algorithm>

// ── COUT CAPTURE ────────────────────────────────────────────────────────────
// Redirect std::cout into a buffer so user print() calls are captured per step
struct CoutCapture {
    std::ostringstream buf;
    std::streambuf* orig;
    CoutCapture() { orig = std::cout.rdbuf(buf.rdbuf()); }
    std::string flush() {
        std::string val = buf.str();
        buf.str(""); buf.clear();
        return val;
    }
    ~CoutCapture() { std::cout.rdbuf(orig); }
} _cout_cap;

// ── TRACER ───────────────────────────────────────────────────────────────────
struct Trace {

    // JSON string escaper
    static std::string esc(const std::string& v) {
        std::ostringstream ss;
        for (unsigned char c : v) {
            if      (c == '"')  ss << "\\\\\\\"";
            else if (c == '\\\\') ss << "\\\\\\\\";
            else if (c == '\\n') ss << "\\\\n";
            else if (c == '\\r') ss << "\\\\r";
            else if (c == '\\t') ss << "\\\\t";
            else ss << c;
        }
        return ss.str();
    }

    // Convert a scope map to a JSON variables object string
    static std::string vars_json(const std::map<std::string, std::string>& scope) {
        std::ostringstream ss;
        ss << "{";
        auto it = scope.begin();
        while (it != scope.end()) {
            ss << "\\"" << it->first << "\\": \\"" << esc(it->second) << "\\"";
            if (++it != scope.end()) ss << ", ";
        }
        ss << "}";
        return ss.str();
    }

    // Emit one trace step as a JSON line to stderr
    // Format matches Python tracer exactly: {line, variables, call_stack, stdout}
    static void log(int line, const std::string& func_name,
                    const std::map<std::string, std::string>& scope) {
        std::string captured = _cout_cap.flush();
        std::string vj = vars_json(scope);

        std::cerr
            << "{\\"line\\":" << line
            << ",\\"variables\\":" << vj
            << ",\\"call_stack\\":[{\\"function\\":\\"" << func_name << "\\"" 
            << ",\\"line\\":" << line
            << ",\\"variables\\":" << vj << "}]"
            << ",\\"stdout\\":\\"" << esc(captured) << "\\"}"
            << "\\n";
        std::cerr.flush();
    }

    // Helper: serialize a vector<T> to a JSON array string
    template<typename T>
    static std::string vec_to_str(const std::vector<T>& v) {
        std::ostringstream ss;
        ss << "[";
        for (size_t i = 0; i < v.size(); ++i) {
            ss << v[i];
            if (i + 1 < v.size()) ss << ", ";
        }
        ss << "]";
        return ss.str();
    }

    // Helper: serialize a raw array to a JSON array string
    template<typename T>
    static std::string arr_to_str(const T* arr, int n) {
        std::ostringstream ss;
        ss << "[";
        for (int i = 0; i < n; ++i) {
            ss << arr[i];
            if (i + 1 < n) ss << ", ";
        }
        ss << "]";
        return ss.str();
    }
};

int main() {
    std::map<std::string, std::string> _scope;

    // ── USER CODE BEGINS ────────────────────────────────────────────────────
`;

// 3. PARSE & INSTRUMENT USER CODE
// Detects variable declarations/assignments and injects scope update + log calls
// Supports: int, double, float, long, char, bool, std::string,
//           std::vector<int/double/string>, int[] arrays
const declRegex = /^\s*(?:(?:std::)?(?:string|vector\s*<[^>]+>)|int|double|float|long|char|bool)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=|\[|{|;)/;
const assignRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\[.*?\]\s*)?=[^=]/;
const vecDecl = /std::vector\s*<([^>]+)>\s+([a-zA-Z_][a-zA-Z0-9_]*)/;
const arrDecl = /(?:int|double|float)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(\d+)\]/;

// Track declared vectors/arrays so we can serialize them properly
const vectors = {};  // varName -> element type
const arrays = {};  // varName -> size

lines.forEach((line, idx) => {
    const ln = idx + 1;
    const trimmed = line.trim();

    instrumentedLines.push(line);

    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    let varToUpdate = null;

    // Check for vector declaration: std::vector<int> v = {1,2,3};
    const vecMatch = trimmed.match(vecDecl);
    if (vecMatch) {
        vectors[vecMatch[2]] = vecMatch[1].trim();
        varToUpdate = vecMatch[2];
    }

    // Check for array declaration: int arr[5] = {...};
    const arrMatch = trimmed.match(arrDecl);
    if (!varToUpdate && arrMatch) {
        arrays[arrMatch[1]] = parseInt(arrMatch[2]);
        varToUpdate = arrMatch[1];
    }

    // Check for normal variable declaration
    if (!varToUpdate) {
        const declMatch = trimmed.match(declRegex);
        if (declMatch) varToUpdate = declMatch[1];
    }

    // Check for plain assignment: x = 5;
    if (!varToUpdate) {
        const asgn = trimmed.match(assignRegex);
        if (asgn && !['for', 'while', 'if'].some(k => trimmed.startsWith(k))) {
            varToUpdate = asgn[1];
        }
    }

    // Inject scope update for the detected variable
    if (varToUpdate) {
        if (vectors[varToUpdate]) {
            // Vector: serialize with Trace::vec_to_str
            instrumentedLines.push(
                `_scope["${varToUpdate}"] = Trace::vec_to_str(${varToUpdate});`
            );
        } else if (arrays[varToUpdate]) {
            // Raw array: serialize with Trace::arr_to_str
            instrumentedLines.push(
                `_scope["${varToUpdate}"] = Trace::arr_to_str(${varToUpdate}, ${arrays[varToUpdate]});`
            );
        } else {
            // Primitive: use ostringstream
            instrumentedLines.push(
                `{ std::ostringstream _ss; _ss << ${varToUpdate}; _scope["${varToUpdate}"] = _ss.str(); }`
            );
        }
    }

    // Inject trace log after every statement-ending line
    const isStatement = trimmed.endsWith(';');
    const isBlockClose = trimmed === '}';
    const skip = trimmed.startsWith('return') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('//') ||
        trimmed.includes('Trace::');

    if ((isStatement || isBlockClose) && !skip) {
        instrumentedLines.push(`Trace::log(${ln}, "main", _scope);`);
    }
});

const footer = `
    // ── USER CODE ENDS ──────────────────────────────────────────────────────
    // Flush any remaining stdout
    {
        std::string _final = _cout_cap.flush();
        if (!_final.empty()) {
            std::cerr << "{\\"line\\":0,\\"variables\\":{},\\"call_stack\\":[]"
                      << ",\\"stdout\\":\\"" << Trace::esc(_final) << "\\"}" << "\\n";
            std::cerr.flush();
        }
    }
    return 0;
}
`;

// 4. WRITE, COMPILE, RUN
try {
    const finalCode = header + instrumentedLines.join('\n') + footer;
    fs.writeFileSync(sourceFile, finalCode);

    // Compile with g++ C++17
    const compile = spawnSync('g++', ['-std=c++17', sourceFile, '-o', exePath], {
        timeout: 10000,
        encoding: 'utf-8',
    });

    if (compile.status !== 0) {
        const errMsg = (compile.stderr || '').replace(/\n/g, '\\n');
        process.stdout.write(
            JSON.stringify({
                line: 0, variables: {}, call_stack: [],
                stdout: '', error: 'C++ Compilation Error:\n' + (compile.stderr || '')
            }) + '\n'
        );
        return;
    }

    // Run with 5-second timeout; trace JSON streams through stderr
    const run = spawnSync(exePath, [], {
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

    // If there was a runtime crash, emit an error step
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
            stdout: '', error: e.message
        }) + '\n'
    );
} finally {
    try { if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile); } catch (_) { }
    try { if (fs.existsSync(exePath)) fs.unlinkSync(exePath); } catch (_) { }
}