const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Docker Service
 * Manages secure code execution inside isolated Docker containers.
 */

const DOCKER_IMAGE = 'codeviz-runner:latest';
const TIMEOUT_MS = 5000; // 5 seconds security timeout
const MEMORY_LIMIT = '256m';

/**
 * Execute code in a sandboxed Docker container
 * @param {string} code - The user's code
 * @param {string} language - The programming language
 * @param {string} input - Optional stdin input
 * @param {function} onStream - Optional callback for live output streaming
 * @returns {Promise<object>} - Execution results (stdout, stderr, exitCode)
 */
async function runInSandbox(code, language, input = '', onStream = null) {
    return new Promise((resolve) => {
        // Create a temporary unique filename for the container to mount
        const timestamp = Date.now() + '_' + Math.random().toString(36).slice(2);
        const tempDir = path.join(__dirname, '../temp/sandbox');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        let fileName;
        let runCommand;

        switch (language) {
            case 'python':
                fileName = `script_${timestamp}.py`;
                runCommand = `python3 /home/runner/code/${fileName}`;
                break;
            case 'javascript':
                fileName = `script_${timestamp}.js`;
                runCommand = `node /home/runner/code/${fileName}`;
                break;
            case 'cpp':
                fileName = `script_${timestamp}.cpp`;
                runCommand = `g++ /home/runner/code/${fileName} -o /home/runner/code/out && /home/runner/code/out`;
                break;
            case 'java':
                fileName = `Main.java`;
                runCommand = `javac /home/runner/code/Main.java && java -cp /home/runner/code Main`;
                break;
            default:
                return resolve({ error: `Language ${language} not supported in sandbox.` });
        }

        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, code);

        const dockerArgs = [
            'run', '--rm',
            '-i',
            '--network', 'none',
            '--memory', MEMORY_LIMIT,
            '-v', `${tempDir}:/home/runner/code`,
            DOCKER_IMAGE,
            'bash', '-c', `echo ${JSON.stringify(input)} | ${runCommand}`
        ];

        const container = spawn('docker', dockerArgs);

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
            stderr += data.toString();
        });

        container.on('close', (code) => {
            clearTimeout(timeout);
            if (killed) return;

            // Cleanup the file
            try { fs.unlinkSync(filePath); } catch (e) { }

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

module.exports = { runInSandbox };
