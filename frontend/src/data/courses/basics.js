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

console.log("Blast off! 🚀");`
            },
            syntaxDiff: 'Both languages use similar while loop syntax. The main difference is semicolons and parentheses around the condition.',
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
        }
    ]
};
