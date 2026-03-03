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
console.log("Student:", isStudent);`,
                java: `// Java Variables
public class Main {
    public static void main(String[] args) {
        String name = "Alice";
        int age = 25;
        double height = 5.6;
        boolean isStudent = true;

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Height: " + height);
        System.out.println("Student: " + isStudent);
    }
}`,
                cpp: `// C++ Variables
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Alice";
    int age = 25;
    double height = 5.6;
    bool isStudent = true;

    cout << "Name: " << name << endl;
    cout << "Age: " << age << endl;
    cout << "Height: " << height << endl;
    cout << "Student: " << (isStudent ? "true" : "false") << endl;
    return 0;
}`
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

console.log("Score:", score, "Grade:", grade);`,
                java: `// Java If-Else
public class Main {
    public static void main(String[] args) {
        int score = 85;
        String grade;

        if (score >= 90) {
            grade = "A";
        } else if (score >= 80) {
            grade = "B";
        } else if (score >= 70) {
            grade = "C";
        } else {
            grade = "F";
        }

        System.out.println("Score: " + score + ", Grade: " + grade);
    }
}`,
                cpp: `// C++ If-Else
#include <iostream>
#include <string>
using namespace std;

int main() {
    int score = 85;
    string grade;

    if (score >= 90) {
        grade = "A";
    } else if (score >= 80) {
        grade = "B";
    } else if (score >= 70) {
        grade = "C";
    } else {
        grade = "F";
    }

    cout << "Score: " << score << ", Grade: " << grade << endl;
    return 0;
}`
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

console.log("Final Sum:", total);`,
                java: `// Java For Loop
public class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        int total = 0;

        for (int i = 0; i < numbers.length; i++) {
            total += numbers[i];
            System.out.println("Added " + numbers[i] + " Total: " + total);
        }

        System.out.println("Final Sum: " + total);
    }
}`,
                cpp: `// C++ For Loop
#include <iostream>
using namespace std;

int main() {
    int numbers[] = {1, 2, 3, 4, 5};
    int total = 0;

    for (int i = 0; i < 5; i++) {
        total += numbers[i];
        cout << "Added " << numbers[i] << " Total: " << total << endl;
    }

    cout << "Final Sum: " << total << endl;
    return 0;
}`
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

console.log("Maximum value is", maxVal);`,
                java: `// Java Find Maximum
public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 50, 30, 90, 20};
        int maxVal = arr[0];

        for (int i = 0; i < arr.length; i++) {
            if (arr[i] > maxVal) {
                maxVal = arr[i];
                System.out.println("New max found: " + maxVal);
            }
        }

        System.out.println("Maximum value is " + maxVal);
    }
}`,
                cpp: `// C++ Find Maximum
#include <iostream>
using namespace std;

int main() {
    int arr[] = {10, 50, 30, 90, 20};
    int maxVal = arr[0];

    for (int i = 0; i < 5; i++) {
        if (arr[i] > maxVal) {
            maxVal = arr[i];
            cout << "New max found: " << maxVal << endl;
        }
    }

    cout << "Maximum value is " << maxVal << endl;
    return 0;
}`
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
}`,
                java: `// Java Linear Search
public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 50, 30, 70, 80, 20};
        int target = 70;
        int foundIndex = -1;

        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                foundIndex = i;
                System.out.println("Found " + target + " at index " + i);
                break;
            }
        }

        if (foundIndex == -1) {
            System.out.println(target + " not found");
        }
    }
}`,
                cpp: `// C++ Linear Search
#include <iostream>
using namespace std;

int main() {
    int arr[] = {10, 50, 30, 70, 80, 20};
    int target = 70;
    int foundIndex = -1;

    for (int i = 0; i < 6; i++) {
        if (arr[i] == target) {
            foundIndex = i;
            cout << "Found " << target << " at index " << i << endl;
            break;
        }
    }

    if (foundIndex == -1) {
        cout << target << " not found" << endl;
    }
    return 0;
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
}`,
                java: `// Java Binary Search
