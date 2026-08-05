const fs = require('fs');
const path = require('path');
const dockerService = require('../services/dockerService');
const { packTrace } = require('../utils/binaryTrace'); // ⚡ Binary Serialization

// Wrap JavaScript source with the acorn-based tracer (also used for TypeScript
// after transpilation).
const wrapJsTracer = (source) => {
    const tracerSource = fs.readFileSync(path.join(__dirname, '../engine/jsTracer.js'), 'utf8');
    return `
require('fs').writeFileSync('/home/runner/code/student_code.js', ${JSON.stringify(source)});
process.argv[2] = '/home/runner/code/student_code.js';
${tracerSource}
`;
};

const executeCode = async (req, res) => {
    const { language, code, input, socketId } = req.body;
    const isBinary = req.query.binary === 'true'; // ⚡ Check for binary request

    if (!code) return res.status(400).json({ error: "No code provided" });

    console.log(`🚀 Executing ${language} in Docker Sandbox...`);

    const io = req.app.get('io');
    const traceArray = [];
    const heatmap = {}; // 🔥 Consolidated heatmap frequencies

    // --- Prepare code + pick the sandbox language ---
    // Traced interpreted langs get a tracer wrapper; compiled langs (c/cpp/java)
    // run raw and are traced in-sandbox by GDB/JDI; go/rust are run-only.
    let finalCode = code;
    let execLanguage = language;

    if (language === 'python') {
        const tracerSource = fs.readFileSync(path.join(__dirname, '../engine/tracer.py'), 'utf8');
        finalCode = `
import os
with open('/home/runner/code/student_code.py', 'w') as f:
    f.write(${JSON.stringify(code)})

# Now run the tracer
${tracerSource.replace("sys.argv[1]", "'/home/runner/code/student_code.py'")}
`;
    } else if (language === 'javascript') {
        finalCode = wrapJsTracer(code);
    } else if (language === 'typescript') {
        // Transpile TS -> JS on the host, then trace it as JavaScript.
        try {
            const ts = require('typescript');
            const js = ts.transpileModule(code, {
                compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
            }).outputText;
            finalCode = wrapJsTracer(js);
            execLanguage = 'javascript';
        } catch (e) {
            return res.json({ error: `TypeScript transpile failed: ${e.message}` });
        }
    }
    // c / cpp / java / go / rust: finalCode stays as the raw user source.

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

        const result = await dockerService.runInSandbox(finalCode, execLanguage, input || '', onStream);

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