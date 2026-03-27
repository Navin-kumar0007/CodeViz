/**
 * Advanced Backend Architecture - Learning Path
 * Scaling, Concurrency, and Infrastructure for Node.js applications.
 */

export const ADV_NODE_PATH = {
    id: 'node-advanced',
    title: 'Advanced Backend Architecture',
    icon: '🚀',
    category: 'Backend Engineering',
    description: 'Scale your applications with multi-processing, advanced databases, and containerization.',
    prerequisites: ['node-basics'],
    lessons: [
        {
            id: 'node-child-process',
            title: 'Child Processes: Spawn & Exec',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Node.js is single-threaded, but it doesn\'t mean we can\'t take advantage of multi-core systems. The `child_process` module allows us to spawn new processes that can execute other scripts or even non-Node.js commands.'
                },
                {
                    type: 'text',
                    content: '`spawn` is best for long-running processes that stream large amounts of data. `exec` is better for small, quick commands where you need the complete output at once.'
                }
            ],
            keyConcepts: [
                'child_process.spawn()',
                'child_process.exec()',
                'Inter-process communication (IPC)',
                'Standard I/O inheritance'
            ],
            code: {
                javascript: `const { spawn, exec } = require('child_process');

// 1. exec: Good for quick commands
exec('ls -lh', (error, stdout, stderr) => {
    if (error) return console.error(error);
    console.log('File list:', stdout);
});

// 2. spawn: Best for large data streaming
const child = spawn('find', ['.']);
child.stdout.on('data', (data) => {
    console.log(\`Found path: \${data}\`);
});`
            },
            quiz: [
                {
                    question: 'Which method is better for handling large output from a process?',
                    options: ['exec', 'spawn', 'fork', 'call'],
                    correct: 1,
                    explanation: 'spawn streams data in chunks, whereas exec buffers the entire output in memory.'
                }
            ]
        },
        {
            id: 'node-clustering',
            title: 'Scalability with Clustering',
            duration: '18 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A single instance of Node.js runs in a single thread. To take advantage of multi-core systems, we use the `cluster` module to launch a cluster of Node.js processes to handle the load.'
                },
                {
                    type: 'tip',
                    content: 'The cluster module allows you to create child processes (workers) that all share the same server ports. This provides built-in load balancing!'
                }
            ],
            keyConcepts: [
                'Primary and Worker processes',
                'cluster.fork()',
                'Zero-downtime restarts',
                'CPU Core utilization'
            ],
            code: {
                javascript: `const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isPrimary) {
    console.log(\`Primary \${process.pid} is running\`);

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(\`Worker \${worker.process.pid} died. Respawning...\`);
        cluster.fork();
    });
} else {
    // Workers share the TCP connection
    http.createServer((req, res) => {
        res.end('Hello from Worker ' + process.pid);
    }).listen(8000);
}`
            },
            quiz: [
                {
                    question: 'How do clusters improve performance?',
                    options: [
                        'They speed up the V8 engine',
                        'They allow a single server to use multiple CPU cores',
                        'They compress data automatically',
                        'They reduce memory usage'
                    ],
                    correct: 1,
                    explanation: 'Clustering runs multiple process instances, allowing the application to utilize several CPU cores concurrently.'
                }
            ]
        },
        {
            id: 'node-mongoose-mvc',
            title: 'Mongoose & MVC Pattern',
            duration: '25 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, and query building.'
                },
                {
                    type: 'text',
                    content: 'Organizing your backend into **MVC (Model-View-Controller)** separates logic into: **Models** (Data structure), **Controllers** (Business logic), and **Routes** (URL mapping).'
                }
            ],
            keyConcepts: [
                'Schemas and Models',
                'Virtuals and Middleware',
                'Validation',
                'Reference and Population'
            ],
            code: {
                javascript: `const mongoose = require('mongoose');

// Define Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: String,
    createdAt: { type: Date, default: Date.now }
});

// Model
const User = mongoose.model('User', userSchema);

// Usage in Controller
const createUser = async (data) => {
    const newUser = new User(data);
    return await newUser.save();
};`
            },
            quiz: [
                {
                    question: 'What is a "Model" in the MVC pattern for Node/Express?',
                    options: [
                        'The HTML template',
                        'The API endpoint',
                        'The data structure/database interface',
                        'The client-side JavaScript'
                    ],
                    correct: 2,
                    explanation: 'The Model handles data logic and interactions with the database.'
                }
            ]
        },
        {
            id: 'node-docker',
            title: 'Dockerizing Node.js',
            duration: '30 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Docker allows you to package an application with all of its dependencies into a standardized unit called a container. This ensures the app runs perfectly on any machine, regardless of the local environment.'
                },
                {
                    type: 'tip',
                    content: 'Use `.dockerignore` to keep your image small by excluding `node_modules` and other large environment files from being copied into the image.'
                }
            ],
            keyConcepts: [
                'Dockerfile',
                'Docker Images and Containers',
                'Multi-stage builds',
                'Environment variables in Docker'
            ],
            code: {
                javascript: `# Example Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Only copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 8080
CMD [ "node", "index.js" ]`
            },
            quiz: [
                {
                    question: 'What is the purpose of a .dockerignore file?',
                    options: [
                        'It encrypts the code',
                        'It prevents unnecessary files from entering the building image',
                        'It speeds up npm install',
                        'It manages database connections'
                    ],
                    correct: 1,
                    explanation: '.dockerignore prevents directories like node_modules or .git from being copied into the container, saving space and build time.'
                }
            ]
        }
    ]
};
