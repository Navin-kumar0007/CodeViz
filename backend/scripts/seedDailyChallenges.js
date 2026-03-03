/**
 * 🏆 DAILY CHALLENGE SEED SCRIPT
 * Seeds 30 curated coding challenges across difficulty levels
 * Run: node scripts/seedDailyChallenges.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const DailyChallenge = require('../models/DailyChallenge');

const challenges = [
    // ────────── EASY (10) ──────────
    {
        title: 'Reverse an Array',
        description: 'Write a function that reverses an array in-place without using the built-in reverse method. Print the reversed array.',
        difficulty: 'easy',
        category: 'arrays',
        starterCode: `# Reverse the array without using .reverse()
arr = [1, 2, 3, 4, 5]

# Your code here

print(arr)`,
        expectedOutput: '[5, 4, 3, 2, 1]',
        hints: ['Use two pointers: one at start, one at end', 'Swap elements and move pointers inward', 'A while loop works great here'],
        xpReward: 15,
        challengeIndex: 0
    },
    {
        title: 'Find Maximum Element',
        description: 'Find the maximum element in an array without using the built-in max() function.',
        difficulty: 'easy',
        category: 'arrays',
        starterCode: `# Find the max without using max()
arr = [34, 12, 67, 23, 89, 45, 11]

# Your code here

print(result)`,
        expectedOutput: '89',
        hints: ['Start with the first element as maximum', 'Compare each element with current max', 'Update max when you find a larger element'],
        xpReward: 15,
        challengeIndex: 1
    },
    {
        title: 'Count Vowels',
        description: 'Count the number of vowels (a, e, i, o, u) in a given string. Case insensitive.',
        difficulty: 'easy',
        category: 'strings',
        starterCode: `# Count vowels in the string
text = "Hello World Programming"

# Your code here

print(count)`,
        expectedOutput: '6',
        hints: ['Convert to lowercase first', 'Use a set of vowels for O(1) lookup', 'Iterate through each character'],
        xpReward: 15,
        challengeIndex: 2
    },
    {
        title: 'Sum of Digits',
        description: 'Calculate the sum of all digits in a number. Handle negative numbers by ignoring the sign.',
        difficulty: 'easy',
        category: 'math',
        starterCode: `# Sum of digits
num = 12345

# Your code here

print(total)`,
        expectedOutput: '15',
        hints: ['Use modulo (%) to get last digit', 'Use integer division (//) to remove last digit', 'Loop until number becomes 0'],
        xpReward: 15,
        challengeIndex: 3
    },
    {
        title: 'Check Palindrome',
        description: 'Check if a given string is a palindrome (reads same forwards and backwards). Print True or False.',
        difficulty: 'easy',
        category: 'strings',
        starterCode: `# Check if palindrome
text = "racecar"

# Your code here

print(result)`,
        expectedOutput: 'True',
        hints: ['Compare the string with its reverse', 'You can use two pointers from both ends', 'String slicing [::-1] is the simplest way'],
        xpReward: 15,
        challengeIndex: 4
    },
    {
        title: 'FizzBuzz',
        description: 'Print numbers 1-15. For multiples of 3 print "Fizz", for 5 print "Buzz", for both print "FizzBuzz".',
        difficulty: 'easy',
        category: 'math',
        starterCode: `# FizzBuzz from 1 to 15

# Your code here
`,
        expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
        hints: ['Check divisible by 15 first (both 3 and 5)', 'Then check 3, then 5', 'Use the modulo operator %'],
        xpReward: 15,
        challengeIndex: 5
    },
    {
        title: 'Remove Duplicates',
        description: 'Remove duplicate elements from an array while maintaining the original order. Print the result.',
        difficulty: 'easy',
        category: 'arrays',
        starterCode: `# Remove duplicates, keep order
arr = [1, 3, 2, 3, 4, 1, 5, 2]

# Your code here

print(result)`,
        expectedOutput: '[1, 3, 2, 4, 5]',
        hints: ['Use a set to track seen elements', 'Build a new list with only unseen elements', 'Sets have O(1) lookup time'],
        xpReward: 15,
        challengeIndex: 6
    },
    {
        title: 'Fibonacci First 10',
        description: 'Generate and print the first 10 Fibonacci numbers as a list: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]',
        difficulty: 'easy',
        category: 'math',
        starterCode: `# Generate first 10 Fibonacci numbers

# Your code here

print(fib)`,
        expectedOutput: '[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]',
        hints: ['Start with [0, 1]', 'Each new number = sum of last two', 'Loop 8 more times to get 10 total'],
        xpReward: 15,
        challengeIndex: 7
    },
    {
        title: 'Swap Two Variables',
        description: 'Swap two variables without using a temporary variable. Print in format "a=X b=Y".',
        difficulty: 'easy',
        category: 'math',
        starterCode: `# Swap without temp variable
a = 10
b = 20

# Your code here

print(f"a={a} b={b}")`,
        expectedOutput: 'a=20 b=10',
        hints: ['Python allows tuple unpacking: a, b = b, a', 'Or use arithmetic: a = a + b, b = a - b, a = a - b', 'XOR also works for integers'],
        xpReward: 10,
        challengeIndex: 8
    },
    {
        title: 'Count Words',
        description: 'Count the number of words in a sentence.',
        difficulty: 'easy',
        category: 'strings',
        starterCode: `# Count words
sentence = "The quick brown fox jumps over the lazy dog"

# Your code here

print(count)`,
        expectedOutput: '9',
        hints: ['Use split() to break into words', 'split() by default splits on whitespace', 'len() gives you the count'],
        xpReward: 10,
        challengeIndex: 9
    },

    // ────────── MEDIUM (10) ──────────
    {
        title: 'Bubble Sort',
        description: 'Implement bubble sort to sort an array in ascending order. Print the sorted array.',
        difficulty: 'medium',
        category: 'sorting',
        starterCode: `# Implement Bubble Sort
arr = [64, 34, 25, 12, 22, 11, 90]

# Your code here

print(arr)`,
        expectedOutput: '[11, 12, 22, 25, 34, 64, 90]',
        hints: ['Use nested loops: outer for passes, inner for comparisons', 'Compare adjacent elements and swap if needed', 'After each pass, the largest is in its correct position'],
        xpReward: 25,
        challengeIndex: 10
    },
    {
        title: 'Binary Search',
        description: 'Implement binary search to find the index of target 23. Print the index.',
        difficulty: 'medium',
        category: 'searching',
        starterCode: `# Binary Search
arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23

# Your code here

print(result)`,
        expectedOutput: '5',
        hints: ['Use low=0 and high=len(arr)-1', 'Calculate mid = (low + high) // 2', 'If arr[mid] < target, search right half; else search left'],
        xpReward: 25,
        challengeIndex: 11
    },
    {
        title: 'Stack: Balanced Parentheses',
        description: 'Check if parentheses in a string are balanced. Print True or False.',
        difficulty: 'medium',
        category: 'stacks',
        starterCode: `# Check balanced parentheses
expression = "((1+2)*(3+4))"

# Your code here

print(result)`,
        expectedOutput: 'True',
        hints: ['Use a stack (list)', 'Push on opening bracket, pop on closing', 'At end, stack should be empty'],
        xpReward: 30,
        challengeIndex: 12
    },
    {
        title: 'Two Sum',
        description: 'Find two numbers in the array that add up to the target. Print their indices as a list.',
        difficulty: 'medium',
        category: 'arrays',
        starterCode: `# Two Sum
nums = [2, 7, 11, 15]
target = 9

# Your code here

print(result)`,
        expectedOutput: '[0, 1]',
        hints: ['Use a dictionary to store value:index pairs', 'For each number, check if (target - num) is in the dict', 'This gives O(n) time complexity'],
        xpReward: 30,
        challengeIndex: 13
    },
    {
        title: 'Selection Sort',
        description: 'Implement selection sort. Print the sorted array.',
        difficulty: 'medium',
        category: 'sorting',
        starterCode: `# Selection Sort
arr = [29, 10, 14, 37, 13]

# Your code here

print(arr)`,
        expectedOutput: '[10, 13, 14, 29, 37]',
        hints: ['Find the minimum in unsorted portion', 'Swap it with the first unsorted element', 'Two nested loops: outer for position, inner for finding min'],
        xpReward: 25,
        challengeIndex: 14
    },
    {
        title: 'String Compression',
        description: 'Compress a string: "aabcccccaaa" → "a2b1c5a3". Print the compressed string.',
        difficulty: 'medium',
        category: 'strings',
        starterCode: `# String compression
s = "aabcccccaaa"

# Your code here

print(result)`,
        expectedOutput: 'a2b1c5a3',
        hints: ['Track current char and its count', 'When char changes, append char+count to result', 'Don\'t forget the last group'],
        xpReward: 30,
        challengeIndex: 15
    },
    {
        title: 'Matrix Diagonal Sum',
        description: 'Calculate the sum of both diagonals of a square matrix. Don\'t double-count the center element.',
        difficulty: 'medium',
        category: 'arrays',
        starterCode: `# Diagonal sum
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Your code here

print(total)`,
        expectedOutput: '25',
        hints: ['Primary diagonal: matrix[i][i]', 'Secondary diagonal: matrix[i][n-1-i]', 'If odd-sized, subtract center element (counted twice)'],
        xpReward: 25,
        challengeIndex: 16
    },
    {
        title: 'Insertion Sort',
        description: 'Implement insertion sort. Print the sorted array.',
        difficulty: 'medium',
        category: 'sorting',
        starterCode: `# Insertion Sort
arr = [12, 11, 13, 5, 6]

# Your code here

print(arr)`,
        expectedOutput: '[5, 6, 11, 12, 13]',
        hints: ['Start from index 1 (second element)', 'Compare with previous elements and shift right', 'Insert the key at its correct position'],
        xpReward: 25,
        challengeIndex: 17
    },
    {
        title: 'Rotate Array',
        description: 'Rotate array right by 2 positions. Print the result.',
        difficulty: 'medium',
        category: 'arrays',
        starterCode: `# Rotate array right by 2
arr = [1, 2, 3, 4, 5, 6, 7]
k = 2

# Your code here

print(arr)`,
        expectedOutput: '[6, 7, 1, 2, 3, 4, 5]',
        hints: ['Use slicing: arr[-k:] + arr[:-k]', 'Or reverse the whole array, then reverse first k and last n-k', 'Handle k > len(arr) with k = k % len(arr)'],
        xpReward: 25,
        challengeIndex: 18
    },
    {
        title: 'Power of Two',
        description: 'Check if each number in the list is a power of 2. Print list of True/False.',
        difficulty: 'medium',
        category: 'math',
        starterCode: `# Check powers of 2
numbers = [1, 2, 3, 4, 5, 8, 16, 15]

# Your code here

print(result)`,
        expectedOutput: '[True, True, False, True, False, True, True, False]',
        hints: ['A power of 2 has exactly one bit set', 'Use: n > 0 and (n & (n-1)) == 0', 'Or keep dividing by 2 and check if remainder is always 0'],
        xpReward: 25,
        challengeIndex: 19
    },

    // ────────── HARD (10) ──────────
    {
        title: 'Merge Sort',
        description: 'Implement merge sort. Print the sorted array.',
        difficulty: 'hard',
        category: 'sorting',
        starterCode: `# Merge Sort
arr = [38, 27, 43, 3, 9, 82, 10]

# Your code here

print(arr)`,
        expectedOutput: '[3, 9, 10, 27, 38, 43, 82]',
        hints: ['Divide array into two halves recursively', 'Merge two sorted halves back together', 'Base case: array of length 0 or 1 is already sorted'],
        xpReward: 40,
        challengeIndex: 20
    },
    {
        title: 'Quick Sort',
        description: 'Implement quick sort using the last element as pivot. Print the sorted array.',
        difficulty: 'hard',
        category: 'sorting',
        starterCode: `# Quick Sort
arr = [10, 80, 30, 90, 40, 50, 70]

# Your code here

print(arr)`,
        expectedOutput: '[10, 30, 40, 50, 70, 80, 90]',
        hints: ['Choose a pivot element', 'Partition: elements < pivot go left, >= pivot go right', 'Recursively sort the partitions'],
        xpReward: 40,
        challengeIndex: 21
    },
    {
        title: 'Linked List Reversal',
        description: 'Reverse a linked list and print the values in order.',
        difficulty: 'hard',
        category: 'linked-lists',
        starterCode: `# Reverse a linked list
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

# Build list: 1 -> 2 -> 3 -> 4 -> 5
head = Node(1)
head.next = Node(2)
head.next.next = Node(3)
head.next.next.next = Node(4)
head.next.next.next.next = Node(5)

# Reverse the list here

# Print the reversed list
current = head
result = []
while current:
    result.append(current.data)
    current = current.next
print(result)`,
        expectedOutput: '[5, 4, 3, 2, 1]',
        hints: ['Use three pointers: prev, current, next', 'In each step: save next, reverse link, move forward', 'At the end, update head to prev'],
        xpReward: 40,
        challengeIndex: 22
    },
    {
        title: 'Longest Common Prefix',
        description: 'Find the longest common prefix among a list of strings.',
        difficulty: 'hard',
        category: 'strings',
        starterCode: `# Longest common prefix
strs = ["flower", "flow", "flight"]

# Your code here

print(result)`,
        expectedOutput: 'fl',
        hints: ['Start with the first string as prefix', 'Compare prefix with each string', 'Shorten prefix until it matches the start of each string'],
        xpReward: 35,
        challengeIndex: 23
    },
    {
        title: 'Valid Anagram',
        description: 'Check if two strings are anagrams of each other. Print True or False.',
        difficulty: 'hard',
        category: 'strings',
        starterCode: `# Valid Anagram
s1 = "listen"
s2 = "silent"

# Your code here (without using sorted())

print(result)`,
        expectedOutput: 'True',
        hints: ['Count character frequencies in both strings', 'Use a dictionary for counting', 'Compare the two frequency dictionaries'],
        xpReward: 35,
        challengeIndex: 24
    },
    {
        title: 'Stack: Next Greater Element',
        description: 'For each element, find the next greater element to its right. Print as list. Use -1 if none exists.',
        difficulty: 'hard',
        category: 'stacks',
        starterCode: `# Next Greater Element
arr = [4, 5, 2, 25, 7, 8]

# Your code here

print(result)`,
        expectedOutput: '[5, 25, 25, -1, 8, -1]',
        hints: ['Use a stack to keep track of elements waiting for their NGE', 'Process from right to left', 'Pop smaller elements from stack, top of stack is the answer'],
        xpReward: 40,
        challengeIndex: 25
    },
    {
        title: 'Kadane\'s Algorithm',
        description: 'Find the maximum subarray sum using Kadane\'s algorithm.',
        difficulty: 'hard',
        category: 'arrays',
        starterCode: `# Maximum Subarray Sum (Kadane's)
arr = [-2, -3, 4, -1, -2, 1, 5, -3]

# Your code here

print(max_sum)`,
        expectedOutput: '7',
        hints: ['Track current_sum and max_sum', 'current_sum = max(element, current_sum + element)', 'max_sum = max(max_sum, current_sum)'],
        xpReward: 40,
        challengeIndex: 26
    },
    {
        title: 'Tower of Hanoi',
        description: 'Solve Tower of Hanoi for 3 disks. Print each move as "Move disk X from A to C" format. Print total moves at end.',
        difficulty: 'hard',
        category: 'recursion',
        starterCode: `# Tower of Hanoi for 3 disks
moves = 0

def hanoi(n, source, target, auxiliary):
    global moves
    # Your code here
    pass

hanoi(3, 'A', 'C', 'B')
print(f"Total moves: {moves}")`,
        expectedOutput: 'Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B\nMove disk 3 from A to C\nMove disk 1 from B to A\nMove disk 2 from B to C\nMove disk 1 from A to C\nTotal moves: 7',
        hints: ['Base case: if n==1, move disk directly', 'Move n-1 disks from source to auxiliary', 'Move nth disk to target, then move n-1 from auxiliary to target'],
        xpReward: 45,
        challengeIndex: 27
    },
    {
        title: 'Spiral Matrix Print',
        description: 'Print the elements of a matrix in spiral order as a flat list.',
        difficulty: 'hard',
        category: 'arrays',
        starterCode: `# Spiral Matrix
matrix = [
    [1,  2,  3,  4],
    [5,  6,  7,  8],
    [9,  10, 11, 12]
]

# Your code here

print(result)`,
        expectedOutput: '[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]',
        hints: ['Use four boundaries: top, bottom, left, right', 'Traverse right, down, left, up in order', 'Shrink boundaries after each direction'],
        xpReward: 45,
        challengeIndex: 28
    },
    {
        title: 'GCD and LCM',
        description: 'Calculate GCD and LCM of two numbers without using math module. Print as tuple.',
        difficulty: 'hard',
        category: 'math',
        starterCode: `# GCD and LCM without math module
a = 12
b = 18

# Your code here

print(f"({gcd_val}, {lcm_val})")`,
        expectedOutput: '(6, 36)',
        hints: ['Use Euclidean algorithm for GCD', 'GCD: gcd(a,b) = gcd(b, a%b), base: gcd(a,0)=a', 'LCM = (a * b) // GCD'],
        xpReward: 35,
        challengeIndex: 29
    }
];

const seedChallenges = async () => {
    try {
        await connectDB();

        // Clear existing
        await DailyChallenge.deleteMany({});
        console.log('🗑️  Cleared existing challenges');

        // Insert all
        await DailyChallenge.insertMany(challenges);
        console.log(`✅ Seeded ${challenges.length} daily challenges successfully!`);
        console.log('   📊 Easy: 10 | Medium: 10 | Hard: 10');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
};

seedChallenges();
