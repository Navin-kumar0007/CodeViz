const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Problem = require('./models/Problem');

dotenv.config({ path: path.join(__dirname, '.env') });

const advancedProblems = [
    {
        title: "Advanced Node.js: Child Process IPC",
        slug: "node-child-process-ipc",
        difficulty: "hard",
        category: "Systems",
        description: "Implement a parent process that spawns a child process and communicates via IPC to calculate the factorial of a large number. The parent should send the number, and the child should send back the result.",
        constraints: ["The result must be returned as a string to avoid overflow.", "Must use process.send and process.on('message')"],
        examples: [{
            input: "number: 5",
            output: "result: '120'",
            explanation: "Parent sends 5, child calculates 5! and sends back '120'."
        }],
        starterCode: {
            javascript: "// Parent Code\nconst { fork } = require('child_process');\n// child_process.fork('./child.js');"
        },
        tags: ["Node.js", "Child Process", "IPC", "Systems Design"],
        order: 100
    },
    {
        title: "Node.js: Stream Transformation",
        slug: "node-stream-transform",
        difficulty: "medium",
        category: "Systems",
        description: "Create a Transform stream that converts incoming text to Uppercase and prepends a timestamp. Pipe a readable stream of lowercase letters through this transform to a writable stream.",
        constraints: ["Must use the Stream.Transform class."],
        examples: [{
            input: "'hello'",
            output: "'[TIMESTAMP] HELLO'",
            explanation: "The chunk 'hello' is transformed to 'HELLO' with a timestamp."
        }],
        starterCode: {
            javascript: "const { Transform } = require('stream');\n// class UpperTransform extends Transform { ... }"
        },
        tags: ["Node.js", "Streams", "Systems Design"],
        order: 101
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🌱 Seeding Advanced Systems Problems...");

        for (const p of advancedProblems) {
            await Problem.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true });
            console.log(`✅ Seeded: ${p.title}`);
        }

        console.log("🚀 Advanced Syllabus Integrated Successfully.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Seeding Failed:", e.message);
        process.exit(1);
    }
}

seed();
