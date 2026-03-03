const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const executeCode = (req, res) => {
    const { language, code } = req.body;

    if (!code) return res.status(400).json({ error: "No code provided" });

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const timestamp = Date.now();
    let command;
    let tempFile;

    // 🧠 LANGUAGE SWITCHER
    switch (language) {
        case 'python':
            tempFile = path.join(tempDir, `temp_${timestamp}.py`);
            fs.writeFileSync(tempFile, code);
            const runnerScript = path.join(__dirname, '../engine/tracer.py');
            command = `python3 "${runnerScript}" "${tempFile}"`;
            break;

        case 'cpp':
            let cppCode = code;
            // Inject C++ boilerplate if 'main' is missing
            if (!/main\s*\(/.test(code)) {
                cppCode = `#include <iostream>\nusing namespace std;\nint main() {\n${code}\nreturn 0;\n}`;
            }
            tempFile = path.join(tempDir, `temp_${timestamp}.cpp`);
            const outFile = path.join(tempDir, `temp_${timestamp}.out`);
            fs.writeFileSync(tempFile, cppCode);
            command = `g++ "${tempFile}" -o "${outFile}" && "${outFile}"`;
            break;

        case 'javascript': // 👈 NEW: Node.js support
            tempFile = path.join(tempDir, `temp_${timestamp}.js`);
            fs.writeFileSync(tempFile, code);
            command = `node "${tempFile}"`;
            const jsRunner = path.join(__dirname, '../engine/jsTracer.js');
            command = `node "${jsRunner}" "${tempFile}"`;
            break;

        case 'java': // 👈 NEW: Java support
            let javaCode = code;

            if (/public\s+class\s+Main/.test(code)) {
                // User already provided the correct structure (like our presets)
                javaCode = code;
            } else if (/main\s*\(/.test(code)) {
                // User provided main() but no public class Main
                if (/class\s+\w+/.test(code)) {
                    // User provided a class. Force name to Main so javac Main.java works
                    javaCode = code.replace(/class\s+\w+/, 'class Main');
                } else {
                    // User provided main() but no class wrapper
                    javaCode = `public class Main {\n${code}\n}`;
                }
            } else {
                // User provided raw code, no main()
                javaCode = `public class Main {\n    public static void main(String[] args) {\n${code}\n    }\n}`;
            }

            // We use a unique subfolder to avoid conflicts
            const javaDir = path.join(tempDir, `java_${timestamp}`);
            if (!fs.existsSync(javaDir)) fs.mkdirSync(javaDir);

            tempFile = path.join(javaDir, 'Main.java');
            fs.writeFileSync(tempFile, javaCode);

            // Compile then Run
            command = `javac "${tempFile}" && java -cp "${javaDir}" Main`;
            break;

        default:
            return res.status(400).json({ error: `Language '${language}' is not supported yet` });
    }

    console.log(`🚀 Executing: ${language}...`);

    exec(command, { timeout: 10000, maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
        // Enforce STRICT Sandbox Cleanup
        try {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
            if (language === 'cpp') {
                const outFile = path.join(tempDir, `temp_${timestamp}.out`);
                if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
            }
            if (language === 'java') {
                const javaDir = path.join(tempDir, `java_${timestamp}`);
                if (fs.existsSync(javaDir)) fs.rmSync(javaDir, { recursive: true, force: true });
            }
        } catch (cleanupError) {
            console.error("🧹 Cleanup Error:", cleanupError);
        }

        if (error) {
            console.error("❌ Exec Error:", stderr || error.message);
            if (error.killed) {
                return res.json({ error: "Execution Timed Out: Infinite loop or process ran longer than 10 seconds." });
            }
            return res.json({ error: stderr || "Execution failed" });
        }

        // Handle Python Visualization vs Plain Output
        if (language === 'python') {
            try {
                const lines = stdout.trim().split('\n');
                const traceArray = JSON.parse(lines[lines.length - 1]);
                // Frontend expects { trace: [...] } format
                res.json({ trace: traceArray });
            } catch (e) {
                // Fallback if python prints something that isn't JSON
                res.json({ output: stdout });
            }
        } else {
            // JS, CPP, Java just return text
            res.json({ output: stdout });
        }
    });
};

module.exports = { executeCode };