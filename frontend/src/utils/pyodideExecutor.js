/* global loadPyodide */
/**
 * 🐍 CodeViz Client-Side Python Executor (WASM)
 * Runs Python code in the browser using Pyodide to save server costs.
 */

let pyodideInstance = null;
let outputBuffer = [];

const LOAD_TIMEOUT_MS = 20000; // don't hang forever if the CDN is slow/blocked

// 1. Initialize Pyodide (Singleton). Throws 'PYODIDE_UNAVAILABLE' if the CDN script
//    never loaded (offline / blocked) or the WASM load stalls — callers fall back to
//    the server executor instead of crashing.
export const initPyodide = async () => {
    if (pyodideInstance) return pyodideInstance;
    if (typeof loadPyodide === 'undefined') {
        throw new Error('PYODIDE_UNAVAILABLE');
    }
    console.log("⏳ Loading Pyodide WASM...");
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('PYODIDE_TIMEOUT')), LOAD_TIMEOUT_MS));
    pyodideInstance = await Promise.race([loadPyodide(), timeout]);
    console.log("✅ Pyodide Loaded!");
    return pyodideInstance;
};

// 2. Execute Python Code. Never throws. Returns:
//    { success:true, output }                       → ran locally
//    { success:false, output }                      → real Python error (show it)
//    { success:false, unavailable:true, output }    → engine couldn't load → use the server
export const runPythonLocally = async (code) => {
    let pyodide;
    try {
        pyodide = await initPyodide();
    } catch {
        pyodideInstance = null; // allow a later retry
        return { success: false, unavailable: true, output: 'Local Python engine unavailable — running on the server instead.' };
    }

    outputBuffer = []; // Clear buffer
    try {
        pyodide.setStdout({ batched: (msg) => outputBuffer.push(msg) });
        await pyodide.runPythonAsync(code);
        return { success: true, output: outputBuffer.join('\n') };
    } catch (err) {
        return { success: false, output: err.toString() };
    }
};

// 3. Generate Trace (Advanced - Mock for now)
// To visualize execution, we would need to inject current_frame() logic here.
// For Phase 8.1, we focus on OUTPUT, while still using Backend for VISUALIZATION.
