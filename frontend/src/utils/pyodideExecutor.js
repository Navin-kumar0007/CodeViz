/**
 * 🐍 CodeViz Client-Side Python Executor (WASM)
 * Runs Python code in the browser using Pyodide to save server costs.
 */

let pyodideInstance = null;
let outputBuffer = [];

// 1. Initialize Pyodide (Singleton)
export const initPyodide = async () => {
    if (pyodideInstance) return pyodideInstance;

    console.log("⏳ Loading Pyodide WASM...");
    pyodideInstance = await loadPyodide();
    console.log("✅ Pyodide Loaded!");
    return pyodideInstance;
};

// 2. Execute Python Code
export const runPythonLocally = async (code) => {
    const pyodide = await initPyodide();
    outputBuffer = []; // Clear buffer

    // Capture stdout (print statements)
    pyodide.setStdout({
        batched: (msg) => outputBuffer.push(msg)
    });

    try {
        // Run code
        await pyodide.runPythonAsync(code);
        return { success: true, output: outputBuffer.join('\n') };
    } catch (err) {
        return { success: false, output: err.toString() };
    }
};

// 3. Generate Trace (Advanced - Mock for now)
// To visualize execution, we would need to inject current_frame() logic here.
// For Phase 8.1, we focus on OUTPUT, while still using Backend for VISUALIZATION.
