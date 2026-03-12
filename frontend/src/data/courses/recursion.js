/**
 * Recursion - Learning Path
 * Builds foundation for trees, DP, and backtracking
 */

export const RECURSION_PATH = {
    id: 'recursion',
    title: 'Recursion',
    icon: '🔄',
    description: 'Master the art of functions that call themselves — the gateway to trees, graphs, and dynamic programming.',
    prerequisites: ['sorting'],
    lessons: [
        {
            id: 'recursion-concept',
            title: 'What is Recursion?',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Recursion** is when a function calls itself to solve a smaller version of the same problem. Every recursive function needs a **base case** (when to stop) and a **recursive case** (how to reduce the problem).'
                },
                {
                    type: 'warning',
                    content: 'Without a base case, recursion becomes infinite and crashes with a "maximum recursion depth exceeded" error!'
                }
            ],
            keyConcepts: [
                'A function that calls itself',
                'Base case = when to stop',
                'Recursive case = break problem into smaller piece'
            ],
            code: {
                python: `# Recursion: Countdown
def countdown(n):
    if n <= 0:          # Base case
        print("Done!")
        return
    print(f"{n}...")
    countdown(n - 1)    # Recursive call

countdown(5)`,
                javascript: `// Recursion: Countdown
function countdown(n) {
    if (n <= 0) {          // Base case
        console.log("Done!");
        return;
    }
    console.log(n + "...");
    countdown(n - 1);     // Recursive call
}

countdown(5);`,
                java: `// Java - Recursion: Countdown
public class Main {
    public static void countdown(int n) {
        if (n <= 0) {
            System.out.println("Done!");
            return;
        }
        System.out.println(n + "...");
        countdown(n - 1);
    }
    public static void main(String[] args) {
        countdown(5);
    }
}`,
                c: `// C - Recursion: Countdown
#include <stdio.h>

void countdown(int n) {
    if (n <= 0) {
        printf("Done!\\n");
        return;
    }
    printf("%d...\\n", n);
    countdown(n - 1);
}

int main() {
    countdown(5);
    return 0;
}`,
                cpp: `// C++ - Recursion: Countdown
#include <iostream>

void countdown(int n) {
    if (n <= 0) {
        std::cout << "Done!\\n";
        return;
    }
    std::cout << n << "...\\n";
    countdown(n - 1);
}

int main() {
    countdown(5);
    return 0;
}`,
                go: `// Go - Recursion: Countdown
package main
import "fmt"

func countdown(n int) {
    if n <= 0 {
        fmt.Println("Done!")
        return
    }
    fmt.Printf("%d...\\n", n)
    countdown(n - 1)
}

func main() {
    countdown(5)
}`,
                typescript: `// TypeScript - Recursion: Countdown
function countdown(n: number): void {
    if (n <= 0) {
        console.log("Done!");
        return;
    }
    console.log(n + "...");
    countdown(n - 1);
}

countdown(5);`
            },
            syntaxDiff: 'The algorithm is identical. Recursion builds a "stack" of calls that resolve in reverse order.',
            quiz: [
                {
                    question: 'What are the two essential parts of a recursive function?',
                    options: [
                        'Loop and condition',
                        'Base case and recursive case',
                        'Input and output',
                        'Start and end'
                    ],
                    correct: 1,
                    explanation: 'Every recursive function needs a base case (when to stop) and a recursive case (the self-call with a smaller problem).'
                }
            ]
        },
        {
            id: 'factorial',
            title: 'Factorial (n!)',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Factorial** (n!) = n × (n-1) × ... × 1. Classic recursion: n! = n × (n-1)!'
                }
            ],
            keyConcepts: [
                'n! = n × (n-1)!',
                'Base case: 0! = 1',
                'Time complexity: O(n)'
            ],
            code: {
                python: `# Factorial recursion
def factorial(n):
    if n <= 1: return 1
    return n * factorial(n - 1)

print(factorial(5))`,
                javascript: `// Factorial recursion
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log(factorial(5));`,
                java: `// Java Factorial
public class Main {
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}`,
                c: `// C Factorial
#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("%d\\n", factorial(5));
    return 0;
}`,
                cpp: `// C++ Factorial
#include <iostream>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    std::cout << factorial(5) << "\\n";
    return 0;
}`,
                go: `// Go Factorial
package main
import "fmt"

func factorial(n int) int {
    if n <= 1 { return 1 }
    return n * factorial(n - 1)
}

func main() {
    fmt.Println(factorial(5))
}`,
                typescript: `// TypeScript Factorial
function factorial(n: number): number {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log(factorial(5));`
            },
            syntaxDiff: 'The code is nearly identical across all languages.',
            quiz: [
                {
                    question: 'What is 4! (4 factorial)?',
                    options: ['4', '10', '24', '16'],
                    correct: 2,
                    explanation: '4! = 4 × 3 × 2 × 1 = 24'
                }
            ]
        }
    ]
};
