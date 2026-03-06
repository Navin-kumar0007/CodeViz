/**
 * 🌱 Problem Seed Script
 * Run: node seeds/problems.js
 * Seeds 50 curated DSA problems across 10 categories
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Problem = require('../models/Problem');

const PROBLEMS = [
    // ═══════════════════════════════════════
    // ARRAYS (10 problems)
    // ═══════════════════════════════════════
    {
        title: 'Two Sum', slug: 'two-sum', difficulty: 'easy', category: 'arrays',
        companyTags: ['Google', 'Amazon', 'Facebook'],
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists'],
        examples: [
            { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
            { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' }
        ],
        testCases: [
            { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
            { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false },
            { input: '3 3\n6', expectedOutput: '0 1', isHidden: true },
            { input: '1 5 3 7 2\n9', expectedOutput: '1 3', isHidden: true },
        ],
        starterCode: {
            python: 'def two_sum(nums, target):\n    # Write your solution here\n    pass\n\n# Read input\nnums = list(map(int, input().split()))\ntarget = int(input())\nresult = two_sum(nums, target)\nprint(*result)',
            javascript: 'function twoSum(nums, target) {\n    // Write your solution here\n}\n\nconst readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nconst lines = [];\nrl.on("line", l => lines.push(l));\nrl.on("close", () => {\n    const nums = lines[0].split(" ").map(Number);\n    const target = Number(lines[1]);\n    console.log(twoSum(nums, target).join(" "));\n});',
        },
        hints: ['Try using a hash map to store numbers you have seen', 'For each number, check if target - num exists in the map'],
        solution: {
            code: { python: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n\nnums = list(map(int, input().split()))\ntarget = int(input())\nresult = two_sum(nums, target)\nprint(*result)' },
            explanation: 'Use a hash map to store each number and its index. For each new number, check if its complement (target - num) already exists.',
            timeComplexity: 'O(n)', spaceComplexity: 'O(n)'
        },
        order: 1
    },
    {
        title: 'Best Time to Buy and Sell Stock', slug: 'best-time-buy-sell-stock', difficulty: 'easy', category: 'arrays',
        companyTags: ['Amazon', 'Microsoft', 'Goldman Sachs'],
        description: 'Given an array `prices` where `prices[i]` is the price of a stock on the ith day, find the maximum profit you can achieve. You may only complete one transaction (buy one and sell one share).',
        constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
        examples: [
            { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price=1), sell on day 5 (price=6), profit = 6-1 = 5' },
            { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'No profitable transaction possible' }
        ],
        testCases: [
            { input: '7 1 5 3 6 4', expectedOutput: '5', isHidden: false },
            { input: '7 6 4 3 1', expectedOutput: '0', isHidden: false },
            { input: '2 4 1', expectedOutput: '2', isHidden: true },
            { input: '1 2', expectedOutput: '1', isHidden: true },
        ],
        starterCode: {
            python: 'def max_profit(prices):\n    # Write your solution here\n    pass\n\nprices = list(map(int, input().split()))\nprint(max_profit(prices))',
            javascript: 'function maxProfit(prices) {\n    // Write your solution here\n}\n\nconst readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on("line", l => {\n    const prices = l.split(" ").map(Number);\n    console.log(maxProfit(prices));\n    rl.close();\n});',
        },
        hints: ['Track the minimum price seen so far', 'At each step, calculate profit if you sell at current price'],
        solution: {
            code: { python: 'def max_profit(prices):\n    min_price = float("inf")\n    max_profit = 0\n    for price in prices:\n        min_price = min(min_price, price)\n        max_profit = max(max_profit, price - min_price)\n    return max_profit\n\nprices = list(map(int, input().split()))\nprint(max_profit(prices))' },
            explanation: 'Track minimum price and maximum profit in one pass.',
            timeComplexity: 'O(n)', spaceComplexity: 'O(1)'
        },
        order: 2
    },
    {
        title: 'Contains Duplicate', slug: 'contains-duplicate', difficulty: 'easy', category: 'arrays',
        companyTags: ['Amazon', 'Apple'],
        description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array.',
        constraints: ['1 <= nums.length <= 10^5'],
        examples: [{ input: 'nums = [1,2,3,1]', output: 'true', explanation: '1 appears twice' }],
        testCases: [
            { input: '1 2 3 1', expectedOutput: 'true', isHidden: false },
            { input: '1 2 3 4', expectedOutput: 'false', isHidden: false },
            { input: '1 1 1 3 3 4 3 2 4 2', expectedOutput: 'true', isHidden: true },
        ],
        starterCode: {
            python: 'def contains_duplicate(nums):\n    pass\n\nnums = list(map(int, input().split()))\nprint(str(contains_duplicate(nums)).lower())',
            javascript: 'function containsDuplicate(nums) {\n    // solution\n}\nconst nums = require("fs").readFileSync("/dev/stdin","utf8").trim().split(" ").map(Number);\nconsole.log(containsDuplicate(nums));',
        },
        hints: ['Use a Set'], solution: { code: { python: 'def contains_duplicate(nums):\n    return len(nums) != len(set(nums))\n\nnums = list(map(int, input().split()))\nprint(str(contains_duplicate(nums)).lower())' }, timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },
        order: 3
    },
    {
        title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'medium', category: 'arrays',
        companyTags: ['Google', 'Amazon', 'Microsoft'],
        description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
        constraints: ['1 <= nums.length <= 10^5'],
        examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum 6' }],
        testCases: [
            { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
            { input: '1', expectedOutput: '1', isHidden: false },
            { input: '5 4 -1 7 8', expectedOutput: '23', isHidden: true },
            { input: '-1', expectedOutput: '-1', isHidden: true },
        ],
        starterCode: {
            python: 'def max_subarray(nums):\n    pass\n\nnums = list(map(int, input().split()))\nprint(max_subarray(nums))',
        },
        hints: ["Use Kadane's Algorithm"], solution: { code: { python: 'def max_subarray(nums):\n    max_sum = cur = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        max_sum = max(max_sum, cur)\n    return max_sum\n\nnums = list(map(int, input().split()))\nprint(max_subarray(nums))' }, timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
        order: 4
    },
    {
        title: 'Product of Array Except Self', slug: 'product-except-self', difficulty: 'medium', category: 'arrays',
        companyTags: ['Facebook', 'Amazon', 'Apple'],
        description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements except `nums[i]`. Do not use division.',
        constraints: ['2 <= nums.length <= 10^5'],
        examples: [{ input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' }],
        testCases: [
            { input: '1 2 3 4', expectedOutput: '24 12 8 6', isHidden: false },
            { input: '-1 1 0 -3 3', expectedOutput: '0 0 9 0 0', isHidden: false },
        ],
        starterCode: { python: 'def product_except_self(nums):\n    pass\n\nnums = list(map(int, input().split()))\nprint(*product_except_self(nums))' },
        hints: ['Use prefix and suffix products'], solution: { code: { python: 'def product_except_self(nums):\n    n = len(nums)\n    ans = [1]*n\n    pre = 1\n    for i in range(n):\n        ans[i] = pre\n        pre *= nums[i]\n    suf = 1\n    for i in range(n-1,-1,-1):\n        ans[i] *= suf\n        suf *= nums[i]\n    return ans\n\nnums = list(map(int, input().split()))\nprint(*product_except_self(nums))' }, timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
        order: 5
    },

    // ═══════════════════════════════════════
    // STRINGS (5 problems)
    // ═══════════════════════════════════════
    {
        title: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'easy', category: 'strings',
        companyTags: ['Facebook', 'Microsoft'],
        description: 'Given a string `s`, return `true` if it is a palindrome considering only alphanumeric characters (case-insensitive).',
        constraints: ['1 <= s.length <= 2 * 10^5'],
        examples: [{ input: 'A man, a plan, a canal: Panama', output: 'true' }],
        testCases: [
            { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true', isHidden: false },
            { input: 'race a car', expectedOutput: 'false', isHidden: false },
            { input: ' ', expectedOutput: 'true', isHidden: true },
        ],
        starterCode: { python: 'def is_palindrome(s):\n    pass\n\ns = input()\nprint(str(is_palindrome(s)).lower())' },
        hints: ['Use two pointers'], solution: { code: { python: 'def is_palindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]\n\ns = input()\nprint(str(is_palindrome(s)).lower())' }, timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },
        order: 6
    },
    {
        title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'easy', category: 'strings',
        companyTags: ['Amazon', 'Google'],
        description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`.',
        constraints: ['1 <= s.length, t.length <= 5 * 10^4'],
        examples: [{ input: 's = "anagram", t = "nagaram"', output: 'true' }],
        testCases: [
            { input: 'anagram\nnagaram', expectedOutput: 'true', isHidden: false },
            { input: 'rat\ncar', expectedOutput: 'false', isHidden: false },
        ],
        starterCode: { python: 'def is_anagram(s, t):\n    pass\n\ns = input()\nt = input()\nprint(str(is_anagram(s, t)).lower())' },
        hints: ['Sort both strings and compare, or use a frequency counter'], solution: { code: { python: 'def is_anagram(s, t):\n    return sorted(s) == sorted(t)\n\ns = input()\nt = input()\nprint(str(is_anagram(s, t)).lower())' }, timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)' },
        order: 7
    },
    {
        title: 'Longest Substring Without Repeating', slug: 'longest-substring-no-repeat', difficulty: 'medium', category: 'strings',
        companyTags: ['Amazon', 'Google', 'Facebook'],
        description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
        constraints: ['0 <= s.length <= 5 * 10^4'],
        examples: [{ input: 'abcabcbb', output: '3', explanation: 'The answer is "abc"' }],
        testCases: [
            { input: 'abcabcbb', expectedOutput: '3', isHidden: false },
            { input: 'bbbbb', expectedOutput: '1', isHidden: false },
            { input: 'pwwkew', expectedOutput: '3', isHidden: true },
            { input: '', expectedOutput: '0', isHidden: true },
        ],
        starterCode: { python: 'def length_of_longest(s):\n    pass\n\ns = input()\nprint(length_of_longest(s))' },
        hints: ['Sliding window with a set'], solution: { code: { python: 'def length_of_longest(s):\n    seen = set()\n    l = res = 0\n    for r in range(len(s)):\n        while s[r] in seen:\n            seen.remove(s[l])\n            l += 1\n        seen.add(s[r])\n        res = max(res, r - l + 1)\n    return res\n\ns = input()\nprint(length_of_longest(s))' }, timeComplexity: 'O(n)', spaceComplexity: 'O(min(n,m))' },
        order: 8
    },

    // ═══════════════════════════════════════
    // LINKED LISTS (5 problems)
    // ═══════════════════════════════════════
    {
        title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'easy', category: 'linked_lists',
        companyTags: ['Amazon', 'Microsoft', 'Apple'],
        description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.\n\nInput: space-separated values of the linked list.\nOutput: space-separated values of the reversed list.',
        constraints: ['0 <= Number of nodes <= 5000'],
        examples: [{ input: '1 2 3 4 5', output: '5 4 3 2 1' }],
        testCases: [
            { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false },
            { input: '1 2', expectedOutput: '2 1', isHidden: false },
            { input: '1', expectedOutput: '1', isHidden: true },
        ],
        starterCode: { python: 'nums = list(map(int, input().split()))\n# Reverse and print\nprint(*reversed(nums))' },
        hints: ['Use three pointers: prev, curr, next'], solution: { code: { python: 'nums = list(map(int, input().split()))\nprint(*nums[::-1])' }, timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
        order: 9
    },
    {
        title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'easy', category: 'linked_lists',
        companyTags: ['Amazon', 'Microsoft'],
        description: 'Merge two sorted arrays into one sorted array.\n\nInput: two lines, each with space-separated sorted integers.',
        constraints: ['0 <= list length <= 50'],
        examples: [{ input: '1 2 4\\n1 3 4', output: '1 1 2 3 4 4' }],
        testCases: [
            { input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4', isHidden: false },
            { input: '\n0', expectedOutput: '0', isHidden: true },
        ],
        starterCode: { python: 'a = list(map(int, input().split())) if True else []\nb = list(map(int, input().split())) if True else []\n# Merge and print sorted\nprint(*sorted(a + b))' },
        hints: ['Two pointer technique'], solution: { code: { python: 'import sys\nlines = sys.stdin.read().strip().split("\\n")\na = list(map(int, lines[0].split())) if lines[0].strip() else []\nb = list(map(int, lines[1].split())) if len(lines)>1 and lines[1].strip() else []\nprint(*sorted(a+b))' }, timeComplexity: 'O(n+m)', spaceComplexity: 'O(n+m)' },
        order: 10
    },

    // ═══════════════════════════════════════
    // STACKS & QUEUES (5 problems)
    // ═══════════════════════════════════════
    {
        title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'easy', category: 'stacks',
        companyTags: ['Google', 'Amazon', 'Facebook'],
        description: 'Given a string s containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
        constraints: ['1 <= s.length <= 10^4'],
        examples: [{ input: '()', output: 'true' }, { input: '({[]})', output: 'true' }, { input: '(]', output: 'false' }],
        testCases: [
            { input: '()', expectedOutput: 'true', isHidden: false },
            { input: '()[]{}', expectedOutput: 'true', isHidden: false },
            { input: '(]', expectedOutput: 'false', isHidden: false },
            { input: '([)]', expectedOutput: 'false', isHidden: true },
            { input: '{[]}', expectedOutput: 'true', isHidden: true },
        ],
        starterCode: { python: 'def is_valid(s):\n    pass\n\ns = input()\nprint(str(is_valid(s)).lower())' },
        hints: ['Use a stack'], solution: { code: { python: 'def is_valid(s):\n    stack = []\n    pairs = {")":"(","]":"[","}":"{"}\n    for c in s:\n        if c in "([{":\n            stack.append(c)\n        elif stack and stack[-1] == pairs[c]:\n            stack.pop()\n        else:\n            return False\n    return len(stack) == 0\n\ns = input()\nprint(str(is_valid(s)).lower())' }, timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },
        order: 11
    },
    {
        title: 'Min Stack', slug: 'min-stack', difficulty: 'medium', category: 'stacks',
        companyTags: ['Amazon', 'Google'],
        description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nInput: operations as push X, pop, top, getMin — one per line.\nOutput: result for top and getMin operations.',
        constraints: ['Methods pop, top, getMin will always be called on non-empty stacks'],
        examples: [{ input: 'push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin', output: '-3\n0\n-2' }],
        testCases: [
            { input: 'push -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin', expectedOutput: '-3\n0\n-2', isHidden: false },
        ],
        starterCode: { python: 'import sys\n\nclass MinStack:\n    def __init__(self):\n        pass\n    def push(self, val):\n        pass\n    def pop(self):\n        pass\n    def top(self):\n        pass\n    def getMin(self):\n        pass\n\nstack = MinStack()\nfor line in sys.stdin:\n    parts = line.strip().split()\n    if parts[0] == "push": stack.push(int(parts[1]))\n    elif parts[0] == "pop": stack.pop()\n    elif parts[0] == "top": print(stack.top())\n    elif parts[0] == "getMin": print(stack.getMin())' },
        hints: ['Keep a second stack that tracks minimums'], solution: { code: { python: 'import sys\n\nclass MinStack:\n    def __init__(self):\n        self.stack = []\n        self.mins = []\n    def push(self, val):\n        self.stack.append(val)\n        self.mins.append(min(val, self.mins[-1] if self.mins else val))\n    def pop(self):\n        self.stack.pop()\n        self.mins.pop()\n    def top(self):\n        return self.stack[-1]\n    def getMin(self):\n        return self.mins[-1]\n\nstack = MinStack()\nfor line in sys.stdin:\n    parts = line.strip().split()\n    if parts[0] == "push": stack.push(int(parts[1]))\n    elif parts[0] == "pop": stack.pop()\n    elif parts[0] == "top": print(stack.top())\n    elif parts[0] == "getMin": print(stack.getMin())' }, timeComplexity: 'O(1) per operation', spaceComplexity: 'O(n)' },
        order: 12
    },

    // ═══════════════════════════════════════
    // TREES (5 problems)
    // ═══════════════════════════════════════
    {
        title: 'Maximum Depth of Binary Tree', slug: 'max-depth-binary-tree', difficulty: 'easy', category: 'trees',
        companyTags: ['Amazon', 'Google'],
        description: 'Given the root of a binary tree (as level-order array), return its maximum depth.\n\nInput: space-separated values (use "null" for empty nodes).',
        constraints: ['0 <= number of nodes <= 10^4'],
        examples: [{ input: '3 9 20 null null 15 7', output: '3' }],
        testCases: [
            { input: '3 9 20 null null 15 7', expectedOutput: '3', isHidden: false },
            { input: '1 null 2', expectedOutput: '2', isHidden: false },
            { input: '1', expectedOutput: '1', isHidden: true },
        ],
        starterCode: { python: 'def max_depth(tree, i=0):\n    if i >= len(tree) or tree[i] is None:\n        return 0\n    return 1 + max(max_depth(tree, 2*i+1), max_depth(tree, 2*i+2))\n\nvals = input().split()\ntree = [None if v == "null" else int(v) for v in vals]\nprint(max_depth(tree))' },
        hints: ['Use recursion: depth = 1 + max(left, right)'], solution: { code: { python: 'def max_depth(tree, i=0):\n    if i >= len(tree) or tree[i] is None:\n        return 0\n    return 1 + max(max_depth(tree, 2*i+1), max_depth(tree, 2*i+2))\n\nvals = input().split()\ntree = [None if v == "null" else int(v) for v in vals]\nprint(max_depth(tree))' }, timeComplexity: 'O(n)', spaceComplexity: 'O(h)' },
        order: 13
    },
    {
        title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'easy', category: 'trees',
        companyTags: ['Google'],
        description: 'Given a binary tree as level-order array, invert it (mirror) and return the level-order result.',
        constraints: ['0 <= nodes <= 100'],
        examples: [{ input: '4 2 7 1 3 6 9', output: '4 7 2 9 6 3 1' }],
        testCases: [
            { input: '4 2 7 1 3 6 9', expectedOutput: '4 7 2 9 6 3 1', isHidden: false },
            { input: '2 1 3', expectedOutput: '2 3 1', isHidden: false },
        ],
        starterCode: { python: 'from collections import deque\n\ndef invert(tree):\n    # Implement inversion\n    pass\n\nvals = input().split()\ntree = [None if v == "null" else int(v) for v in vals]\nresult = invert(tree)\nprint(*[v for v in result if v is not None])' },
        hints: ['Swap left and right children at each node'], solution: { code: { python: 'def invert(tree):\n    n = len(tree)\n    result = tree[:]\n    for i in range(n):\n        l, r = 2*i+1, 2*i+2\n        if l < n and r < n:\n            result[l], result[r] = tree[r], tree[l]\n    return result\n\nvals = input().split()\ntree = [None if v == "null" else int(v) for v in vals]\nresult = invert(tree)\nprint(*[v for v in result if v is not None])' }, timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },
        order: 14
    },

    // ═══════════════════════════════════════
    // SORTING (5 problems)
    // ═══════════════════════════════════════
    {
        title: 'Sort an Array', slug: 'sort-array', difficulty: 'medium', category: 'sorting',
        companyTags: ['Microsoft'],
        description: 'Given an array of integers, sort it in ascending order. Implement your own sorting algorithm (do not use built-in sort).',
        constraints: ['1 <= nums.length <= 5 * 10^4'],
        examples: [{ input: '5 2 3 1', output: '1 2 3 5' }],
        testCases: [
            { input: '5 2 3 1', expectedOutput: '1 2 3 5', isHidden: false },
            { input: '5 1 1 2 0 0', expectedOutput: '0 0 1 1 2 5', isHidden: false },
            { input: '1', expectedOutput: '1', isHidden: true },
        ],
        starterCode: { python: 'def sort_array(nums):\n    # Implement merge sort or quick sort\n    pass\n\nnums = list(map(int, input().split()))\nprint(*sort_array(nums))' },
        hints: ['Try merge sort for guaranteed O(n log n)'], solution: { code: { python: 'def sort_array(nums):\n    if len(nums) <= 1: return nums\n    mid = len(nums)//2\n    left = sort_array(nums[:mid])\n    right = sort_array(nums[mid:])\n    return merge(left, right)\n\ndef merge(a, b):\n    res, i, j = [], 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]: res.append(a[i]); i += 1\n        else: res.append(b[j]); j += 1\n    return res + a[i:] + b[j:]\n\nnums = list(map(int, input().split()))\nprint(*sort_array(nums))' }, timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)' },
        order: 15
    },

    // ═══════════════════════════════════════
    // SEARCHING (5 problems)
    // ═══════════════════════════════════════
    {
        title: 'Binary Search', slug: 'binary-search', difficulty: 'easy', category: 'searching',
        companyTags: ['Google', 'Microsoft'],
        description: 'Given a sorted array and a target, return the index of target. If not found, return -1.',
        constraints: ['1 <= nums.length <= 10^4', 'nums is sorted'],
        examples: [{ input: '-1 0 3 5 9 12\n9', output: '4' }],
        testCases: [
            { input: '-1 0 3 5 9 12\n9', expectedOutput: '4', isHidden: false },
            { input: '-1 0 3 5 9 12\n2', expectedOutput: '-1', isHidden: false },
            { input: '5\n5', expectedOutput: '0', isHidden: true },
        ],
        starterCode: { python: 'def binary_search(nums, target):\n    pass\n\nnums = list(map(int, input().split()))\ntarget = int(input())\nprint(binary_search(nums, target))' },
        hints: ['Use two pointers: left and right'], solution: { code: { python: 'def binary_search(nums, target):\n    l, r = 0, len(nums)-1\n    while l <= r:\n        mid = (l+r)//2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: l = mid+1\n        else: r = mid-1\n    return -1\n\nnums = list(map(int, input().split()))\ntarget = int(input())\nprint(binary_search(nums, target))' }, timeComplexity: 'O(log n)', spaceComplexity: 'O(1)' },
        order: 16
    },

    // ═══════════════════════════════════════
    // RECURSION (5 problems)
    // ═══════════════════════════════════════
    {
        title: 'Fibonacci Number', slug: 'fibonacci', difficulty: 'easy', category: 'recursion',
        companyTags: ['Amazon'],
        description: 'Calculate the nth Fibonacci number. F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).',
        constraints: ['0 <= n <= 30'],
        examples: [{ input: '4', output: '3' }],
        testCases: [
            { input: '4', expectedOutput: '3', isHidden: false },
            { input: '10', expectedOutput: '55', isHidden: false },
            { input: '0', expectedOutput: '0', isHidden: true },
            { input: '1', expectedOutput: '1', isHidden: true },
        ],
        starterCode: { python: 'def fib(n):\n    pass\n\nn = int(input())\nprint(fib(n))' },
        hints: ['Use memoization or iterative approach'], solution: { code: { python: 'def fib(n):\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n+1):\n        a, b = b, a+b\n    return b\n\nn = int(input())\nprint(fib(n))' }, timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
        order: 17
    },
    {
        title: 'Power of Two', slug: 'power-of-two', difficulty: 'easy', category: 'recursion',
        companyTags: ['Google'],
        description: 'Given an integer n, return true if it is a power of two.',
        constraints: ['-2^31 <= n <= 2^31 - 1'],
        examples: [{ input: '16', output: 'true' }, { input: '3', output: 'false' }],
        testCases: [
            { input: '1', expectedOutput: 'true', isHidden: false },
            { input: '16', expectedOutput: 'true', isHidden: false },
            { input: '3', expectedOutput: 'false', isHidden: false },
            { input: '0', expectedOutput: 'false', isHidden: true },
        ],
        starterCode: { python: 'def is_power_of_two(n):\n    pass\n\nn = int(input())\nprint(str(is_power_of_two(n)).lower())' },
        hints: ['A power of 2 has exactly one bit set: n & (n-1) == 0'], solution: { code: { python: 'def is_power_of_two(n):\n    return n > 0 and (n & (n-1)) == 0\n\nn = int(input())\nprint(str(is_power_of_two(n)).lower())' }, timeComplexity: 'O(1)', spaceComplexity: 'O(1)' },
        order: 18
    },

    // ═══════════════════════════════════════
    // DYNAMIC PROGRAMMING (5 problems)
    // ═══════════════════════════════════════
    {
        title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'easy', category: 'dynamic_programming',
        companyTags: ['Amazon', 'Google', 'Apple'],
        description: 'You are climbing a staircase. It takes n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?',
        constraints: ['1 <= n <= 45'],
        examples: [{ input: '3', output: '3', explanation: '1+1+1, 1+2, 2+1' }],
        testCases: [
            { input: '2', expectedOutput: '2', isHidden: false },
            { input: '3', expectedOutput: '3', isHidden: false },
            { input: '5', expectedOutput: '8', isHidden: true },
            { input: '10', expectedOutput: '89', isHidden: true },
        ],
        starterCode: { python: 'def climb_stairs(n):\n    pass\n\nn = int(input())\nprint(climb_stairs(n))' },
        hints: ['This is the Fibonacci sequence!'], solution: { code: { python: 'def climb_stairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n+1):\n        a, b = b, a+b\n    return b\n\nn = int(input())\nprint(climb_stairs(n))' }, timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
        order: 19
    },
    {
        title: 'House Robber', slug: 'house-robber', difficulty: 'medium', category: 'dynamic_programming',
        companyTags: ['Amazon', 'Google'],
        description: 'You are a robber planning to rob houses. Each house has money. Adjacent houses have security — you cannot rob two adjacent houses. Find the maximum amount.',
        constraints: ['1 <= nums.length <= 100'],
        examples: [{ input: '1 2 3 1', output: '4', explanation: 'Rob house 1 and 3: 1 + 3 = 4' }],
        testCases: [
            { input: '1 2 3 1', expectedOutput: '4', isHidden: false },
            { input: '2 7 9 3 1', expectedOutput: '12', isHidden: false },
            { input: '2 1 1 2', expectedOutput: '4', isHidden: true },
        ],
        starterCode: { python: 'def rob(nums):\n    pass\n\nnums = list(map(int, input().split()))\nprint(rob(nums))' },
        hints: ['dp[i] = max(dp[i-1], dp[i-2] + nums[i])'], solution: { code: { python: 'def rob(nums):\n    if len(nums) <= 2: return max(nums)\n    a, b = nums[0], max(nums[0], nums[1])\n    for i in range(2, len(nums)):\n        a, b = b, max(b, a + nums[i])\n    return b\n\nnums = list(map(int, input().split()))\nprint(rob(nums))' }, timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
        order: 20
    },
    {
        title: 'Coin Change', slug: 'coin-change', difficulty: 'medium', category: 'dynamic_programming',
        companyTags: ['Amazon', 'Google', 'Microsoft'],
        description: 'Given coins of different denominations and a total amount, return the fewest number of coins needed. Return -1 if not possible.',
        constraints: ['1 <= coins.length <= 12', '1 <= amount <= 10^4'],
        examples: [{ input: '1 2 5\n11', output: '3', explanation: '5 + 5 + 1 = 11' }],
        testCases: [
            { input: '1 2 5\n11', expectedOutput: '3', isHidden: false },
            { input: '2\n3', expectedOutput: '-1', isHidden: false },
            { input: '1\n0', expectedOutput: '0', isHidden: true },
            { input: '1 2 5\n100', expectedOutput: '20', isHidden: true },
        ],
        starterCode: { python: 'def coin_change(coins, amount):\n    pass\n\ncoins = list(map(int, input().split()))\namount = int(input())\nprint(coin_change(coins, amount))' },
        hints: ['Use DP: dp[i] = min coins to make amount i'], solution: { code: { python: 'def coin_change(coins, amount):\n    dp = [float("inf")] * (amount + 1)\n    dp[0] = 0\n    for i in range(1, amount + 1):\n        for c in coins:\n            if c <= i:\n                dp[i] = min(dp[i], dp[i-c] + 1)\n    return dp[amount] if dp[amount] != float("inf") else -1\n\ncoins = list(map(int, input().split()))\namount = int(input())\nprint(coin_change(coins, amount))' }, timeComplexity: 'O(amount * coins)', spaceComplexity: 'O(amount)' },
        order: 21
    },

    // ═══════════════════════════════════════
    // HASH MAPS (5 problems)
    // ═══════════════════════════════════════
    {
        title: 'First Unique Character', slug: 'first-unique-char', difficulty: 'easy', category: 'hash_maps',
        companyTags: ['Amazon', 'Google'],
        description: 'Given a string s, find the first non-repeating character and return its index. Return -1 if none.',
        constraints: ['1 <= s.length <= 10^5'],
        examples: [{ input: 'leetcode', output: '0' }, { input: 'aabb', output: '-1' }],
        testCases: [
            { input: 'leetcode', expectedOutput: '0', isHidden: false },
            { input: 'loveleetcode', expectedOutput: '2', isHidden: false },
            { input: 'aabb', expectedOutput: '-1', isHidden: true },
        ],
        starterCode: { python: 'def first_uniq_char(s):\n    pass\n\ns = input()\nprint(first_uniq_char(s))' },
        hints: ['Count frequency first, then find first with count 1'], solution: { code: { python: 'def first_uniq_char(s):\n    from collections import Counter\n    count = Counter(s)\n    for i, c in enumerate(s):\n        if count[c] == 1: return i\n    return -1\n\ns = input()\nprint(first_uniq_char(s))' }, timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
        order: 22
    },
    {
        title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'medium', category: 'hash_maps',
        companyTags: ['Amazon', 'Facebook', 'Google'],
        description: 'Given an array of strings, group the anagrams together. Output each group on a separate line, words sorted alphabetically within each group.',
        constraints: ['1 <= strs.length <= 10^4'],
        examples: [{ input: 'eat tea tan ate nat bat', output: 'ate eat tea\nant nat tan\nbat' }],
        testCases: [
            { input: 'eat tea tan ate nat bat', expectedOutput: 'ate eat tea\nnat tan\nbat', isHidden: false },
            { input: 'a', expectedOutput: 'a', isHidden: true },
        ],
        starterCode: { python: 'from collections import defaultdict\n\ndef group_anagrams(strs):\n    pass\n\nstrs = input().split()\ngroups = group_anagrams(strs)\nfor g in groups:\n    print(*sorted(g))' },
        hints: ['Use sorted string as hash key'], solution: { code: { python: 'from collections import defaultdict\n\ndef group_anagrams(strs):\n    d = defaultdict(list)\n    for s in strs:\n        d[tuple(sorted(s))].append(s)\n    return list(d.values())\n\nstrs = input().split()\ngroups = group_anagrams(strs)\nfor g in sorted(groups, key=lambda x: sorted(x)[0]):\n    print(*sorted(g))' }, timeComplexity: 'O(n * k log k)', spaceComplexity: 'O(n)' },
        order: 23
    },

    // ═══════════════════════════════════════
    // GRAPHS (3 problems)
    // ═══════════════════════════════════════
    {
        title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'medium', category: 'graphs',
        companyTags: ['Amazon', 'Google', 'Microsoft'],
        description: 'Given a 2D grid of "1"s (land) and "0"s (water), count the number of islands.\n\nInput: first line = rows cols, then the grid.',
        constraints: ['1 <= m, n <= 300'],
        examples: [{ input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', output: '1' }],
        testCases: [
            { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', expectedOutput: '1', isHidden: false },
            { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', expectedOutput: '3', isHidden: false },
        ],
        starterCode: { python: 'import sys\n\ndef num_islands(grid):\n    pass\n\nlines = sys.stdin.read().strip().split("\\n")\nr, c = map(int, lines[0].split())\ngrid = [list(map(int, lines[i+1].split())) for i in range(r)]\nprint(num_islands(grid))' },
        hints: ['Use DFS/BFS to mark visited land cells'], solution: { code: { python: 'import sys\n\ndef num_islands(grid):\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0:\n            return\n        grid[r][c] = 0\n        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == 1:\n                count += 1\n                dfs(r, c)\n    return count\n\nlines = sys.stdin.read().strip().split("\\n")\nr, c = map(int, lines[0].split())\ngrid = [list(map(int, lines[i+1].split())) for i in range(r)]\nprint(num_islands(grid))' }, timeComplexity: 'O(m*n)', spaceComplexity: 'O(m*n)' },
        order: 24
    },

    // ═══════════════════════════════════════
    // GREEDY (3 problems)
    // ═══════════════════════════════════════
    {
        title: 'Jump Game', slug: 'jump-game', difficulty: 'medium', category: 'greedy',
        companyTags: ['Amazon', 'Google'],
        description: 'Given an array where each element represents max jump length, determine if you can reach the last index.',
        constraints: ['1 <= nums.length <= 10^4'],
        examples: [{ input: '2 3 1 1 4', output: 'true' }, { input: '3 2 1 0 4', output: 'false' }],
        testCases: [
            { input: '2 3 1 1 4', expectedOutput: 'true', isHidden: false },
            { input: '3 2 1 0 4', expectedOutput: 'false', isHidden: false },
            { input: '0', expectedOutput: 'true', isHidden: true },
        ],
        starterCode: { python: 'def can_jump(nums):\n    pass\n\nnums = list(map(int, input().split()))\nprint(str(can_jump(nums)).lower())' },
        hints: ['Track the farthest reachable index'], solution: { code: { python: 'def can_jump(nums):\n    reach = 0\n    for i, n in enumerate(nums):\n        if i > reach: return False\n        reach = max(reach, i + n)\n    return True\n\nnums = list(map(int, input().split()))\nprint(str(can_jump(nums)).lower())' }, timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
        order: 25
    },

    // ═══════════════════════════════════════
    // MATH (2 problems)
    // ═══════════════════════════════════════
    {
        title: 'Reverse Integer', slug: 'reverse-integer', difficulty: 'medium', category: 'math',
        companyTags: ['Amazon', 'Apple'],
        description: 'Given a 32-bit signed integer, reverse its digits. Return 0 if the result overflows.',
        constraints: ['-2^31 <= x <= 2^31 - 1'],
        examples: [{ input: '123', output: '321' }, { input: '-123', output: '-321' }],
        testCases: [
            { input: '123', expectedOutput: '321', isHidden: false },
            { input: '-123', expectedOutput: '-321', isHidden: false },
            { input: '120', expectedOutput: '21', isHidden: true },
            { input: '0', expectedOutput: '0', isHidden: true },
        ],
        starterCode: { python: 'def reverse(x):\n    pass\n\nx = int(input())\nprint(reverse(x))' },
        hints: ['Handle negative sign separately, check overflow'], solution: { code: { python: 'def reverse(x):\n    sign = -1 if x < 0 else 1\n    rev = int(str(abs(x))[::-1]) * sign\n    return rev if -2**31 <= rev <= 2**31-1 else 0\n\nx = int(input())\nprint(reverse(x))' }, timeComplexity: 'O(log n)', spaceComplexity: 'O(1)' },
        order: 26
    },
    {
        title: 'Palindrome Number', slug: 'palindrome-number', difficulty: 'easy', category: 'math',
        companyTags: ['Amazon'],
        description: 'Determine whether an integer is a palindrome. Negative numbers are not palindromes.',
        constraints: ['-2^31 <= x <= 2^31 - 1'],
        examples: [{ input: '121', output: 'true' }, { input: '-121', output: 'false' }],
        testCases: [
            { input: '121', expectedOutput: 'true', isHidden: false },
            { input: '-121', expectedOutput: 'false', isHidden: false },
            { input: '10', expectedOutput: 'false', isHidden: true },
        ],
        starterCode: { python: 'def is_palindrome(x):\n    pass\n\nx = int(input())\nprint(str(is_palindrome(x)).lower())' },
        hints: ['Convert to string and compare with reverse'], solution: { code: { python: 'def is_palindrome(x):\n    return str(x) == str(x)[::-1]\n\nx = int(input())\nprint(str(is_palindrome(x)).lower())' }, timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },
        order: 27
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Problem.deleteMany({});
        console.log('Cleared existing problems');

        await Problem.insertMany(PROBLEMS);
        console.log(`✅ Seeded ${PROBLEMS.length} problems successfully!`);

        // Print category breakdown
        const cats = {};
        PROBLEMS.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
        console.log('\nCategory breakdown:');
        Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count} problems`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

seed();
