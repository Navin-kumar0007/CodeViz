/**
 * Dynamic Programming - Learning Path
 * Learn to solve complex problems by breaking them into overlapping subproblems
 */

export const DP_PATH = {
    id: 'dp',
    title: 'Dynamic Programming',
    icon: '🧠',
    description: 'Master the art of caching results! Learn Memoization and Tabulation to optimize recursive algorithms.',
    prerequisites: ['recursion'],
    lessons: [
        {
            id: 'what-is-dp',
            title: 'Intro to DP & Memoization',
            duration: '15 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Dynamic Programming (DP) is a technique used to solve problems by breaking them down into simpler, recurring subproblems and saving the results so you never compute the same thing twice.'
                },
                {
                    type: 'tip',
                    content: 'For DP to work, a problem must have TWO properties:\n1. Overlapping Subproblems: Reusing the same smaller problems.\n2. Optimal Substructure: The global optimal solution is made of local optimal solutions.'
                },
                {
                    type: 'text',
                    content: '**Memoization** (Top-Down DP) is the easiest way to start: you write a normal recursive function, but you add a "cache" (like a HashMap or Array) to remember arguments you\'ve already seen.'
                }
            ],
            keyConcepts: [
                'Time Complexity drops massively (e.g., O(2^N) -> O(N))',
                'Memoization uses a cache to store results of function calls',
                'Pass the cache down via arguments or use a global scope',
                'Reduces duplicate work in recursive trees'
            ],
            code: {
                python: `# Python - Top-Down Memoization (Fibonacci)
def fib(n, memo=None):
    if memo is None:
        memo = {}
    
    # Base cases
    if n <= 1: return n
    
    # Check cache
    if n in memo: return memo[n]
    
    # Compute and store in cache
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]

print(fib(50)) # Very fast because of memoization!`,
                javascript: `// JavaScript - Top-Down Memoization (Fibonacci)
function fib(n, memo = {}) {
    // Base cases
    if (n <= 1) return n;
    
    // Check cache
    if (n in memo) return memo[n];
    
    // Compute and store in cache
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}

console.log(fib(50)); // Fast!`,
                java: `// Java - Top-Down Memoization
import java.util.HashMap;

public class Main {
    public static long fib(int n, HashMap<Integer, Long> memo) {
        if (n <= 1) return n;
        if (memo.containsKey(n)) return memo.get(n);
        
        long result = fib(n - 1, memo) + fib(n - 2, memo);
        memo.put(n, result);
        return result;
    }
    
    public static void main(String[] args) {
        System.out.println(fib(50, new HashMap<>())); 
    }
}`,
                cpp: `// C++ - Top-Down Memoization
#include <iostream>
#include <unordered_map>
using namespace std;

long long fib(int n, unordered_map<int, long long>& memo) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];
    
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}

int main() {
    unordered_map<int, long long> memo;
    cout << fib(50, memo) << endl;
    return 0;
}`,
                c: `// C - Top-Down Memoization (Using Array)
#include <stdio.h>

long long memo[100]; // Pre-fill with -1 in main

long long fib(int n) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    
    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
}

int main() {
    for (int i=0; i<100; i++) memo[i] = -1;
    printf("%lld\\n", fib(50));
    return 0;
}`,
                go: `// Go - Top-Down Memoization
package main
import "fmt"

func fib(n int, memo map[int]int64) int64 {
    if n <= 1 {
        return int64(n)
    }
    if val, exists := memo[n]; exists {
        return val
    }
    
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]
}

func main() {
    memo := make(map[int]int64)
    fmt.Println(fib(50, memo))
}`,
                typescript: `// TypeScript - Top-Down Memoization
function fib(n: number, memo: Record<number, number> = {}): number {
    if (n <= 1) return n;
    if (n in memo) return memo[n];
    
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
    return memo[n];
}

console.log(fib(50));`
            },
            syntaxDiff: 'Python, JS, C++, Go, and TS all easily pass hashmaps recursively. In C, statically sized arrays pre-filled with an invalid value (like -1) are the fastest and most common way to implement memoization cache.',
            quiz: [
                {
                    question: 'If Fibonacci(50) is run as a basic recursive function without Memoization, roughly how many operations occur?',
                    options: ['50', '2500', '100000', 'Over a Trillion'],
                    correct: 3,
                    explanation: 'The time complexity of naive recursive Fibonacci is O(2^N). 2^50 is a massive branching tree that would take years to run.'
                },
                {
                    question: 'What is the time complexity of the Memoized Fibonacci function?',
                    options: ['O(1)', 'O(N)', 'O(N²)', 'O(2^N)'],
                    correct: 1,
                    explanation: 'Because the function only calculates `fib(N)` one single time and caches it (costing O(1) thereafter), the total unique function calls is precisely N.'
                }
            ]
        },
        {
            id: 'tabulation',
            title: 'Tabulation (Bottom-Up DP)',
            duration: '12 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Tabulation** is the Opposite of Memoization. Instead of starting at the top `fib(50)` and recursively making calls down to `fib(0)`, you start at `0` and iterate UP using a loop.'
                },
                {
                    type: 'tip',
                    content: 'Tabulation is strictly an Iterative approach (loops & tables) whereas Memoization is strictly Recursive.'
                },
                {
                    type: 'warning',
                    content: 'Tabulation is universally FASTER in production because it entirely avoids the memory overhead and risk of Stack Overflow Exceptions caused by deep recursion!'
                }
            ],
            keyConcepts: [
                'Create a table (array/matrix) to store results',
                'Initialize base cases directly in the table',
                'Write an iterative loop filling the table up to N',
                'Can sometimes optimize Space Complexity to O(1) if you only need the last 2 values'
            ],
            code: {
                python: `# Python - Bottom-Up Tabulation (Fibonacci)
def fib_tab(n):
    if n <= 1: return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
        
    return dp[n]

# Space Optimized to O(1)
def fib_optimized(n):
    if n <= 1: return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        curr = prev1 + prev2
        prev2, prev1 = prev1, curr
    return prev1`,
                javascript: `// JavaScript - Bottom-Up Tabulation
function fibTab(n) {
    if (n <= 1) return n;
    
    const dp = new Array(n + 1).fill(0);
    dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

// Space Optimized to O(1)
function fibOptimized(n) {
    if (n <= 1) return n;
    let prev2 = 0, prev1 = 1;
    for (let i = 2; i <= n; i++) {
        const curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
                java: `// Java - Bottom-Up Tabulation
public long fibTab(int n) {
    if (n <= 1) return n;
    
    long[] dp = new long[n + 1];
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`,
                cpp: `// C++ - Bottom-Up Tabulation
long long fibTab(int n) {
    if (n <= 1) return n;
    
    vector<long long> dp(n + 1, 0);
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`,
                c: `// C - Bottom-Up Tabulation
long long fibTab(int n) {
    if (n <= 1) return n;
    
    long long dp[100] = {0}; // Assuming N <= 99
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`,
                go: `// Go - Bottom-Up Tabulation
func fibTab(n int) int64 {
    if n <= 1 { return int64(n) }
    
    dp := make([]int64, n+1)
    dp[1] = 1
    
    for i := 2; i <= n; i++ {
        dp[i] = dp[i-1] + dp[i-2]
    }
    return dp[n]
}`,
                typescript: `// TypeScript - Bottom-Up Tabulation
function fibTab(n: number): number {
    if (n <= 1) return n;
    
    const dp: number[] = new Array(n + 1).fill(0);
    dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}`
            },
            syntaxDiff: 'Because tabulation resolves entirely to loops and array access, the implementation syntax is basically identical across C, C++, Java, JS, Go, and Python.',
            quiz: [
                {
                    question: 'Why is Tabulation generally considered computationally safer than Memoization?',
                    options: [
                        'It uses less raw CPU power',
                        'It protects against Stack Overflow crashes',
                        'It has a faster time complexity (O(1))',
                        'It is easier to read'
                    ],
                    correct: 1,
                    explanation: 'Deep recursive algorithms can hit the system\'s recursive depth limit (Stack Overflow exception). Tabulation uses iterative for-loops and avoids the call stack completely.'
                },
                {
                    question: 'Can you achieve O(1) Space Complexity algorithmically with DP?',
                    options: ['Yes, always', 'No, never', 'Yes, but only if the recurrence relation only depends on a fixed number of previous states', 'Only in Java'],
                    correct: 2,
                    explanation: 'If computing dp[i] only requires knowing dp[i-1] and dp[i-2] (like Fibonacci), you don\'t need to keep an array of size N in memory. You only need 2 variables, dropping Space from O(N) to O(1).'
                }
            ]
        }
    ]
};
