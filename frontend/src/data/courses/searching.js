/**
 * Searching Algorithms - Learning Path
 * Learn how to find elements in arrays efficiently
 */

export const SEARCHING_PATH = {
    id: 'searching',
    title: 'Searching Algorithms',
    icon: '🔍',
    description: 'Master the art of finding elements - from simple linear search to efficient binary search!',
    prerequisites: ['arrays'],  // Unlock after Arrays
    lessons: [
        {
            id: 'linear-search',
            title: 'Linear Search',
            duration: '6 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Linear Search** is the simplest search algorithm. You check each element one by one until you find what you\'re looking for.'
                },
                {
                    type: 'tip',
                    content: 'Think of it like looking for a book on a shelf - you start from one end and check each book until you find it!'
                },
                {
                    type: 'text',
                    content: 'Linear search works on ANY array (sorted or unsorted). Its time complexity is O(n) - in the worst case, you check every element.'
                }
            ],
            keyConcepts: [
                'Check each element from start to end',
                'Return index when found, -1 if not found',
                'Works on unsorted arrays',
                'Time complexity: O(n)'
            ],
            code: {
                python: `# Python - Linear Search
def linear_search(arr, target):
    """Find target in array, return index or -1"""
    for i in range(len(arr)):
        print(f"Checking index {i}: {arr[i]}")
        if arr[i] == target:
            return i  # Found it!
    return -1  # Not found

# Test it
numbers = [10, 25, 30, 45, 50]
target = 30

result = linear_search(numbers, target)
if result != -1:
    print(f"Found {target} at index {result}")
else:
    print(f"{target} not found")`,
                javascript: `// JavaScript - Linear Search
function linearSearch(arr, target) {
    // Find target in array, return index or -1
    for (let i = 0; i < arr.length; i++) {
        console.log("Checking index " + i + ": " + arr[i]);
        if (arr[i] === target) {
            return i;  // Found it!
        }
    }
    return -1;  // Not found
}

// Test it
let numbers = [10, 25, 30, 45, 50];
let target = 30;

let result = linearSearch(numbers, target);
if (result !== -1) {
    console.log("Found " + target + " at index " + result);
} else {
    console.log(target + " not found");
}`
            },
            syntaxDiff: 'Both languages use the same logic. Python uses range(len(arr)), JavaScript uses a classic for loop.',
            quiz: [
                {
                    question: 'What is the time complexity of linear search?',
                    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
                    correct: 2,
                    explanation: 'Linear search is O(n) because in the worst case, you check every single element in the array.'
                },
                {
                    question: 'What should linear search return if the element is not found?',
                    options: ['0', '-1', 'null', 'The last index'],
                    correct: 1,
                    explanation: 'By convention, search functions return -1 when the element is not found, since -1 is not a valid array index.'
                },
                {
                    question: 'Does linear search require a sorted array?',
                    options: ['Yes, always', 'No, it works on any array', 'Only for numbers', 'Only for strings'],
                    correct: 1,
                    explanation: 'Linear search works on any array - sorted or unsorted - because it checks every element one by one.'
                }
            ]
        },
        {
            id: 'binary-search',
            title: 'Binary Search',
            duration: '8 min',
            explanation: [
                {
                    type: 'text',
                    content: '**Binary Search** is a fast search algorithm for **sorted arrays**. It repeatedly divides the search space in half.'
                },
                {
                    type: 'warning',
                    content: 'Binary search ONLY works on sorted arrays! If the array is unsorted, you must sort it first or use linear search.'
                },
                {
                    type: 'tip',
                    content: 'Think of it like guessing a number: "Is it higher or lower?" Each guess eliminates half the possibilities!'
                },
                {
                    type: 'text',
                    content: 'Time complexity is O(log n) - much faster than linear search for large arrays. For 1000 elements, it needs at most 10 comparisons!'
                }
            ],
            keyConcepts: [
                'Requires a SORTED array',
                'Compare with middle element',
                'If target < middle, search left half',
                'If target > middle, search right half',
                'Time complexity: O(log n)'
            ],
            code: {
                python: `# Python - Binary Search
def binary_search(arr, target):
    """Binary search on sorted array"""
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        print(f"Checking mid index {mid}: {arr[mid]}")
        
        if arr[mid] == target:
            return mid  # Found it!
        elif arr[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1  # Search left half
    
    return -1  # Not found

# Test it (array MUST be sorted!)
numbers = [10, 20, 30, 40, 50, 60, 70]
target = 50

result = binary_search(numbers, target)
if result != -1:
    print(f"Found {target} at index {result}")
else:
    print(f"{target} not found")`,
                javascript: `// JavaScript - Binary Search
function binarySearch(arr, target) {
    // Binary search on sorted array
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        console.log("Checking mid index " + mid + ": " + arr[mid]);
        
        if (arr[mid] === target) {
            return mid;  // Found it!
        } else if (arr[mid] < target) {
            left = mid + 1;  // Search right half
        } else {
            right = mid - 1;  // Search left half
        }
    }
    
    return -1;  // Not found
}

// Test it (array MUST be sorted!)
let numbers = [10, 20, 30, 40, 50, 60, 70];
let target = 50;

let result = binarySearch(numbers, target);
if (result !== -1) {
    console.log("Found " + target + " at index " + result);
} else {
    console.log(target + " not found");
}`
            },
            syntaxDiff: 'Python uses // for integer division. JavaScript uses Math.floor() to get an integer result.',
            quiz: [
                {
                    question: 'What is required for binary search to work?',
                    options: ['An unsorted array', 'A sorted array', 'An array of strings', 'An empty array'],
                    correct: 1,
                    explanation: 'Binary search requires a SORTED array. The algorithm relies on comparing with the middle element to decide which half to search.'
                },
                {
                    question: 'What is the time complexity of binary search?',
                    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
                    correct: 1,
                    explanation: 'Binary search is O(log n) because each comparison eliminates half of the remaining elements.'
                },
                {
                    question: 'If target > middle element, which half do we search?',
                    options: ['Left half', 'Right half', 'Both halves', 'Start over'],
                    correct: 1,
                    explanation: 'If target is greater than middle, it must be in the right half (larger values) of the sorted array.'
                },
                {
                    question: 'For an array of 1000 elements, max comparisons needed?',
                    options: ['1000', '500', '100', 'About 10'],
                    correct: 3,
                    explanation: 'log₂(1000) ≈ 10. Binary search needs at most 10 comparisons for 1000 elements - that\'s the power of O(log n)!'
                }
            ]
        },
        {
            id: 'search-comparison',
            title: 'Linear vs Binary Search',
            duration: '5 min',
            explanation: [
                {
                    type: 'text',
                    content: 'When should you use each search algorithm? It depends on your data and requirements!'
                },
                {
                    type: 'tip',
                    content: 'Linear: Simple, works on any array. Binary: Fast, but requires sorted array.'
                },
                {
                    type: 'text',
                    content: 'For small arrays (< 20 elements), the difference is negligible. For large arrays, binary search is dramatically faster!'
                }
            ],
            keyConcepts: [
                'Linear: O(n), any array, simple',
                'Binary: O(log n), sorted array only',
                'For 1 million items: Linear = 1M ops, Binary ≈ 20 ops',
                'Consider sorting cost if using binary search repeatedly'
            ],
            code: {
                python: `# Python - Comparing Search Performance
import time

# Generate a large sorted array
arr = list(range(1, 100001))  # 1 to 100,000
target = 99999  # Near the end

# Linear Search
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# Binary Search
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Compare
print(f"Array size: {len(arr)}")
print(f"Looking for: {target}")

result_linear = linear_search(arr, target)
print(f"Linear found at: {result_linear}")

result_binary = binary_search(arr, target)
print(f"Binary found at: {result_binary}")`,
                javascript: `// JavaScript - Comparing Search Performance
// Generate a large sorted array
let arr = [];
for (let i = 1; i <= 100000; i++) {
    arr.push(i);
}
let target = 99999;  // Near the end

// Linear Search
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}

// Binary Search
function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// Compare
console.log("Array size:", arr.length);
console.log("Looking for:", target);

let resultLinear = linearSearch(arr, target);
console.log("Linear found at:", resultLinear);

let resultBinary = binarySearch(arr, target);
console.log("Binary found at:", resultBinary);`
            },
            syntaxDiff: 'Both implementations show the same comparison. Python uses list(range()) to generate arrays, JavaScript uses a for loop with push().',
            quiz: [
                {
                    question: 'When should you use linear search over binary search?',
                    options: [
                        'When the array is sorted',
                        'When the array is unsorted',
                        'When searching for the first element',
                        'Always'
                    ],
                    correct: 1,
                    explanation: 'Use linear search when the array is unsorted. Binary search requires a sorted array to work correctly.'
                },
                {
                    question: 'For 1 million sorted elements, approximately how many comparisons does binary search need?',
                    options: ['1 million', '500,000', 'About 20', 'About 100'],
                    correct: 2,
                    explanation: 'log₂(1,000,000) ≈ 20. Binary search is incredibly efficient for large datasets!'
                }
            ]
        }
    ]
};
