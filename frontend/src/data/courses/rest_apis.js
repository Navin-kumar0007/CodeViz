/**
 * REST API Design - Learning Path
 * Design clean, predictable HTTP APIs.
 */

export const REST_APIS_PATH = {
    id: 'rest-apis',
    title: 'REST API Design',
    icon: '🔌',
    category: 'Backend Engineering',
    description: 'Design HTTP APIs the right way — resources, methods, status codes, and versioning.',
    prerequisites: [],
    lessons: [
        {
            id: 'rest-principles',
            title: 'Resources & HTTP Methods',
            duration: '7 min',
            explanation: [
                { type: 'text', content: '**REST** models your API as **resources** (nouns) addressed by URLs: `/users`, `/users/42`. Actions come from HTTP **methods**, not the URL.' },
                { type: 'text', content: '**GET** reads, **POST** creates, **PUT/PATCH** update, **DELETE** removes. GET and PUT/DELETE are **idempotent** — repeating them has the same effect.' },
                { type: 'warning', content: 'Do not put verbs in URLs (`/getUser`, `/createUser`). Use nouns + methods: `GET /users`, `POST /users`.' },
            ],
            keyConcepts: [
                'Resources are nouns addressed by URLs',
                'HTTP methods express the action',
                'GET reads, POST creates, PUT/PATCH update, DELETE removes',
                'GET/PUT/DELETE are idempotent; POST is not',
            ],
            code: {
                javascript: `// Express: a resource with proper methods
app.get('/users', listUsers);        // read collection
app.get('/users/:id', getUser);      // read one
app.post('/users', createUser);      // create
app.patch('/users/:id', updateUser); // partial update
app.delete('/users/:id', deleteUser);// remove`,
                python: `# FastAPI: same resource, proper methods
@app.get("/users")
def list_users(): ...

@app.post("/users")
def create_user(body: User): ...

@app.patch("/users/{id}")
def update_user(id: int, body: User): ...

@app.delete("/users/{id}")
def delete_user(id: int): ...`,
            },
            quiz: [
                {
                    question: 'Which HTTP method should create a new resource?',
                    options: ['GET', 'POST', 'DELETE', 'HEAD'],
                    correct: 1,
                    explanation: 'POST creates a new resource in a collection.',
                },
                {
                    question: 'Which URL is a well-designed REST endpoint?',
                    options: ['/getUserById?id=42', 'GET /users/42', '/user/delete/42', '/api?do=fetchUser'],
                    correct: 1,
                    explanation: 'REST uses nouns + methods: GET /users/42 reads user 42.',
                },
            ],
        },
        {
            id: 'status-codes',
            title: 'Status Codes & Errors',
            duration: '7 min',
            explanation: [
                { type: 'text', content: 'Status codes tell the client what happened. **2xx** success, **3xx** redirect, **4xx** client error, **5xx** server error.' },
                { type: 'text', content: 'Common ones: **200** OK, **201** Created, **204** No Content, **400** Bad Request, **401** Unauthorized, **403** Forbidden, **404** Not Found, **429** Too Many Requests, **500** Server Error.' },
                { type: 'tip', content: 'Return a consistent JSON error shape (`{ "message": "..." }`) so clients can handle failures uniformly.' },
            ],
            keyConcepts: [
                '2xx success, 4xx client error, 5xx server error',
                '201 Created for successful POSTs',
                '401 = not authenticated; 403 = not allowed',
                'Return consistent, machine-readable error bodies',
            ],
            code: {
                javascript: `app.post('/users', async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ message: 'email is required' });
  }
  const user = await User.create(req.body);
  return res.status(201).json(user); // 201 Created
});`,
            },
            quiz: [
                {
                    question: 'Which status code means "created successfully"?',
                    options: ['200', '201', '400', '500'],
                    correct: 1,
                    explanation: '201 Created signals a new resource was successfully created.',
                },
                {
                    question: 'What does 401 Unauthorized mean?',
                    options: ['Server crashed', 'The request is not authenticated', 'Resource not found', 'Too many requests'],
                    correct: 1,
                    explanation: '401 means authentication is missing or invalid (403 means authenticated but not allowed).',
                },
            ],
        },
        {
            id: 'pagination-versioning',
            title: 'Pagination, Filtering & Versioning',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'Never return unbounded lists. **Paginate** with `?page=&limit=` or cursor-based `?after=`. Include total/next info so clients can navigate.' },
                { type: 'text', content: 'Support **filtering and sorting** via query params: `?status=active&sort=-createdAt`.' },
                { type: 'text', content: '**Version** your API (`/v1/users`) so you can evolve it without breaking existing clients.' },
                { type: 'tip', content: 'Cursor pagination is more stable than offset pagination when data changes between requests.' },
            ],
            keyConcepts: [
                'Always paginate large collections',
                'Filter and sort with query parameters',
                'Version the API to avoid breaking clients',
                'Cursor pagination beats offset for changing data',
            ],
            code: {
                javascript: `// GET /v1/users?status=active&page=2&limit=20&sort=-createdAt
app.get('/v1/users', async (req, res) => {
  const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const filter = status ? { status } : {};
  const users = await User.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ page: Number(page), limit: Number(limit), data: users });
});`,
            },
            quiz: [
                {
                    question: 'Why version an API (e.g. /v1/)?',
                    options: ['To make URLs longer', 'To evolve it without breaking existing clients', 'To improve caching', 'It is required by HTTP'],
                    correct: 1,
                    explanation: 'Versioning lets you introduce breaking changes in a new version while old clients keep working.',
                },
                {
                    question: 'What problem does pagination solve?',
                    options: ['Authentication', 'Returning unbounded, huge result sets', 'Encryption', 'Routing'],
                    correct: 1,
                    explanation: 'Pagination returns results in manageable pages instead of everything at once.',
                },
            ],
        },
    ],
};
