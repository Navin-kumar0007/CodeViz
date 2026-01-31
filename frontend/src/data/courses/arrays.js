/**
 * Arrays & Lists - Learning Path
 * Second path - requires Basics as prerequisite
 */

export const ARRAYS_PATH = {
    id: 'arrays',
    title: 'Arrays & Lists',
    icon: '📊',
    description: 'Learn how to store and manipulate collections of data - essential for any programmer!',
    prerequisites: ['basics'],
    lessons: [
        {
            id: 'what-is-array',
            title: 'What is an Array?',
            duration: '5 min',
            explanation: [
                {
                    type: 'text',
                    content: 'An **array** (called a **list** in Python) is a collection that stores multiple values in a single variable. Each value has an **index** (position number).'
                },
                {
                    type: 'tip',
                    content: 'Think of an array like a row of mailboxes. Each box has a number (index) and can hold a value.'
                },
                {
                    type: 'warning',
                    content: 'Important: Array indexes start at 0, not 1! The first element is at index 0.'
                }
            ],
            keyConcepts: [
                'Arrays store multiple values in one variable',
                'Each element has an index (starting from 0)',
                'Elements can be accessed by their index'
            ],
            code: {
                python: `# Python Lists (Arrays)
fruits = ["apple", "banana", "cherry", "date"]

# Arrays start at index 0!
print(f"Index 0: {fruits[0]}")  # apple
print(f"Index 1: {fruits[1]}")  # banana
print(f"Index 2: {fruits[2]}")  # cherry

# Check how many items
print(f"Total items: {len(fruits)}")`,
                javascript: `// JavaScript Arrays
let fruits = ["apple", "banana", "cherry", "date"];

// Arrays start at index 0!
console.log("Index 0:", fruits[0]);  // apple
console.log("Index 1:", fruits[1]);  // banana
console.log("Index 2:", fruits[2]);  // cherry

// Check how many items
console.log("Total items:", fruits.length);`
            },
            syntaxDiff: 'Python uses len(arr) for length, JavaScript uses arr.length. Both count from index 0!',
            quiz: [
                {
                    question: 'What index does the FIRST element of an array have?',
                    options: ['1', '0', '-1', 'first'],
                    correct: 1,
                    explanation: 'Arrays always start counting from 0. The first element is at index 0, second at index 1, etc.'
                },
                {
                    question: 'In ["a", "b", "c"], what is at index 2?',
                    options: ['"a"', '"b"', '"c"', 'Error'],
                    correct: 2,
                    explanation: 'Index 0="a", Index 1="b", Index 2="c". Remember, counting starts at 0!'
                }
            ]
        },
        {
            id: 'access-elements',
            title: 'Accessing Array Elements',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'To access an element, use its **index** in square brackets: array[index]. You can also access from the end using negative indices.'
                },
                {
                    type: 'tip',
                    content: 'Use -1 to get the LAST element, -2 for second-to-last, and so on!'
                },
                {
                    type: 'text',
                    content: 'You can also **change** values by assigning to a specific index: array[1] = "new value"'
                }
            ],
            keyConcepts: [
                'Use brackets [index] to access elements',
                'Negative indices count from the end',
                'You can modify elements by assigning to an index'
            ],
            code: {
                python: `# Python - Accessing Elements
numbers = [10, 20, 30, 40, 50]

# Access by index
first = numbers[0]    # 10
third = numbers[2]    # 30
last = numbers[-1]    # 50 (negative index!)

print(f"First: {first}")
print(f"Third: {third}")
print(f"Last: {last}")

# Modify an element
numbers[1] = 25
print(f"After change: {numbers}")`,
                javascript: `// JavaScript - Accessing Elements
let numbers = [10, 20, 30, 40, 50];

// Access by index
let first = numbers[0];              // 10
let third = numbers[2];              // 30
let last = numbers[numbers.length-1]; // 50

console.log("First:", first);
console.log("Third:", third);
console.log("Last:", last);

// Modify an element
numbers[1] = 25;
console.log("After change:", numbers);`
            },
            syntaxDiff: 'Python supports negative indices directly (arr[-1]). JavaScript needs arr[arr.length-1] for the last element.',
            quiz: [
                {
                    question: 'What does numbers[-1] return in Python for [10, 20, 30]?',
                    options: ['10', '20', '30', 'Error'],
                    correct: 2,
                    explanation: '-1 means the LAST element. In [10, 20, 30], the last element is 30.'
                },
                {
                    question: 'How do you change the second element to 99?',
                    options: [
                        'array[1] = 99',
                        'array[2] = 99',
                        'array.set(1, 99)',
                        'array = 99'
                    ],
                    correct: 0,
                    explanation: 'The second element is at index 1 (remember, counting starts at 0). Use array[1] = 99.'
                }
            ]
        },
        {
            id: 'modify-arrays',
            title: 'Adding & Removing Elements',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Arrays are dynamic - you can **add** new elements and **remove** existing ones. The most common operations are adding/removing from the end.'
                },
                {
                    type: 'tip',
                    content: 'append/push adds to the END. pop removes from the END. Think of a stack of plates!'
                },
                {
                    type: 'text',
                    content: 'You can also add/remove from specific positions using insert and remove/splice methods.'
                }
            ],
            keyConcepts: [
                'append/push adds to the end',
                'pop removes from the end',
                'insert adds at a specific position'
            ],
            code: {
                python: `# Python - Modifying Lists
fruits = ["apple", "banana"]
print(f"Start: {fruits}")

# Add to end
fruits.append("cherry")
print(f"After append: {fruits}")

# Remove from end
removed = fruits.pop()
print(f"Popped: {removed}")
print(f"After pop: {fruits}")

# Insert at specific position
fruits.insert(1, "grape")
print(f"After insert at 1: {fruits}")`,
                javascript: `// JavaScript - Modifying Arrays
let fruits = ["apple", "banana"];
console.log("Start:", fruits);

// Add to end
fruits.push("cherry");
console.log("After push:", fruits);

// Remove from end
let removed = fruits.pop();
console.log("Popped:", removed);
console.log("After pop:", fruits);

// Insert at specific position
fruits.splice(1, 0, "grape");
console.log("After insert at 1:", fruits);`
            },
            syntaxDiff: 'Python uses append(), JavaScript uses push(). For inserting, Python uses insert(index, value), JavaScript uses splice(index, 0, value).',
            quiz: [
                {
                    question: 'Which method adds an element to the END of an array?',
                    options: ['insert', 'append/push', 'add', 'extend'],
                    correct: 1,
                    explanation: 'append() in Python and push() in JavaScript both add to the END of the array.'
                },
                {
                    question: 'What does pop() remove?',
                    options: [
                        'The first element',
                        'The last element',
                        'A random element',
                        'All elements'
                    ],
                    correct: 1,
                    explanation: 'pop() removes and returns the LAST element from the array.'
                }
            ]
        },
        {
            id: 'traverse-array',
            title: 'Traversing Arrays (Loops)',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'To process every element in an array, we **traverse** (loop through) it. You can use a for loop to visit each element one by one.'
                },
                {
                    type: 'tip',
                    content: 'There are two main ways: loop through indices (0, 1, 2...) or loop directly through values.'
                },
                {
                    type: 'text',
                    content: 'Looping through indices is useful when you need to know the position. Looping through values is cleaner when you only need the data.'
                }
            ],
            keyConcepts: [
                'Use loops to visit every element',
                'Index loops give you position information',
                'Value loops are cleaner for simple iteration'
            ],
            code: {
                python: `# Python - Traversing Lists
fruits = ["apple", "banana", "cherry"]

# Method 1: Loop through values
print("Loop through values:")
for fruit in fruits:
    print(f"  {fruit}")

# Method 2: Loop through indices
print("Loop with indices:")
for i in range(len(fruits)):
    print(f"  Index {i}: {fruits[i]}")`,
                javascript: `// JavaScript - Traversing Arrays
let fruits = ["apple", "banana", "cherry"];

// Method 1: Loop through values
console.log("Loop through values:");
for (let fruit of fruits) {
    console.log("  " + fruit);
}

// Method 2: Loop through indices
console.log("Loop with indices:");
for (let i = 0; i < fruits.length; i++) {
    console.log("  Index " + i + ": " + fruits[i]);
}`
            },
            syntaxDiff: 'Python uses "for x in list". JavaScript uses "for (let x of array)" for values or classic for loop for indices.',
            quiz: [
                {
                    question: 'What does "for fruit in fruits" do?',
                    options: [
                        'Creates new fruits',
                        'Visits each element in the list one by one',
                        'Sorts the fruits',
                        'Counts the fruits'
                    ],
                    correct: 1,
                    explanation: 'This loop visits each element one by one, assigning it to the variable "fruit" each time.'
                },
                {
                    question: 'When should you use an index-based loop?',
                    options: [
                        'When you need the position number',
                        'When you want faster code',
                        'Always',
                        'Never'
                    ],
                    correct: 0,
                    explanation: 'Use index loops when you need to know WHERE each element is (its position), not just what it is.'
                }
            ]
        },
        {
            id: 'find-max',
            title: 'Finding Maximum Value',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A common task is finding the **maximum (largest) value** in an array. The algorithm: assume the first is biggest, then check each element.'
                },
                {
                    type: 'tip',
                    content: 'Start with max = first element. For each other element, if it\'s bigger than max, update max!'
                },
                {
                    type: 'text',
                    content: 'This pattern is called a **search algorithm**. You\'ll use similar logic to find minimum, sum, average, etc.'
                }
            ],
            keyConcepts: [
                'Initialize with the first element',
                'Compare each element to the current max',
                'Update max when you find a bigger value'
            ],
            code: {
                python: `# Python - Find Maximum
numbers = [10, 50, 30, 90, 20]
print(f"Array: {numbers}")

# Start with first element as max
max_value = numbers[0]

# Check each element
for num in numbers:
    if num > max_value:
        max_value = num
        print(f"New max found: {max_value}")

print(f"Maximum is: {max_value}")`,
                javascript: `// JavaScript - Find Maximum
let numbers = [10, 50, 30, 90, 20];
console.log("Array:", numbers);

// Start with first element as max
let maxValue = numbers[0];

// Check each element
for (let num of numbers) {
    if (num > maxValue) {
        maxValue = num;
        console.log("New max found:", maxValue);
    }
}

console.log("Maximum is:", maxValue);`
            },
            syntaxDiff: 'Both languages use similar logic. Python uses snake_case (max_value), JavaScript uses camelCase (maxValue).',
            quiz: [
                {
                    question: 'Why do we start max_value with numbers[0]?',
                    options: [
                        'Because 0 is the smallest number',
                        'It gives us a starting point to compare against',
                        'It\'s required by the language',
                        'To avoid errors'
                    ],
                    correct: 1,
                    explanation: 'We need a starting value to compare against. Using the first element guarantees max_value is a real value from the array.'
                },
                {
                    question: 'What happens when we find a bigger value?',
                    options: [
                        'We print it and continue',
                        'We update max_value to the new bigger value',
                        'We stop the loop',
                        'We remove it from the array'
                    ],
                    correct: 1,
                    explanation: 'When we find a bigger value, we update max_value. At the end, max_value holds the largest value found.'
                }
            ]
        },
        {
            id: 'reverse-array',
            title: 'Reversing an Array',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Reversing an array means flipping it: first becomes last, last becomes first. This is a classic algorithm problem!'
                },
                {
                    type: 'tip',
                    content: 'Use two pointers: one at the start, one at the end. Swap values and move pointers toward the middle.'
                },
                {
                    type: 'text',
                    content: 'This **two-pointer technique** is very common in algorithms. It\'s efficient because you only need one pass through the array.'
                }
            ],
            keyConcepts: [
                'Two pointers: left and right',
                'Swap elements at left and right',
                'Move pointers toward middle until they meet'
            ],
            code: {
                python: `# Python - Reverse Array (Manual)
arr = [1, 2, 3, 4, 5]
print(f"Original: {arr}")

left = 0
right = len(arr) - 1

while left < right:
    # Swap elements
    arr[left], arr[right] = arr[right], arr[left]
    print(f"Swapped {left} and {right}: {arr}")
    left += 1
    right -= 1

print(f"Reversed: {arr}")`,
                javascript: `// JavaScript - Reverse Array (Manual)
let arr = [1, 2, 3, 4, 5];
console.log("Original:", arr);

let left = 0;
let right = arr.length - 1;

while (left < right) {
    // Swap elements
    let temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    console.log("Swapped " + left + " and " + right + ":", arr);
    left++;
    right--;
}

console.log("Reversed:", arr);`
            },
            syntaxDiff: 'Python can swap in one line: a, b = b, a. JavaScript needs a temporary variable for swapping.',
            quiz: [
                {
                    question: 'What is the two-pointer technique?',
                    options: [
                        'Using two arrays',
                        'Using two loops',
                        'Using two variables pointing to different positions',
                        'Using two conditions'
                    ],
                    correct: 2,
                    explanation: 'Two pointers are variables that track two positions in the array, typically moving toward each other.'
                },
                {
                    question: 'When do we stop the while loop?',
                    options: [
                        'When left == 0',
                        'When right == 0',
                        'When left >= right (pointers meet/cross)',
                        'After 5 iterations'
                    ],
                    correct: 2,
                    explanation: 'We stop when the pointers meet or cross (left >= right). At that point, all elements have been swapped.'
                },
                {
                    question: 'How many swaps for array of 5 elements?',
                    options: ['5', '4', '2', '3'],
                    correct: 2,
                    explanation: 'For 5 elements: swap 0↔4, then 1↔3. The middle element (index 2) stays in place. That is 2 swaps!'
                }
            ]
        }
    ]
};
