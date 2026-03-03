/**
 * Battle Problems — Curated coding challenges for 1v1 battles
 */

const BATTLE_PROBLEMS = [
    // ─── Easy ───
    {
        title: 'Reverse a String',
        description: 'Write a function that reverses a given string.\n\nInput: "hello"\nOutput: "olleh"',
        starterCode: 'def reverse_string(s):\n    # Your code here\n    pass\n\nprint(reverse_string("hello"))',
        expectedOutput: 'olleh',
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },
    {
        title: 'Sum of Array',
        description: 'Write a function that returns the sum of all elements in an array.\n\nInput: [1, 2, 3, 4, 5]\nOutput: 15',
        starterCode: 'def sum_array(arr):\n    # Your code here\n    pass\n\nprint(sum_array([1, 2, 3, 4, 5]))',
        expectedOutput: '15',
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },
    {
        title: 'Find Maximum',
        description: 'Write a function that finds the maximum element in a list.\n\nInput: [3, 7, 1, 9, 4]\nOutput: 9',
        starterCode: 'def find_max(arr):\n    # Your code here\n    pass\n\nprint(find_max([3, 7, 1, 9, 4]))',
        expectedOutput: '9',
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },
    {
        title: 'Count Vowels',
        description: 'Count the number of vowels in a string.\n\nInput: "CodeViz"\nOutput: 3',
        starterCode: 'def count_vowels(s):\n    # Your code here\n    pass\n\nprint(count_vowels("CodeViz"))',
        expectedOutput: '3',
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },
    {
        title: 'Is Palindrome',
        description: 'Check if a string is a palindrome.\n\nInput: "racecar"\nOutput: True',
        starterCode: 'def is_palindrome(s):\n    # Your code here\n    pass\n\nprint(is_palindrome("racecar"))',
        expectedOutput: 'True',
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 300
    },

    // ─── Medium ───
    {
        title: 'Two Sum',
        description: 'Given an array and a target, return indices of two numbers that add up to the target.\n\nInput: [2, 7, 11, 15], target=9\nOutput: [0, 1]',
        starterCode: 'def two_sum(nums, target):\n    # Your code here\n    pass\n\nprint(two_sum([2, 7, 11, 15], 9))',
        expectedOutput: '[0, 1]',
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },
    {
        title: 'FizzBuzz',
        description: 'Print numbers 1 to 15. For multiples of 3 print "Fizz", for 5 print "Buzz", for both print "FizzBuzz".\n\nOutput first 5 lines:\n1\n2\nFizz\n4\nBuzz',
        starterCode: 'def fizzbuzz(n):\n    # Your code here\n    pass\n\nfizzbuzz(15)',
        expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },
    {
        title: 'Remove Duplicates',
        description: 'Remove duplicates from a sorted array in-place and return the count of unique elements.\n\nInput: [1, 1, 2, 3, 3]\nOutput: 3',
        starterCode: 'def remove_duplicates(nums):\n    # Your code here\n    pass\n\nprint(remove_duplicates([1, 1, 2, 3, 3]))',
        expectedOutput: '3',
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },
    {
        title: 'Fibonacci Sequence',
        description: 'Return the first n Fibonacci numbers.\n\nInput: 8\nOutput: [0, 1, 1, 2, 3, 5, 8, 13]',
        starterCode: 'def fibonacci(n):\n    # Your code here\n    pass\n\nprint(fibonacci(8))',
        expectedOutput: '[0, 1, 1, 2, 3, 5, 8, 13]',
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },
    {
        title: 'Valid Parentheses',
        description: 'Check if a string of brackets is valid.\n\nInput: "([{}])"\nOutput: True',
        starterCode: 'def is_valid(s):\n    # Your code here\n    pass\n\nprint(is_valid("([{}])"))',
        expectedOutput: 'True',
        difficulty: 'medium',
        xpReward: 75,
        timeLimit: 600
    },

    // ─── Hard ───
    {
        title: 'Merge Sort',
        description: 'Implement merge sort and sort the array.\n\nInput: [38, 27, 43, 3, 9, 82, 10]\nOutput: [3, 9, 10, 27, 38, 43, 82]',
        starterCode: 'def merge_sort(arr):\n    # Your code here\n    pass\n\nprint(merge_sort([38, 27, 43, 3, 9, 82, 10]))',
        expectedOutput: '[3, 9, 10, 27, 38, 43, 82]',
        difficulty: 'hard',
        xpReward: 150,
        timeLimit: 900
    },
    {
        title: 'Longest Substring Without Repeating',
        description: 'Find the length of the longest substring without repeating characters.\n\nInput: "abcabcbb"\nOutput: 3',
        starterCode: 'def length_of_longest_substring(s):\n    # Your code here\n    pass\n\nprint(length_of_longest_substring("abcabcbb"))',
        expectedOutput: '3',
        difficulty: 'hard',
        xpReward: 150,
        timeLimit: 900
    },
    {
        title: 'Binary Search',
        description: 'Implement binary search. Return the index of the target or -1.\n\nInput: [1, 3, 5, 7, 9, 11], target=7\nOutput: 3',
        starterCode: 'def binary_search(arr, target):\n    # Your code here\n    pass\n\nprint(binary_search([1, 3, 5, 7, 9, 11], 7))',
        expectedOutput: '3',
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
