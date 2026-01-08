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
            tempFile = path.join(tempDir, `temp_${timestamp}.cpp`);
            const outFile = path.join(tempDir, `temp_${timestamp}.out`);
            fs.writeFileSync(tempFile, code);
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
            // For Java, we force the file to be Main.java so "public class Main" works
            // We use a unique subfolder to avoid conflicts
            const javaDir = path.join(tempDir, `java_${timestamp}`);
            if (!fs.existsSync(javaDir)) fs.mkdirSync(javaDir);

            tempFile = path.join(javaDir, 'Main.java');
            fs.writeFileSync(tempFile, code);

            // Compile then Run
            command = `javac "${tempFile}" && java -cp "${javaDir}" Main`;
            break;

        default:
            return res.status(400).json({ error: `Language '${language}' is not supported yet` });
    }

    console.log(`🚀 Executing: ${language}...`);

    exec(command, (error, stdout, stderr) => {
        // Cleanup (optional, keep commented for debugging)
        // if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

        if (error) {
            console.error("❌ Exec Error:", stderr);
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