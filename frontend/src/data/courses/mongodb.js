/**
 * MongoDB & NoSQL - Learning Path
 * Store and query flexible document data.
 */

export const MONGODB_PATH = {
    id: 'mongodb',
    title: 'MongoDB & NoSQL',
    icon: '🍃',
    category: 'Databases',
    description: 'Model, query, and aggregate document data with MongoDB — the database behind modern apps.',
    prerequisites: [],
    lessons: [
        {
            id: 'documents-crud',
            title: 'Documents & CRUD',
            duration: '7 min',
            explanation: [
                { type: 'text', content: '**MongoDB** stores **documents** (JSON-like objects) inside **collections**. Unlike SQL rows, documents can have flexible, nested shapes.' },
                { type: 'text', content: 'The four basic operations are **C**reate, **R**ead, **U**pdate, **D**elete — `insertOne`, `find`, `updateOne`, `deleteOne`.' },
                { type: 'tip', content: 'Every document gets a unique `_id` automatically if you do not provide one.' },
            ],
            keyConcepts: [
                'Documents are JSON-like and can be nested',
                'Collections group related documents',
                'CRUD = insert, find, update, delete',
                'Each document has a unique _id',
            ],
            code: {
                javascript: `// MongoDB shell / driver style
db.users.insertOne({
  name: "Ada",
  email: "ada@example.com",
  roles: ["admin", "author"]
});

db.users.find({ name: "Ada" });

db.users.updateOne(
  { name: "Ada" },
  { $set: { active: true } }
);

db.users.deleteOne({ name: "Ada" });`,
            },
            quiz: [
                {
                    question: 'What does MongoDB store inside collections?',
                    options: ['Rows and columns', 'JSON-like documents', 'CSV files', 'Images only'],
                    correct: 1,
                    explanation: 'MongoDB stores flexible, JSON-like documents grouped into collections.',
                },
                {
                    question: 'Which operation adds a new document?',
                    options: ['find', 'insertOne', 'deleteOne', 'updateOne'],
                    correct: 1,
                    explanation: 'insertOne creates a new document in the collection.',
                },
            ],
        },
        {
            id: 'queries-indexes',
            title: 'Queries & Indexes',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'Queries use a filter document. **Operators** like `$gt`, `$in`, and `$or` express conditions: `{ age: { $gt: 18 } }`.' },
                { type: 'text', content: 'Refine results with `.sort()`, `.limit()`, and projection (choosing fields).' },
                { type: 'text', content: 'An **index** makes queries on a field fast by avoiding a full collection scan — essential as data grows.' },
                { type: 'warning', content: 'Querying an unindexed field on a large collection scans every document — slow. Index fields you filter or sort on.' },
            ],
            keyConcepts: [
                'Query operators: $gt, $lt, $in, $or, $and',
                'sort, limit, and projection shape results',
                'Indexes speed up filtering and sorting',
                'Unindexed queries do a full collection scan',
            ],
            code: {
                javascript: `// Adults, newest first, name + email only
db.users.find(
  { age: { $gt: 18 }, roles: { $in: ["author"] } },
  { name: 1, email: 1, _id: 0 }
).sort({ createdAt: -1 }).limit(10);

// Speed up queries on email
db.users.createIndex({ email: 1 });`,
            },
            quiz: [
                {
                    question: 'What does the $gt operator mean?',
                    options: ['Greater than', 'Group total', 'Get text', 'Global type'],
                    correct: 0,
                    explanation: '$gt matches values greater than the given number.',
                },
                {
                    question: 'Why create an index on a field?',
                    options: ['To delete it', 'To make queries on that field fast', 'To encrypt it', 'To rename it'],
                    correct: 1,
                    explanation: 'Indexes let MongoDB find matching documents without scanning the whole collection.',
                },
            ],
        },
        {
            id: 'aggregation-pipeline',
            title: 'The Aggregation Pipeline',
            duration: '9 min',
            explanation: [
                { type: 'text', content: 'The **aggregation pipeline** processes documents through a series of **stages**, each transforming the stream — like Unix pipes for data.' },
                { type: 'text', content: 'Common stages: **$match** (filter), **$group** (aggregate), **$sort**, **$project** (reshape). Data flows top to bottom.' },
                { type: 'tip', content: 'Put $match early to shrink the data before expensive stages like $group.' },
            ],
            keyConcepts: [
                'A pipeline is an ordered array of stages',
                '$match filters; $group aggregates',
                '$sort and $project order and reshape output',
                'Filter early to keep pipelines fast',
            ],
            code: {
                javascript: `// Total spend per active user, top 5
db.orders.aggregate([
  { $match: { status: "paid" } },
  { $group: {
      _id: "$userId",
      spent: { $sum: "$total" },
      orders: { $sum: 1 }
  }},
  { $sort: { spent: -1 } },
  { $limit: 5 }
]);`,
            },
            quiz: [
                {
                    question: 'What does the $group stage do?',
                    options: ['Deletes documents', 'Aggregates documents by a key', 'Creates an index', 'Sorts alphabetically'],
                    correct: 1,
                    explanation: '$group buckets documents by an _id expression and computes aggregates like $sum.',
                },
                {
                    question: 'Why place $match early in a pipeline?',
                    options: ['It is required first', 'To shrink the data before expensive stages', 'To sort results', 'It has no effect'],
                    correct: 1,
                    explanation: 'Filtering early reduces how many documents later stages must process.',
                },
            ],
        },
    ],
};
