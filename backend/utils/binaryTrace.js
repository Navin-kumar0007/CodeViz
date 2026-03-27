/**
 * ⚡ CodeViz Binary Trace Utility
 * Compacts large execution traces into a binary buffer to reduce payload size
 * and network latency.
 */

/**
 * Packs a trace array into a binary Buffer
 * @param {Array} trace - Array of trace steps
 * @returns {Buffer} - Packed binary data
 */
const packTrace = (trace) => {
    if (!trace || !Array.isArray(trace)) return Buffer.alloc(0);

    const stepCount = trace.length;
    const buffers = [];

    // Header: Step Count (4 bytes, UInt32BE)
    const header = Buffer.alloc(4);
    header.writeUInt32BE(stepCount, 0);
    buffers.push(header);

    const encoder = new TextEncoder();

    for (const step of trace) {
        // 1. Line (4 bytes, Int32 to support -1)
        const lineBuf = Buffer.alloc(4);
        lineBuf.writeInt32BE(step.line !== undefined ? step.line : 0, 0);
        buffers.push(lineBuf);

        // 2. Stdout
        const stdoutStr = step.stdout || "";
        const stdoutEncoded = encoder.encode(stdoutStr);
        const stdoutLenBuf = Buffer.alloc(4);
        stdoutLenBuf.writeUInt32BE(stdoutEncoded.length, 0);
        buffers.push(stdoutLenBuf);
        buffers.push(Buffer.from(stdoutEncoded));

        // 3. Variables (JSON)
        const varsStr = JSON.stringify(step.variables || {});
        const varsEncoded = encoder.encode(varsStr);
        const varsLenBuf = Buffer.alloc(4);
        varsLenBuf.writeUInt32BE(varsEncoded.length, 0);
        buffers.push(varsLenBuf);
        buffers.push(Buffer.from(varsEncoded));
        
        // 4. Hits (if present, 4 bytes)
        const hitsBuf = Buffer.alloc(4);
        hitsBuf.writeUInt32BE(step.hits || 0, 0);
        buffers.push(hitsBuf);
    }

    return Buffer.concat(buffers);
};

module.exports = { packTrace };
