const instrumentCpp = (code) => {
    const helperHeader = `
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include <algorithm>

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
};

struct Trace {
    static std::string esc(const std::string& v) {
        std::ostringstream ss;
        for (unsigned char c : v) {
            if (c == '"') ss << "\\\\\\\"";
            else if (c == '\\\\') ss << "\\\\\\\\";
            else if (c == '\\n') ss << "\\\\n";
            else ss << c;
        }
        return ss.str();
    }
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
    static void log(int line, const std::string& func_name, const std::map<std::string, std::string>& scope, std::string captured, std::streambuf* orig_buf) {
        std::string vj = vars_json(scope);
        std::ostream os(orig_buf);
        os << "{\\"line\\":" << line << ",\\"variables\\":" << vj << ",\\"call_stack\\":[{\\"function\\":\\"" << func_name << "\\",\\"line\\":" << line << ",\\"variables\\":" << vj << "}],\\"stdout\\":\\"" << esc(captured) << "\\"}\\n";
        os.flush();
    }
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
`;

    const mainInit = `
    CoutCapture _cout_cap;
    std::map<std::string, std::string> _scope;
`;

    const lines = code.split('\n');
    const instrumentedLines = [];
    const declRegex = /^\s*(?:(?:std::)?(?:string|vector\s*<[^>]+>)|int|double|float|long|char|bool)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=|\[|{|;)/;
    const assignRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\[.*?\]\s*)?=[^=]/;
    const vecDecl = /std::vector\s*<([^>]+)>\s+([a-zA-Z_][a-zA-Z0-9_]*)/;
    const arrDecl = /(?:int|double|float)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(\d+)\]/;

    const vectors = {};
    const arrays = {};

    const hasMain = code.includes('int main');
    
    if (hasMain) {
        let inMain = false;
        let braceCount = 0;

        lines.forEach((line, idx) => {
            const ln = idx + 1;
            const trimmed = line.trim();

            if (trimmed.includes('int main')) {
                inMain = true;
                instrumentedLines.push(line);
                return;
            }

            if (inMain) {
                if (trimmed.includes('{')) {
                    if (braceCount === 0) {
                        instrumentedLines.push(line);
                        instrumentedLines.push(mainInit);
                        braceCount++;
                        return;
                    }
                    braceCount++;
                }
                if (trimmed.includes('}')) {
                    braceCount--;
                    if (braceCount === 0) {
                        instrumentedLines.push(`{ std::ostream _os(_cout_cap.orig); std::string _final = _cout_cap.flush(); if (!_final.empty()) _os << "{\\"line\\":0,\\"variables\\":{},\\"call_stack\\":[],\\"stdout\\":\\"" << Trace::esc(_final) << "\\"}\\n"; }`);
                        instrumentedLines.push(line);
                        inMain = false;
                        return;
                    }
                }

                instrumentedLines.push(line);
                if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

                let varToUpdate = null;
                const vecMatch = trimmed.match(vecDecl);
                if (vecMatch) { vectors[vecMatch[2]] = vecMatch[1].trim(); varToUpdate = vecMatch[2]; }
                const arrMatch = trimmed.match(arrDecl);
                if (!varToUpdate && arrMatch) { arrays[arrMatch[1]] = parseInt(arrMatch[2]); varToUpdate = arrMatch[1]; }
                if (!varToUpdate) { const declMatch = trimmed.match(declRegex); if (declMatch) varToUpdate = declMatch[1]; }
                if (!varToUpdate) { const asgn = trimmed.match(assignRegex); if (asgn && !['for', 'while', 'if'].some(k => trimmed.startsWith(k))) varToUpdate = asgn[1]; }

                if (varToUpdate) {
                    if (vectors[varToUpdate]) instrumentedLines.push(`_scope["${varToUpdate}"] = Trace::vec_to_str(${varToUpdate});`);
                    else if (arrays[varToUpdate]) instrumentedLines.push(`_scope["${varToUpdate}"] = Trace::arr_to_str(${varToUpdate}, ${arrays[varToUpdate]});`);
                    else instrumentedLines.push(`{ std::ostringstream _ss; _ss << ${varToUpdate}; _scope["${varToUpdate}"] = _ss.str(); }`);
                }

                if ((trimmed.endsWith(';') || trimmed.endsWith('}')) && !trimmed.startsWith('return') && !trimmed.includes('Trace::')) {
                    instrumentedLines.push(`Trace::log(${ln}, "main", _scope, _cout_cap.flush(), _cout_cap.orig);`);
                }
            } else {
                instrumentedLines.push(line);
            }
        });

        return helperHeader + instrumentedLines.join('\n');
    } else {
        return helperHeader + "\nint main() {\n" + mainInit + code + "\nreturn 0;\n}";
    }
};

module.exports = { instrumentCpp };
