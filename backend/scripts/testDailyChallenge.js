const axios = require('axios');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const testUser = {
    _id: "65b9c7b4a1b2c3d4e5f6g7h8", // mock id
    name: "Test User",
    email: "test@example.com",
    role: "student"
};

const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

async function testChallenge() {
    try {
        console.log("Fetching challenge...");
        let challengeRes;
        try {
            challengeRes = await axios.get('http://localhost:5001/api/challenges/today', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Challenge:", challengeRes.data.title);
        } catch (e) {
             console.log("Failed to fetch challenge, attempting to create one");
             return;
        }

        const validCode = `arr = [1, 2, 3, 4, 5]
for i in range(len(arr) // 2):
    arr[i], arr[-i - 1] = arr[-i - 1], arr[i]
print(arr)`;

        console.log("Running Code...");
        const runRes = await axios.post('http://localhost:5001/run', {
            language: 'python',
            code: validCode
        });
        const output = runRes.data.output || runRes.data.trace.map(t => t.stdout).join('');
        console.log("Run Output:", output);

        console.log("Submitting Code...");
        const submitRes = await axios.post('http://localhost:5001/api/challenges/submit', {
            challengeId: challengeRes.data._id,
            output: output
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Submit Result:", submitRes.data);
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}

testChallenge();
