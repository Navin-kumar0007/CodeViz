/**
 * Stacks - Learning Path
 * Learn about LIFO data structure and its applications
 */

export const STACKS_PATH = {
    id: 'stacks',
    title: 'Stacks',
    icon: '📚',
    description: 'Master the LIFO principle! Learn push, pop, and practical applications of stacks.',
    prerequisites: ['hashmaps'],
    lessons: [
        {
            id: 'what-is-stack',
            title: 'What is a Stack?',
            duration: '5 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Stack** is a linear data structure that follows the **LIFO** principle: Last In, First Out. The last element added is the first one removed.'
                },
                {
                    type: 'tip',
                    content: 'Think of a stack of plates: you can only add or remove from the TOP.'
                }
            ],
            keyConcepts: [
                'LIFO: Last In, First Out',
                'push: Add element to top',
                'pop: Remove element from top',
                'O(1) time for push/pop'
            ],
            code: {
                python: `# Python Stack (using list)
stack = []
stack.append(10) # Push
stack.append(20)
print(stack.pop()) # Pop -> 20
print(stack[-1])   # Peek -> 10`,
                javascript: `// JavaScript Stack (using array)
let stack = [];
stack.push(10); // Push
stack.push(20);
console.log(stack.pop()); // Pop -> 20
console.log(stack[stack.length - 1]); // Peek -> 10`,
                java: `// Java Stack
import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();
        stack.push(10);
        stack.push(20);
        System.out.println(stack.pop()); // 20
        System.out.println(stack.peek()); // 10
    }
}`,
                c: `// C - Simple Stack (Concept)
#include <stdio.h>
#define MAX 100

int stack[MAX], top = -1;

void push(int x) { stack[++top] = x; }
int pop() { return stack[top--]; }

int main() {
    push(10); push(20);
    printf("%d\\n", pop()); // 20
    return 0;
}`,
                cpp: `// C++ std::stack
#include <iostream>
#include <stack>

int main() {
    std::stack<int> s;
    s.push(10); s.push(20);
    std::cout << s.top() << "\\n"; // 20
    s.pop();
    return 0;
}`,
                go: `// Go Stack (using slice)
package main
import "fmt"

func main() {
    var stack []int
    stack = append(stack, 10) // Push
    stack = append(stack, 20)
    
    top := stack[len(stack)-1] // Peek
    stack = stack[:len(stack)-1] // Pop
    fmt.Println(top)
}`,
                typescript: `// TypeScript Stack
let stack: number[] = [];
stack.push(10);
stack.push(20);
console.log(stack.pop()); // 20
console.log(stack[stack.length - 1]); // Peek`
            },
            syntaxDiff: 'Python uses `append`/`pop`. JavaScript/TypeScript use `push`/`pop`. Java and C++ have dedicated `Stack` classes.',
            quiz: [
                {
                    question: 'What does LIFO stand for?',
                    options: ['Last In First Out', 'Left In Front Out', 'List Input First Output', 'Loop In For Output'],
                    correct: 0,
                    explanation: 'LIFO = Last In, First Out. The most recently added element is the first to be removed.'
                }
            ]
        }
    ]
};
