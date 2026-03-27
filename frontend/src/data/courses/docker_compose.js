/**
 * Docker Compose - Learning Path
 * Orchestrating multi-container applications.
 */

export const DOCKER_COMPOSE_PATH = {
    id: 'docker-compose',
    title: 'Multi-Container Apps',
    icon: '🔗',
    category: 'Cloud & DevOps',
    description: 'Learn to manage complex applications with multiple services using Docker Compose.',
    prerequisites: ['docker-basics'],
    lessons: [
        {
            id: 'intro-to-compose',
            title: 'The YAML Blueprint',
            duration: '12 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Most real-world apps need more than one container (e.g., a Backend + a Database). **Docker Compose** lets you define and run multi-container applications using a single YAML file.'
                },
                {
                    type: 'text',
                    content: 'With one command (\`docker-compose up\`), you can spin up your entire stack with networking and volumes automatically configured.'
                }
            ],
            keyConcepts: [
                'Services',
                'Networks',
                'Volumes',
                'Environment Variables'
            ],
            code: {
                yaml: `# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret`
            },
            quiz: [
                {
                    question: 'What is the primary purpose of Docker Compose?',
                    options: [
                        'To speed up a single container',
                        'To define and run multi-container applications',
                        'To replace Kubernetes in production',
                        'To write better JavaScript code'
                    ],
                    correct: 1,
                    explanation: 'Docker Compose simplifies the management of applications that require multiple interconnected services.'
                }
            ]
        }
    ]
};
