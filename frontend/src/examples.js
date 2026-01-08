export const EXAMPLES = {
    python: {
        "Bubble Sort": `# Python Bubble Sort
arr = [64, 34, 25, 12, 22]
n = len(arr)
print(f"Original: {arr}")

for i in range(n):
    for j in range(0, n-i-1):
        if arr[j] > arr[j+1]:
            arr[j], arr[j+1] = arr[j+1], arr[j]
            
print(f"Sorted: {arr}")`,

        "Binary Search": `# Python Binary Search
arr = [2, 5, 8, 12, 16, 23, 38, 56]
target = 23
low = 0
high = len(arr) - 1
found = -1

while low <= high:
    mid = (low + high) // 2
    if arr[mid] == target:
        found = mid
        print(f"Found at index {mid}")
        break
    elif arr[mid] < target:
        low = mid + 1
    else:
        high = mid - 1

if found == -1: print("Not Found")`,

        "Fibonacci Series": `# Python Fibonacci
n = 8
a, b = 0, 1
print(f"Fib 0: {a}")
print(f"Fib 1: {b}")

for i in range(2, n):
    c = a + b
    print(f"Fib {i}: {c}")
    a = b
    b = c`,

        "Check Prime": `# Python Check Prime
num = 29
is_prime = True

if num > 1:
    for i in range(2, num):
        if (num % i) == 0:
            is_prime = False
            print(f"{num} is divisible by {i}")
            break

if is_prime: print(f"{num} is Prime")
else: print(f"{num} is NOT Prime")`,

        "Find Maximum": `# Python Find Max
arr = [10, 50, 30, 90, 20]
max_val = arr[0]

for x in arr:
    if x > max_val:
        max_val = x
        
print(f"Maximum value is {max_val}")`,

        "Recursive Factorial": `# Python Recursive Factorial
def factorial(n):
    if n == 1:
        return 1
    else:
        # Recursive Call
        result = n * factorial(n - 1)
        return result

num = 5
print(f"Calculating factorial of {num}...")
final_result = factorial(num)
print(f"Result: {final_result}")`
    },

    javascript: {
        "Bubble Sort": `// JS Bubble Sort
let arr = [5, 3, 8, 4, 2];
console.log("Start:", arr);

for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            let temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
}
console.log("Sorted:", arr);`,

        "Selection Sort": `// JS Selection Sort
let arr = [29, 10, 14, 37, 13];
let n = arr.length;

for (let i = 0; i < n - 1; i++) {
    let min_idx = i;
    for (let j = i + 1; j < n; j++) {
        if (arr[j] < arr[min_idx]) {
            min_idx = j;
        }
    }
    // Swap
    let temp = arr[min_idx];
    arr[min_idx] = arr[i];
    arr[i] = temp;
}
console.log("Sorted:", arr);`,

        "Linear Search": `// JS Linear Search
let arr = [10, 50, 30, 70, 80, 20];
let target = 30;
let index = -1;

for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
        index = i;
        console.log("Found at index:", index);
        break;
    }
}
if (index === -1) console.log("Not found");`,

        "Factorial": `// JS Factorial
let n = 6;
let fact = 1;

for (let i = 1; i <= n; i++) {
    fact = fact * i;
}
console.log("Factorial of", n, "is", fact);`,

        "Linked List": `// JS Linked List
class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

// 1. Create Nodes
let head = new Node(10);
let second = new Node(20);
let third = new Node(30);

// 2. Link them
head.next = second;
second.next = third;

// 3. Traverse
console.log("Traversing...");
let current = head;
while (current !== null) {
    console.log("Visiting:", current.val);
    current = current.next;
}
console.log("Done!");`,

        "Binary Tree": `// JS Binary Tree
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Create Nodes
let root = new TreeNode(10);
root.left = new TreeNode(5);
root.right = new TreeNode(15);

root.left.left = new TreeNode(2);
root.left.right = new TreeNode(7);

// Traverse (Pre-order)
console.log("Root:", root.val);
console.log("Left:", root.left.val);
console.log("Right:", root.right.val);`,

        "Graph BFS": `// JS Graph BFS
// Adjacency List Representation
const graph = {
    "A": ["B", "C"],
    "B": ["D", "E"],
    "C": ["F"],
    "D": [],
    "E": ["F"],
    "F": []
};

let queue = ["A"];
let visited = ["A"];

console.log("Starting BFS...");

while (queue.length > 0) {
    let node = queue.shift();
    console.log("Visiting:", node);
    
    let neighbors = graph[node];
    for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        
        if (!visited.includes(neighbor)) {
            visited.push(neighbor);
            queue.push(neighbor);
        }
    }
}
console.log("Done!");`,

        "Stack Demo": `// JS Stack Demo
let stack = [];
console.log("Pushing elements...");

// Push elements
stack.push(10);
stack.push(20);
stack.push(30);
stack.push(40);

// Pop element
let popped = stack.pop();
console.log("Popped:", popped);

stack.push(50);
console.log("Final stack:", stack);`,

        "Queue Demo": `// JS Queue Demo
let queue = [];
console.log("Enqueuing elements...");

// Enqueue (add to rear)
queue.push(1);
queue.push(2);
queue.push(3);
queue.push(4);

// Dequeue (remove from front)
let removed = queue.shift();
console.log("Removed:", removed);

queue.push(5);
console.log("Final queue:", queue);`,

        "Linked List Demo": `// JS Linked List Demo
class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

// Create: 10 -> 20 -> 30 -> 40
let head = new Node(10);
head.next = new Node(20);
head.next.next = new Node(30);
head.next.next.next = new Node(40);

console.log("Created!");
console.log("Head:",
        "Binary Tree Traversal": \`// JS Binary Tree Traversal
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Build a balanced tree
let root = new TreeNode(50);
root.left = new TreeNode(30);
root.right = new TreeNode(70);
root.left.left = new TreeNode(20);
root.left.right = new TreeNode(40);
root.right.left = new TreeNode(60);
root.right.right = new TreeNode(80);

console.log("Tree created!");
console.log("Root:", root);\`,

        "BST Insertion": \`// JS BST Insertion
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Start with root
let root = new TreeNode(50);
console.log("Root 50 created");

// Insert left - smaller than root
root.left = new TreeNode(30);
console.log("Inserted 30 to left");

// Insert right - larger than root
root.right = new TreeNode(70);
console.log("Inserted 70 to right");

// Insert more nodes
root.left.left = new TreeNode(20);
root.left.right = new TreeNode(40);
root.right.left = new TreeNode(60);

console.log("BST complete!", root);\`,

        "Graph DFS": \`// JS Graph DFS
const graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["E", "F"],
    "D": [],
    "E": [],
    "F": ["G"],
    "G": []
};

let visited = [];
let stack = ["A"];

console.log("Starting DFS...");

while (stack.length > 0) {
    let node = stack.pop();
    
    if (!visited.includes(node)) {
        visited.push(node);
        console.log("Visiting:", node);
        
        let neighbors = graph[node];
        for (let i = neighbors.length - 1; i >= 0; i--) {
            let neighbor = neighbors[i];
            if (!visited.includes(neighbor)) {
                stack.push(neighbor);
            }
        }
    }
}
console.log("DFS complete!");\`,

        "Small Graph": \`// JS Small Graph
const graph = {
    "X": ["Y", "Z"],
    "Y": ["Z"],
    "Z": []
};

console.log("Simple graph created");
console.log("Nodes:", Object.keys(graph));

// Show connections
for (let node in graph) {
    console.log(node, "connects to:", graph[node]);
}\` head);`
    },
    java: {
        "Bubble Sort": `// Java Bubble Sort
int[] arr = { 5, 1, 4, 2, 8 };
System.out.println("Start");

for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 4 - i; j++) {
        if (arr[j] > arr[j+1]) {
            int temp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = temp;
        }
    }
}
System.out.println("Sorted!");`,

        "Reverse Array": `// Java Reverse Array
int[] arr = { 10, 20, 30, 40, 50 };
int start = 0;
int end = 4;

while (start < end) {
    int temp = arr[start];
    arr[start] = arr[end];
    arr[end] = temp;
    start = start + 1;
    end = end - 1;
}
System.out.println("Reversed");`,

        "Insertion Sort": `// Java Insertion Sort
int[] arr = { 12, 11, 13, 5, 6 };
int n = 5;

for (int i = 1; i < n; ++i) {
    int key = arr[i];
    int j = i - 1;

    while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        j = j - 1;
    }
    arr[j + 1] = key;
}
System.out.println("Sorted");`,

        "Check Prime": `// Java Prime Check
int num = 17;
boolean isPrime = true;

for (int i = 2; i <= num / 2; ++i) {
    if (num % i == 0) {
        isPrime = false;
        break;
    }
}

// ⚡️ FIX: Use curly braces to prevent tracer injection errors
if (isPrime) {
    System.out.println(num + " is Prime");
} else {
    System.out.println(num + " is NOT Prime");
}`,

        "Fibonacci Series": `// Java Fibonacci
int n = 8;
int a = 0;
int b = 1;

System.out.println("Fib: " + a);
System.out.println("Fib: " + b);

for (int i = 2; i < n; i++) {
    int c = a + b;
    System.out.println("Fib: " + c);
    a = b;
    b = c;
}`
    },

    cpp: {
        "Bubble Sort": `// C++ Bubble Sort
int arr[] = { 64, 25, 12, 22, 11 };
int n = 5;

for (int i = 0; i < n-1; i++) {
    for (int j = 0; j < n-i-1; j++) {
        if (arr[j] > arr[j+1]) {
            int temp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = temp;
        }
    }
}
int final = 0;`,

        "Count Even Numbers": `// C++ Count Evens
int arr[] = { 1, 2, 3, 4, 5, 6, 7, 8 };
int count = 0;
int n = 8;

for(int i=0; i<n; i++) {
    if(arr[i] % 2 == 0) {
        count = count + 1;
    }
}
int result = count;`,

        "Simple Sum Loop": `// C++ Sum Loop
int sum = 0;
for (int i = 1; i <= 10; i++) {
    sum = sum + i;
}
int total = sum;`
    },

    java: {
        "Bubble Sort": `// Java Bubble Sort
int[] arr = { 5, 1, 4, 2, 8 };
System.out.println("Start");

for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 4 - i; j++) {
        if (arr[j] > arr[j+1]) {
            int temp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = temp;
        }
    }
}
System.out.println("Sorted!");`,

        "Reverse Array": `// Java Reverse Array
int[] arr = { 10, 20, 30, 40, 50 };
int start = 0;
int end = 4;

while (start < end) {
    int temp = arr[start];
    arr[start] = arr[end];
    arr[end] = temp;
    start = start + 1;
    end = end - 1;
}
System.out.println("Reversed");`,

        "Insertion Sort": `// Java Insertion Sort
int[] arr = { 12, 11, 13, 5, 6 };
int n = 5;

for (int i = 1; i < n; ++i) {
    int key = arr[i];
    int j = i - 1;

    while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        j = j - 1;
    }
    arr[j + 1] = key;
}
System.out.println("Sorted");`,

        "Check Prime": `// Java Prime Check
int num = 17;
boolean isPrime = true;

for (int i = 2; i <= num / 2; ++i) {
    if (num % i == 0) {
        isPrime = false;
        break;
    }
}

// ⚡️ FIX: Use curly braces to prevent tracer injection errors
if (isPrime) {
    System.out.println(num + " is Prime");
} else {
    System.out.println(num + " is NOT Prime");
}`,

        "Fibonacci Series": `// Java Fibonacci
int n = 8;
int a = 0;
int b = 1;

System.out.println("Fib: " + a);
System.out.println("Fib: " + b);

for (int i = 2; i < n; i++) {
    int c = a + b;
    System.out.println("Fib: " + c);
    a = b;
    b = c;
}`,

        "Matrix Search": `// Java Matrix Search
int[][] matrix = {
    {1, 4, 7},
    {2, 5, 8},
    {3, 6, 9}
};
int target = 5;
String foundAt = "Not Found";

for (int r = 0; r < 3; r++) {
    for (int c = 0; c < 3; c++) {
        if (matrix[r][c] == target) {
            foundAt = "[" + r + "][" + c + "]";
            break;
        }
    }
}
System.out.println("Found at: " + foundAt);`
    }
};