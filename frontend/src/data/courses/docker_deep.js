/**
 * Docker in Depth - Learning Path
 * Go beyond the basics: images, layers, networking, and volumes.
 */

export const DOCKER_DEEP_PATH = {
    id: 'docker-deep',
    title: 'Docker in Depth',
    icon: '🐳',
    category: 'Cloud & DevOps',
    description: 'Master Docker images, layer caching, volumes, and networking for production containers.',
    prerequisites: ['docker-basics'],
    lessons: [
        {
            id: 'images-layers',
            title: 'Images, Layers & Caching',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'A Docker **image** is built from a **Dockerfile** as a stack of read-only **layers** — one per instruction. Containers add a writable layer on top.' },
                { type: 'text', content: 'Docker **caches** layers: if an instruction and its inputs are unchanged, it reuses the cached layer. Order instructions from least- to most-frequently changing.' },
                { type: 'tip', content: 'Copy package manifests and install deps BEFORE copying source, so dependency layers stay cached when only code changes.' },
            ],
            keyConcepts: [
                'Each Dockerfile instruction creates a layer',
                'Layers are cached and reused when unchanged',
                'Order matters: stable steps first',
                'Install dependencies before copying source',
            ],
            code: {
                bash: `# Dockerfile — layer order optimized for caching
FROM node:20-alpine
WORKDIR /app

# 1) deps layer — cached unless package.json changes
COPY package*.json ./
RUN npm ci

# 2) source layer — changes often, rebuilt on code edits
COPY . .

CMD ["node", "server.js"]`,
            },
            quiz: [
                {
                    question: 'Why copy package.json and install deps before copying source?',
                    options: ['It looks cleaner', 'So the dependency layer stays cached when only code changes', 'Docker requires it', 'To reduce security risk'],
                    correct: 1,
                    explanation: 'Dependencies change less often; installing them first keeps that expensive layer cached.',
                },
                {
                    question: 'What creates a new image layer?',
                    options: ['Running the container', 'Each Dockerfile instruction', 'Every request', 'Nothing'],
                    correct: 1,
                    explanation: 'Each instruction (FROM, COPY, RUN…) adds a layer to the image.',
                },
            ],
        },
        {
            id: 'volumes-persistence',
            title: 'Volumes & Persistence',
            duration: '7 min',
            explanation: [
                { type: 'text', content: 'A container’s writable layer is **ephemeral** — deleted with the container. To persist data, use **volumes**.' },
                { type: 'text', content: '**Named volumes** are managed by Docker (great for databases). **Bind mounts** map a host folder into the container (great for local dev with live reload).' },
                { type: 'warning', content: 'Never store a database inside the container’s writable layer — you will lose data when it is recreated.' },
            ],
            keyConcepts: [
                'Container filesystem is ephemeral by default',
                'Named volumes persist and are Docker-managed',
                'Bind mounts map host folders for dev',
                'Persist stateful data (DBs) in volumes',
            ],
            code: {
                bash: `# Named volume for a database (persists across restarts)
docker run -d \\
  -v pgdata:/var/lib/postgresql/data \\
  postgres:16

# Bind mount for local development (live code)
docker run -it \\
  -v "$(pwd)":/app \\
  node:20 bash`,
            },
            quiz: [
                {
                    question: 'What happens to a container’s writable layer when it is removed?',
                    options: ['It is backed up', 'It is deleted (ephemeral)', 'It becomes an image', 'It is encrypted'],
                    correct: 1,
                    explanation: 'The writable layer is ephemeral; data there is lost unless stored in a volume.',
                },
                {
                    question: 'Which is best for persisting a database?',
                    options: ['A bind mount to /tmp', 'A named volume', 'The container writable layer', 'Environment variables'],
                    correct: 1,
                    explanation: 'Named volumes are Docker-managed and durable — ideal for databases.',
                },
            ],
        },
        {
            id: 'networking',
            title: 'Container Networking',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'Containers on the same Docker **network** reach each other by **service name** as a hostname — no IPs needed.' },
                { type: 'text', content: 'Publish a port to the host with `-p host:container` to expose a service externally. Internal services should stay unpublished.' },
                { type: 'tip', content: 'In docker-compose, every service joins a default network and can call others by their service name (e.g. `http://api:3000`).' },
            ],
            keyConcepts: [
                'Containers on a network resolve each other by name',
                '-p host:container publishes a port to the host',
                'Keep internal services unpublished',
                'Compose services talk via service names',
            ],
            code: {
                bash: `# docker-compose.yml
services:
  api:
    build: .
    # no ports needed for internal-only access

  web:
    image: nginx
    ports:
      - "8080:80"        # exposed to host
    # web can reach the API at http://api:3000`,
            },
            quiz: [
                {
                    question: 'How do containers on the same network find each other?',
                    options: ['By hardcoded IP', 'By service name as a hostname', 'By email', 'They cannot'],
                    correct: 1,
                    explanation: 'Docker provides DNS so containers reach each other by service/container name.',
                },
                {
                    question: 'What does -p 8080:80 do?',
                    options: ['Deletes port 80', 'Maps host port 8080 to container port 80', 'Encrypts traffic', 'Limits memory'],
                    correct: 1,
                    explanation: 'It publishes container port 80 on host port 8080, making it reachable externally.',
                },
            ],
        },
    ],
};
