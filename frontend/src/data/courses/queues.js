/**
 * Queues - Learning Path
 * FIFO data structure, BFS foundation
 */

export const QUEUES_PATH = {
    id: 'queues',
    title: 'Queues',
    icon: '🚶‍♂️',
    description: 'First In, First Out — learn the queue pattern used in BFS, task scheduling, and real-world systems.',
    prerequisites: ['linkedlists'],
    lessons: [
        {
            id: 'queue-concept',
            title: 'What is a Queue?',
            duration: '5 min',
            explanation: [
                { type: 'text', content: 'A **Queue** follows **FIFO** (First In, First Out). Like a line at a restaurant — the first person to join is the first to be served.' },
                { type: 'tip', content: 'Stacks are LIFO (Last In, First Out). Queues are FIFO (First In, First Out). Know the difference!' },
                { type: 'text', content: 'Key operations: **enqueue** (add to back), **dequeue** (remove from front), **peek** (look at front).' }
            ],
            keyConcepts: ['FIFO: First In, First Out', 'Enqueue = add to back', 'Dequeue = remove from front'],
            code: {
                python: `# Queue using deque
from collections import deque

queue = deque()
queue.append("Alice")
queue.append("Bob")
queue.append("Charlie")
print(f"Queue: {list(queue)}")

served = queue.popleft()
print(f"Served: {served}")
print(f"Queue now: {list(queue)}")
print(f"Next in line: {queue[0]}")`,
                javascript: `// Queue using array
let queue = [];
queue.push("Alice");
queue.push("Bob");
queue.push("Charlie");
console.log("Queue:", queue);

let served = queue.shift();
console.log("Served:", served);
console.log("Queue now:", queue);
console.log("Next in line:", queue[0]);`
            },
            syntaxDiff: 'Python uses deque.popleft() for O(1) dequeue. JavaScript shift() is O(n).',
            quiz: [
                { question: 'What does FIFO stand for?', options: ['First In, First Out', 'Fast In, Fast Out', 'First In, Final Out', 'File In, File Out'], correct: 0, explanation: 'FIFO = First In, First Out.' },
                { question: '🧠 TRICKY: In JavaScript, why is shift() inefficient?', options: ['It doesn\'t work', 'It\'s O(n) — all elements shift forward', 'Wrong end', 'Same as pop'], correct: 1, explanation: 'shift() removes index 0, shifting every element — O(n).' },
                { question: 'How is a queue different from a stack?', options: ['Queue is FIFO, Stack is LIFO', 'Queue is slower', 'Stack holds more items', 'Same thing'], correct: 0, explanation: 'Queue: FIFO (like a line). Stack: LIFO (like plates).' }
            ]
        },
        {
            id: 'bfs-intro',
            title: 'BFS with Queues',
            duration: '8 min',
            explanation: [
                { type: 'text', content: '**Breadth-First Search (BFS)** explores level by level. Queues ensure we process nodes in discovery order.' },
                { type: 'tip', content: 'BFS finds shortest path in unweighted graphs. Think of ripples spreading in a pond.' }
            ],
            keyConcepts: ['BFS explores level by level', 'Uses queue to track nodes', 'Finds shortest path'],
            code: {
                python: `# BFS - Level order traversal
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    level = 0
    while queue:
        size = len(queue)
        nodes = []
        for _ in range(size):
            node = queue.popleft()
            nodes.append(node)
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        print(f"Level {level}: {nodes}")
        level += 1

graph = {"A": ["B", "C"], "B": ["D", "E"], "C": ["F"], "D": [], "E": [], "F": []}
bfs(graph, "A")`,
                javascript: `// BFS - Level order traversal
function bfs(graph, start) {
    let visited = new Set();
    let queue = [start];
    visited.add(start);
    let level = 0;
    while (queue.length > 0) {
        let size = queue.length;
        let nodes = [];
        for (let i = 0; i < size; i++) {
            let node = queue.shift();
            nodes.push(node);
            for (let neighbor of (graph[node] || [])) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        console.log("Level " + level + ":", nodes.join(", "));
        level++;
    }
}

let graph = {A: ["B", "C"], B: ["D", "E"], C: ["F"], D: [], E: [], F: []};
bfs(graph, "A");`
            },
            syntaxDiff: 'Python uses set() and deque. JavaScript uses Set and regular array.',
            quiz: [
                { question: 'Why does BFS use a queue?', options: ['Faster', 'FIFO ensures level-by-level traversal', 'Stacks can\'t hold nodes', 'No reason'], correct: 1, explanation: 'FIFO processes nodes in discovery order — level by level.' },
                { question: '🧠 TRICKY: Replace queue with stack — what algorithm?', options: ['Still BFS', 'DFS', 'Dijkstra', 'Binary Search'], correct: 1, explanation: 'LIFO (stack) makes it DFS. The data structure determines traversal order.' }
            ]
        },
        {
            id: 'circular-queue',
            title: 'Circular Queue',
            duration: '7 min',
            explanation: [
                { type: 'text', content: 'A **Circular Queue** wraps around when the rear reaches the end. Uses modular arithmetic: next = (current + 1) % capacity.' },
                { type: 'tip', content: 'Avoids wasted space from linear queues after dequeuing.' }
            ],
            keyConcepts: ['Fixed-size array that wraps', 'Modular arithmetic for indices', 'No wasted space'],
            code: {
                python: `# Circular Queue
class CircularQueue:
    def __init__(self, cap):
        self.q = [None] * cap
        self.cap = cap
        self.front = 0
        self.rear = -1
        self.size = 0
    
    def enqueue(self, item):
        if self.size == self.cap:
            print("Full!"); return
        self.rear = (self.rear + 1) % self.cap
        self.q[self.rear] = item
        self.size += 1
        print(f"Enqueued {item} at pos {self.rear}")
    
    def dequeue(self):
        if self.size == 0:
            print("Empty!"); return None
        item = self.q[self.front]
        self.front = (self.front + 1) % self.cap
        self.size -= 1
        print(f"Dequeued {item}")
        return item

cq = CircularQueue(3)
cq.enqueue("A"); cq.enqueue("B"); cq.enqueue("C")
cq.dequeue()
cq.enqueue("D")  # Wraps!
print(f"Internal: {cq.q}")`,
                javascript: `// Circular Queue
class CircularQueue {
    constructor(cap) {
        this.q = new Array(cap).fill(null);
        this.cap = cap;
        this.front = 0;
        this.rear = -1;
        this.size = 0;
    }
    enqueue(item) {
        if (this.size === this.cap) { console.log("Full!"); return; }
        this.rear = (this.rear + 1) % this.cap;
        this.q[this.rear] = item;
        this.size++;
        console.log("Enqueued", item, "at pos", this.rear);
    }
    dequeue() {
        if (this.size === 0) { console.log("Empty!"); return null; }
        let item = this.q[this.front];
        this.front = (this.front + 1) % this.cap;
        this.size--;
        console.log("Dequeued", item);
        return item;
    }
}
let cq = new CircularQueue(3);
cq.enqueue("A"); cq.enqueue("B"); cq.enqueue("C");
cq.dequeue();
cq.enqueue("D");  // Wraps!
console.log("Internal:", cq.q);`
            },
            syntaxDiff: 'Both use class syntax. Python: __init__/self. JavaScript: constructor/this.',
            quiz: [
                { question: 'Why use (rear + 1) % capacity?', options: ['Sort elements', 'Wrap around to beginning', 'Check if full', 'Reverse'], correct: 1, explanation: 'Modular arithmetic wraps the index back to 0 at capacity.' },
                { question: '🧠 TRICKY: After dequeue A and enqueue D in capacity-3 queue [A,B,C], internal array is?', options: ['[D, B, C]', '[B, C, D]', '[A, B, D]', '[D, A, B]'], correct: 0, explanation: 'D wraps to position 0 (where A was). Array: [D, B, C], front→B.' }
            ]
        },
        {
            id: 'queue-real-world',
            title: 'Real-World Queue Applications',
            duration: '5 min',
            explanation: [
                { type: 'text', content: 'Queues are everywhere: print queues, task schedulers, message queues (Kafka, RabbitMQ), web server request handling.' },
                { type: 'tip', content: 'A "hot potato" game is a queue — pass the item around, eliminate the holder when timer stops!' }
            ],
            keyConcepts: ['Print/task job scheduling', 'Message queue systems', 'Request handling'],
            code: {
                python: `# Hot Potato Game
from collections import deque

def hot_potato(names, passes):
    queue = deque(names)
    while len(queue) > 1:
        for _ in range(passes):
            queue.append(queue.popleft())
        eliminated = queue.popleft()
        print(f"❌ {eliminated} eliminated!")
    print(f"🏆 {queue[0]} wins!")

hot_potato(["Alice", "Bob", "Charlie", "Diana", "Eve"], 3)`,
                javascript: `// Hot Potato Game
function hotPotato(names, passes) {
    let queue = [...names];
    while (queue.length > 1) {
        for (let i = 0; i < passes; i++)
            queue.push(queue.shift());
        let eliminated = queue.shift();
        console.log("❌ " + eliminated + " eliminated!");
    }
    console.log("🏆 " + queue[0] + " wins!");
}

hotPotato(["Alice", "Bob", "Charlie", "Diana", "Eve"], 3);`
            },
            syntaxDiff: 'Same logic. Python uses deque for efficiency.',
            quiz: [
                { question: 'Which system uses a queue?', options: ['Undo/Redo', 'Print scheduling', 'Browser back button', 'Calculator'], correct: 1, explanation: 'Print jobs are FIFO. Undo uses a stack.' },
                { question: '🧠 TRICKY: Stack and queue both use push. How does remove differ?', options: ['Stack: front, Queue: back', 'Stack: back (LIFO), Queue: front (FIFO)', 'Both from front', 'Both from back'], correct: 1, explanation: 'Stack: push+pop same end. Queue: push back, remove front.' }
            ]
        }
    ]
};
