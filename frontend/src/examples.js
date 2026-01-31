/**
 * CodeViz Examples - Organized by Learning Topic
 * Perfect for beginners learning programming concepts
 */

export const EXAMPLES_BY_TOPIC = {
    "🔰 Basics": {
        description: "Start here! Learn the fundamentals of programming.",
        examples: {
            "Variables & Types": {
                python: `# Python Variables
name = "Alice"
age = 25
height = 5.6
is_student = True

print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height}")
print(f"Student: {is_student}")`,
                javascript: `// JavaScript Variables
let name = "Alice";
let age = 25;
let height = 5.6;
let isStudent = true;

console.log("Name:", name);
console.log("Age:", age);
console.log("Height:", height);
console.log("Student:", isStudent);`
            },
            "If-Else Conditions": {
                python: `# Python If-Else
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Score: {score}, Grade: {grade}")`,
                javascript: `// JavaScript If-Else
let score = 85;
let grade;

if (score >= 90) {
    grade = "A";
} else if (score >= 80) {
    grade = "B";
} else if (score >= 70) {
    grade = "C";
} else {
    grade = "F";
}

console.log("Score:", score, "Grade:", grade);`
            },
            "For Loop": {
                python: `# Python For Loop
numbers = [1, 2, 3, 4, 5]
total = 0

for num in numbers:
    total = total + num
    print(f"Added {num}, Total: {total}")

print(f"Final Sum: {total}")`,
                javascript: `// JavaScript For Loop
let numbers = [1, 2, 3, 4, 5];
let total = 0;

for (let i = 0; i < numbers.length; i++) {
    total = total + numbers[i];
    console.log("Added", numbers[i], "Total:", total);
}

console.log("Final Sum:", total);`
            },
            "While Loop": {
                python: `# Python While Loop
count = 5

while count > 0:
    print(f"Countdown: {count}")
    count = count - 1

print("Blast off! 🚀")`,
                javascript: `// JavaScript While Loop
let count = 5;

while (count > 0) {
    console.log("Countdown:", count);
    count = count - 1;
}

console.log("Blast off! 🚀");`
            }
        }
    },

    "📊 Arrays": {
        description: "Learn how to store and manipulate collections of data.",
        examples: {
            "Create & Access": {
                python: `# Python Lists
fruits = ["apple", "banana", "cherry", "date"]

print(f"First fruit: {fruits[0]}")
print(f"Last fruit: {fruits[-1]}")
print(f"Total fruits: {len(fruits)}")

# Add a fruit
fruits.append("elderberry")
print(f"After append: {fruits}")`,
                javascript: `// JavaScript Arrays
let fruits = ["apple", "banana", "cherry", "date"];

console.log("First fruit:", fruits[0]);
console.log("Last fruit:", fruits[fruits.length - 1]);
console.log("Total fruits:", fruits.length);

// Add a fruit
fruits.push("elderberry");
console.log("After push:", fruits);`
            },
            "Find Maximum": {
                python: `# Python Find Maximum
arr = [10, 50, 30, 90, 20]
max_val = arr[0]

for x in arr:
    if x > max_val:
        max_val = x
        print(f"New max found: {max_val}")
        
print(f"Maximum value is {max_val}")`,
                javascript: `// JavaScript Find Maximum
let arr = [10, 50, 30, 90, 20];
let maxVal = arr[0];

for (let i = 0; i < arr.length; i++) {
    if (arr[i] > maxVal) {
        maxVal = arr[i];
        console.log("New max found:", maxVal);
    }
}

console.log("Maximum value is", maxVal);`
            },
            "Reverse Array": {
                python: `# Python Reverse Array
arr = [1, 2, 3, 4, 5]
print(f"Original: {arr}")

# Manual reverse
left = 0
right = len(arr) - 1

while left < right:
    arr[left], arr[right] = arr[right], arr[left]
    left = left + 1
    right = right - 1

print(f"Reversed: {arr}")`,
                javascript: `// JavaScript Reverse Array
let arr = [1, 2, 3, 4, 5];
console.log("Original:", arr);

// Manual reverse
let left = 0;
let right = arr.length - 1;

while (left < right) {
    let temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
}

console.log("Reversed:", arr);`
            }
        }
    },

    "🔍 Searching": {
        description: "Learn algorithms to find elements in data.",
        examples: {
            "Linear Search": {
                python: `# Python Linear Search
arr = [10, 50, 30, 70, 80, 20]
target = 70
found_index = -1

for i in range(len(arr)):
    if arr[i] == target:
        found_index = i
        print(f"Found {target} at index {i}!")
        break

if found_index == -1:
    print(f"{target} not found")`,
                javascript: `// JavaScript Linear Search
let arr = [10, 50, 30, 70, 80, 20];
let target = 70;
let foundIndex = -1;

for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
        foundIndex = i;
        console.log("Found", target, "at index", i);
        break;
    }
}

if (foundIndex === -1) {
    console.log(target, "not found");
}`
            },
            "Binary Search": {
                python: `# Python Binary Search (array must be sorted!)
arr = [2, 5, 8, 12, 16, 23, 38, 56]
target = 23
low = 0
high = len(arr) - 1

while low <= high:
    mid = (low + high) // 2
    print(f"Checking index {mid}: {arr[mid]}")
    
    if arr[mid] == target:
        print(f"Found {target} at index {mid}!")
        break
    elif arr[mid] < target:
        low = mid + 1
    else:
        high = mid - 1`,
                javascript: `// JavaScript Binary Search (array must be sorted!)
let arr = [2, 5, 8, 12, 16, 23, 38, 56];
let target = 23;
let low = 0;
let high = arr.length - 1;

while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    console.log("Checking index", mid, ":", arr[mid]);
    
    if (arr[mid] === target) {
        console.log("Found", target, "at index", mid);
        break;
    } else if (arr[mid] < target) {
        low = mid + 1;
    } else {
        high = mid - 1;
    }
}`
            }
        }
    },

    "📈 Sorting": {
        description: "Learn how to arrange elements in order.",
        examples: {
            "Bubble Sort": {
                python: `# Python Bubble Sort
arr = [64, 34, 25, 12, 22]
n = len(arr)
print(f"Original: {arr}")

for i in range(n):
    for j in range(0, n-i-1):
        if arr[j] > arr[j+1]:
            arr[j], arr[j+1] = arr[j+1], arr[j]
            
print(f"Sorted: {arr}")`,
                javascript: `// JavaScript Bubble Sort
let arr = [64, 34, 25, 12, 22];
console.log("Original:", arr);

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
                java: `// Java Bubble Sort
int[] arr = { 64, 34, 25, 12, 22 };
System.out.println("Sorting...");

for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 4 - i; j++) {
        if (arr[j] > arr[j+1]) {
            int temp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = temp;
        }
    }
}
System.out.println("Done!");`
            },
            "Selection Sort": {
                python: `# Python Selection Sort
arr = [29, 10, 14, 37, 13]
n = len(arr)

for i in range(n - 1):
    min_idx = i
    for j in range(i + 1, n):
        if arr[j] < arr[min_idx]:
            min_idx = j
    # Swap
    arr[i], arr[min_idx] = arr[min_idx], arr[i]
    print(f"After pass {i+1}: {arr}")

print(f"Sorted: {arr}")`,
                javascript: `// JavaScript Selection Sort
let arr = [29, 10, 14, 37, 13];
let n = arr.length;

for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
        if (arr[j] < arr[minIdx]) {
            minIdx = j;
        }
    }
    // Swap
    let temp = arr[minIdx];
    arr[minIdx] = arr[i];
    arr[i] = temp;
    console.log("After pass", i+1, ":", arr);
}

