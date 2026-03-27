const fs = require('fs');
const path = require('path');
const { instrumentJava } = require('../engine/javaTracerUtil');
const { instrumentCpp } = require('../engine/cppTracerUtil');
const dockerService = require('../services/dockerService');
const { packTrace } = require('../utils/binaryTrace'); // ⚡ Binary Serialization

const executeCode = async (req, res) => {
    const { language, code, input, socketId } = req.body;
    const isBinary = req.query.binary === 'true'; // ⚡ Check for binary request

    if (!code) return res.status(400).json({ error: "No code provided" });

    console.log(`🚀 Executing ${language} in Docker Sandbox...`);

    const io = req.app.get('io');
    const traceArray = [];
    const heatmap = {}; // 🔥 Consolidated heatmap frequencies

    // --- Prepare Tracer Wrappers ---
    let finalCode = code;
    let runnerRequired = false;

    if (language === 'python') {
        const runnerPath = path.join(__dirname, '../engine/tracer.py');
        const tracerSource = fs.readFileSync(runnerPath, 'utf8');

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
    } else if (language === 'java') {
        finalCode = instrumentJava(code);
        runnerRequired = true;
    } else if (language === 'cpp') {
        finalCode = instrumentCpp(code);
        runnerRequired = true;
    }

    try {
        const onStream = (line) => {
            try {
                const step = JSON.parse(line);
                traceArray.push(step);

                // 📈 Track global hits for Heatmap
                if (step.line > 0) {
                    heatmap[step.line] = (heatmap[step.line] || 0) + 1;
                }

                if (socketId && io) {
                    io.to(socketId).emit('execution_step', step);
                }
            } catch (e) {
                if (socketId && io) {
                    io.to(socketId).emit('execution_step', { stdout: line + '\n' });
                }
            }
        };

        const result = await dockerService.runInSandbox(finalCode, language, input || '', onStream);

        if (result.error && !result.output) {
            return res.json({ error: result.error });
        }

        const cleanedOutput = traceArray.length > 0
            ? traceArray.map(t => t.stdout || '').join('')
            : result.output;

        // ⚡ OPTIMIZED BINARY RESPONSE
        if (isBinary && traceArray.length > 0) {
            const buffer = packTrace(traceArray);
            res.set('Content-Type', 'application/octet-stream');
            res.set('X-Heatmap', JSON.stringify(heatmap)); // Pass heatmap in header or metadata
            return res.send(buffer);
        }

        res.json({
            trace: traceArray,
            heatmap: heatmap, // 🎯 Return consolidated heatmap for the editor
            output: cleanedOutput || result.output || '',
            error: result.error
        });

    } catch (error) {
        console.error("❌ Execution Error:", error);
        res.status(500).json({ error: "Execution failed during sandboxing", details: error.message, stack: error.stack });
    }
};

module.exports = { executeCode };