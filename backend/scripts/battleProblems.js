/**
 * Battle Problems — Curated coding challenges for 1v1 battles
 * Each problem now has multiple test cases for robust validation
 */

const BATTLE_PROBLEMS = [
    // ─── Easy ───
    {
        title: 'Reverse a String',
        description: 'Write a function that reverses a given string.\n\nExample:\n  Input: "hello" → Output: "olleh"\n  Input: "world" → Output: "dlrow"',
        starterCode: 'def reverse_string(s):\n    # Your code here\n    pass\n\n# Do not modify below\nimport sys\ns = sys.stdin.readline().strip()\nprint(reverse_string(s))',
        testCases: [
            { input: 'hello', expectedOutput: 'olleh' },
            { input: 'world', expectedOutput: 'dlrow' },
            { input: 'a', expectedOutput: 'a' },
            { input: 'racecar', expectedOutput: 'racecar' },
            { input: 'Python', expectedOutput: 'nohtyP' }
        ],
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },
    {
        title: 'Sum of Array',
        description: 'Write a function that returns the sum of all elements in an array.\n\nExample:\n  Input: 1 2 3 4 5 → Output: 15',
        starterCode: 'def sum_array(arr):\n    # Your code here\n    pass\n\nimport sys\narr = list(map(int, sys.stdin.readline().strip().split()))\nprint(sum_array(arr))',
        testCases: [
            { input: '1 2 3 4 5', expectedOutput: '15' },
            { input: '10 20 30', expectedOutput: '60' },
            { input: '0', expectedOutput: '0' },
            { input: '-1 1', expectedOutput: '0' },
            { input: '100 200 300 400', expectedOutput: '1000' }
        ],
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },
    {
        title: 'Find Maximum',
        description: 'Write a function that finds the maximum element in a list.\n\nExample:\n  Input: 3 7 1 9 4 → Output: 9',
        starterCode: 'def find_max(arr):\n    # Your code here\n    pass\n\nimport sys\narr = list(map(int, sys.stdin.readline().strip().split()))\nprint(find_max(arr))',
        testCases: [
            { input: '3 7 1 9 4', expectedOutput: '9' },
            { input: '1', expectedOutput: '1' },
            { input: '-5 -2 -8', expectedOutput: '-2' },
            { input: '100 99 98', expectedOutput: '100' },
            { input: '5 5 5 5', expectedOutput: '5' }
        ],
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },
    {
        title: 'Count Vowels',
        description: 'Count the number of vowels (a,e,i,o,u) in a string (case-insensitive).\n\nExample:\n  Input: "CodeViz" → Output: 3',
        starterCode: 'def count_vowels(s):\n    # Your code here\n    pass\n\nimport sys\ns = sys.stdin.readline().strip()\nprint(count_vowels(s))',
        testCases: [
            { input: 'CodeViz', expectedOutput: '3' },
            { input: 'hello', expectedOutput: '2' },
            { input: 'xyz', expectedOutput: '0' },
            { input: 'AEIOU', expectedOutput: '5' },
            { input: 'Programming', expectedOutput: '3' }
        ],
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },
    {
        title: 'Is Palindrome',
        description: 'Check if a string is a palindrome.\n\nExample:\n  Input: "racecar" → Output: True',
        starterCode: 'def is_palindrome(s):\n    # Your code here\n    pass\n\nimport sys\ns = sys.stdin.readline().strip()\nprint(is_palindrome(s))',
        testCases: [
            { input: 'racecar', expectedOutput: 'True' },
            { input: 'hello', expectedOutput: 'False' },
            { input: 'a', expectedOutput: 'True' },
            { input: 'madam', expectedOutput: 'True' },
            { input: 'python', expectedOutput: 'False' }
        ],
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },

    // ─── Medium ───
    {
        title: 'Two Sum',
        description: 'Given an array and a target, return indices of two numbers that add up to the target.\n\nInput format: first line is space-separated array, second line is target\nOutput: two indices space-separated\n\nExample:\n  Input: 2 7 11 15\\n9 → Output: 0 1',
        starterCode: 'def two_sum(nums, target):\n    # Your code here\n    pass\n\nimport sys\nnums = list(map(int, sys.stdin.readline().strip().split()))\ntarget = int(sys.stdin.readline().strip())\nresult = two_sum(nums, target)\nprint(result[0], result[1])',
        testCases: [
            { input: '2 7 11 15\n9', expectedOutput: '0 1' },
            { input: '3 2 4\n6', expectedOutput: '1 2' },
            { input: '1 5 3 7\n8', expectedOutput: '1 2' },
            { input: '0 4 3 0\n0', expectedOutput: '0 3' },
            { input: '1 2 3 4 5\n9', expectedOutput: '3 4' }
        ],
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },
    {
        title: 'FizzBuzz',
        description: 'Print numbers 1 to n. For multiples of 3 print "Fizz", for 5 print "Buzz", for both print "FizzBuzz".\n\nInput: a number n\nOutput: each result on a new line',
        starterCode: 'def fizzbuzz(n):\n    # Your code here\n    pass\n\nimport sys\nn = int(sys.stdin.readline().strip())\nfizzbuzz(n)',
        testCases: [
            { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz' },
            { input: '3', expectedOutput: '1\n2\nFizz' },
            { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
            { input: '1', expectedOutput: '1' },
            { input: '6', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz' }
        ],
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },
    {
        title: 'Remove Duplicates',
        description: 'Remove duplicates from a sorted array and return count of unique elements.\n\nExample:\n  Input: 1 1 2 3 3 → Output: 3',
        starterCode: 'def remove_duplicates(nums):\n    # Your code here\n    pass\n\nimport sys\nnums = list(map(int, sys.stdin.readline().strip().split()))\nprint(remove_duplicates(nums))',
        testCases: [
            { input: '1 1 2 3 3', expectedOutput: '3' },
            { input: '1 2 3 4 5', expectedOutput: '5' },
            { input: '1 1 1 1', expectedOutput: '1' },
            { input: '1', expectedOutput: '1' },
            { input: '0 0 1 1 2 2 3', expectedOutput: '4' }
        ],
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },
    {
        title: 'Fibonacci Sequence',
        description: 'Return the nth Fibonacci number (0-indexed).\n\nExample:\n  Input: 7 → Output: 13',
        starterCode: 'def fibonacci(n):\n    # Your code here\n    pass\n\nimport sys\nn = int(sys.stdin.readline().strip())\nprint(fibonacci(n))',
        testCases: [
            { input: '7', expectedOutput: '13' },
            { input: '0', expectedOutput: '0' },
            { input: '1', expectedOutput: '1' },
            { input: '10', expectedOutput: '55' },
            { input: '5', expectedOutput: '5' }
        ],
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },
    {
        title: 'Valid Parentheses',
        description: 'Check if a string of brackets is valid.\n\nExample:\n  Input: "([{}])" → Output: True',
        starterCode: 'def is_valid(s):\n    # Your code here\n    pass\n\nimport sys\ns = sys.stdin.readline().strip()\nprint(is_valid(s))',
        testCases: [
            { input: '([{}])', expectedOutput: 'True' },
            { input: '()', expectedOutput: 'True' },
            { input: '([)]', expectedOutput: 'False' },
            { input: '{[]}', expectedOutput: 'True' },
            { input: '((()))', expectedOutput: 'True' }
        ],
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },

    // ─── Hard ───
    {
        title: 'Merge Sort',
        description: 'Implement merge sort and return the sorted array.\n\nInput: space-separated integers\nOutput: space-separated sorted integers',
        starterCode: 'def merge_sort(arr):\n    # Your code here\n    pass\n\nimport sys\narr = list(map(int, sys.stdin.readline().strip().split()))\nprint(" ".join(map(str, merge_sort(arr))))',
        testCases: [
            { input: '38 27 43 3 9 82 10', expectedOutput: '3 9 10 27 38 43 82' },
            { input: '5 4 3 2 1', expectedOutput: '1 2 3 4 5' },
            { input: '1', expectedOutput: '1' },
            { input: '3 1 2', expectedOutput: '1 2 3' },
            { input: '10 -1 5 0 3', expectedOutput: '-1 0 3 5 10' }
        ],
        difficulty: 'hard',
        xpReward: 150,
        timeLimit: 900
    },
    {
        title: 'Longest Substring Without Repeating',
        description: 'Find the length of the longest substring without repeating characters.\n\nExample:\n  Input: "abcabcbb" → Output: 3',
        starterCode: 'def length_of_longest_substring(s):\n    # Your code here\n    pass\n\nimport sys\ns = sys.stdin.readline().strip()\nprint(length_of_longest_substring(s))',
        testCases: [
            { input: 'abcabcbb', expectedOutput: '3' },
            { input: 'bbbbb', expectedOutput: '1' },
            { input: 'pwwkew', expectedOutput: '3' },
            { input: 'abcdef', expectedOutput: '6' },
            { input: 'a', expectedOutput: '1' }
        ],
        difficulty: 'hard',
        xpReward: 150,
        timeLimit: 900
    },
    {
        title: 'Binary Search',
        description: 'Implement binary search. Return the index of the target or -1.\n\nInput: first line is sorted array, second line is target\nOutput: index or -1',
        starterCode: 'def binary_search(arr, target):\n    # Your code here\n    pass\n\nimport sys\narr = list(map(int, sys.stdin.readline().strip().split()))\ntarget = int(sys.stdin.readline().strip())\nprint(binary_search(arr, target))',
        testCases: [
            { input: '1 3 5 7 9 11\n7', expectedOutput: '3' },
            { input: '1 2 3 4 5\n1', expectedOutput: '0' },
            { input: '1 2 3 4 5\n6', expectedOutput: '-1' },
            { input: '10 20 30 40 50\n30', expectedOutput: '2' },
            { input: '5\n5', expectedOutput: '0' }
        ],
        difficulty: 'hard',
        xpReward: 150,
        timeLimit: 900
    }
];

const getRandomProblem = (difficulty = null) => {
    let pool = BATTLE_PROBLEMS;
    if (difficulty) {
        pool = BATTLE_PROBLEMS.filter(p => p.difficulty === difficulty);
    }
    return pool[Math.floor(Math.random() * pool.length)];
};

module.exports = { BATTLE_PROBLEMS, getRandomProblem };
