/**
 * 🎯 INTERVIEW PREP — Curated DSA Problem Bank
 * 30+ problems across 6 categories with test cases
 */

const interviewProblems = [
    // ═══════════════════════════════════════
    // 📦 ARRAYS (6 problems)
    // ═══════════════════════════════════════
    {
        id: 'arr-1',
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. You may assume each input has exactly one solution.',
        difficulty: 'easy',
        category: 'arrays',
        timeEstimate: 10,
        companies: ['Google', 'Amazon', 'Meta'],
        hints: [
            'Think about what complement you need for each number',
            'A hash map can store numbers you\'ve already seen',
            'For each number, check if (target - number) exists in the map'
        ],
        starterCode: `def two_sum(nums, target):
    # Return indices of two numbers that sum to target
    pass

# Test
print(two_sum([2, 7, 11, 15], 9))  # Expected: [0, 1]`,
        testCases: [
            { input: '2 7 11 15\n9', expectedOutput: '[0, 1]' },
            { input: '3 2 4\n6', expectedOutput: '[1, 2]' },
            { input: '3 3\n6', expectedOutput: '[0, 1]' },
            { input: '1 5 3 7\n8', expectedOutput: '[1, 2]' },
            { input: '-1 -2 -3 -4\n-6', expectedOutput: '[1, 3]' }
        ]
    },
    {
        id: 'arr-2',
        title: 'Maximum Subarray',
        description: 'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum. Return the sum.',
        difficulty: 'medium',
        category: 'arrays',
        timeEstimate: 15,
        companies: ['Amazon', 'Microsoft', 'Apple'],
        hints: [
            'Kadane\'s algorithm is optimal for this',
            'Track current sum and max sum as you iterate',
            'Reset current sum to 0 if it goes negative'
        ],
        starterCode: `def max_subarray(nums):
    # Return the maximum subarray sum
    pass

# Test
print(max_subarray([-2,1,-3,4,-1,2,1,-5,4]))  # Expected: 6`,
        testCases: [
            { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
            { input: '1', expectedOutput: '1' },
            { input: '5 4 -1 7 8', expectedOutput: '23' },
            { input: '-1 -2 -3', expectedOutput: '-1' },
            { input: '1 2 3 4 5', expectedOutput: '15' }
        ]
    },
    {
        id: 'arr-3',
        title: 'Rotate Array',
        description: 'Given an integer array `nums`, rotate the array to the right by `k` steps. Print the rotated array.',
        difficulty: 'easy',
        category: 'arrays',
        timeEstimate: 10,
        companies: ['Microsoft', 'Amazon'],
        hints: [
            'Think about what happens when k >= length of array',
            'Slicing the array can make this simple',
            'nums[-k:] + nums[:-k] works in Python'
        ],
        starterCode: `def rotate_array(nums, k):
    # Rotate array to the right by k steps
    pass

# Test
print(rotate_array([1,2,3,4,5,6,7], 3))  # Expected: [5,6,7,1,2,3,4]`,
        testCases: [
            { input: '1 2 3 4 5 6 7\n3', expectedOutput: '[5, 6, 7, 1, 2, 3, 4]' },
            { input: '-1 -100 3 99\n2', expectedOutput: '[3, 99, -1, -100]' },
            { input: '1 2 3\n1', expectedOutput: '[3, 1, 2]' },
            { input: '1 2\n3', expectedOutput: '[2, 1]' },
            { input: '1\n0', expectedOutput: '[1]' }
        ]
    },
    {
        id: 'arr-4',
        title: 'Merge Sorted Arrays',
        description: 'Given two sorted arrays `nums1` and `nums2`, merge them into a single sorted array. Return the merged array.',
        difficulty: 'easy',
        category: 'arrays',
        timeEstimate: 10,
        companies: ['Meta', 'Microsoft'],
        hints: [
            'Use two pointers, one for each array',
            'Compare elements and add the smaller one',
            'Don\'t forget to add remaining elements'
        ],
        starterCode: `def merge_sorted(nums1, nums2):
    # Merge two sorted arrays
    pass

# Test
print(merge_sorted([1,3,5], [2,4,6]))  # Expected: [1,2,3,4,5,6]`,
        testCases: [
            { input: '1 3 5\n2 4 6', expectedOutput: '[1, 2, 3, 4, 5, 6]' },
            { input: '1\n2', expectedOutput: '[1, 2]' },
            { input: '1 2 3\n4 5 6', expectedOutput: '[1, 2, 3, 4, 5, 6]' },
            { input: '2 4 6\n1 3 5 7', expectedOutput: '[1, 2, 3, 4, 5, 6, 7]' },
            { input: '\n1 2 3', expectedOutput: '[1, 2, 3]' }
        ]
    },
    {
        id: 'arr-5',
        title: 'Product of Array Except Self',
        description: 'Given an integer array `nums`, return an array `output` such that `output[i]` is the product of all elements except `nums[i]`. Do NOT use division.',
        difficulty: 'medium',
        category: 'arrays',
        timeEstimate: 15,
        companies: ['Amazon', 'Apple', 'Meta'],
        hints: [
            'Build prefix products from left',
            'Build suffix products from right',
            'Multiply prefix[i] * suffix[i] for result[i]'
        ],
        starterCode: `def product_except_self(nums):
    # Return array of products except self (no division)
    pass

# Test
print(product_except_self([1, 2, 3, 4]))  # Expected: [24, 12, 8, 6]`,
        testCases: [
            { input: '1 2 3 4', expectedOutput: '[24, 12, 8, 6]' },
            { input: '-1 1 0 -3 3', expectedOutput: '[0, 0, 9, 0, 0]' },
            { input: '2 3', expectedOutput: '[3, 2]' },
            { input: '1 1 1 1', expectedOutput: '[1, 1, 1, 1]' },
            { input: '5 2 4', expectedOutput: '[8, 20, 10]' }
        ]
    },
    {
        id: 'arr-6',
        title: 'Container With Most Water',
        description: 'Given `n` non-negative integers `height` where each represents a vertical line, find two lines that together with the x-axis form a container that holds the most water. Return the maximum area.',
        difficulty: 'hard',
        category: 'arrays',
        timeEstimate: 20,
        companies: ['Google', 'Amazon', 'Goldman Sachs'],
        hints: [
            'Use two pointers starting from both ends',
            'Area = min(height[left], height[right]) * (right - left)',
            'Move the pointer with the shorter height inward'
        ],
        starterCode: `def max_area(height):
    # Return max water area between two lines
    pass

# Test
print(max_area([1,8,6,2,5,4,8,3,7]))  # Expected: 49`,
        testCases: [
            { input: '1 8 6 2 5 4 8 3 7', expectedOutput: '49' },
            { input: '1 1', expectedOutput: '1' },
            { input: '4 3 2 1 4', expectedOutput: '16' },
            { input: '1 2 1', expectedOutput: '2' },
            { input: '2 3 10 5 7 8 9', expectedOutput: '36' }
        ]
    },

    // ═══════════════════════════════════════
    // 🔤 STRINGS (5 problems)
    // ═══════════════════════════════════════
    {
        id: 'str-1',
        title: 'Valid Anagram',
        description: 'Given two strings `s` and `t`, return True if `t` is an anagram of `s`, and False otherwise.',
        difficulty: 'easy',
        category: 'strings',
        timeEstimate: 8,
        companies: ['Amazon', 'Bloomberg'],
        hints: [
            'Count character frequencies in both strings',
            'Alternatively, sort both strings and compare',
            'Python: Counter(s) == Counter(t)'
        ],
        starterCode: `def is_anagram(s, t):
    # Return True if t is anagram of s
    pass

# Test
print(is_anagram("anagram", "nagaram"))  # Expected: True`,
        testCases: [
            { input: 'anagram\nnagaram', expectedOutput: 'True' },
            { input: 'rat\ncar', expectedOutput: 'False' },
            { input: 'listen\nsilent', expectedOutput: 'True' },
            { input: 'hello\nworld', expectedOutput: 'False' },
            { input: 'a\na', expectedOutput: 'True' }
        ]
    },
    {
        id: 'str-2',
        title: 'Longest Substring Without Repeating',
        description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
        difficulty: 'medium',
        category: 'strings',
        timeEstimate: 15,
        companies: ['Amazon', 'Google', 'Meta', 'Microsoft'],
        hints: [
            'Use a sliding window approach',
            'Track characters in a set',
            'When a repeat is found, shrink the window from the left'
        ],
        starterCode: `def length_longest_substring(s):
    # Return length of longest substring without repeats
    pass

# Test
print(length_longest_substring("abcabcbb"))  # Expected: 3`,
        testCases: [
            { input: 'abcabcbb', expectedOutput: '3' },
            { input: 'bbbbb', expectedOutput: '1' },
            { input: 'pwwkew', expectedOutput: '3' },
            { input: '', expectedOutput: '0' },
            { input: 'abcdef', expectedOutput: '6' }
        ]
    },
    {
        id: 'str-3',
        title: 'Valid Parentheses',
        description: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. Return True or False.',
        difficulty: 'easy',
        category: 'strings',
        timeEstimate: 10,
        companies: ['Amazon', 'Google', 'Meta'],
        hints: [
            'Use a stack data structure',
            'Push opening brackets, pop for closing',
            'Check if popped bracket matches the closing bracket'
        ],
        starterCode: `def is_valid(s):
    # Return True if brackets are valid
    pass

# Test
print(is_valid("()[]{}"))  # Expected: True`,
        testCases: [
            { input: '()[]{}', expectedOutput: 'True' },
            { input: '(]', expectedOutput: 'False' },
            { input: '([)]', expectedOutput: 'False' },
            { input: '{[]}', expectedOutput: 'True' },
            { input: '((()))', expectedOutput: 'True' }
        ]
    },
    {
        id: 'str-4',
        title: 'Group Anagrams',
        description: 'Given an array of strings `strs`, group the anagrams together. Return the groups.',
        difficulty: 'medium',
        category: 'strings',
        timeEstimate: 15,
        companies: ['Amazon', 'Meta', 'Uber'],
        hints: [
            'Sorted version of an anagram is the same',
            'Use sorted string as dictionary key',
            'Group all strings with the same sorted form'
        ],
        starterCode: `def group_anagrams(strs):
    # Group anagrams together
    pass

# Test  
print(group_anagrams(["eat","tea","tan","ate","nat","bat"]))`,
        testCases: [
            { input: 'eat tea tan ate nat bat', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
            { input: '', expectedOutput: '[[""]]' },
            { input: 'a', expectedOutput: '[["a"]]' },
            { input: 'abc bca cab xyz', expectedOutput: '[["abc","bca","cab"],["xyz"]]' },
            { input: 'listen silent hello', expectedOutput: '[["listen","silent"],["hello"]]' }
        ]
    },
    {
        id: 'str-5',
        title: 'Longest Palindromic Substring',
        description: 'Given a string `s`, return the longest palindromic substring in `s`.',
        difficulty: 'hard',
        category: 'strings',
        timeEstimate: 20,
        companies: ['Amazon', 'Microsoft', 'Goldman Sachs'],
        hints: [
            'Expand around center approach works well',
            'Try each character (and between characters) as center',
            'Expand outward while characters match'
        ],
        starterCode: `def longest_palindrome(s):
    # Return the longest palindromic substring
    pass

# Test
print(longest_palindrome("babad"))  # Expected: "bab" or "aba"`,
        testCases: [
            { input: 'babad', expectedOutput: 'bab' },
            { input: 'cbbd', expectedOutput: 'bb' },
            { input: 'a', expectedOutput: 'a' },
            { input: 'racecar', expectedOutput: 'racecar' },
            { input: 'abcd', expectedOutput: 'a' }
        ]
    },

    // ═══════════════════════════════════════
    // 🔗 LINKED LISTS (5 problems)
    // ═══════════════════════════════════════
    {
        id: 'll-1',
        title: 'Reverse Linked List',
        description: 'Given a linked list as a space-separated string, reverse it and print the result. Input: "1 2 3 4 5", Output: "5 4 3 2 1".',
        difficulty: 'easy',
        category: 'linked_lists',
        timeEstimate: 10,
        companies: ['Amazon', 'Microsoft', 'Apple'],
        hints: [
            'Use three pointers: prev, curr, next',
            'Or simply reverse the list/string',
            'Iterative approach: flip each pointer direction'
        ],
        starterCode: `def reverse_list(nums):
    # Reverse the list
    return nums[::-1]

# Test
data = list(map(int, input().split()))
print(' '.join(map(str, reverse_list(data))))`,
        testCases: [
            { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1' },
            { input: '1 2', expectedOutput: '2 1' },
            { input: '1', expectedOutput: '1' },
            { input: '10 20 30', expectedOutput: '30 20 10' },
            { input: '5 4 3 2 1', expectedOutput: '1 2 3 4 5' }
        ]
    },
    {
        id: 'll-2',
        title: 'Detect Cycle in List',
        description: 'Given a list of numbers, determine if there is a duplicate (representing a cycle). Print True if duplicate exists, False otherwise.',
        difficulty: 'medium',
        category: 'linked_lists',
        timeEstimate: 12,
        companies: ['Amazon', 'Microsoft'],
        hints: [
            'Use a set to track seen elements',
            'Floyd\'s cycle detection: slow and fast pointer',
            'If any element is seen twice, there\'s a cycle'
        ],
        starterCode: `def has_cycle(nums):
    # Return True if list has duplicates (cycle)
    pass

# Test
data = list(map(int, input().split()))
print(has_cycle(data))`,
        testCases: [
            { input: '1 2 3 4 2', expectedOutput: 'True' },
            { input: '1 2 3 4 5', expectedOutput: 'False' },
            { input: '1 1', expectedOutput: 'True' },
            { input: '1', expectedOutput: 'False' },
            { input: '3 1 4 1 5', expectedOutput: 'True' }
        ]
    },
    {
        id: 'll-3',
        title: 'Merge Two Sorted Lists',
        description: 'Given two sorted lists, merge them into one sorted list.',
        difficulty: 'easy',
        category: 'linked_lists',
        timeEstimate: 10,
        companies: ['Amazon', 'Google', 'Apple'],
        hints: [
            'Compare heads of both lists',
            'Add the smaller one to result',
            'Continue until one list is empty'
        ],
        starterCode: `def merge_lists(l1, l2):
    # Merge two sorted lists
    pass

# Test
l1 = list(map(int, input().split()))
l2 = list(map(int, input().split()))
print(merge_lists(l1, l2))`,
        testCases: [
            { input: '1 2 4\n1 3 4', expectedOutput: '[1, 1, 2, 3, 4, 4]' },
            { input: '\n0', expectedOutput: '[0]' },
            { input: '1 3 5\n2 4 6', expectedOutput: '[1, 2, 3, 4, 5, 6]' },
            { input: '1\n2', expectedOutput: '[1, 2]' },
            { input: '5 10 15\n1 2 3', expectedOutput: '[1, 2, 3, 5, 10, 15]' }
        ]
    },
    {
        id: 'll-4',
        title: 'Remove Nth Node From End',
        description: 'Given a list and integer n, remove the nth element from the end and print the result.',
        difficulty: 'medium',
        category: 'linked_lists',
        timeEstimate: 12,
        companies: ['Meta', 'Amazon'],
        hints: [
            'Use two pointers with a gap of n',
            'When fast pointer reaches end, slow is at the target',
            'Handle edge case: removing the first element'
        ],
        starterCode: `def remove_nth_end(nums, n):
    # Remove nth from end
    pass

# Test
data = list(map(int, input().split()))
n = int(input())
print(remove_nth_end(data, n))`,
        testCases: [
            { input: '1 2 3 4 5\n2', expectedOutput: '[1, 2, 3, 5]' },
            { input: '1\n1', expectedOutput: '[]' },
            { input: '1 2\n1', expectedOutput: '[1]' },
            { input: '1 2\n2', expectedOutput: '[2]' },
            { input: '1 2 3 4 5\n5', expectedOutput: '[2, 3, 4, 5]' }
        ]
    },
    {
        id: 'll-5',
        title: 'Find Middle of List',
        description: 'Given a list, find and print the middle element. If even length, print the second middle.',
        difficulty: 'easy',
        category: 'linked_lists',
        timeEstimate: 8,
        companies: ['Amazon', 'Microsoft'],
        hints: [
            'Use slow and fast pointer',
            'Fast moves 2 steps, slow moves 1',
            'When fast reaches end, slow is at middle'
        ],
        starterCode: `def find_middle(nums):
    # Find middle element
    pass

# Test
data = list(map(int, input().split()))
print(find_middle(data))`,
        testCases: [
            { input: '1 2 3 4 5', expectedOutput: '3' },
            { input: '1 2 3 4 5 6', expectedOutput: '4' },
            { input: '1', expectedOutput: '1' },
            { input: '1 2', expectedOutput: '2' },
            { input: '10 20 30 40 50', expectedOutput: '30' }
        ]
    },

    // ═══════════════════════════════════════
    // 🌳 TREES (5 problems)
    // ═══════════════════════════════════════
    {
        id: 'tree-1',
        title: 'Maximum Depth of Binary Tree',
        description: 'Given a binary tree as level-order list (null for missing nodes), find the maximum depth.',
        difficulty: 'easy',
        category: 'trees',
        timeEstimate: 10,
        companies: ['Amazon', 'Google', 'Meta'],
        hints: [
            'Use recursion: depth = 1 + max(left_depth, right_depth)',
            'Base case: empty tree has depth 0',
            'BFS can also work: count levels'
        ],
        starterCode: `def max_depth(tree):
    # Find max depth from level-order list
    if not tree or tree[0] == 'null':
        return 0
    depth = 0
    level_size = 1
    i = 0
    while i < len(tree):
        depth += 1
        next_size = 0
        for j in range(level_size):
            if i + j < len(tree) and tree[i + j] != 'null':
                next_size += 2
        i += level_size
        level_size = next_size
        if level_size == 0:
            break
    return depth

# Test
data = input().split()
print(max_depth(data))`,
        testCases: [
            { input: '3 9 20 null null 15 7', expectedOutput: '3' },
            { input: '1 null 2', expectedOutput: '2' },
            { input: '1', expectedOutput: '1' },
            { input: '1 2 3 4 5', expectedOutput: '3' },
            { input: '1 2 null 3 null null null 4', expectedOutput: '4' }
        ]
    },
    {
        id: 'tree-2',
        title: 'Inorder Traversal',
        description: 'Given a binary tree as level-order list, print its inorder traversal (Left, Root, Right).',
        difficulty: 'easy',
        category: 'trees',
        timeEstimate: 10,
        companies: ['Microsoft', 'Amazon'],
        hints: [
            'Recursion: inorder(left), visit root, inorder(right)',
            'Left child of node i is at 2i+1, right at 2i+2',
            'Use a stack for iterative approach'
        ],
        starterCode: `def inorder(tree, i=0):
    # Inorder traversal from level-order list
    if i >= len(tree) or tree[i] == 'null':
        return []
    left = inorder(tree, 2*i+1)
    right = inorder(tree, 2*i+2)
    return left + [tree[i]] + right

# Test
data = input().split()
print(' '.join(inorder(data)))`,
        testCases: [
            { input: '1 2 3', expectedOutput: '2 1 3' },
            { input: '1 null 2 null null 3', expectedOutput: '1 3 2' },
            { input: '4 2 6 1 3 5 7', expectedOutput: '1 2 3 4 5 6 7' },
            { input: '1', expectedOutput: '1' },
            { input: '5 3 7 1 4', expectedOutput: '1 3 4 5 7' }
        ]
    },
    {
        id: 'tree-3',
        title: 'Symmetric Tree',
        description: 'Check if a binary tree (given as level-order list) is symmetric (mirror of itself). Print True or False.',
        difficulty: 'medium',
        category: 'trees',
        timeEstimate: 15,
        companies: ['Google', 'Amazon', 'Bloomberg'],
        hints: [
            'A tree is symmetric if left subtree mirrors right subtree',
            'Compare: left.left with right.right, left.right with right.left',
            'Use level-order and check each level is a palindrome'
        ],
        starterCode: `def is_symmetric(tree):
    # Check if tree is symmetric
    pass

# Test
data = input().split()
print(is_symmetric(data))`,
        testCases: [
            { input: '1 2 2 3 4 4 3', expectedOutput: 'True' },
            { input: '1 2 2 null 3 null 3', expectedOutput: 'False' },
            { input: '1', expectedOutput: 'True' },
            { input: '1 2 2', expectedOutput: 'True' },
            { input: '1 2 3', expectedOutput: 'False' }
        ]
    },
    {
        id: 'tree-4',
        title: 'Level Order Traversal',
        description: 'Given a binary tree as level-order list, print each level on a separate line.',
        difficulty: 'medium',
        category: 'trees',
        timeEstimate: 12,
        companies: ['Meta', 'Microsoft', 'Amazon'],
        hints: [
            'Use BFS with a queue',
            'Process one level at a time',
            'Track level size to know when a level ends'
        ],
        starterCode: `def level_order(tree):
    # Print each level
    pass

# Test
data = input().split()
level_order(data)`,
        testCases: [
            { input: '3 9 20 null null 15 7', expectedOutput: '3\n9 20\n15 7' },
            { input: '1', expectedOutput: '1' },
            { input: '1 2 3 4 5', expectedOutput: '1\n2 3\n4 5' },
            { input: '1 2 3', expectedOutput: '1\n2 3' },
            { input: '1 null 2 null null null 3', expectedOutput: '1\n2\n3' }
        ]
    },
    {
        id: 'tree-5',
        title: 'Validate BST',
        description: 'Check if a binary tree (level-order list) is a valid Binary Search Tree. Print True or False.',
        difficulty: 'hard',
        category: 'trees',
        timeEstimate: 20,
        companies: ['Google', 'Amazon', 'Meta'],
        hints: [
            'Each node must be within a valid range (min, max)',
            'Left child must be < parent, right must be > parent',
            'Inorder traversal of BST should be sorted'
        ],
        starterCode: `def is_valid_bst(tree):
    # Check if valid BST
    pass

# Test
data = input().split()
print(is_valid_bst(data))`,
        testCases: [
            { input: '2 1 3', expectedOutput: 'True' },
            { input: '5 1 4 null null 3 6', expectedOutput: 'False' },
            { input: '1', expectedOutput: 'True' },
            { input: '5 3 7 1 4 6 8', expectedOutput: 'True' },
            { input: '10 5 15 null null 6 20', expectedOutput: 'False' }
        ]
    },

    // ═══════════════════════════════════════
    // 🕸️ GRAPHS (5 problems)
    // ═══════════════════════════════════════
    {
        id: 'graph-1',
        title: 'Number of Islands',
        description: 'Given a 2D grid of "1"s (land) and "0"s (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.',
        difficulty: 'medium',
        category: 'graphs',
        timeEstimate: 15,
        companies: ['Amazon', 'Google', 'Meta', 'Microsoft'],
        hints: [
            'Use BFS or DFS to explore each island',
            'When you find a "1", increment count and mark all connected "1"s as visited',
            'Check all 4 directions: up, down, left, right'
        ],
        starterCode: `def num_islands(grid):
    # Count number of islands
    pass

# Test
rows = int(input())
grid = []
for _ in range(rows):
    grid.append(input().split())
print(num_islands(grid))`,
        testCases: [
            { input: '4\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', expectedOutput: '1' },
            { input: '4\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', expectedOutput: '3' },
            { input: '1\n0 0 0', expectedOutput: '0' },
            { input: '1\n1', expectedOutput: '1' },
            { input: '3\n1 0 1\n0 1 0\n1 0 1', expectedOutput: '5' }
        ]
    },
    {
        id: 'graph-2',
        title: 'BFS Shortest Path',
        description: 'Given number of nodes n, edges as pairs, and start/end nodes, find the shortest path length using BFS. Print -1 if no path exists.',
        difficulty: 'medium',
        category: 'graphs',
        timeEstimate: 15,
        companies: ['Google', 'Meta', 'Uber'],
        hints: [
            'Build adjacency list from edges',
            'Use BFS from start node',
            'Track distance with level counting'
        ],
        starterCode: `from collections import deque

def shortest_path(n, edges, start, end):
    # Find shortest path using BFS
    pass

# Test
n = int(input())
m = int(input())
edges = []
for _ in range(m):
    u, v = map(int, input().split())
    edges.append((u, v))
start, end = map(int, input().split())
print(shortest_path(n, edges, start, end))`,
        testCases: [
            { input: '5\n4\n0 1\n1 2\n2 3\n3 4\n0 4', expectedOutput: '4' },
            { input: '4\n3\n0 1\n1 2\n0 3\n0 2', expectedOutput: '2' },
            { input: '3\n1\n0 1\n0 2', expectedOutput: '-1' },
            { input: '2\n1\n0 1\n0 1', expectedOutput: '1' },
            { input: '6\n5\n0 1\n1 3\n0 2\n2 4\n4 5\n0 5', expectedOutput: '3' }
        ]
    },
    {
        id: 'graph-3',
        title: 'Detect Cycle in Graph',
        description: 'Given a directed graph with n nodes and edges, determine if the graph contains a cycle. Print True or False.',
        difficulty: 'medium',
        category: 'graphs',
        timeEstimate: 15,
        companies: ['Amazon', 'Microsoft', 'Google'],
        hints: [
            'Use DFS with three states: unvisited, in-progress, visited',
            'If you revisit an in-progress node, there is a cycle',
            'Topological sort also detects cycles'
        ],
        starterCode: `def has_cycle(n, edges):
    # Detect cycle in directed graph
    pass

# Test
n = int(input())
m = int(input())
edges = []
for _ in range(m):
    u, v = map(int, input().split())
    edges.append((u, v))
print(has_cycle(n, edges))`,
        testCases: [
            { input: '4\n4\n0 1\n1 2\n2 3\n3 1', expectedOutput: 'True' },
            { input: '3\n2\n0 1\n1 2', expectedOutput: 'False' },
            { input: '2\n2\n0 1\n1 0', expectedOutput: 'True' },
            { input: '4\n3\n0 1\n0 2\n0 3', expectedOutput: 'False' },
            { input: '3\n3\n0 1\n1 2\n2 0', expectedOutput: 'True' }
        ]
    },
    {
        id: 'graph-4',
        title: 'Topological Sort',
        description: 'Given a DAG with n nodes and edges, print one valid topological ordering.',
        difficulty: 'hard',
        category: 'graphs',
        timeEstimate: 20,
        companies: ['Google', 'Amazon', 'Uber'],
        hints: [
            'Use Kahn\'s algorithm (BFS with in-degree)',
            'Start with nodes that have in-degree 0',
            'Remove edges and add new 0-degree nodes to queue'
        ],
        starterCode: `from collections import deque

def topological_sort(n, edges):
    # Return topological ordering
    pass

# Test
n = int(input())
m = int(input())
edges = []
for _ in range(m):
    u, v = map(int, input().split())
    edges.append((u, v))
print(' '.join(map(str, topological_sort(n, edges))))`,
        testCases: [
            { input: '4\n4\n0 1\n0 2\n1 3\n2 3', expectedOutput: '0 1 2 3' },
            { input: '3\n2\n0 1\n1 2', expectedOutput: '0 1 2' },
            { input: '2\n1\n1 0', expectedOutput: '1 0' },
            { input: '4\n3\n3 0\n3 1\n0 2', expectedOutput: '3 0 1 2' },
            { input: '1\n0', expectedOutput: '0' }
        ]
    },
    {
        id: 'graph-5',
        title: 'Clone Graph (Adjacency)',
        description: 'Given an adjacency list representation, create a deep copy. Print the adjacency list of the cloned graph.',
        difficulty: 'medium',
        category: 'graphs',
        timeEstimate: 15,
        companies: ['Meta', 'Google', 'Amazon'],
        hints: [
            'Use BFS/DFS with a hashmap to track cloned nodes',
            'For each node, create a copy and copy its neighbors',
            'The hashmap prevents infinite loops'
        ],
        starterCode: `def clone_graph(adj):
    # Deep copy adjacency list
    return [list(neighbors) for neighbors in adj]

# Test
n = int(input())
adj = []
for i in range(n):
    neighbors = list(map(int, input().split())) if True else []
    adj.append(neighbors)
cloned = clone_graph(adj)
for i, neighbors in enumerate(cloned):
    print(f"{i}: {neighbors}")`,
        testCases: [
            { input: '4\n1 2\n0 3\n0 3\n1 2', expectedOutput: '0: [1, 2]\n1: [0, 3]\n2: [0, 3]\n3: [1, 2]' },
            { input: '1\n', expectedOutput: '0: []' },
            { input: '2\n1\n0', expectedOutput: '0: [1]\n1: [0]' },
            { input: '3\n1\n0 2\n1', expectedOutput: '0: [1]\n1: [0, 2]\n2: [1]' },
            { input: '3\n1 2\n0 2\n0 1', expectedOutput: '0: [1, 2]\n1: [0, 2]\n2: [0, 1]' }
        ]
    },

    // ═══════════════════════════════════════
    // 🧮 DYNAMIC PROGRAMMING (5 problems)
    // ═══════════════════════════════════════
    {
        id: 'dp-1',
        title: 'Climbing Stairs',
        description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        difficulty: 'easy',
        category: 'dynamic_programming',
        timeEstimate: 8,
        companies: ['Amazon', 'Google', 'Apple'],
        hints: [
            'This is essentially Fibonacci',
            'dp[i] = dp[i-1] + dp[i-2]',
            'Base cases: dp[1] = 1, dp[2] = 2'
        ],
        starterCode: `def climb_stairs(n):
    # Return number of distinct ways
    pass

# Test
n = int(input())
print(climb_stairs(n))`,
        testCases: [
            { input: '2', expectedOutput: '2' },
            { input: '3', expectedOutput: '3' },
            { input: '5', expectedOutput: '8' },
            { input: '1', expectedOutput: '1' },
            { input: '10', expectedOutput: '89' }
        ]
    },
    {
        id: 'dp-2',
        title: 'Coin Change',
        description: 'Given an amount and coin denominations, return the fewest number of coins needed to make the amount. Return -1 if not possible.',
        difficulty: 'medium',
        category: 'dynamic_programming',
        timeEstimate: 15,
        companies: ['Amazon', 'Google', 'Goldman Sachs'],
        hints: [
            'Use bottom-up DP: dp[i] = min coins for amount i',
            'For each amount, try each coin',
            'dp[i] = min(dp[i], dp[i - coin] + 1)'
        ],
        starterCode: `def coin_change(coins, amount):
    # Return min coins needed
    pass

# Test
coins = list(map(int, input().split()))
amount = int(input())
print(coin_change(coins, amount))`,
        testCases: [
            { input: '1 5 10 25\n30', expectedOutput: '2' },
            { input: '2\n3', expectedOutput: '-1' },
            { input: '1\n0', expectedOutput: '0' },
            { input: '1 2 5\n11', expectedOutput: '3' },
            { input: '1 3 4\n6', expectedOutput: '2' }
        ]
    },
    {
        id: 'dp-3',
        title: 'Longest Increasing Subsequence',
        description: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.',
        difficulty: 'medium',
        category: 'dynamic_programming',
        timeEstimate: 15,
        companies: ['Amazon', 'Microsoft', 'Google'],
        hints: [
            'dp[i] = length of LIS ending at index i',
            'For each i, check all j < i where nums[j] < nums[i]',
            'dp[i] = max(dp[j] + 1) for all valid j'
        ],
        starterCode: `def length_lis(nums):
    # Return length of LIS
    pass

# Test
nums = list(map(int, input().split()))
print(length_lis(nums))`,
        testCases: [
            { input: '10 9 2 5 3 7 101 18', expectedOutput: '4' },
            { input: '0 1 0 3 2 3', expectedOutput: '4' },
            { input: '7 7 7 7 7', expectedOutput: '1' },
            { input: '1 2 3 4 5', expectedOutput: '5' },
            { input: '5 4 3 2 1', expectedOutput: '1' }
        ]
    },
    {
        id: 'dp-4',
        title: '0/1 Knapsack',
        description: 'Given weights and values of n items, and a capacity W, find the maximum value that can fit in the knapsack.',
        difficulty: 'hard',
        category: 'dynamic_programming',
        timeEstimate: 20,
        companies: ['Amazon', 'Google', 'Goldman Sachs'],
        hints: [
            'Classic DP: dp[i][w] = max value with first i items and capacity w',
            'For each item: include or exclude',
            'dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])'
        ],
        starterCode: `def knapsack(weights, values, capacity):
    # Return max value
    pass

# Test
n = int(input())
weights = list(map(int, input().split()))
values = list(map(int, input().split()))
capacity = int(input())
print(knapsack(weights, values, capacity))`,
        testCases: [
            { input: '3\n1 2 3\n6 10 12\n5', expectedOutput: '22' },
            { input: '4\n2 3 4 5\n3 4 5 6\n8', expectedOutput: '13' },
            { input: '1\n5\n10\n4', expectedOutput: '0' },
            { input: '2\n1 1\n1 1\n2', expectedOutput: '2' },
            { input: '3\n10 20 30\n60 100 120\n50', expectedOutput: '220' }
        ]
    },
    {
        id: 'dp-5',
        title: 'Edit Distance',
        description: 'Given two strings word1 and word2, return the minimum number of operations (insert, delete, replace) required to convert word1 to word2.',
        difficulty: 'hard',
        category: 'dynamic_programming',
        timeEstimate: 20,
        companies: ['Google', 'Amazon', 'Microsoft'],
        hints: [
            'Classic DP: dp[i][j] = edit distance for word1[:i] and word2[:j]',
            'If chars match, dp[i][j] = dp[i-1][j-1]',
            'If not, take min of insert, delete, replace + 1'
        ],
        starterCode: `def edit_distance(word1, word2):
    # Return min edit distance
    pass

# Test
word1 = input()
word2 = input()
print(edit_distance(word1, word2))`,
        testCases: [
            { input: 'horse\nros', expectedOutput: '3' },
            { input: 'intention\nexecution', expectedOutput: '5' },
            { input: 'abc\nabc', expectedOutput: '0' },
            { input: '\nabc', expectedOutput: '3' },
            { input: 'kitten\nsitting', expectedOutput: '3' }
        ]
    }
];

// Helper to get problems by criteria
const getProblems = (mode, count = 5) => {
    let pool;
    if (mode === 'easy') pool = interviewProblems.filter(p => p.difficulty === 'easy');
    else if (mode === 'medium') pool = interviewProblems.filter(p => p.difficulty === 'medium');
    else if (mode === 'hard') pool = interviewProblems.filter(p => p.difficulty === 'hard');
    else pool = [...interviewProblems]; // mixed

    // Shuffle and pick
    const shuffled = pool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

const getProblemById = (id) => interviewProblems.find(p => p.id === id);

const getCategories = () => {
    const cats = {};
    interviewProblems.forEach(p => {
        if (!cats[p.category]) cats[p.category] = { easy: 0, medium: 0, hard: 0 };
        cats[p.category][p.difficulty]++;
    });
    return cats;
};

module.exports = { interviewProblems, getProblems, getProblemById, getCategories };
