/**
 * Programming Basics - Learning Path
 * First path for absolute beginners
 */

export const BASICS_PATH = {
    id: 'basics',
    title: 'Programming Basics',
    icon: '🔰',
    description: 'Start here! Learn variables, loops, and conditions - the building blocks of programming.',
    prerequisites: [],
    lessons: [
        {
            id: 'variables',
            title: 'Variables & Data Types',
            duration: '5 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **variable** is like a labeled box that stores a value. You can put data in it, change the data, or read what\'s inside.'
                },
                {
                    type: 'tip',
                    content: 'Think of variables as sticky notes with names - you write something on them and can read or change it later!'
                },
                {
                    type: 'text',
                    content: 'Variables can store different **types** of data: numbers, text (strings), and true/false values (booleans).'
                }
            ],
            keyConcepts: [
                'Variables store values for later use',
                'Variable names should be descriptive',
                'Different data types: numbers, strings, booleans'
            ],
            code: {
                python: `# Python Variables
name = "Alice"      # String (text)
age = 25            # Integer (number)
height = 5.6        # Float (decimal)
is_student = True   # Boolean (true/false)

print(f"Name: {name}")
print(f"Age: {age}")
print(f"Is student: {is_student}")`,
                javascript: `// JavaScript Variables
let name = "Alice";      // String (text)
let age = 25;            // Integer (number)
let height = 5.6;        // Float (decimal)
let isStudent = true;    // Boolean (true/false)

console.log("Name:", name);
console.log("Age:", age);
console.log("Is student:", isStudent);`,
                java: `// Java Variables
public class Main {
    public static void main(String[] args) {
        String name = "Alice";    // String
        int age = 25;             // Integer
        double height = 5.6;      // Double 
        boolean isStudent = true; // Boolean

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Is student: " + isStudent);
    }
}`,
                c: `// C Variables
#include <stdio.h>
#include <stdbool.h>

int main() {
    char name[] = "Alice";  // String 
    int age = 25;           // Integer
    float height = 5.6f;    // Float
    bool isStudent = true;  // Boolean

    printf("Name: %s\\n", name);
    printf("Age: %d\\n", age);
    printf("Is student: %d\\n", isStudent);
    return 0;
}`,
                cpp: `// C++ Variables
#include <iostream>
#include <string>

int main() {
    std::string name = "Alice"; // String
    int age = 25;               // Integer
    float height = 5.6f;        // Float
    bool isStudent = true;      // Boolean

    std::cout << "Name: " << name << "\\n";
    std::cout << "Age: " << age << "\\n";
    std::cout << "Is student: " << isStudent << "\\n";
    return 0;
}`,
                go: `// Go Variables
package main
import "fmt"

func main() {
    name := "Alice"      // Inferred string
    var age int = 25     // Explicit integer
    height := 5.6        // Inferred float64
    isStudent := true    // Inferred bool

    fmt.Println("Name:", name)
    fmt.Println("Age:", age)
    fmt.Println("Is student:", isStudent)
}`,
                typescript: `// TypeScript Variables
let name: string = "Alice";      // String
let age: number = 25;            // Number
let height: number = 5.6;        // Number
let isStudent: boolean = true;   // Boolean

console.log("Name:", name);
console.log("Age:", age);
console.log("Is student:", isStudent);`
            },
            syntaxDiff: 'Python uses no semicolons and no "let" keyword. JavaScript uses camelCase (isStudent) while Python uses snake_case (is_student).',
            quiz: [
                {
                    question: 'What is a variable?',
                    options: [
                        'A container that stores a value',
                        'A type of loop',
                        'A way to print output',
                        'A mathematical equation'
                    ],
                    correct: 0,
                    explanation: 'A variable is like a labeled box that stores a value. You can read it, change it, or use it in calculations.'
                },
                {
                    question: 'What data type is "Hello World"?',
                    options: ['Integer', 'Boolean', 'String', 'Float'],
                    correct: 2,
                    explanation: 'Text enclosed in quotes is called a String. It can contain letters, numbers, or symbols.'
                },
                {
                    question: 'What data type is True or False?',
                    options: ['String', 'Integer', 'Boolean', 'Float'],
                    correct: 2,
                    explanation: 'True/False values are called Booleans. They\'re used for yes/no decisions in code.'
                }
            ]
        },
        {
            id: 'if-else',
            title: 'If-Else Conditions',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Programs need to make **decisions**. The **if-else** statement lets your code choose different paths based on conditions.'
                },
                {
                    type: 'tip',
                    content: 'Think of it like a traffic light: IF the light is green, go. ELSE (otherwise), stop.'
                },
                {
                    type: 'text',
                    content: 'You can chain multiple conditions with **elif** (Python) or **else if** (JavaScript) to check many possibilities.'
                }
            ],
            keyConcepts: [
                'if checks a condition',
                'else runs when the condition is false',
                'elif/else if adds more conditions'
            ],
            code: {
                python: `# Python If-Else
score = 85

if score >= 90:
    grade = "A"
    print("Excellent!")
elif score >= 80:
    grade = "B"
    print("Good job!")
elif score >= 70:
    grade = "C"
    print("Not bad!")
else:
    grade = "F"
    print("Need improvement")

print(f"Grade: {grade}")`,
                javascript: `// JavaScript If-Else
let score = 85;
let grade;

if (score >= 90) {
    grade = "A";
    console.log("Excellent!");
} else if (score >= 80) {
    grade = "B";
    console.log("Good job!");
} else if (score >= 70) {
    grade = "C";
    console.log("Not bad!");
} else {
    grade = "F";
    console.log("Need improvement");
}

console.log("Grade:", grade);`,
                java: `// Java If-Else
public class Main {
    public static void main(String[] args) {
        int score = 85;
        String grade;

        if (score >= 90) {
            grade = "A";
            System.out.println("Excellent!");
        } else if (score >= 80) {
            grade = "B";
            System.out.println("Good job!");
        } else if (score >= 70) {
            grade = "C";
            System.out.println("Not bad!");
        } else {
            grade = "F";
            System.out.println("Need improvement");
        }

        System.out.println("Grade: " + grade);
    }
}`,
                c: `// C If-Else
#include <stdio.h>

int main() {
    int score = 85;
    char grade;

    if (score >= 90) {
        grade = 'A';
        printf("Excellent!\\n");
    } else if (score >= 80) {
        grade = 'B';
        printf("Good job!\\n");
    } else if (score >= 70) {
        grade = 'C';
        printf("Not bad!\\n");
    } else {
        grade = 'F';
        printf("Need improvement\\n");
    }

    printf("Grade: %c\\n", grade);
    return 0;
}`,
                cpp: `// C++ If-Else
#include <iostream>

int main() {
    int score = 85;
    char grade;

    if (score >= 90) {
        grade = 'A';
        std::cout << "Excellent!\\n";
    } else if (score >= 80) {
        grade = 'B';
        std::cout << "Good job!\\n";
    } else if (score >= 70) {
        grade = 'C';
        std::cout << "Not bad!\\n";
    } else {
        grade = 'F';
        std::cout << "Need improvement\\n";
    }

    std::cout << "Grade: " << grade << "\\n";
    return 0;
}`,
                go: `// Go If-Else
package main
import "fmt"

func main() {
    score := 85
    var grade string

    if score >= 90 {
        grade = "A"
        fmt.Println("Excellent!")
    } else if score >= 80 {
        grade = "B"
        fmt.Println("Good job!")
    } else if score >= 70 {
        grade = "C"
        fmt.Println("Not bad!")
    } else {
        grade = "F"
        fmt.Println("Need improvement")
    }

    fmt.Println("Grade:", grade)
}`,
                typescript: `// TypeScript If-Else
let score: number = 85;
let grade: string;

if (score >= 90) {
    grade = "A";
    console.log("Excellent!");
} else if (score >= 80) {
    grade = "B";
    console.log("Good job!");
} else if (score >= 70) {
    grade = "C";
    console.log("Not bad!");
} else {
    grade = "F";
    console.log("Need improvement");
}

console.log("Grade:", grade);`
            },
            syntaxDiff: 'Python uses colons and indentation. JavaScript uses curly braces {} and "else if" instead of "elif".',
            quiz: [
                {
                    question: 'What does an if statement check?',
                    options: [
                        'A condition (true or false)',
                        'A variable name',
                        'The length of a string',
                        'The type of data'
                    ],
                    correct: 0,
                    explanation: 'An if statement evaluates a condition. If true, the code inside runs. If false, it skips.'
                },
                {
                    question: 'When does the else block run?',
                    options: [
                        'Always',
                        'When the if condition is true',
                        'When the if condition is false',
                        'Never'
                    ],
                    correct: 2,
                    explanation: 'The else block is the "otherwise" case - it runs only when the if condition is NOT true.'
                }
            ]
        },
        {
            id: 'for-loop',
            title: 'For Loops',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **for loop** repeats code a specific number of times. It\'s perfect when you know exactly how many times to repeat.'
                },
                {
                    type: 'tip',
                    content: 'Imagine counting: "For each number from 1 to 10, do this action." That\'s a for loop!'
                },
                {
                    type: 'text',
                    content: 'The loop uses a **counter variable** (usually called i) that changes with each iteration.'
                }
            ],
            keyConcepts: [
                'Loops repeat code multiple times',
                'The counter variable tracks progress',
                'Great for processing lists or counting'
            ],
            code: {
                python: `# Python For Loop
print("Counting to 5:")

for i in range(1, 6):
    print(f"Count: {i}")

# Sum numbers 1 to 5
total = 0
for num in range(1, 6):
    total = total + num
    print(f"Added {num}, Total: {total}")

print(f"Final sum: {total}")`,
                javascript: `// JavaScript For Loop
console.log("Counting to 5:");

for (let i = 1; i <= 5; i++) {
    console.log("Count:", i);
}

// Sum numbers 1 to 5
let total = 0;
for (let num = 1; num <= 5; num++) {
    total = total + num;
    console.log("Added", num, "Total:", total);
}

console.log("Final sum:", total);`,
                java: `// Java For Loop
public class Main {
    public static void main(String[] args) {
        System.out.println("Counting to 5:");

        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }

        // Sum numbers 1 to 5
        int total = 0;
        for (int num = 1; num <= 5; num++) {
            total += num;
            System.out.println("Added " + num + ", Total: " + total);
        }

        System.out.println("Final sum: " + total);
    }
}`,
                c: `// C For Loop
#include <stdio.h>

int main() {
    printf("Counting to 5:\\n");

    for (int i = 1; i <= 5; i++) {
        printf("Count: %d\\n", i);
    }

    // Sum numbers 1 to 5
    int total = 0;
    for (int num = 1; num <= 5; num++) {
        total += num;
        printf("Added %d, Total: %d\\n", num, total);
    }

    printf("Final sum: %d\\n", total);
    return 0;
}`,
                cpp: `// C++ For Loop
#include <iostream>

int main() {
    std::cout << "Counting to 5:\\n";

    for (int i = 1; i <= 5; i++) {
        std::cout << "Count: " << i << "\\n";
    }

    // Sum numbers 1 to 5
    int total = 0;
    for (int num = 1; num <= 5; num++) {
        total += num;
        std::cout << "Added " << num << ", Total: " << total << "\\n";
    }

    std::cout << "Final sum: " << total << "\\n";
    return 0;
}`,
                go: `// Go For Loop
package main
import "fmt"

func main() {
    fmt.Println("Counting to 5:")

    for i := 1; i <= 5; i++ {
        fmt.Println("Count:", i)
    }

    // Sum numbers 1 to 5
    total := 0
    for num := 1; num <= 5; num++ {
        total += num
        fmt.Printf("Added %d, Total: %d\\n", num, total)
    }

    fmt.Println("Final sum:", total)
}`,
                typescript: `// TypeScript For Loop
console.log("Counting to 5:");

for (let i: number = 1; i <= 5; i++) {
    console.log("Count:", i);
}

// Sum numbers 1 to 5
let total: number = 0;
for (let num: number = 1; num <= 5; num++) {
    total += num;
    console.log(\`Added \${num}, Total: \${total}\`);
}

console.log("Final sum:", total);`
            },
            syntaxDiff: 'Python uses "for i in range(start, end)" which is cleaner. JavaScript uses the classic "for (init; condition; increment)" format.',
            quiz: [
                {
                    question: 'What does a for loop do?',
                    options: [
                        'Makes a decision',
                        'Repeats code a specific number of times',
                        'Stores a value',
                        'Prints output'
                    ],
                    correct: 1,
                    explanation: 'A for loop repeats a block of code. You control how many times it repeats.'
                },
                {
                    question: 'What is range(1, 5) in Python?',
                    options: [
                        'Numbers 1 to 5 (including 5)',
                        'Numbers 1 to 4 (not including 5)',
                        'Numbers 0 to 5',
                        'Numbers 1 to 10'
                    ],
                    correct: 1,
                    explanation: 'range(1, 5) generates 1, 2, 3, 4. The end value (5) is NOT included!'
                },
                {
                    question: 'What happens when the loop finishes?',
                    options: [
                        'The program stops',
                        'The code after the loop runs',
                        'It starts over',
                        'An error occurs'
                    ],
                    correct: 1,
                    explanation: 'After a loop completes all iterations, the program continues with the code after the loop.'
                }
            ]
        },
        {
            id: 'while-loop',
            title: 'While Loops',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **while loop** repeats code as long as a condition is true. It\'s useful when you don\'t know how many times to repeat.'
                },
                {
                    type: 'warning',
                    content: 'Be careful! If the condition never becomes false, you get an infinite loop that runs forever!'
                },
                {
                    type: 'tip',
                    content: 'Think: "While I\'m hungry, keep eating." The loop stops when you\'re no longer hungry.'
                }
            ],
            keyConcepts: [
                'Repeats while condition is true',
                'Must update something to eventually stop',
                'Good for unknown number of iterations'
            ],
            code: {
                python: `# Python While Loop
count = 5

print("Countdown:")
while count > 0:
    print(f"{count}...")
    count = count - 1

print("Blast off! 🚀")`,
                javascript: `// JavaScript While Loop
let count = 5;

console.log("Countdown:");
while (count > 0) {
    console.log(count + "...");
    count = count - 1;
}

console.log("Blast off! 🚀");`,
                java: `// Java While Loop
public class Main {
    public static void main(String[] args) {
        int count = 5;

        System.out.println("Countdown:");
        while (count > 0) {
            System.out.println(count + "...");
            count--;
        }

        System.out.println("Blast off! 🚀");
    }
}`,
                c: `// C While Loop
#include <stdio.h>

int main() {
    int count = 5;

    printf("Countdown:\\n");
    while (count > 0) {
        printf("%d...\\n", count);
        count--;
    }

    printf("Blast off! 🚀\\n");
    return 0;
}`,
                cpp: `// C++ While Loop
#include <iostream>

int main() {
    int count = 5;

    std::cout << "Countdown:\\n";
    while (count > 0) {
        std::cout << count << "...\\n";
        count--;
    }

    std::cout << "Blast off! 🚀\\n";
    return 0;
}`,
                go: `// Go While Loop
package main
import "fmt"

func main() {
    count := 5

    fmt.Println("Countdown:")
    for count > 0 { // Go uses 'for' instead of 'while'
        fmt.Printf("%d...\\n", count)
        count--
    }

    fmt.Println("Blast off! 🚀")
}`,
                typescript: `// TypeScript While Loop
let count: number = 5;

console.log("Countdown:");
while (count > 0) {
    console.log(count + "...");
    count = count - 1;
}

console.log("Blast off! 🚀");`
            },
            syntaxDiff: 'Go doesn\'t have a "while" keyword - it uses a "for" loop with only a condition. Python and JS both have "while".',
            quiz: [
                {
                    question: 'When does a while loop stop?',
                    options: [
                        'After 10 iterations',
                        'When the condition becomes false',
                        'When you press stop',
                        'It never stops'
                    ],
                    correct: 1,
                    explanation: 'A while loop keeps running as long as the condition is true. It stops when the condition becomes false.'
                },
                {
                    question: 'What is an infinite loop?',
                    options: [
                        'A very long loop',
                        'A loop that never ends',
                        'A loop inside a loop',
                        'A fast loop'
                    ],
                    correct: 1,
                    explanation: 'An infinite loop occurs when the condition never becomes false, causing the loop to run forever.'
                }
            ]
        },
        {
            id: 'functions',
            title: 'Functions',
            duration: '8 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **function** is a reusable block of code that performs a specific task. You define it once and can use it many times.'
                },
                {
                    type: 'tip',
                    content: 'Think of functions like recipes. You write the recipe once, then follow it whenever you want to make that dish.'
                },
                {
                    type: 'text',
                    content: 'Functions can take **parameters** (inputs) and can **return** a value (output).'
                }
            ],
            keyConcepts: [
                'Functions are reusable code blocks',
                'Parameters are inputs to the function',
                'Return sends a value back to the caller'
            ],
            code: {
                python: `# Python Functions
def greet(name):
    """Say hello to someone"""
    message = f"Hello, {name}!"
    return message

# Call the function
result = greet("Alice")
print(result)

# Function with multiple parameters
def add(a, b):
    return a + b

sum_result = add(5, 3)
print(f"5 + 3 = {sum_result}")`,
                javascript: `// JavaScript Functions
function greet(name) {
    // Say hello to someone
    let message = "Hello, " + name + "!";
    return message;
}

// Call the function
let result = greet("Alice");
console.log(result);

// Function with multiple parameters
function add(a, b) {
    return a + b;
}

let sumResult = add(5, 3);
console.log("5 + 3 =", sumResult);`,
                java: `// Java Functions
public class Main {
    // Define the function (method in Java)
    static String greet(String name) {
        return "Hello, " + name + "!";
    }

    static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        // Call the function
        String result = greet("Alice");
        System.out.println(result);

        int sumResult = add(5, 3);
        System.out.println("5 + 3 = " + sumResult);
    }
}`,
                c: `// C Functions
#include <stdio.h>

// Function declarations
void greet(char name[]) {
    printf("Hello, %s!\\n", name);
}

int add(int a, int b) {
    return a + b;
}

int main() {
    // Call the function
    greet("Alice");

    int sumResult = add(5, 3);
    printf("5 + 3 = %d\\n", sumResult);
    return 0;
}`,
                cpp: `// C++ Functions
#include <iostream>
#include <string>

// Function definition
std::string greet(std::string name) {
    return "Hello, " + name + "!";
}

int add(int a, int b) {
    return a + b;
}

int main() {
    // Call the function
    std::string result = greet("Alice");
    std::cout << result << "\\n";

    int sumResult = add(5, 3);
    std::cout << "5 + 3 = " << sumResult << "\\n";
    return 0;
}`,
                go: `// Go Functions
package main
import "fmt"

// Function definition
func greet(name string) string {
    return "Hello, " + name + "!"
}

func add(a int, b int) int {
    return a + b
}

func main() {
    // Call the function
    result := greet("Alice")
    fmt.Println(result)

    sumResult := add(5, 3)
    fmt.Printf("5 + 3 = %d\\n", sumResult)
}`,
                typescript: `// TypeScript Functions
function greet(name: string): string {
    // Say hello to someone
    let message: string = "Hello, " + name + "!";
    return message;
}

// Call the function
let result: string = greet("Alice");
console.log(result);

// Function with multiple parameters
function add(a: number, b: number): number {
    return a + b;
}

let sumResult: number = add(5, 3);
console.log("5 + 3 =", sumResult);`
            },
            syntaxDiff: 'Python uses "def" to define functions. JavaScript uses "function". Python functions can have docstrings for documentation.',
            quiz: [
                {
                    question: 'What is a function?',
                    options: [
                        'A variable that stores numbers',
                        'A reusable block of code',
                        'A type of loop',
                        'A way to make decisions'
                    ],
                    correct: 1,
                    explanation: 'A function is a named, reusable block of code. Define it once, use it many times!'
                },
                {
                    question: 'What does "return" do in a function?',
                    options: [
                        'Stops the program',
                        'Prints output',
                        'Sends a value back to the caller',
                        'Creates a loop'
                    ],
                    correct: 2,
                    explanation: 'Return sends a value back to wherever the function was called from.'
                },
                {
                    question: 'What are parameters?',
                    options: [
                        'Variables inside loops',
                        'Inputs passed to a function',
                        'Outputs from a function',
                        'Error messages'
                    ],
                    correct: 1,
                    explanation: 'Parameters are the inputs a function receives. They let you customize what the function does.'
                }
            ]
        },
        {
            id: 'type-systems',
            title: 'Static vs Dynamic Typing',
            duration: '12 min',
            explanation: [
                {
                    type: 'text',
                    content: 'You might have noticed a major difference in how variables are created across different languages. Languages like **Python** and **JavaScript** use **Dynamic Typing**. This means they figure out the data type automatically, and a variable can change types later.'
                },
                {
                    type: 'tip',
                    content: 'Dynamic Typing is like an adjustable box. You can put a number in it today, and a string in it tomorrow.'
                },
                {
                    type: 'text',
                    content: 'Languages like **Java**, **C**, **C++**, and **Go** use **Static Typing**. You must explicitly tell the computer what type of data the variable will hold (like `int` for integer, or `String` for text). Once defined, that variable can NEVER hold a different type of data.'
                },
                {
                    type: 'warning',
                    content: 'Static typing prevents many bugs before the code even runs because the compiler checks that all data fits perfectly into its declared boxes.'
                }
            ],
            keyConcepts: [
                'Dynamic Typing: Types are inferred at runtime',
                'Static Typing: Types are checked during compilation',
                'Dynamic is faster to write, Static is safer for large apps',
                'Variables in static languages cannot change types later'
            ],
            code: {
                python: `# Python (Dynamic)
box = 42          # Python knows it's an integer
print(f"I contain data: {box}")

box = "Hello!"    # Perfectly fine! The type changes to String.
print(f"Now I contain data: {box}")`,
                javascript: `// JavaScript (Dynamic)
let box = 42;         // JS infers it as a Number
console.log("I contain data:", box);

box = "Hello!";       // Valid! The variable now holds a String.
console.log("Now I contain data:", box);`,
                java: `// Java (Static)
public class Main {
    public static void main(String[] args) {
        int box = 42;    // Explicitly declared as integer
        System.out.println("I contain data: " + box);
        
        // box = "Hello!"; 
        // ERROR! A String cannot be put in an int variable!
    }
}`,
                c: `// C (Static)
#include <stdio.h>

int main() {
    int box = 42;
    printf("I contain data: %d\\n", box);
    
    // box = "Hello!"; 
    // ERROR! Incompatible types.
    return 0;
}`,
                cpp: `// C++ (Static)
#include <iostream>

int main() {
    int box = 42;
    std::cout << "I contain data: " << box << "\\n";
    
    // box = "Hello!"; 
    // ERROR! Cannot change the type of 'box'.
    return 0;
}`,
                go: `// Go (Static, but with type inference)
package main
import "fmt"

func main() {
    box := 42 // Go infers 'int', but rigidly locks it!
    fmt.Println("I contain data:", box)
    
    // box = "Hello!" 
    // ERROR! Cannot use type string as type int in assignment
}`,
                typescript: `// TypeScript (Static with Optional Inference)
let box: any = 42; // TypeScript can behave dynamically with 'any'
console.log("I contain data:", box);

let typedBox: number = 42;
// typedBox = "Hello!"; // TypeScript ERROR! Type 'string' is not assignable to type 'number'.`
            },
            syntaxDiff: 'Dynamic typing needs no type declarations. Static typing requires rigid type definitions like "int" or "string", even if inferred like in Go.',
            quiz: [
                {
                    question: 'Which of these pairs use Dynamic Typing?',
                    options: [
                        'Java and C',
                        'Python and JavaScript',
                        'C++ and Go',
                        'Java and Python'
                    ],
                    correct: 1,
                    explanation: 'Python and JavaScript are dynamically-typed, meaning variables can hold different types of data over their lifetime without explicit declarations.'
                },
                {
                    question: 'What is a major advantage of Static Typing?',
                    options: [
                        "It is much faster to write",
                        "You don't have to remember data types",
                        "The compiler catches type-related bugs before the code runs",
                        "Variables can change types freely"
                    ],
                    correct: 2,
                    explanation: 'Because types are checked during compilation, static typing catches many errors early, making large applications much safer and more reliable.'
                }
            ]
        }
    ]
};
