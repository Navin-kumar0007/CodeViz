/**
 * System Design - Learning Path
 * Design systems that scale to millions of users.
 */

export const SYSTEM_DESIGN_PATH = {
    id: 'system-design',
    title: 'System Design',
    icon: '🏗️',
    category: 'System Design',
    description: 'Learn the building blocks of scalable systems — load balancing, caching, databases, and trade-offs.',
    prerequisites: [],
    lessons: [
        {
            id: 'scalability-basics',
            title: 'Scalability Basics',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'A system **scales** when it handles more load by adding resources. **Vertical scaling** means a bigger machine; **horizontal scaling** means more machines.' },
                { type: 'text', content: 'Horizontal scaling is preferred at large scale — it has no single hardware ceiling and improves fault tolerance. A **load balancer** spreads requests across servers.' },
                { type: 'tip', content: 'Stateless services scale horizontally most easily — keep session state in a shared store (Redis/DB), not in memory.' },
            ],
            keyConcepts: [
                'Vertical = bigger box; Horizontal = more boxes',
                'Load balancers distribute traffic across servers',
                'Stateless services scale out cleanly',
                'Horizontal scaling improves fault tolerance',
            ],
            code: {
                python: `# Conceptual: a load balancer round-robins requests
servers = ["srv-1", "srv-2", "srv-3"]

def route(request_id):
    # pick a server by round-robin
    return servers[request_id % len(servers)]

for i in range(6):
    print(f"request {i} -> {route(i)}")`,
            },
            quiz: [
                {
                    question: 'What is horizontal scaling?',
                    options: ['Upgrading to a bigger single machine', 'Adding more machines to share load', 'Deleting servers', 'Caching data'],
                    correct: 1,
                    explanation: 'Horizontal scaling adds more machines; vertical scaling makes one machine bigger.',
                },
                {
                    question: 'Why are stateless services easier to scale out?',
                    options: ['They use no memory', 'Any server can handle any request', 'They never fail', 'They are faster to code'],
                    correct: 1,
                    explanation: 'With no per-server session state, requests can go to any instance behind the load balancer.',
                },
            ],
        },
        {
            id: 'caching-load-balancing',
            title: 'Caching & CDNs',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'A **cache** stores expensive results close to where they are needed, cutting latency and database load. Common layers: in-memory (Redis), application, and CDN.' },
                { type: 'text', content: 'A **CDN** caches static assets at edge locations near users. The hard part of caching is **invalidation** — keeping cached data fresh.' },
                { type: 'text', content: 'Common strategies: **cache-aside** (app checks cache, then DB), **TTL** expiry, and **write-through** (write to cache and DB together).' },
                { type: 'warning', content: 'Stale cache is a top source of bugs. Always define how and when entries expire.' },
            ],
            keyConcepts: [
                'Caches reduce latency and database load',
                'CDNs cache static assets near users',
                'Cache-aside and TTL are common patterns',
                'Invalidation is the hardest part of caching',
            ],
            code: {
                python: `# Cache-aside pattern
def get_user(user_id, cache, db):
    key = f"user:{user_id}"
    cached = cache.get(key)
    if cached:
        return cached                 # cache hit
    user = db.find_user(user_id)      # cache miss -> DB
    cache.set(key, user, ttl=300)     # store for 5 min
    return user`,
            },
            quiz: [
                {
                    question: 'What does a CDN primarily cache?',
                    options: ['Passwords', 'Static assets near users', 'SQL queries', 'Server logs'],
                    correct: 1,
                    explanation: 'CDNs cache static content at edge locations to reduce latency for nearby users.',
                },
                {
                    question: 'In cache-aside, what happens on a cache miss?',
                    options: ['Return an error', 'Fetch from the database, then populate the cache', 'Restart the server', 'Ignore the request'],
                    correct: 1,
                    explanation: 'On a miss the app reads from the DB and stores the result in the cache for next time.',
                },
            ],
        },
        {
            id: 'databases-tradeoffs',
            title: 'Databases & Trade-offs',
            duration: '9 min',
            explanation: [
                { type: 'text', content: '**SQL** databases give strong consistency and joins; **NoSQL** offers flexible schemas and easy horizontal scaling. Choose by access pattern, not hype.' },
                { type: 'text', content: '**Replication** copies data to multiple nodes (read scaling, failover). **Sharding** splits data across nodes by a key (write scaling).' },
                { type: 'text', content: 'The **CAP theorem** says under a network partition you must choose Consistency or Availability — you cannot have both.' },
                { type: 'tip', content: 'Most real systems mix stores: a relational DB for core data, a cache for speed, and object storage for files.' },
            ],
            keyConcepts: [
                'SQL = consistency + joins; NoSQL = flexibility + scale',
                'Replication scales reads and adds failover',
                'Sharding partitions data to scale writes',
                'CAP: under a partition, pick Consistency or Availability',
            ],
            code: {
                python: `# Sharding: route a record to a shard by key hash
shards = ["db-a", "db-b", "db-c", "db-d"]

def shard_for(user_id):
    return shards[hash(user_id) % len(shards)]

print(shard_for("ada"))
print(shard_for("linus"))`,
            },
            quiz: [
                {
                    question: 'What does sharding achieve?',
                    options: ['Encrypts data', 'Splits data across nodes to scale writes', 'Deletes old rows', 'Caches queries'],
                    correct: 1,
                    explanation: 'Sharding partitions data by a key across nodes, distributing write load.',
                },
                {
                    question: 'The CAP theorem forces a choice between which two under a partition?',
                    options: ['Cost and Performance', 'Consistency and Availability', 'Caching and Persistence', 'CPU and Memory'],
                    correct: 1,
                    explanation: 'During a network partition you can guarantee Consistency or Availability, not both.',
                },
            ],
        },
    ],
};
