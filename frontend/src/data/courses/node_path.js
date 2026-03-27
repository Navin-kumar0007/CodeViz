/**
 * Node.js Fundamentals - Learning Path
 * Comprehensive guide to the Node.js runtime and core modules.
 */

export const NODE_PATH = {
    id: 'node-basics',
    title: 'Node.js Fundamentals',
    icon: '📦',
    category: 'Backend Engineering',
    description: 'Master the Node.js runtime, event loop, module system, and core API.',
    prerequisites: ['basics'],
    lessons: [
        {
            id: 'node-intro',
            title: 'What is Node.js?',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Node.js is a **cross-platform, open-source JavaScript runtime environment** that can run on Windows, Linux, Unix, macOS, and more. It runs on the V8 JavaScript engine (the same one that powers Chrome) and executes JavaScript code outside a web browser.'
                },
                {
                    type: 'tip',
                    content: 'Node.js uses an **Asynchronous, Event-Driven, Non-blocking I/O model**, making it incredibly efficient and lightweight for data-intensive real-time applications.'
                },
                {
                    type: 'text',
                    content: 'In standard synchronous programming, the processor waits for I/O operations (like reading a file or a network request) to finish. Node.js continues executing other code while waiting, and triggers a callback when the operation completes.'
                }
            ],
            keyConcepts: [
                'V8 Engine',
                'Event-Driven Architecture',
                'Non-blocking I/O',
                'Single-threaded execution with Libuv'
            ],
            code: {
                javascript: `// A simple Node.js HTTP server
const http = require('http');

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello from Node.js!\\n');
});

server.listen(3000, '127.0.0.1', () => {
    console.log('Server running at http://127.0.0.1:3000/');
});`
            },
            quiz: [
                {
                    question: 'Which engine powers Node.js?',
                    options: ['SpiderMonkey', 'Chakra', 'V8', 'Nitro'],
                    correct: 2,
                    explanation: 'Node.js is built on Chrome\'s V8 JavaScript engine.'
                },
                {
                    question: 'What is a core characteristic of Node.js I/O?',
                    options: ['Blocking', 'Synchronous', 'Non-blocking', 'Multi-threaded'],
                    correct: 2,
                    explanation: 'Node.js uses non-blocking I/O, allowing it to handle many operations concurrently without waiting.'
                }
            ]
        },
        {
            id: 'node-process',
            title: 'Process & Environment',
            duration: '12 min',
            explanation: [
                {
                    type: 'text',
                    content: 'The `process` object in Node.js provides information about, and control over, the current Node.js process. It is a global object, so you don\'t need to `require()` it.'
                },
                {
                    type: 'text',
                    content: 'The `process.env` property returns an object containing the user environment. This is often used to store configuration like database strings or API keys (typically loaded from a `.env` file).'
                }
            ],
            keyConcepts: [
                'process.env',
                'process.argv',
                'process.exit()',
                'Environment Variables'
            ],
            code: {
                javascript: `// Accessing environment and arguments
console.log('Current PID:', process.pid);
console.log('Node Version:', process.version);

// Environment variables
const PORT = process.env.PORT || 3000;
console.log(\`Server will run on port \${PORT}\`);

// CLI Arguments
// Run as: node app.js --user=admin
process.argv.forEach((val, index) => {
  console.log(\`\${index}: \${val}\`);
});`
            },
            quiz: [
                {
                    question: 'How do you access environment variables in Node.js?',
                    options: ['process.settings', 'process.env', 'node.env', 'global.env'],
                    correct: 1,
                    explanation: 'Environment variables are stored in the process.env object.'
                }
            ]
        },
        {
            id: 'node-modules',
            title: 'Modules: CJS vs ESM',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Node.js has two module systems: **CommonJS (CJS)**, the original system, and **ES Modules (ESM)**, the standard used in modern JavaScript.'
                },
                {
                    type: 'text',
                    content: 'CommonJS uses `require()` and `module.exports`, while ES Modules use `import` and `export`. By default, `.js` files in Node.js are treated as CommonJS unless you set `"type": "module"` in `package.json` or use the `.mjs` extension.'
                }
            ],
            keyConcepts: [
                'CommonJS (require/exports)',
                'ES Modules (import/export)',
                'package.json types',
                'NPM modules'
            ],
            code: {
                javascript: `// math.js (CJS)
module.exports.add = (a, b) => a + b;

// app.js (CJS)
const { add } = require('./math');
console.log(add(5, 5));

// --- Transitioning to ESM ---

// math.mjs (ESM)
export const multiply = (a, b) => a * b;

// app.mjs (ESM)
import { multiply } from './math.mjs';
console.log(multiply(5, 5));`
            },
            quiz: [
                {
                    question: 'Which keyword is used to include a CommonJS module?',
                    options: ['import', 'require', 'include', 'fetch'],
                    correct: 1,
                    explanation: 'CommonJS uses the require() function to load modules.'
                }
            ]
        },
        {
            id: 'node-events',
            title: 'Events & EventEmitter',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Every action on a computer is an event. Like when a connection is made or a file is opened. In Node.js, we can use the `events` module to create, fire, and listen for our own events.'
                },
                {
                    type: 'text',
                    content: 'The core of Node.js\'s event-driven architecture is the `EventEmitter` class. Objects that emit events are instances of this class.'
                }
            ],
            keyConcepts: [
                'emitter.on()',
                'emitter.emit()',
                'Custom Events',
                'Event-driven flow'
            ],
            code: {
                javascript: `const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// 1. Assign an event handler
myEmitter.on('login', (user) => {
    console.log(\`User \${user} has logged in.\`);
});

// 2. Fire the event
myEmitter.emit('login', 'Alice');`
            },
            quiz: [
                {
                    question: 'Which method is used to trigger an event?',
                    options: ['trigger()', 'fire()', 'emit()', 'dispatch()'],
                    correct: 2,
                    explanation: 'The emit() method is used to trigger a named event.'
                }
            ]
        },
        {
            id: 'node-fs',
            title: 'FS Module & Path',
            duration: '20 min',
            explanation: [
                {
                    type: 'text',
                    content: 'The File System (`fs`) module allows you to work with the file system on your computer. You can read files, create files, update files, delete files, and rename files.'
                },
                {
                    type: 'tip',
                    content: 'Always prefer the asynchronous methods (e.g., `fs.readFile`) or the promises-based API (`fs.promises`) to avoid blocking the single execution thread.'
                }
            ],
            keyConcepts: [
                'fs.readFile / fs.writeFile',
                'Synchronous vs Asynchronous',
                'path.join',
                'File descriptors'
            ],
            code: {
                javascript: `const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data.txt');

// Asynchronous Read
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err;
    console.log('File Content:', data);
});

// Promises API (Modern approach)
const fsPromises = require('fs').promises;
async function writeData() {
    await fsPromises.writeFile('log.txt', 'Log entry: ' + new Date());
    console.log('Write complete');
}
writeData();`
            },
            quiz: [
                {
                    question: 'Why should you avoid using fs.readFileSync in a production server?',
                    options: [
                        'It is deprecated',
                        'It blocks the event loop',
                        'It is less secure',
                        'It cannot read large files'
                    ],
                    correct: 1,
                    explanation: 'Sync methods block the single-threaded event loop, preventing the server from handling other requests until the file operation finishes.'
                }
            ]
        },
        {
            id: 'node-streams',
            title: 'Streams & Buffers',
            duration: '25 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Streams are objects that let you read data from a source or write data to a destination in a continuous fashion. Instead of loading a 1GB file into memory all at once, you process it chunk by chunk.'
                },
                {
                    type: 'text',
                    content: 'A **Buffer** is a temporary storage area for data while it is being transferred. It represents a fixed-size chunk of memory outside the V8 heap.'
                }
            ],
            keyConcepts: [
                'Readable and Writable Streams',
                'Pipe method',
                'Backpressure',
                'Buffer manipulation'
            ],
            code: {
                javascript: `const fs = require('fs');

// Create a readable stream
const reader = fs.createReadStream('large_input.txt');
// Create a writable stream
const writer = fs.createWriteStream('output_copy.txt');

// Use pipe to transfer data automatically
// This handles "backpressure" (speed difference) for us!
reader.pipe(writer);

reader.on('end', () => console.log('Copy complete!'));`
            },
            quiz: [
                {
                    question: 'What is the main benefit of using Streams?',
                    options: [
                        'Encryption',
                        'Handling large data efficiently without high memory usage',
                        'Automated formatting',
                        'Database connectivity'
                    ],
                    correct: 1,
                    explanation: 'Streams process data in chunks, allowing you to handle massive files or data feeds without exhausting system memory.'
                }
            ]
        }
    ]
};
