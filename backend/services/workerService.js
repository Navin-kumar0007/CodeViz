const { Worker } = require('worker_threads');
const path = require('path');

/**
 * Worker Service
 * Orchestrates worker threads for heavy processing.
 */

/**
 * Parses an AI response using a separate worker thread.
 * @param {string} raw - The raw text from the AI.
 * @param {string} type - The type of analysis (e.g., 'complexity', 'rubric').
 * @returns {Promise<object>} - The parsed JSON result.
 */
function parseAiResponse(raw, type) {
    return new Promise((resolve, reject) => {
        const workerPath = path.join(__dirname, '../utils/aiWorker.js');
        const worker = new Worker(workerPath);

        // Timeout the worker if it takes too long (1 second logic protection)
        const timeout = setTimeout(() => {
            worker.terminate();
            reject(new Error('Worker Thread Timeout (Parsing Failure)'));
        }, 1000);

        worker.postMessage({ raw, type });

        worker.on('message', (message) => {
            clearTimeout(timeout);
            worker.terminate();
            if (message.success) {
                resolve(message.result);
            } else {
                // If parsing failed, return raw or error
                resolve({ raw: message.raw, error: message.error });
            }
        });

        worker.on('error', (err) => {
            clearTimeout(timeout);
            worker.terminate();
            reject(err);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                clearTimeout(timeout);
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

module.exports = { parseAiResponse };
