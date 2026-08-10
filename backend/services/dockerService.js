const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Docker Service
 * Manages secure code execution inside isolated Docker containers.
 */

const DOCKER_IMAGE = 'codeviz-runner:latest';
const TIMEOUT_RUN = 5000;    // run-only languages (fast)
const TIMEOUT_TRACE = 15000; // debugger/tracer languages need more headroom
const MEMORY_LIMIT = '256m';

// Languages traced by an in-image debugger/instrumenter (slower, need more time)
const TRACED_LANGS = new Set(['python', 'javascript', 'cpp', 'c', 'java']);
// Languages that compile inside the sandbox (need more RAM than interpreters)
const COMPILED_LANGS = new Set(['cpp', 'c', 'java', 'go', 'rust']);

/**
 * Concurrency limiter — caps how many Docker containers run at once so a burst
 * of executions can't exhaust the host. Extra requests wait in a bounded queue;
 * if the queue is full they're rejected fast ("server busy") rather than piling
 * up. Tune with env: EXEC_MAX_CONCURRENT, EXEC_MAX_QUEUE.
 */
const { createLimiter } = require('../utils/limiter');
const limiter = createLimiter({
    max: parseInt(process.env.EXEC_MAX_CONCURRENT, 10) || 4,
    maxQueue: parseInt(process.env.EXEC_MAX_QUEUE, 10) || 50,
});

/**
 * Resolve the sandbox filename + shell command for a given language.
 * `code` has already been prepared by the controller (tracer-wrapped for
 * python/js, raw user source for compiled languages).
 */
function resolveCommand(language, fileName) {
    switch (language) {
        case 'python':
            return { fileName: fileName || `script.py`, run: (f) => `python3 ${f}` };
        case 'javascript':
            return { fileName: fileName || `script.js`, run: (f) => `node ${f}` };
        case 'cpp':
            return {
                fileName: fileName || `script.cpp`,
                // GDB's own stdout is discarded; the tracer writes clean JSON to
                // .trace.jsonl which we then stream out.
                run: (f) => `g++ -g ${f} -o out 2>cerr.txt && { CODEVIZ_SRC=${f} gdb -q -batch -x /opt/codeviz/gdbTracer.py ./out >/dev/null 2>&1; cat .trace.jsonl; } || cat cerr.txt`,
            };
        case 'c':
            return {
                fileName: fileName || `script.c`,
                run: (f) => `gcc -g ${f} -o out 2>cerr.txt && { CODEVIZ_SRC=${f} gdb -q -batch -x /opt/codeviz/gdbTracer.py ./out >/dev/null 2>&1; cat .trace.jsonl; } || cat cerr.txt`,
            };
        case 'java':
            return {
                fileName: `Main.java`,
                run: () => `javac -g Main.java -d . 2>jerr.txt && java --add-modules jdk.jdi -cp /opt/codeviz JdiTracer || cat jerr.txt`,
            };
        case 'go':
            return { fileName: fileName || `main.go`, run: (f) => `go run ${f}` };
        case 'rust':
            return {
                fileName: fileName || `main.rs`,
                run: (f) => `rustc ${f} -o rout 2>rerr.txt && ./rout || cat rerr.txt`,
            };
        default:
            return null;
    }
}

/**
 * Execute code in a sandboxed Docker container
 * @param {string} code - The user's code
 * @param {string} language - The programming language
 * @param {string} input - Optional stdin input
 * @param {function} onStream - Optional callback for live output streaming
 * @returns {Promise<object>} - Execution results (stdout, stderr, exitCode)
 */