public class Main {
    public static void main(String[] args) {
        int[] arr = {2, 5, 8, 12, 16, 23, 38, 56};
        int target = 23;
        int low = 0;
        int high = arr.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            System.out.println("Checking index " + mid + ": " + arr[mid]);
            
            if (arr[mid] == target) {
                System.out.println("Found " + target + " at index " + mid);
                break;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
    }
}`,
                cpp: `// C++ Binary Search
#include <iostream>
using namespace std;

int main() {
    int arr[] = {2, 5, 8, 12, 16, 23, 38, 56};
    int target = 23;
    int low = 0;
    int high = 7;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        cout << "Checking index " << mid << ": " << arr[mid] << endl;
        
        if (arr[mid] == target) {
            cout << "Found " << target << " at index " << mid << endl;
            break;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return 0;
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
public class Main {
    public static void main(String[] args) {
        int[] arr = { 64, 34, 25, 12, 22 };
        System.out.println("Sorting...");

        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - 1 - i; j++) {
                if (arr[j] > arr[j+1]) {
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
            }
        }
        System.out.println("Done!");
    }
}`,
                cpp: `// C++ Bubble Sort
#include <iostream>
using namespace std;

int main() {
    int arr[] = { 64, 34, 25, 12, 22 };
    int n = 5;
    cout << "Sorting..." << endl;

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
    cout << "Done!" << endl;
    return 0;
}`
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
console.log("Result:", result);`,
                java: `// Java Recursive Factorial
public class Main {
    public static int factorial(int n) {
        System.out.println("factorial(" + n + ") called");
        if (n == 1) {
            return 1;
        } else {
            return n * factorial(n - 1);
        }
    }

    public static void main(String[] args) {
        int num = 5;
        int result = factorial(num);
        System.out.println("Result: " + result);
    }
}`,
                cpp: `// C++ Recursive Factorial
#include <iostream>
using namespace std;

int factorial(int n) {
    cout << "factorial(" << n << ") called" << endl;
    if (n == 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

int main() {
    int num = 5;
    int result = factorial(num);
    cout << "Result: " << result << endl;
    return 0;
}`
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
}`,
                java: `// Java Fibonacci
public class Main {
    public static void main(String[] args) {
        int n = 8;
        int a = 0;
        int b = 1;

        System.out.println("Fib 0: " + a);
        System.out.println("Fib 1: " + b);

        for (int i = 2; i < n; i++) {
            int c = a + b;
            System.out.println("Fib " + i + ": " + c);
            a = b;
            b = c;
        }
    }
}`,
                cpp: `// C++ Fibonacci
#include <iostream>
using namespace std;

int main() {
    int n = 8;
    int a = 0;
    int b = 1;

    cout << "Fib 0: " << a << endl;
    cout << "Fib 1: " << b << endl;

    for (int i = 2; i < n; i++) {
        int c = a + b;
        cout << "Fib " << i << ": " << c << endl;
        a = b;
        b = c;
    }
    return 0;
}`
            }
        }
    },

    "🚀 Advanced Concepts": {
        description: "Learn advanced structural patterns like OOP and threading.",
        examples: {
            "OOP (Classes & Objects)": {
                python: `# Python Object-Oriented Programming
class Car:
    def __init__(self, brand, year):
        self.brand = brand
        self.year = year
        
    def display_info(self):
        print(f"Car: {self.brand}, Year: {self.year}")

my_car1 = Car("Toyota", 2020)
my_car2 = Car("Honda", 2022)

my_car1.display_info()
my_car2.display_info()`,
                javascript: `// JavaScript Object-Oriented Programming
class Car {
    constructor(brand, year) {
        this.brand = brand;
        this.year = year;
    }

    displayInfo() {
        console.log("Car: " + this.brand + ", Year: " + this.year);
    }
}

const myCar1 = new Car("Toyota", 2020);
const myCar2 = new Car("Honda", 2022);

myCar1.displayInfo();
myCar2.displayInfo();`,
                java: `// Java Object-Oriented Programming
class Car {
    String brand;
    int year;

    Car(String b, int y) {
        brand = b;
        year = y;
    }

    void displayInfo() {
        System.out.println("Car: " + brand + ", Year: " + year);
    }
}

public class Main {
    public static void main(String[] args) {
        // Creating objects from the Car class
        Car myCar1 = new Car("Toyota", 2020);
        Car myCar2 = new Car("Honda", 2022);

        // Calling methods
        myCar1.displayInfo();
        myCar2.displayInfo();
    }
}`,
                cpp: `// C++ Object-Oriented Programming
#include <iostream>
#include <string>
using namespace std;

class Car {
public:
    string brand;
    int year;

    Car(string b, int y) {
        brand = b;
        year = y;
    }

    void displayInfo() {
        cout << "Car: " << brand << ", Year: " << year << endl;
    }
};

int main() {
    Car myCar1("Toyota", 2020);
    Car myCar2("Honda", 2022);

    myCar1.displayInfo();
    myCar2.displayInfo();
    return 0;
}`
            },
            "Multithreading": {
                java: `// Java Multithreading
class MyThread extends Thread {
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println(Thread.currentThread().getName() + " - Count: " + i);
            try {
                Thread.sleep(500); // Pause for 500ms
            } catch (InterruptedException e) {
                System.out.println("Thread error");
            }
        }
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Starting threads...");
        
        MyThread t1 = new MyThread();
        MyThread t2 = new MyThread();
        
        t1.setName("Thread-A");
        t2.setName("Thread-B");
        
        t1.start();
        t2.start();
        
        System.out.println("Main method finished, but Threads continue running!");
    }
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
    java: getFlatExamples('java'),
    cpp: getFlatExamples('cpp')
};