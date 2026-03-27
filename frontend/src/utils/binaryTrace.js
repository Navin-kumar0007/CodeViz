/**
 * ⚡ CodeViz Binary Trace Unpacker
 * Decodes binary trace buffers back into JavaScript objects.
 */

const unpackTrace = (buffer) => {
    if (!buffer || buffer.byteLength < 4) return [];

    const view = new DataView(buffer);
    const decoder = new TextDecoder();
    let offset = 0;

    // Header: Step Count
    const stepCount = view.getUint32(offset);
    offset += 4;

    const trace = [];

    for (let i = 0; i < stepCount; i++) {
        // Line (Int32 to support -1)
        const line = view.getInt32(offset);
        offset += 4;

        // Stdout
        const stdoutLen = view.getUint32(offset);
        offset += 4;
        const stdout = decoder.decode(new Uint8Array(buffer, offset, stdoutLen));
        offset += stdoutLen;

        // Variables
        const varsLen = view.getUint32(offset);
        offset += 4;
        const varsStr = decoder.decode(new Uint8Array(buffer, offset, varsLen));
        const variables = JSON.parse(varsStr);
        offset += varsLen;

        // Hits
        const hits = view.getUint32(offset);
        offset += 4;

        trace.push({ line, stdout, variables, hits });
    }

    return trace;
};

export { unpackTrace };
