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
                { type: 'tip', content: 'Key operations: **enqueue** (add to back), **dequeue** (remove from front).' }
            ],
            keyConcepts: ['FIFO: First In, First Out', 'Enqueue = add to back', 'Dequeue = remove from front'],
            code: {
                python: `# Python Queue (using deque)
from collections import deque
queue = deque()
queue.append("Alice") # Enqueue
queue.append("Bob")
print(queue.popleft()) # Dequeue -> Alice
print(queue[0])        # Peek -> Bob`,
                javascript: `// JavaScript Queue (using array)
let queue = [];
queue.push("Alice"); // Enqueue
queue.push("Bob");
console.log(queue.shift()); // Dequeue -> Alice
console.log(queue[0]);      // Peek -> Bob`,
                java: `// Java Queue
import java.util.LinkedList;
import java.util.Queue;

public class Main {
    public static void main(String[] args) {
        Queue<String> queue = new LinkedList<>();
        queue.add("Alice");
        queue.add("Bob");
        System.out.println(queue.poll()); // Alice
        System.out.println(queue.peek()); // Bob
    }
}`,
                c: `// C - Simple Queue (Concept)
#include <stdio.h>
#define MAX 100

int queue[MAX], front = 0, rear = -1;

void enqueue(int x) { queue[++rear] = x; }
int dequeue() { return queue[front++]; }

int main() {
    enqueue(10); enqueue(20);
    printf("%d\\n", dequeue()); // 10
    return 0;
}`,
                cpp: `// C++ std::queue
#include <iostream>
#include <queue>
#include <string>

int main() {
    std::queue<std::string> q;
    q.push("Alice"); q.push("Bob");
    std::cout << q.front() << "\\n"; // Alice
    q.pop();
    return 0;
}`,
                go: `// Go Queue (using slice)
package main
import "fmt"

func main() {
    var queue []string
    queue = append(queue, "Alice")
    queue = append(queue, "Bob")
    
    front := queue[0]
    queue = queue[1:] // Dequeue
    fmt.Println(front)
}`,
                typescript: `// TypeScript Queue
let queue: string[] = [];
queue.push("Alice");
queue.push("Bob");
console.log(queue.shift()); // Alice
console.log(queue[0]);      // Peek`
            },
            syntaxDiff: 'Python uses `deque.popleft()`. JavaScript/TypeScript use `shift()`. Java uses `poll()`. All follow the FIFO principle.',
            quiz: [
                { question: 'What does FIFO stand for?', options: ['First In, First Out', 'Fast In, Fast Out', 'First In, Final Out', 'File In, File Out'], correct: 0, explanation: 'FIFO = First In, First Out.' }
            ]
        }
    ]
};
