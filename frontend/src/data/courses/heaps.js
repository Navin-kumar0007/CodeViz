/**
 * Heaps - Learning Path
 * Learn about Priority Queues and Heap implementations
 */

export const HEAPS_PATH = {
    id: 'heaps',
    title: 'Heaps & Priority Queues',
    icon: '⛰️',
    description: 'Learn how to always keep the biggest or smallest element instantly accessible using Heaps.',
    prerequisites: ['trees', 'arrays'],
    lessons: [
        {
            id: 'what-is-a-heap',
            title: 'Introduction to Heaps',
            duration: '10 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Heap** is a complete binary tree (filled left-to-right) that perfectly satisfies the **Heap Property**.'
                },
                {
                    type: 'tip',
                    content: 'In a **Max-Heap**, every parent node is GREATER than or equal to its children. The absolute maximum value is always at the Root! A **Min-Heap** is the exact opposite (minimum at the root).'
                },
                {
                    type: 'text',
                    content: 'Because a Heap is a *complete* tree, we don\'t actually need Node objects and pointers! We can store the entire tree flat inside an **Array** using clever math indexing.'
                }
            ],
            keyConcepts: [
                'Always tracks the Min (Min-Heap) or Max (Max-Heap) in O(1) time',
                'Insertions take O(log N) time',
                'Deletions (popping the root) take O(log N) time',
                'Backed by a flat Array'
            ],
            code: {
                python: `# Python - Built-in Min-Heap (heapq)
import heapq

# Create an empty heap
nums = []

# Push elements - O(log N)
heapq.heappush(nums, 5)
heapq.heappush(nums, 1)
heapq.heappush(nums, 8)
heapq.heappush(nums, 3)

# The smallest element is always at index 0
print("Minimum:", nums[0]) # Output: 1

# Pop elements (always returns the smallest) - O(log N)
print(heapq.heappop(nums)) # 1
print(heapq.heappop(nums)) # 3
print(heapq.heappop(nums)) # 5

# Max-Heap workaround: Multiply values by -1
max_nums = []
heapq.heappush(max_nums, -5)
heapq.heappush(max_nums, -1)
print("Max:", -max_nums[0]) # Output: 5`,
                javascript: `// JavaScript - Manual Min-Heap implementation
// (JS has no built-in heap, so we often write a basic class)
class MinHeap {
    constructor() { this.data = []; }
    push(val) {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }
    peek() { return this.data[0]; }
    
    bubbleUp(index) {
        let parentParams = Math.floor((index - 1) / 2);
        while (index > 0 && this.data[index] < this.data[parentParams]) {
            [this.data[index], this.data[parentParams]] = [this.data[parentParams], this.data[index]];
            index = parentParams;
            parentParams = Math.floor((index - 1) / 2);
        }
    }
}
const pq = new MinHeap();
pq.push(5); pq.push(1); pq.push(8);
console.log("Min:", pq.peek()); // 1`,
                java: `// Java - Built-in Priority Queue
import java.util.PriorityQueue;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        // Min-Heap (Default)
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        minHeap.offer(5);
        minHeap.offer(1);
        minHeap.offer(8);
        System.out.println("Min: " + minHeap.peek()); // 1
        System.out.println("Popped: " + minHeap.poll()); // 1
        
        // Max-Heap (Reverse Order)
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        maxHeap.offer(5);
        maxHeap.offer(1);
        System.out.println("Max: " + maxHeap.peek()); // 5
    }
}`,
                cpp: `// C++ - Built-in Priority Queue
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    // Max-Heap (Default in C++)
    priority_queue<int> maxHeap;
    maxHeap.push(5);
    maxHeap.push(1);
    maxHeap.push(8);
    cout << "Max: " << maxHeap.top() << endl; // 8
    
    // Min-Heap (Using greater<int>)
    priority_queue<int, vector<int>, greater<int>> minHeap;
    minHeap.push(5);
    minHeap.push(1);
    cout << "Min: " << minHeap.top() << endl; // 1
    
    return 0;
}`,
                c: `// C - Manual Min-Heap Array
#include <stdio.h>

void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }

void heapifyUp(int heap[], int index) {
    if (index && heap[(index - 1) / 2] > heap[index]) {
        swap(&heap[(index - 1) / 2], &heap[index]);
        heapifyUp(heap, (index - 1) / 2);
    }
}

int main() {
    int minHeap[100];
    int size = 0;
    
    // Push 5
    minHeap[size] = 5; heapifyUp(minHeap, size++);
    // Push 1
    minHeap[size] = 1; heapifyUp(minHeap, size++);
    
    printf("Min: %d\\n", minHeap[0]); // 1
    return 0;
}`,
                go: `// Go - Built-in Container/Heap Interface
package main

import (
    "container/heap"
    "fmt"
)

// An IntHeap is a min-heap of ints.
type IntHeap []int
func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *IntHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func main() {
    h := &IntHeap{5, 1, 8, 3}
    heap.Init(h)
    heap.Push(h, 0)
    fmt.Printf("Min: %d\\n", (*h)[0]) // 0
}`,
                typescript: `// TypeScript - Array Implementation Concept
class MinHeap {
    data: number[] = [];
    push(val: number) {
        this.data.push(val);
        this.bubbleUp(this.data.length - 1);
    }
    peek() { return this.data[0]; }
    
    bubbleUp(index: number) {
        let parentParams = Math.floor((index - 1) / 2);
        while (index > 0 && this.data[index] < this.data[parentParams]) {
            [this.data[index], this.data[parentParams]] = [this.data[parentParams], this.data[index]];
            index = parentParams;
            parentParams = Math.floor((index - 1) / 2);
        }
    }
}
const pq = new MinHeap();
pq.push(5); pq.push(1);
console.log("Min:", pq.peek()); // 1`
            },
            syntaxDiff: 'Python (`import heapq`), Java (`PriorityQueue`), and C++ (`priority_queue`) all feature heavily utilized, built-in standard-library implementations of Heap objects. JavaScript and C do not have built-in Heaps, requiring manual implementation of class classes to write the `bubbleUp` logic.',
            quiz: [
                {
                    question: 'If you want to continuously pull the absolute LARGEST remaining value out of a varying data set, what data structure should you use?',
                    options: [
                        'Hash Map',
                        'Max-Heap',
                        'Binary Search Tree',
                        'Min-Heap'
                    ],
                    correct: 1,
                    explanation: 'A Max-Heap inherently bubbles the absolute largest value up to the root index. Retrieving it is O(1) and removing it rearranges the tree in O(log N).'
                },
                {
                    question: 'Unlike traditional Binary Trees packed with Nodes and parent pointers, how are standard Heaps typically stored in memory?',
                    options: ['In a Linked List', 'In a separate database', 'In a flat Array', 'Uses physical files'],
                    correct: 2,
                    explanation: 'Because Heaps are strictly filled left to right, we can mathematically calculate that the left child of an index `i` is at `2i+1`, and right child is `2i+2`. No pointers are needed, it just sits sequentially in an array!'
                }
            ]
        }
    ]
};