console.log("Sorted:", arr);`
            },
            "Insertion Sort": {
                python: `# Python Insertion Sort
arr = [12, 11, 13, 5, 6]
print(f"Original: {arr}")

for i in range(1, len(arr)):
    key = arr[i]
    j = i - 1
    
    while j >= 0 and arr[j] > key:
        arr[j + 1] = arr[j]
        j = j - 1
    
    arr[j + 1] = key
    print(f"After inserting {key}: {arr}")`,
                javascript: `// JavaScript Insertion Sort
let arr = [12, 11, 13, 5, 6];
console.log("Original:", arr);

for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    
    while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        j = j - 1;
    }
    
    arr[j + 1] = key;
    console.log("After inserting", key, ":", arr);
}`
            }
        }
    },

    "📚 Data Structures": {
        description: "Learn about Stacks, Queues, and Linked Lists.",
        examples: {
            "Stack Demo": {
                python: `# Python Stack (LIFO - Last In First Out)
stack = []
print("Pushing elements...")

stack.append(10)
stack.append(20)
stack.append(30)
stack.append(40)
print(f"Stack: {stack}")

# Pop element
popped = stack.pop()
print(f"Popped: {popped}")
print(f"Stack after pop: {stack}")`,
                javascript: `// JavaScript Stack (LIFO - Last In First Out)
let stack = [];
console.log("Pushing elements...");

stack.push(10);
stack.push(20);
stack.push(30);
stack.push(40);
console.log("Stack:", stack);

// Pop element
let popped = stack.pop();
console.log("Popped:", popped);
console.log("Stack after pop:", stack);`
            },
            "Queue Demo": {
                python: `# Python Queue (FIFO - First In First Out)