function _runInSandbox(code, language, input = '', onStream = null) {
    return new Promise((resolve) => {
        const spec = resolveCommand(language, null);
        if (!spec) {
            return resolve({ error: `Language ${language} not supported in sandbox.` });
        }

        // Isolate each execution in its own directory so concurrent runs never
        // clash (important for Java's fixed Main.java) and compiled artifacts
        // (binaries, .class, error logs) are cleaned up together.
        const timestamp = Date.now() + '_' + Math.random().toString(36).slice(2);
        // Base dir is configurable via EXEC_DIR. In a containerized deploy this
        // MUST point at a host path bind-mounted into the backend at the same
        // absolute path, so sibling sandbox containers (spawned on the host
        // daemon) can mount it. On a host deploy the default is fine.
        const sandboxBase = process.env.EXEC_DIR || path.join(__dirname, '../temp/sandbox');
        const runDir = path.join(sandboxBase, `run_${timestamp}`);
        fs.mkdirSync(runDir, { recursive: true });

        const fileName = spec.fileName; // fixed per language (e.g. Main.java, script.cpp)
        const runCommand = spec.run(fileName);
        const TIMEOUT_MS = TRACED_LANGS.has(language) ? TIMEOUT_TRACE : TIMEOUT_RUN;
        // Compiled languages (compiler + possibly two JVMs for Java) need more RAM.
        const memory = COMPILED_LANGS.has(language) ? '512m' : MEMORY_LIMIT;

        const filePath = path.join(runDir, fileName);
        fs.writeFileSync(filePath, code);

        const dockerArgs = [
            'run', '--rm',
            '-i',
            '--network', 'none',
            '--memory', memory,
            '--memory-swap', memory,               // no swap beyond the memory cap
            '--cpus', process.env.EXEC_CPUS || '1', // cap CPU
            '--pids-limit', '128',
            '--cap-drop', 'ALL',                    // 🔒 drop all Linux capabilities
            '--security-opt', 'no-new-privileges',  // 🔒 block privilege escalation
            '--ulimit', 'nproc=256:256',            // fork bomb guard
            '--ulimit', 'fsize=20000000',           // 20MB max file size
            '-v', `${runDir}:/home/runner/code`,
            DOCKER_IMAGE,
            'bash', '-c', runCommand
        ];

        const container = spawn('docker', dockerArgs);

        // Feed standard input securely via STDIN, bypassing bash echoing which breaks newlines
        if (input !== undefined && input !== null) {
            container.stdin.write(input + '\n');
        }
        container.stdin.end();

        let stdout = '';
        let stderr = '';
        let killed = false;
        let lineBuffer = '';

        const timeout = setTimeout(() => {
            killed = true;
            container.kill();
            resolve({ error: 'Time Limit Exceeded (TLE)', timeout: true });
        }, TIMEOUT_MS);

        container.stdout.on('data', (data) => {
            const chunk = data.toString();
            stdout += chunk;

            if (onStream) {
                lineBuffer += chunk;
                let lines = lineBuffer.split('\n');
                lineBuffer = lines.pop(); // Keep partial line in buffer
                lines.forEach(line => {
                    if (line.trim()) onStream(line.trim());
                });
            }
        });

        container.stderr.on('data', (data) => {
            const chunk = data.toString();
            stderr += chunk;

            if (onStream) {
                // Also stream stderr lines for tracers that use it (e.g. Java/C++ current impls)
                const lines = chunk.split('\n');
                lines.forEach(line => {
                    if (line.trim()) onStream(line.trim());
                });
            }
        });

        container.on('close', (code) => {
            clearTimeout(timeout);

            // Cleanup the whole isolated run directory (source + artifacts)
            try { fs.rmSync(runDir, { recursive: true, force: true }); } catch (e) { }

            if (killed) return;

            // Process any remaining data in lineBuffer
            if (onStream && lineBuffer.trim()) {
                onStream(lineBuffer.trim());
            }
            resolve({
                output: stdout.trim(),
                error: stderr.trim(),
                exitCode: code
            });
        });
    });
}

/**
 * Public entry: acquire a concurrency slot (or fail fast when the host is
 * saturated), run the sandbox, and always release the slot afterwards.
 */
async function runInSandbox(code, language, input = '', onStream = null) {
    try {
        await limiter.acquire();
    } catch {
        return { error: 'Server is busy — too many executions right now. Please retry in a moment.', busy: true };
    }
    try {
        return await _runInSandbox(code, language, input, onStream);
    } finally {
        limiter.release();
    }
}

module.exports = { runInSandbox, _stats: () => limiter.stats() };
