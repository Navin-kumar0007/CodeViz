const fs = require('fs');
const path = require('path');
const dockerService = require('../services/dockerService');

const executeCode = async (req, res) => {
    const { language, code, input, socketId } = req.body;

    if (!code) return res.status(400).json({ error: "No code provided" });

    console.log(`🚀 Executing ${language} in Docker Sandbox...`);

    const io = req.app.get('io');
    const traceArray = [];

    // --- Prepare Tracer Wrappers ---
    let finalCode = code;
    let runnerRequired = false;

    if (language === 'python') {
        // We need to write the user code to a file that tracer.py can read
        // But runInSandbox takes the 'code' string.
        // So we wrap the student code inside a tracer execution string
        const runnerPath = path.join(__dirname, '../engine/tracer.py');
        const tracerSource = fs.readFileSync(runnerPath, 'utf8');

        // We inject the student code into a multi-line string in Python
        // and have Python write it to a temp file INSIDE the container
        finalCode = `
import os
with open('/home/runner/code/student_code.py', 'w') as f:
    f.write(${JSON.stringify(code)})

# Now run the tracer
${tracerSource.replace("sys.argv[1]", "'/home/runner/code/student_code.py'")}
`;
        runnerRequired = true;
    } else if (language === 'javascript') {
        const runnerPath = path.join(__dirname, '../engine/jsTracer.js');
        const tracerSource = fs.readFileSync(runnerPath, 'utf8');

        finalCode = `
require('fs').writeFileSync('/home/runner/code/student_code.js', ${JSON.stringify(code)});
process.argv[2] = '/home/runner/code/student_code.js';
${tracerSource}
`;
        runnerRequired = true;
    }

    try {
        const onStream = (line) => {
            try {
                const step = JSON.parse(line);
                traceArray.push(step);

                // If the user is connected via socket, push the step LIVE
                if (socketId && io) {
                    io.to(socketId).emit('execution_step', step);
                }
            } catch (e) {
                // Not JSON (maybe plain print output)
                if (socketId && io) {
                    io.to(socketId).emit('execution_step', { stdout: line + '\n' });
                }
            }
        };

        const result = await dockerService.runInSandbox(finalCode, language, input || '', onStream);

        if (result.error && !result.output) {
            return res.json({ error: result.error });
        }

        // Return the full trace for backward compatibility
        // Clean output: prioritize the joined stdout from parsed trace steps if using tracers
        const cleanedOutput = traceArray.length > 0
            ? traceArray.map(t => t.stdout || '').join('')
            : result.output;

        res.json({
            trace: traceArray,
            output: cleanedOutput || result.output || '',
            error: result.error
        });

    } catch (error) {
        console.error("❌ Execution Error:", error);
        res.status(500).json({ error: "Execution failed during sandboxing" });
    }
};

module.exports = { executeCode };