queue = []
print("Enqueuing elements...")

queue.append(1)
queue.append(2)
queue.append(3)
queue.append(4)
print(f"Queue: {queue}")

# Dequeue element
removed = queue.pop(0)
print(f"Dequeued: {removed}")
print(f"Queue after dequeue: {queue}")`,
                javascript: `// JavaScript Queue (FIFO - First In First Out)
let queue = [];
console.log("Enqueuing elements...");

queue.push(1);
queue.push(2);
queue.push(3);
queue.push(4);
console.log("Queue:", queue);

// Dequeue element
let removed = queue.shift();
console.log("Dequeued:", removed);
console.log("Queue after dequeue:", queue);`
            },
            "Linked List": {
                javascript: `// JavaScript Linked List
class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

// Create nodes
let head = new Node(10);
let second = new Node(20);
let third = new Node(30);

// Link them together
head.next = second;
second.next = third;

// Traverse
console.log("Traversing linked list...");
let current = head;
while (current !== null) {
    console.log("Node value:", current.val);
    current = current.next;
}
console.log("End of list (null)");`
            }
        }
    },

    "🌲 Trees & Graphs": {
        description: "Advanced data structures for hierarchical and network data.",
        examples: {
            "Binary Tree": {
                javascript: `// JavaScript Binary Tree
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Build tree
let root = new TreeNode(10);
root.left = new TreeNode(5);
root.right = new TreeNode(15);
root.left.left = new TreeNode(2);
root.left.right = new TreeNode(7);

console.log("Tree created!");
console.log("Root:", root.val);
console.log("Left child:", root.left.val);
console.log("Right child:", root.right.val);`
            },
            "Graph BFS": {
                javascript: `// JavaScript Graph BFS (Breadth-First Search)
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

console.log("Starting BFS from A...");

while (queue.length > 0) {
    let node = queue.shift();
    console.log("Visiting:", node);
    
    let neighbors = graph[node];
    for (let i = 0; i < neighbors.length; i++) {
        if (!visited.includes(neighbors[i])) {
            visited.push(neighbors[i]);
            queue.push(neighbors[i]);
        }
    }
}

console.log("BFS complete!");`
            },
            "Graph DFS": {
                javascript: `// JavaScript Graph DFS (Depth-First Search)
const graph = {
    "A": ["B", "C"],
    "B": ["D"],
    "C": ["E", "F"],
    "D": [],
    "E": [],
    "F": []
};

let stack = ["A"];
let visited = [];

console.log("Starting DFS from A...");

while (stack.length > 0) {
    let node = stack.pop();
    
    if (!visited.includes(node)) {
        visited.push(node);
        console.log("Visiting:", node);
        
        let neighbors = graph[node];
        for (let i = neighbors.length - 1; i >= 0; i--) {
            stack.push(neighbors[i]);
        }
    }
}

console.log("DFS complete!");`
            }
        }
    },

    "🔄 Recursion": {
        description: "Learn how functions can call themselves.",
        examples: {
            "Factorial": {
                python: `# Python Recursive Factorial
def factorial(n):
    print(f"factorial({n}) called")
    if n == 1:
        return 1
    else:
        result = n * factorial(n - 1)
        return result

num = 5
final_result = factorial(num)
print(f"Result: {final_result}")`,
                javascript: `// JavaScript Recursive Factorial
function factorial(n) {
    console.log("factorial(" + n + ") called");
    if (n === 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

let num = 5;
let result = factorial(num);
console.log("Result:", result);`
            },
            "Fibonacci": {
                python: `# Python Fibonacci
n = 8
a = 0
b = 1

print(f"Fib 0: {a}")
print(f"Fib 1: {b}")

for i in range(2, n):
    c = a + b
    print(f"Fib {i}: {c}")
    a = b
    b = c`,
                javascript: `// JavaScript Fibonacci
let n = 8;
let a = 0;
let b = 1;

console.log("Fib 0:", a);
console.log("Fib 1:", b);

for (let i = 2; i < n; i++) {
    let c = a + b;
    console.log("Fib " + i + ":", c);
    a = b;
    b = c;
}`
            }
        }
    }
};

// Helper to get flat list for backward compatibility
export const getFlatExamples = (language) => {
    const flat = {};
    Object.values(EXAMPLES_BY_TOPIC).forEach(topic => {
        Object.entries(topic.examples).forEach(([name, langs]) => {
            if (langs[language]) {
                flat[name] = langs[language];
            }
        });
    });
    return flat;
};

// Keep old format for backward compatibility
export const EXAMPLES = {
    python: getFlatExamples('python'),
    javascript: getFlatExamples('javascript'),
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
int final = 0;`
    }
};