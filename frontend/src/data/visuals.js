/**
 * Concept animation specs, keyed by "courseSlug:lessonId".
 * Rendered by <ConceptPlayer/> inside a lesson — a hand-authored, step-by-step
 * animated explanation of the concept (no code execution required).
 */

export const VISUALS = {
  // ---- Searching ----
  'searching:binary-search': {
    title: 'Binary Search — find 9',
    kind: 'array',
    data: [1, 3, 5, 7, 9, 11, 13],
    steps: [
      { caption: 'Search for 9. lo=0, hi=6. Look at the middle, mid=3 → arr[3]=7.', pointers: { lo: 0, hi: 6, mid: 3 }, compare: [3] },
      { caption: '7 < 9, so the answer must be to the right. Discard the left half; lo=4.', pointers: { lo: 4, hi: 6, mid: 5 }, dim: [0, 1, 2, 3], compare: [5] },
      { caption: '11 > 9, so go left. hi=4, mid=4 → arr[4]=9.', pointers: { lo: 4, hi: 4, mid: 4 }, dim: [0, 1, 2, 3, 5, 6], compare: [4] },
      { caption: 'arr[4] = 9 = target. Found at index 4 in just 3 steps (log₂N).', dim: [0, 1, 2, 3, 5, 6], done: [4] },
    ],
  },
  'searching:linear-search': {
    title: 'Linear Search — find 7',
    kind: 'array',
    data: [4, 2, 7, 1, 9],
    steps: [
      { caption: 'Check each element from the left. index 0 → 4 ≠ 7.', pointers: { i: 0 }, compare: [0] },
      { caption: 'index 1 → 2 ≠ 7.', pointers: { i: 1 }, dim: [0], compare: [1] },
      { caption: 'index 2 → 7 = 7. Found!', pointers: { i: 2 }, dim: [0, 1], done: [2] },
      { caption: 'Linear search may check every element — O(N) in the worst case.', done: [2], dim: [0, 1] },
    ],
  },
  // ---- Sorting ----
  'sorting:bubble-sort': {
    title: 'Bubble Sort',
    kind: 'array',
    moveByValue: true,
    data: [5, 2, 8, 1],
    steps: [
      { array: [5, 2, 8, 1], caption: 'Compare neighbours 5 & 2 → 5 > 2, swap.', compare: [0, 1] },
      { array: [2, 5, 8, 1], caption: 'Compare 5 & 8 → already in order.', compare: [1, 2] },
      { array: [2, 5, 8, 1], caption: 'Compare 8 & 1 → 8 > 1, swap.', compare: [2, 3] },
      { array: [2, 5, 1, 8], caption: 'Largest value 8 has bubbled to the end. It is now in place.', done: [3] },
      { array: [2, 5, 1, 8], caption: 'Next pass. Compare 2 & 5 → in order.', compare: [0, 1], done: [3] },
      { array: [2, 5, 1, 8], caption: 'Compare 5 & 1 → swap.', compare: [1, 2], done: [3] },
      { array: [2, 1, 5, 8], caption: '5 is now in place.', done: [2, 3] },
      { array: [2, 1, 5, 8], caption: 'Compare 2 & 1 → swap.', compare: [0, 1], done: [2, 3] },
      { array: [1, 2, 5, 8], caption: 'Array is fully sorted!', done: [0, 1, 2, 3] },
    ],
  },
  'sorting:selection-sort': {
    title: 'Selection Sort',
    kind: 'array',
    moveByValue: true,
    data: [64, 25, 12, 22],
    steps: [
      { array: [64, 25, 12, 22], caption: 'Find the smallest value from index 0. It is 12 at index 2.', pointers: { i: 0 }, highlight: [2] },
      { array: [12, 25, 64, 22], caption: 'Swap it into index 0. 12 is now in place.', done: [0] },
      { array: [12, 25, 64, 22], caption: 'Smallest of the rest is 22 at index 3.', pointers: { i: 1 }, highlight: [3], done: [0] },
      { array: [12, 22, 64, 25], caption: 'Swap into index 1. Two placed.', done: [0, 1] },
      { array: [12, 22, 25, 64], caption: 'Smallest of the rest is 25 → swap into place.', done: [0, 1, 2] },
      { array: [12, 22, 25, 64], caption: 'Sorted! Selection sort makes N swaps total.', done: [0, 1, 2, 3] },
    ],
  },
  // ---- Arrays ----
  'arrays:traverse-array': {
    title: 'Traversing an Array',
    kind: 'array',
    data: [10, 20, 30, 40],
    steps: [
      { caption: 'Start at index 0 and visit each element in turn.', pointers: { i: 0 }, highlight: [0] },
      { caption: 'Move to index 1.', pointers: { i: 1 }, highlight: [1], dim: [0] },
      { caption: 'Move to index 2.', pointers: { i: 2 }, highlight: [2], dim: [0, 1] },
      { caption: 'Move to index 3 — the last element.', pointers: { i: 3 }, highlight: [3], dim: [0, 1, 2] },
      { caption: 'Every element visited exactly once → O(N).', done: [0, 1, 2, 3] },
    ],
  },
  'arrays:find-max': {
    title: 'Finding the Maximum',
    kind: 'array',
    data: [3, 9, 2, 11, 7],
    steps: [
      { caption: 'Assume the first element is the max so far (3).', pointers: { i: 0, max: 0 }, highlight: [0] },
      { caption: '9 > 3 → new max at index 1.', pointers: { i: 1, max: 1 }, compare: [1] },
      { caption: '2 < 9 → keep the current max.', pointers: { i: 2, max: 1 }, dim: [2] },
      { caption: '11 > 9 → new max at index 3.', pointers: { i: 3, max: 3 }, compare: [3] },
      { caption: '7 < 11 → keep the max.', pointers: { i: 4, max: 3 }, dim: [4] },
      { caption: 'Maximum is 11 at index 3, found in one pass.', done: [3] },
    ],
  },
  // ---- Stacks ----
  'stacks:what-is-stack': {
    title: 'Stack — push & pop (LIFO)',
    kind: 'stack',
    steps: [
      { stack: [], caption: 'An empty stack.' },
      { stack: [10], caption: 'push(10) — add to the top.' },
      { stack: [10, 20], caption: 'push(20).' },
      { stack: [10, 20, 30], caption: 'push(30). The top is now 30.' },
      { stack: [10, 20], caption: 'pop() removes 30 — the last item added.' },
      { stack: [10], caption: 'pop() removes 20. LIFO: Last In, First Out.' },
    ],
  },
  // ---- Queues ----
  'queues:queue-concept': {
    title: 'Queue — enqueue & dequeue (FIFO)',
    kind: 'queue',
    steps: [
      { queue: [], caption: 'An empty queue.' },
      { queue: [1], caption: 'enqueue(1) — add to the back.' },
      { queue: [1, 2], caption: 'enqueue(2).' },
      { queue: [1, 2, 3], caption: 'enqueue(3). Front is 1, back is 3.' },
      { queue: [2, 3], caption: 'dequeue() removes 1 — the first item added.' },
      { queue: [3], caption: 'dequeue() removes 2. FIFO: First In, First Out.' },
    ],
  },
  // ---- Two Pointers ----
  'twopointers:two-pointers-opposite': {
    title: 'Two Pointers — pair sum = 10',
    kind: 'array',
    data: [1, 3, 4, 6, 8, 11],
    steps: [
      { caption: 'Sorted array. Start L at the left, R at the right. 1 + 11 = 12 > 10 → move R left.', pointers: { L: 0, R: 5 }, compare: [0, 5] },
      { caption: '1 + 8 = 9 < 10 → too small, move L right.', pointers: { L: 0, R: 4 }, compare: [0, 4] },
      { caption: '3 + 8 = 11 > 10 → move R left.', pointers: { L: 1, R: 4 }, compare: [1, 4] },
      { caption: '3 + 6 = 9 < 10 → move L right.', pointers: { L: 1, R: 3 }, compare: [1, 3] },
      { caption: '4 + 6 = 10 = target! Found in O(N) without a nested loop.', pointers: { L: 2, R: 3 }, done: [2, 3] },
    ],
  },
  // ---- Dynamic Programming ----
  'dp:tabulation': {
    title: 'DP Tabulation — climbing stairs',
    kind: 'array',
    data: [1, 1],
    steps: [
      { array: [1, 1], caption: 'Base cases: 1 way to reach step 0, 1 way to reach step 1.', highlight: [0, 1] },
      { array: [1, 1, 2], caption: 'dp[2] = dp[1] + dp[0] = 1 + 1 = 2.', compare: [0, 1], highlight: [2] },
      { array: [1, 1, 2, 3], caption: 'dp[3] = dp[2] + dp[1] = 2 + 1 = 3.', compare: [1, 2], highlight: [3] },
      { array: [1, 1, 2, 3, 5], caption: 'dp[4] = dp[3] + dp[2] = 3 + 2 = 5.', compare: [2, 3], highlight: [4] },
      { array: [1, 1, 2, 3, 5, 8], caption: 'dp[5] = dp[4] + dp[3] = 5 + 3 = 8. Each cell built from smaller ones.', done: [5] },
    ],
  },

  // ================= Phase 3: conceptual DIAGRAMS =================
  'system-design:scalability-basics': {
    kind: 'diagram',
    title: 'Horizontal Scaling with a Load Balancer',
    nodes: [
      { id: 'client', label: 'Client', icon: '💻', x: 80, y: 130 },
      { id: 'lb', label: 'Load Balancer', x: 300, y: 130, w: 128 },
      { id: 's1', label: 'Server 1', x: 520, y: 55 },
      { id: 's2', label: 'Server 2', x: 520, y: 130 },
      { id: 's3', label: 'Server 3', x: 520, y: 205 },
    ],
    edges: [
      { id: 'c-lb', from: 'client', to: 'lb' },
      { id: 'lb-s1', from: 'lb', to: 's1' },
      { id: 'lb-s2', from: 'lb', to: 's2' },
      { id: 'lb-s3', from: 'lb', to: 's3' },
    ],
    steps: [
      { caption: 'A request arrives from a client.', activeNodes: ['client'], activeEdges: ['c-lb'], packet: { edge: 'c-lb' } },
      { caption: 'The load balancer receives it and must choose a server.', activeNodes: ['lb'] },
      { caption: 'Request 1 is routed to Server 1.', activeNodes: ['s1'], activeEdges: ['lb-s1'], packet: { edge: 'lb-s1' } },
      { caption: 'The next request goes to Server 2 (round-robin).', activeNodes: ['s2'], activeEdges: ['lb-s2'], packet: { edge: 'lb-s2' } },
      { caption: 'And the next to Server 3. Traffic is spread across many machines — that is horizontal scaling.', activeNodes: ['s3'], activeEdges: ['lb-s3'], packet: { edge: 'lb-s3' } },
    ],
  },
  'rest-apis:rest-principles': {
    kind: 'diagram',
    title: 'A REST Request/Response',
    nodes: [
      { id: 'client', label: 'Client', icon: '💻', x: 80, y: 130 },
      { id: 'server', label: 'API Server', x: 320, y: 130, w: 120 },
      { id: 'db', label: 'Data Store', x: 540, y: 130 },
    ],
    edges: [
      { id: 'cs', from: 'client', to: 'server', label: 'HTTP' },
      { id: 'sd', from: 'server', to: 'db' },
    ],
    steps: [
      { caption: 'Client sends GET /users/42 — read a resource by its URL.', activeNodes: ['client'], activeEdges: ['cs'], packet: { edge: 'cs' } },
      { caption: 'The server looks the resource up in its data store.', activeNodes: ['server'], activeEdges: ['sd'], packet: { edge: 'sd' } },
      { caption: 'The record is found and returned to the server.', activeNodes: ['db'] },
      { caption: 'Server replies 200 OK with JSON. POST would create (201), PATCH updates, DELETE removes (204).', activeNodes: ['server'] },
    ],
  },
  'web-security:injection': {
    kind: 'diagram',
    title: 'SQL Injection — and the Fix',
    nodes: [
      { id: 'user', label: 'User input', icon: '⌨️', x: 90, y: 130, w: 120 },
      { id: 'app', label: 'App / Query', x: 320, y: 130, w: 120 },
      { id: 'db', label: 'Database', icon: '🗄️', x: 540, y: 130 },
    ],
    edges: [
      { id: 'ua', from: 'user', to: 'app' },
      { id: 'ad', from: 'app', to: 'db' },
    ],
    steps: [
      { caption: "A user submits malicious input: '; DROP TABLE users; --", activeNodes: ['user'], activeEdges: ['ua'], packet: { edge: 'ua' } },
      { caption: '❌ A vulnerable app CONCATENATES that input straight into the SQL string.', activeNodes: ['app'] },
      { caption: 'The database executes the injected command — the table is dropped.', activeNodes: ['db'], activeEdges: ['ad'], packet: { edge: 'ad' } },
      { caption: '✅ Fix: a parameterized query sends the SQL and the input SEPARATELY.', activeNodes: ['app'] },
      { caption: 'Now the input is treated as pure data — it can never run as code. Safe.', activeNodes: ['db'], activeEdges: ['ad'], packet: { edge: 'ad' } },
    ],
  },
  'llm-fundamentals:rag-basics': {
    kind: 'diagram',
    title: 'Retrieval-Augmented Generation (RAG)',
    nodes: [
      { id: 'q', label: 'Question', icon: '❓', x: 70, y: 130 },
      { id: 'vdb', label: 'Vector DB', sub: 'embeddings', x: 240, y: 130, w: 116 },
      { id: 'llm', label: 'LLM', icon: '🧠', x: 410, y: 130 },
      { id: 'ans', label: 'Grounded answer', x: 545, y: 130, w: 120 },
    ],
    edges: [
      { id: 'qv', from: 'q', to: 'vdb', label: 'search' },
      { id: 'vl', from: 'vdb', to: 'llm', label: 'top-k' },
      { id: 'la', from: 'llm', to: 'ans' },
    ],
    steps: [
      { caption: 'The question is embedded and used to search a vector database.', activeNodes: ['q'], activeEdges: ['qv'], packet: { edge: 'qv' } },
      { caption: 'The most relevant document chunks are retrieved.', activeNodes: ['vdb'] },
      { caption: 'Those chunks are injected into the prompt as context for the model.', activeNodes: ['llm'], activeEdges: ['vl'], packet: { edge: 'vl' } },
      { caption: 'The LLM answers grounded in real documents — cutting hallucination.', activeNodes: ['ans'], activeEdges: ['la'], packet: { edge: 'la' } },
    ],
  },
  'git:branching-merging': {
    kind: 'diagram',
    title: 'Branching & Merging',
    nodes: [
      { id: 'm1', label: 'main', icon: '●', x: 80, y: 80 },
      { id: 'm2', label: 'main', icon: '●', x: 250, y: 80 },
      { id: 'merge', label: 'merge', icon: '◆', x: 500, y: 80 },
      { id: 'f1', label: 'feature', icon: '○', x: 250, y: 195 },
      { id: 'f2', label: 'feature', icon: '○', x: 375, y: 195 },
    ],
    edges: [
      { id: 'm1m2', from: 'm1', to: 'm2' },
      { id: 'branch', from: 'm1', to: 'f1' },
      { id: 'f1f2', from: 'f1', to: 'f2' },
      { id: 'f2merge', from: 'f2', to: 'merge' },
      { id: 'm2merge', from: 'm2', to: 'merge' },
    ],
    steps: [
      { show: ['m1'], activeNodes: ['m1'], caption: 'You start on main with one commit.' },
      { show: ['m1', 'm2'], activeNodes: ['m2'], caption: 'Work continues on main.' },
      { show: ['m1', 'm2', 'f1'], activeNodes: ['f1'], caption: 'Create a feature branch off main — an independent line of work.' },
      { show: ['m1', 'm2', 'f1', 'f2'], activeNodes: ['f2'], caption: 'Commit on the feature branch. main is untouched.' },
      { show: ['m1', 'm2', 'f1', 'f2', 'merge'], activeNodes: ['merge'], activeEdges: ['f2merge', 'm2merge'], caption: 'Merge the feature back into main — both histories combine.' },
    ],
  },
};

export function getVisual(slug, lessonId) {
  return VISUALS[`${slug}:${lessonId}`] || null;
}
