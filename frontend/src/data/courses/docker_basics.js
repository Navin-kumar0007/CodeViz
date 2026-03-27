/**
 * Docker Foundations - Learning Path
 * The building blocks of containerization.
 */

export const DOCKER_BASICS_PATH = {
    id: 'docker-basics',
    title: 'Docker Foundations',
    icon: '🐳',
    category: 'Cloud & DevOps',
    description: 'Learn to package apps into standardized units. Master Images, Containers, and the Dockerfile.',
    prerequisites: ['basics'],
    lessons: [
        {
            id: 'what-is-docker',
            title: 'Containers vs Virtual Machines',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Container** is a lightweight, standalone package that includes everything needed to run an application. Unlike Virtual Machines (VMs), containers share the host OS kernel, making them much faster and smaller.'
                },
                {
                    type: 'text',
                    content: 'Docker Solve the "It works on my machine" problem by ensuring the environment is identical everywhere.'
                }
            ],
            keyConcepts: [
                'Containerization',
                'Isolation',
                'Portability',
                'Kernel Sharing'
            ],
            code: {
                javascript: `// Concept: Container isolation
const app = "My Web App";
const dependencies = ["Node.js", "Express"];

const container = {
    os: "Alpine Linux",
    runtime: "Node 18",
    app,
    dependencies
};

console.log("Running isolated environment...");`,
                bash: `# Check running containers
docker ps

# Run your first container
docker run hello-world`
            },
            quiz: [
                {
                    question: 'How do containers differ from Virtual Machines?',
                    options: [
                         'Containers include a full OS, VMs do not',
                         'Containers share the host OS kernel, VMs have their own',
                         'VMs are faster to start than containers',
                         'Containers can only run on Linux'
                    ],
                    correct: 1,
                    explanation: 'Containers are more efficient because they share the host system\'s kernel instead of hardware-emulating a whole new OS.'
                }
            ]
        },
        {
            id: 'docker-images',
            title: 'Images & The Dockerfile',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Docker Image** is a read-only template used to create containers. You create images using a **Dockerfile**—a text file containing a list of instructions.'
                },
                {
                    type: 'tip',
                    content: 'Images are built in **layers**. Each instruction in your Dockerfile adds a new layer. Reusing layers makes builds incredibly fast!'
                }
            ],
            keyConcepts: [
                'Base Images (FROM)',
                'Layer Caching',
                'Build Context',
                'Image Tagging'
            ],
            code: {
                dockerfile: `# 1. Start from a base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy files
COPY package*.json ./
RUN npm install
COPY . .

# 4. Command to run
CMD ["npm", "start"]`
            },
            quiz: [
                {
                    question: 'What is a Dockerfile?',
                    options: [
                        'A script to start a container',
                        'A blueprint for building a Docker Image',
                        'A tool to manage database backups',
                        'A configuration for Kubernetes'
                    ],
                    correct: 1,
                    explanation: 'A Dockerfile is a manifest of instructions that Docker uses to automatically build an image.'
                }
            ]
        }
    ]
};
