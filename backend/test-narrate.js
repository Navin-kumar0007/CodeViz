require('dotenv').config();
const { narrateCode } = require('./services/geminiService');

async function test() {
  try {
    const raw = await narrateCode("print('hello')", "python", "testuser");
    console.log("RAW OUTPUT:", raw);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
