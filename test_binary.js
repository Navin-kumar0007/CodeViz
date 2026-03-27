const { packTrace } = require('./backend/utils/binaryTrace');

const mockTrace = [
    { line: 1, stdout: "Hello", variables: { x: 10 }, hits: 1 },
    { line: 2, stdout: "World", variables: { y: [1, 2, 3] }, hits: 2 }
];

try {
    const buffer = packTrace(mockTrace);
    console.log('✅ Binary Packing Success');
    console.log('Buffer Length:', buffer.length);
    console.log('Step Count (Header):', buffer.readUInt32BE(0));
    
    // Manual verification of first step
    const line1 = buffer.readUInt32BE(4);
    console.log('Step 1 Line:', line1);
    
    if (line1 === 1 && buffer.readUInt32BE(0) === 2) {
        console.log('🧪 BINARY TEST PASSED');
    } else {
        console.log('❌ BINARY TEST FAILED');
    }
} catch (err) {
    console.error('❌ Binary Test Error:', err);
}
