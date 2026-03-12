const { parentPort } = require('worker_threads');

/**
 * AI Worker
 * Handles heavy string cleaning and JSON parsing of LLM responses
 * to prevent blocking the main event loop.
 */

parentPort.on('message', (data) => {
    const { raw, type } = data;

    try {
        // 1. Clean markdown code fences
        const cleaned = raw
            .replace(/```json?\n?/g, '')
            .replace(/```/g, '')
            .trim();

        // 2. Parse JSON
        const parsed = JSON.parse(cleaned);

        // 3. Post-processing (type-specific)
        if (type === 'complexity') {
            // Ensure growthData spans are consistent
            if (parsed.growthData && !parsed.growthData.labels) {
                parsed.growthData.labels = [10, 50, 100, 500, 1000];
            }
        }

        parentPort.postMessage({ success: true, result: parsed });
    } catch (error) {
        // Falling back to raw text if parsing fails
        parentPort.postMessage({ success: false, raw: raw, error: error.message });
    }
});
