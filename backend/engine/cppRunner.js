const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// 1. SETUP PATHS
const sourcePath = process.argv[2];
if (!sourcePath) process.exit(1);

const dir = path.dirname(sourcePath);
// Create a random name for the executable to avoid conflicts
const execName = "cpp_exec_" + Math.random().toString(36).substring(7);
const sourceFile = path.join(dir, `${execName}.cpp`);
const exePath = path.join(dir, execName);

const userCode = fs.readFileSync(sourcePath, 'utf-8');
const lines = userCode.split('\n');
const instrumentedLines = [];

// 2. HEADER: The C++ Tracer Logic
// We inject a tiny JSON builder class directly into the code.
const header = `
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>

// --- TRACER START ---
struct Trace {
    static std::vector<std::string> history;

    // Helper to escape strings for JSON
    static std::string escape(const std::string& val) {
        std::ostringstream ss;
        for (char c : val) {
            if (c == '"') ss << "\\\\\\\"";
            else if (c == '\\\\') ss << "\\\\\\\\";
            else ss << c;
        }
        return ss.str();
    }

    // Log the current state
    static void log(int line, std::map<std::string, std::string> scope) {
        std::ostringstream ss;
        ss << "{ \\"line\\": " << line << ", \\"stack\\": [ { \\"name\\": \\"main\\", \\"variables\\": {";
        
        auto it = scope.begin();
        while (it != scope.end()) {
            ss << "\\"" << it->first << "\\": \\"" << escape(it->second) << "\\"";
            if (++it != scope.end()) ss << ", ";
        }
        
        ss << "} } ] }";
        history.push_back(ss.str());
    }

    static void printJson() {
        std::cout << "{ \\"trace\\": [";
        for (size_t i = 0; i < history.size(); ++i) {
            std::cout << history[i];
            if (i < history.size() - 1) std::cout << ", ";
        }
        std::cout << "], \\"output\\": \\"\\" }" << std::endl;
    }
};

std::vector<std::string> Trace::history;
// --- TRACER END ---

int main() {
    std::map<std::string, std::string> _scope;
    
    // User code starts here
`;

// 3. PARSING LOGIC (Regex)
// Detects: int x = 10; | double d = 5.5; | std::string s = "hi";
// We support basic types for this version.
const declRegex = /(?:int|double|float|std::string|char|bool|long)\s+([a-zA-Z0-9_]+)\s*=/;
const assignRegex = /([a-zA-Z0-9_]+)\s*=[^=]/; 

lines.forEach((line, idx) => {
    const ln = idx + 1;
    const trimmed = line.trim();

    instrumentedLines.push(line);

    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) return;

    let varToUpdate = null;
    const declMatch = trimmed.match(declRegex);
    if (declMatch) varToUpdate = declMatch[1];

    const assignMatch = trimmed.match(assignRegex);
    if (!varToUpdate && assignMatch) varToUpdate = assignMatch[1];

    // If we found a variable update, we update the C++ map
    if (varToUpdate) {
        // We use stringstream to convert any type (int, double) to string for the map
        instrumentedLines.push(`{ std::ostringstream _ss; _ss << ${varToUpdate}; _scope["${varToUpdate}"] = _ss.str(); }`);
    }

    // Inject Trace Log
    if (trimmed.endsWith(";") && !trimmed.startsWith("return")) {
        instrumentedLines.push(`Trace::log(${ln}, _scope);`);
    }
});

const footer = `
    Trace::printJson();
    return 0;
}
`;

// 4. WRITE & COMPILE
try {
    const finalCode = header + instrumentedLines.join('\n') + footer;
    fs.writeFileSync(sourceFile, finalCode);

    // Compile: g++ -std=c++17 temp.cpp -o temp_exec
    // We use C++17 to ensure modern features work smoothly
    execSync(`g++ -std=c++17 "${sourceFile}" -o "${exePath}"`);

    // Run the executable
    const output = execSync(`"${exePath}"`).toString();
    console.log(output);

} catch (e) {
    const err = e.stderr ? e.stderr.toString() : e.message;
    console.log(JSON.stringify({ trace: [], error: "C++ Compilation Error:\\n" + err }));
} finally {
    // Cleanup files
    try { 
        if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
        if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
    } catch(e) {}
}