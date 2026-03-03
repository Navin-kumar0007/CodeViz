/**
 * Hash Maps / Dictionaries - Learning Path
 * Essential data structure for real-world programming
 */

export const HASHMAPS_PATH = {
    id: 'hashmaps',
    title: 'Hash Maps & Dictionaries',
    icon: '🗂️',
    description: 'Learn key-value storage — the most practical data structure used in almost every real-world application.',
    prerequisites: ['recursion'],
    lessons: [
        {
            id: 'hashmap-concept',
            title: 'What is a Hash Map?',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **Hash Map** (called **Dictionary** in Python, **Object/Map** in JavaScript) stores data as **key-value pairs**. You look up values using unique keys — like a phone book where the name is the key and the number is the value.'
                },
                {
                    type: 'tip',
                    content: 'Hash maps give O(1) average lookup time! Arrays need O(n) to find an item, but hash maps find it instantly by key.'
                },
                {
                    type: 'text',
                    content: 'Keys must be **unique and immutable** (strings, numbers). Values can be anything.'
                }
            ],
            keyConcepts: [
                'Stores key-value pairs',
                'O(1) average lookup time',
                'Keys must be unique'
            ],
            code: {
                python: `# Python Dictionary
student = {
    "name": "Alice",
    "age": 20,
    "grade": "A"
}

# Access by key
print(f"Name: {student['name']}")
print(f"Age: {student['age']}")

# Add new key
student["email"] = "alice@school.com"
print(f"Updated: {student}")

# Check if key exists
print(f"Has grade? {'grade' in student}")
print(f"Has phone? {'phone' in student}")`,
                javascript: `// JavaScript Map/Object
let student = {
    name: "Alice",
    age: 20,
    grade: "A"
};

// Access by key
console.log("Name:", student.name);
console.log("Age:", student["age"]);

// Add new key
student.email = "alice@school.com";
console.log("Updated:", student);

// Check if key exists
console.log("Has grade?", "grade" in student);
console.log("Has phone?", "phone" in student);`
            },
            syntaxDiff: 'Python uses {key: value} with dict. JavaScript uses objects with dot notation or bracket notation.',
            quiz: [
                {
                    question: 'What is the average time to look up a value in a hash map?',
                    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
                    correct: 2,
                    explanation: 'Hash maps use a hash function to directly compute where the value is stored — O(1) average time!'
                },
                {
                    question: '🧠 TRICKY: What happens if you add a key that already exists?',
                    options: [
                        'Error',
                        'It creates a duplicate',
                        'It overwrites the old value',
                        'Nothing happens'
                    ],
                    correct: 2,
                    explanation: 'Keys must be unique. Setting an existing key overwrites the previous value. No error, no duplicate.'
                },
                {
                    question: '🧠 EDGE CASE: Can you use a list/array as a hash map key in Python?',
                    options: ['Yes', 'No — lists are mutable', 'Only if empty', 'Only in Python 3'],
                    correct: 1,
                    explanation: 'Lists are mutable (changeable) and cannot be hashed, so they can\'t be used as dictionary keys. Use tuples instead!'
                }
            ]
        },
        {
            id: 'frequency-count',
            title: 'Frequency Counter Pattern',
            duration: '7 min',
            explanation: [
                {
                    type: 'text',
                    content: 'The **frequency counter** is the most common hash map pattern. Count how many times each item appears in a list. This solves tons of interview problems!'
                },
                {
                    type: 'tip',
                    content: 'Pattern: Loop through array → for each item, increment its count in the map. If key doesn\'t exist, start at 1.'
                }
            ],
            keyConcepts: [
                'Count occurrences of each element',
                'Initialize count to 0 or check existence',
                'Used in anagrams, duplicates, majority element'
            ],
            code: {
                python: `# Frequency Counter
def count_frequency(arr):
    freq = {}
    for item in arr:
        if item in freq:
            freq[item] += 1
        else:
            freq[item] = 1
    return freq

nums = [1, 2, 3, 2, 1, 3, 3, 4]
result = count_frequency(nums)
print(f"Frequencies: {result}")

# Find most common
most_common = max(result, key=result.get)
print(f"Most common: {most_common} ({result[most_common]} times)")`,
                javascript: `// Frequency Counter
function countFrequency(arr) {
    let freq = {};
    for (let item of arr) {
        if (freq[item]) {
            freq[item]++;
        } else {
            freq[item] = 1;
        }
    }
    return freq;
}

let nums = [1, 2, 3, 2, 1, 3, 3, 4];
let result = countFrequency(nums);
console.log("Frequencies:", result);

// Find most common
let mostCommon = Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b);
console.log("Most common:", mostCommon, "(" + result[mostCommon] + " times)");`
            },
            syntaxDiff: 'Python checks `if item in freq`. JavaScript checks `if (freq[item])` (truthy check — 0 is falsy!).',
            quiz: [
                {
                    question: 'What is the time complexity of counting frequencies?',
                    options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(1)'],
                    correct: 1,
                    explanation: 'We loop through n items once, and each hash map operation is O(1). Total: O(n).'
                },
                {
                    question: '🧠 BUG FIND: In JavaScript, what\'s wrong with `if (freq[item])` for counting?',
                    options: [
                        'Nothing wrong',
                        'It crashes on strings',
                        'If count is 0, it\'s falsy — skips the increment',
                        'It only works for numbers'
                    ],
                    correct: 2,
                    explanation: 'In JavaScript, 0 is falsy! So if freq[item] is 0, the condition is false. Use `freq[item] !== undefined` or initialize to 0.'
                }
            ]
        },
        {
            id: 'two-sum-pattern',
            title: 'Two Sum (Classic Interview)',
            duration: '8 min',
            explanation: [
                {
                    type: 'text',
                    content: 'The **Two Sum** problem: Given an array and a target sum, find two numbers that add up to it. This is the #1 most asked interview question (LeetCode #1!).'
                },
                {
                    type: 'text',
                    content: 'Brute force: Check all pairs → O(n²). Hash map: For each number, check if `target - number` exists in the map → O(n)!'
                },
                {
                    type: 'tip',
                    content: 'The "complement" technique: instead of looking for a pair, look for what\'s MISSING. target - current = complement.'
                }
            ],
            keyConcepts: [
                'Complement = target - current number',
                'Store seen numbers in hash map',
                'O(n) time instead of O(n²)'
            ],
            code: {
                python: `# Two Sum - Hash Map Solution
def two_sum(nums, target):
    seen = {}  # value -> index
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in seen:
            print(f"Found! {complement} + {num} = {target}")
            return [seen[complement], i]
        
        seen[num] = i
        print(f"Stored: {num} at index {i}")
    
    return []

result = two_sum([2, 7, 11, 15], 9)
print(f"Indices: {result}")`,
                javascript: `// Two Sum - Hash Map Solution
function twoSum(nums, target) {
    let seen = {};  // value -> index
    
    for (let i = 0; i < nums.length; i++) {
        let complement = target - nums[i];
        
        if (seen[complement] !== undefined) {
            console.log("Found!", complement, "+", nums[i], "=", target);
            return [seen[complement], i];
        }
        
        seen[nums[i]] = i;
        console.log("Stored:", nums[i], "at index", i);
    }
    
    return [];
}

let result = twoSum([2, 7, 11, 15], 9);
console.log("Indices:", result);`
            },
            syntaxDiff: 'Python uses enumerate() for index+value. JavaScript uses a classic for loop.',
            quiz: [
                {
                    question: 'What is the time complexity of the hash map solution for Two Sum?',
                    options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
                    correct: 2,
                    explanation: 'We traverse the array once (O(n)), and each hash map lookup is O(1). Total: O(n).'
                },
                {
                    question: '🧠 TRICKY: For two_sum([3, 3], 6), what is the output?',
                    options: ['[0, 0]', '[0, 1]', '[1, 1]', 'Empty list'],
                    correct: 1,
                    explanation: 'First loop: store 3→index 0. Second loop: complement = 6-3 = 3, found in map at index 0. Return [0, 1].'
                },
                {
                    question: '🧠 EDGE CASE: For two_sum([1, 2, 3], 10), what happens?',
                    options: ['Returns [0, 2]', 'Returns empty list', 'Returns None', 'Error'],
                    correct: 1,
                    explanation: 'No two numbers add up to 10, so the function exits the loop and returns an empty list.'
                }
            ]
        },
        {
            id: 'hashmap-collisions',
            title: 'How Hashing Works',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'A **hash function** converts a key into an array index. For example, hash("alice") might give index 3. But what if two keys hash to the same index? That\'s a **collision**.'
                },
                {
                    type: 'text',
                    content: 'Collision handling: **Chaining** (store multiple items at same index in a linked list) or **Open Addressing** (find the next empty slot).'
                },
                {
                    type: 'warning',
                    content: 'Worst case: all keys hash to the same index → O(n) lookup. That\'s why good hash functions distribute evenly!'
                }
            ],
            keyConcepts: [
                'Hash function maps key to index',
                'Collisions happen when two keys get same index',
                'Good hash functions minimize collisions'
            ],
            code: {
                python: `# Simple hash function demo
def simple_hash(key, table_size):
    """Sum of character codes modulo table size"""
    total = 0
    for char in str(key):
        total += ord(char)
    index = total % table_size
    print(f"hash('{key}') = {total} % {table_size} = {index}")
    return index

# Hash some keys into a table of size 10
simple_hash("name", 10)
simple_hash("age", 10)
simple_hash("mane", 10)   # Anagram of "name" - same hash!
simple_hash("grade", 10)`,
                javascript: `// Simple hash function demo
function simpleHash(key, tableSize) {
    let total = 0;
    for (let char of String(key)) {
        total += char.charCodeAt(0);
    }
    let index = total % tableSize;
    console.log("hash('" + key + "') = " + total + " % " + tableSize + " = " + index);
    return index;
}

// Hash some keys into a table of size 10
simpleHash("name", 10);
simpleHash("age", 10);
simpleHash("mane", 10);   // Anagram of "name" - same hash!
simpleHash("grade", 10);`
            },
            syntaxDiff: 'Python uses ord(char) for character code. JavaScript uses char.charCodeAt(0).',
            quiz: [
                {
                    question: 'What is a hash collision?',
                    options: [
                        'When a key is not found',
                        'When two different keys produce the same hash index',
                        'When the hash table is full',
                        'When the hash function is slow'
                    ],
                    correct: 1,
                    explanation: 'A collision occurs when two different keys hash to the same index in the underlying array.'
                },
                {
                    question: '🧠 TRICKY: "name" and "mane" — will they always collide with a simple sum-based hash?',
                    options: ['Yes — same letters, same sum', 'No — different order', 'Depends on table size', 'Only in Python'],
                    correct: 0,
                    explanation: 'Anagrams have the same character sum, so a simple sum-based hash ALWAYS gives them the same index. Better hash functions consider character positions.'
                }
            ]
        },
        {
            id: 'hashmap-real-world',
            title: 'Real-World Hash Map Uses',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: 'Hash maps are everywhere: **caching** (store computed results), **counting** (word frequency), **grouping** (group students by grade), **deduplication** (remove duplicates).'
                },
                {
                    type: 'tip',
                    content: 'Whenever you need to "look up something quickly" or "check if something exists" — think hash map!'
                }
            ],
            keyConcepts: [
                'Caching: store expensive computation results',
                'Grouping: organize data by category',
                'Deduplication: find/remove duplicates efficiently'
            ],
            code: {
                python: `# Real-world: Group students by grade
students = [
    ("Alice", "A"), ("Bob", "B"), ("Charlie", "A"),
    ("Diana", "B"), ("Eve", "A"), ("Frank", "C")
]

groups = {}
for name, grade in students:
    if grade not in groups:
        groups[grade] = []
    groups[grade].append(name)

for grade, names in groups.items():
    print(f"Grade {grade}: {names}")`,
                javascript: `// Real-world: Group students by grade
let students = [
    ["Alice", "A"], ["Bob", "B"], ["Charlie", "A"],
    ["Diana", "B"], ["Eve", "A"], ["Frank", "C"]
];

let groups = {};
for (let [name, grade] of students) {
    if (!groups[grade]) {
        groups[grade] = [];
    }
    groups[grade].push(name);
}

for (let grade in groups) {
    console.log("Grade " + grade + ":", groups[grade]);
}`
            },
            syntaxDiff: 'Python uses tuple unpacking. JavaScript uses array destructuring.',
            quiz: [
                {
                    question: 'Which problem is NOT efficiently solved by hash maps?',
                    options: ['Finding duplicates', 'Counting frequency', 'Sorting an array', 'Grouping by category'],
                    correct: 2,
                    explanation: 'Sorting requires ordering, which hash maps don\'t provide. Use arrays + sorting algorithms instead.'
                },
                {
                    question: '🧠 TRICKY: How do you remove duplicates from [1,2,2,3,3,3] using a hash map?',
                    options: [
                        'Sort the array first',
                        'Add to a set (hash set), then convert back to list',
                        'Use two nested loops',
                        'Not possible with hash maps'
                    ],
                    correct: 1,
                    explanation: 'A set is a hash map with only keys (no values). Adding items to a set automatically removes duplicates — O(n) time!'
                }
            ]
        }
    ]
};
