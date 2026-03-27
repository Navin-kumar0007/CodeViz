const mongoose = require('mongoose');
require('dotenv').config();

const groqProvider = require('./services/groqService');

async function test() {
    console.log("🧪 Testing AI Provider completeness (GROQ-fallback)...");
    
    const requiredMethods = ['generateInterviewProblems', 'generateInterviewTestCases'];
    
    for (const method of requiredMethods) {
        if (typeof groqProvider[method] === 'function') {
            console.log(\`✅ SUCCESS: groqProvider has \${method} method.\`);
        } else {
            console.error(\`❌ FAIL: groqProvider missing \${method} method.\`);
            process.exit(1);
        }
    }
    
    process.exit(0);
}

test();
