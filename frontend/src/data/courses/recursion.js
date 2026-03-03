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
                },
                {
                    type: 'tip',
                    content: 'Think of Russian nesting dolls — open one, find a smaller one inside. The smallest doll is the base case.'
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

countdown(5);`
            },
            syntaxDiff: 'Both languages use the same recursive pattern. Python uses `def`, JavaScript uses `function`.',
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
                },
                {
                    question: 'What happens if you forget the base case?',
                    options: [
                        'The function returns 0',
                        'Nothing happens',
                        'Infinite recursion → stack overflow crash',
                        'The function skips the call'
                    ],
                    correct: 2,
                    explanation: 'Without a base case, the function calls itself forever until the call stack overflows and the program crashes.'
                },
                {
                    question: '🧠 TRICKY: What does countdown(0) print?',
                    options: ['0...', 'Nothing', 'Done!', 'Error'],
                    correct: 2,
                    explanation: 'When n=0, the condition n <= 0 is True, so it prints "Done!" and returns. The recursive call is never reached.'
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
                    content: '**Factorial** (n!) = n × (n-1) × (n-2) × ... × 1. For example, 5! = 5×4×3×2×1 = 120. This is a classic recursion problem because n! = n × (n-1)!'
                },
                {
                    type: 'tip',
                    content: 'Base case: 0! = 1 and 1! = 1. Recursive case: n! = n × (n-1)!'
                }
            ],
            keyConcepts: [
                'n! = n × (n-1)!',
                'Base case: 0! = 1',
                'Each call multiplies n by the result of the smaller problem'
            ],
            code: {
                python: `# Factorial using Recursion
def factorial(n):
    if n <= 1:           # Base case
        return 1
    result = n * factorial(n - 1)  # Recursive
    print(f"{n}! = {n} × {n-1}! = {result}")
    return result

answer = factorial(5)
print(f"Final: 5! = {answer}")`,
                javascript: `// Factorial using Recursion
function factorial(n) {
    if (n <= 1) {           // Base case
        return 1;
    }
    let result = n * factorial(n - 1);  // Recursive
    console.log(n + "! = " + n + " × " + (n-1) + "! = " + result);
    return result;
}

let answer = factorial(5);
console.log("Final: 5! = " + answer);`
            },
            syntaxDiff: 'Same logic in both. Python uses f-strings for formatting, JavaScript uses string concatenation.',
            quiz: [
                {
                    question: 'What is 4! (4 factorial)?',
                    options: ['4', '10', '24', '16'],
                    correct: 2,
                    explanation: '4! = 4 × 3 × 2 × 1 = 24'
                },
                {
                    question: '🧠 TRICKY: What is 0! (zero factorial)?',
                    options: ['0', '1', 'Undefined', 'Error'],
                    correct: 1,
                    explanation: 'By mathematical convention, 0! = 1. This is the base case and it\'s important for combinatorics.'
                },
                {
                    question: '🧠 EDGE CASE: How many function calls does factorial(4) make (including the first)?',
                    options: ['3', '4', '5', '6'],
                    correct: 1,
                    explanation: 'factorial(4) → factorial(3) → factorial(2) → factorial(1). That\'s 4 function calls. factorial(1) hits the base case.'
                }
            ]
        },
        {
            id: 'fibonacci',
            title: 'Fibonacci Sequence',
            duration: '8 min',
            explanation: [
                {
                    type: 'text',
                    content: 'The **Fibonacci sequence** is: 0, 1, 1, 2, 3, 5, 8, 13, 21... Each number is the sum of the two before it: F(n) = F(n-1) + F(n-2).'
                },
                {
                    type: 'warning',
                    content: 'Naive recursive Fibonacci is VERY slow (exponential time!). Each call makes TWO more calls, creating a tree of calls that grows exponentially.'
                },
                {
                    type: 'tip',
                    content: 'This is why Dynamic Programming exists — to fix the inefficiency of naive recursion by storing results.'
                }
            ],
            keyConcepts: [
                'F(n) = F(n-1) + F(n-2)',
                'Two base cases: F(0)=0, F(1)=1',
                'Naive recursion is O(2^n) — very slow'
            ],
            code: {
                python: `# Fibonacci - Recursive
def fib(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fib(n - 1) + fib(n - 2)

for i in range(8):
    print(f"fib({i}) = {fib(i)}")`,
                javascript: `// Fibonacci - Recursive
function fib(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return fib(n - 1) + fib(n - 2);
}

for (let i = 0; i < 8; i++) {
    console.log("fib(" + i + ") = " + fib(i));
}`
            },
            syntaxDiff: 'Same logic. JavaScript uses === for strict equality, Python uses ==.',
            quiz: [
                {
                    question: 'What is fib(6)?',
                    options: ['5', '6', '8', '13'],
                    correct: 2,
                    explanation: 'F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8'
                },
                {
                    question: '🧠 TRICKY: Why is recursive Fibonacci slow?',
                    options: [
                        'It uses too much memory',
                        'It recalculates the same values many times',
                        'Python is slow',
                        'It needs a bigger base case'
                    ],
                    correct: 1,
                    explanation: 'fib(5) calls fib(3) twice, fib(2) three times, etc. This overlapping subproblem recalculation makes it O(2^n).'
                },
                {
                    question: '🧠 OUTPUT: What does fib(0) return?',
                    options: ['1', '0', 'None', 'Error'],
                    correct: 1,
                    explanation: 'fib(0) returns 0 — this is the first base case. fib(1) returns 1.'
                }
            ]
        },
        {
            id: 'recursion-vs-iteration',
            title: 'Recursion vs Iteration',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Any recursive solution can be rewritten as a loop (iteration). Recursion is more elegant for tree-like problems, but iteration is often more memory-efficient.'
                },
                {
                    type: 'text',
                    content: 'Recursion uses the **call stack** — each recursive call adds a frame. Too many calls = stack overflow. Iteration uses a simple counter.'
                },
                {
                    type: 'tip',
                    content: 'Rule of thumb: Use recursion for trees/graphs/divide-and-conquer. Use iteration for simple counting and array traversal.'
                }
            ],
            keyConcepts: [
                'Both can solve the same problems',
                'Recursion uses call stack memory',
                'Iteration is usually more memory-efficient'
            ],
            code: {
                python: `# Sum 1 to n: Recursive vs Iterative

# Recursive
def sum_recursive(n):
    if n <= 0:
        return 0
    return n + sum_recursive(n - 1)

# Iterative  
def sum_iterative(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total

print(f"Recursive: {sum_recursive(5)}")
print(f"Iterative: {sum_iterative(5)}")`,
                javascript: `// Sum 1 to n: Recursive vs Iterative

// Recursive
function sumRecursive(n) {
    if (n <= 0) return 0;
    return n + sumRecursive(n - 1);
}

// Iterative
function sumIterative(n) {
    let total = 0;
    for (let i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}

console.log("Recursive:", sumRecursive(5));
console.log("Iterative:", sumIterative(5));`
            },
            syntaxDiff: 'Both show the same pattern. Recursion replaces the loop with a self-call.',
            quiz: [
                {
                    question: 'When is recursion preferred over iteration?',
                    options: [
                        'Always',
                        'For tree/graph traversal problems',
                        'For simple counting',
                        'Never'
                    ],
                    correct: 1,
                    explanation: 'Recursion naturally models tree/graph structures. Iteration is better for linear tasks.'
                },
                {
                    question: '🧠 TRICKY: What is the space complexity of recursive sum(n)?',
                    options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
                    correct: 1,
                    explanation: 'Each recursive call adds to the call stack. sum(n) makes n calls before reaching the base case → O(n) stack space.'
                }
            ]
        },
        {
            id: 'power-recursion',
            title: 'Power Function (x^n)',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Calculate x^n recursively: x^n = x × x^(n-1). But we can be smarter! If n is even: x^n = (x^(n/2))². This is called **fast exponentiation** and runs in O(log n).'
                },
                {
                    type: 'tip',
                    content: 'Fast exponentiation: 2^8 = (2^4)² = ((2²)²)² — only 3 multiplications instead of 7!'
                }
            ],
            keyConcepts: [
                'x^n = x × x^(n-1) is O(n)',
                'x^n = (x^(n/2))² is O(log n)',
                'Divide and conquer optimization'
            ],
            code: {
                python: `# Fast Exponentiation
def power(x, n):
    if n == 0:
        return 1
    if n % 2 == 0:  # Even: x^n = (x^(n/2))^2
        half = power(x, n // 2)
        result = half * half
    else:           # Odd: x^n = x * x^(n-1)
        result = x * power(x, n - 1)
    print(f"power({x}, {n}) = {result}")
    return result

print(f"2^10 = {power(2, 10)}")`,
                javascript: `// Fast Exponentiation
function power(x, n) {
    if (n === 0) return 1;
    if (n % 2 === 0) {  // Even: x^n = (x^(n/2))^2
        let half = power(x, Math.floor(n / 2));
        let result = half * half;
        console.log("power(" + x + ", " + n + ") = " + result);
        return result;
    } else {           // Odd: x^n = x * x^(n-1)
        let result = x * power(x, n - 1);
        console.log("power(" + x + ", " + n + ") = " + result);
        return result;
    }
}

console.log("2^10 = " + power(2, 10));`
            },
            syntaxDiff: 'Python uses // for integer division, JavaScript uses Math.floor().',
            quiz: [
                {
                    question: 'What is the time complexity of fast exponentiation?',
                    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
                    correct: 2,
                    explanation: 'We halve n at each step (for even n), so it takes O(log n) multiplications.'
                },
                {
                    question: '🧠 TRICKY: power(5, 0) returns what?',
                    options: ['0', '5', '1', 'Error'],
                    correct: 2,
                    explanation: 'Any number raised to the power 0 is 1. This is the base case.'
                }
            ]
        },
        {
            id: 'backtracking-intro',
            title: 'Intro to Backtracking',
            duration: '8 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Backtracking** explores all possibilities by making a choice, recursing, and undoing the choice if it doesn\'t work. It\'s like solving a maze — try a path, hit a wall, go back, try another.'
                },
                {
                    type: 'tip',
                    content: 'Pattern: Choose → Explore → Un-choose. This is the foundation for solving puzzles like Sudoku, N-Queens, and permutations.'
                }
            ],
            keyConcepts: [
                'Try a choice, recurse, undo if it fails',
                'Explores all possible solutions',
                'Foundation for combinatorial problems'
            ],
            code: {
                python: `# Generate all subsets using backtracking
def subsets(nums, index, current, result):
    if index == len(nums):
        result.append(current[:])  # Save a copy
        print(f"Found subset: {current}")
        return
    
    # Choice 1: Include nums[index]
    current.append(nums[index])
    subsets(nums, index + 1, current, result)
    
    # Choice 2: Exclude nums[index] (backtrack)
    current.pop()
    subsets(nums, index + 1, current, result)

result = []
subsets([1, 2, 3], 0, [], result)
print(f"Total subsets: {len(result)}")`,
                javascript: `// Generate all subsets using backtracking
function subsets(nums, index, current, result) {
    if (index === nums.length) {
        result.push([...current]);  // Save a copy
        console.log("Found subset:", current);
        return;
    }
    
    // Choice 1: Include nums[index]
    current.push(nums[index]);
    subsets(nums, index + 1, current, result);
    
    // Choice 2: Exclude nums[index] (backtrack)
    current.pop();
    subsets(nums, index + 1, current, result);
}

let result = [];
subsets([1, 2, 3], 0, [], result);
console.log("Total subsets:", result.length);`
            },
            syntaxDiff: 'Python uses current[:] to copy a list, JavaScript uses [...current] (spread operator).',
            quiz: [
                {
                    question: 'What is the key pattern to backtracking?',
                    options: [
                        'Loop → Break → Continue',
                        'Choose → Explore → Un-choose',
                        'Push → Pop → Push',
                        'Sort → Search → Return'
                    ],
                    correct: 1,
                    explanation: 'Backtracking follows: make a choice, explore recursively, undo the choice (backtrack) to try other options.'
                },
                {
                    question: '🧠 TRICKY: How many subsets does a set of 3 elements have?',
                    options: ['3', '6', '7', '8'],
                    correct: 3,
                    explanation: 'A set of n elements has 2^n subsets. 2³ = 8 (including the empty set and the full set).'
                }
            ]
        }
    ]
};
