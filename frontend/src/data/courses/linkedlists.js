/**
 * Linked Lists - Learning Path
 * Learn about dynamic data structures with pointers
 */

export const LINKEDLISTS_PATH = {
    id: 'linkedlists',
    title: 'Linked Lists',
    icon: '🔗',
    description: 'Discover how nodes and pointers create flexible data structures that grow dynamically!',
    prerequisites: ['stacks'],
    lessons: [
        {
            id: 'what-is-linkedlist',
            title: 'What is a Linked List?',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Linked List** is a data structure where elements (called **nodes**) are connected using **pointers**. Each node contains data and a reference to the next node.'
                },
                {
                    type: 'tip',
                    content: 'Think of a treasure hunt: each clue (node) tells you where to find the next clue!'
                }
            ],
            keyConcepts: [
                'Nodes contain data + pointer to next node',
                'Head points to the first node',
                'Last node points to null (end)',
                'Dynamic size'
            ],
            code: {
                python: `# Python Node
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

node1 = Node(10)
node2 = Node(20)
node1.next = node2`,
                javascript: `// JavaScript Node
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

let node1 = new Node(10);
let node2 = new Node(20);
node1.next = node2;`,
                java: `// Java Node
class Node {
    int data;
    Node next;
    Node(int data) { this.data = data; }
}

public class Main {
    public static void main(String[] args) {
        Node node1 = new Node(10);
        Node node2 = new Node(20);
        node1.next = node2;
    }
}`,
                c: `// C Node
#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

int main() {
    struct Node* node1 = malloc(sizeof(struct Node));
    node1->data = 10;
    node1->next = NULL;
    return 0;
}`,
                cpp: `// C++ Node
#include <iostream>

struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

int main() {
    Node* node1 = new Node(10);
    Node* node2 = new Node(20);
    node1->next = node2;
    return 0;
}`,
                go: `// Go Node
package main

type Node struct {
    data int
    next *Node
}

func main() {
    node1 := &Node{data: 10}
    node2 := &Node{data: 20}
    node1.next = node2
}`,
                typescript: `// TypeScript Node
class ListNode {
    data: number;
    next: ListNode | null;
    constructor(data: number) {
        this.data = data;
        this.next = null;
    }
}

let node1 = new ListNode(10);
let node2 = new ListNode(20);
node1.next = node2;`
            },
            syntaxDiff: 'C and C++ use pointers (`*`). Go uses pointers with a simpler syntax. Others use object references.',
            quiz: [
                {
                    question: 'What does each node in a linked list contain?',
                    options: [
                        'Only data',
                        'Only a pointer',
                        'Data and a pointer to the next node',
                        'An array of values'
                    ],
                    correct: 2,
                    explanation: 'Each node contains the actual data AND a pointer/reference to the next node in the list.'
                }
            ]
        }
    ]
};
