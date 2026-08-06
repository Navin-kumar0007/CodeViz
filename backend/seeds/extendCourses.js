/**
 * Extend existing thin courses with additional lessons, pushed directly into
 * the DB-backed Course documents. Idempotent: a lesson is only added if its
 * lessonId is not already present.
 *
 * Usage: node seeds/extendCourses.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

const q = (question, options, correct, explanation) => ({ question, options, correct, explanation });
const T = (content) => ({ type: 'text', content });
const TIP = (content) => ({ type: 'tip', content });
const WARN = (content) => ({ type: 'warning', content });

// slug -> [ lessons to add ]
const EXTENSIONS = {
  // ---------------- Data Structures ----------------
  hashmaps: [
    {
      lessonId: 'hashmap-collisions', title: 'Hashing & Collisions', duration: '8 min',
      explanation: [
        T('A **hash function** maps a key to a bucket index. When two keys map to the same bucket, that is a **collision**.'),
        T('Common resolution: **chaining** (each bucket holds a list) or **open addressing** (probe for the next free slot).'),
        TIP('A good hash spreads keys evenly. A bad one clusters everything into few buckets, degrading lookups to O(N).'),
      ],
      keyConcepts: ['Hash function maps key → bucket', 'Collisions are unavoidable', 'Chaining stores lists per bucket', 'Load factor drives resizing'],
      code: {
        python: `# Chaining by hand (conceptually what dict does)
class HashMap:
    def __init__(self, size=8):
        self.buckets = [[] for _ in range(size)]
    def _idx(self, key):
        return hash(key) % len(self.buckets)
    def put(self, key, val):
        b = self.buckets[self._idx(key)]
        for i, (k, _) in enumerate(b):
            if k == key: b[i] = (key, val); return
        b.append((key, val))
    def get(self, key):
        for k, v in self.buckets[self._idx(key)]:
            if k == key: return v
        return None`,
        javascript: `class HashMap {
  constructor(size = 8) { this.buckets = Array.from({length: size}, () => []); }
  _idx(key) { let h = 0; for (const c of String(key)) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h) % this.buckets.length; }
  put(key, val) { const b = this.buckets[this._idx(key)]; const e = b.find(p => p[0] === key); if (e) e[1] = val; else b.push([key, val]); }
  get(key) { const e = this.buckets[this._idx(key)].find(p => p[0] === key); return e ? e[1] : null; }
}`,
      },
      quiz: [
        q('What is a hash collision?', ['Two keys mapping to the same bucket', 'A network error', 'A full disk', 'A syntax error'], 0, 'A collision is when different keys hash to the same bucket index.'),
        q('How does chaining resolve collisions?', ['Deletes one key', 'Stores multiple entries in a list per bucket', 'Ignores the key', 'Doubles the value'], 1, 'Chaining keeps a list at each bucket so multiple colliding keys coexist.'),
      ],
    },
    {
      lessonId: 'hashmap-patterns', title: 'Common HashMap Patterns', duration: '8 min',
      explanation: [
        T('Hash maps turn many O(N²) problems into O(N) by trading space for speed — frequency counts, seen-sets, and index lookups.'),
        T('Classic: **Two Sum** — store each number’s index, then for each value check if its complement was seen.'),
        TIP('A hash **set** is a hash map with keys only — perfect for "have I seen this?" checks.'),
      ],
      keyConcepts: ['Trade space for O(1) lookups', 'Frequency counting with a map', 'Seen-set for duplicates', 'Complement lookup (Two Sum)'],
      code: {
        python: `def two_sum(nums, target):
    seen = {}                 # value -> index
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]`,
        javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
      },
      quiz: [
        q('How does a hash map speed up Two Sum?', ['By sorting', 'By storing seen values for O(1) complement lookup', 'By using recursion', 'It does not'], 1, 'Storing each value’s index lets you check for the needed complement in O(1).'),
        q('What is a hash set best for?', ['Sorting numbers', 'Membership / "seen this?" checks', 'Math', 'Rendering UI'], 1, 'A set gives O(1) membership tests, ideal for duplicate/seen checks.'),
      ],
    },
  ],
  stacks: [
    {
      lessonId: 'stack-applications', title: 'Stack Applications', duration: '8 min',
      explanation: [
        T('A **stack** is LIFO (last-in, first-out). It powers undo, the call stack, and expression evaluation.'),
        T('Classic use: **balanced parentheses** — push openers, pop on closers, and check they match.'),
        TIP('If a problem involves "most recent" or "matching pairs," a stack is often the answer.'),
      ],
      keyConcepts: ['LIFO order', 'Push/pop are O(1)', 'Matching-pairs problems', 'Backs the call stack & undo'],
      code: {
        python: `def is_balanced(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c in '([{':
            stack.append(c)
        elif c in pairs:
            if not stack or stack.pop() != pairs[c]:
                return False
    return not stack

print(is_balanced("([]{})"))  # True`,
        javascript: `function isBalanced(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const c of s) {
    if ('([{'.includes(c)) stack.push(c);
    else if (pairs[c] && stack.pop() !== pairs[c]) return false;
  }
  return stack.length === 0;
}`,
      },
      quiz: [
        q('What order does a stack use?', ['FIFO', 'LIFO', 'Random', 'Sorted'], 1, 'A stack is Last-In, First-Out.'),
        q('Which problem is a natural fit for a stack?', ['Balanced parentheses', 'Finding the average', 'Sorting a list', 'Sending email'], 0, 'Matching opening/closing symbols maps directly to push/pop.'),
      ],
    },
    {
      lessonId: 'monotonic-stack', title: 'The Monotonic Stack', duration: '9 min',
      explanation: [
        T('A **monotonic stack** keeps elements in sorted (increasing or decreasing) order, popping ones that break the order.'),
        T('It solves "next greater element" style problems in O(N) instead of O(N²).'),
        WARN('Store indices, not just values, when you need distances between elements.'),
      ],
      keyConcepts: ['Keeps a sorted stack', 'Solves next-greater/next-smaller in O(N)', 'Store indices for distances', 'Each element pushed/popped once'],
      code: {
        python: `def next_greater(nums):
    res = [-1] * len(nums)
    stack = []               # indices, values decreasing
    for i, n in enumerate(nums):
        while stack and nums[stack[-1]] < n:
            res[stack.pop()] = n
        stack.append(i)
    return res

print(next_greater([2, 1, 3, 1]))  # [3, 3, -1, -1]`,
        javascript: `function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = [];
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length-1]] < nums[i]) res[stack.pop()] = nums[i];
    stack.push(i);
  }
  return res;
}`,
      },
      quiz: [
        q('What does a monotonic stack maintain?', ['Random order', 'Elements in increasing or decreasing order', 'A hash', 'Two queues'], 1, 'It keeps its contents monotonic, popping elements that violate the order.'),
        q('What is the time complexity of next-greater-element with a monotonic stack?', ['O(N^2)', 'O(N)', 'O(log N)', 'O(1)'], 1, 'Each index is pushed and popped at most once → O(N).'),
      ],
    },
  ],
  linkedlists: [
    {
      lessonId: 'reverse-linked-list', title: 'Reversing a Linked List', duration: '8 min',
      explanation: [
        T('Reversing a singly linked list means flipping every `next` pointer. Track **prev**, **curr**, and **next** as you walk.'),
        T('It is done in-place in O(N) time and O(1) extra space — a very common interview staple.'),
        TIP('Draw the three pointers on paper; the order of reassignment matters.'),
      ],
      keyConcepts: ['Flip each next pointer', 'Track prev/curr/next', 'O(N) time, O(1) space', 'Return the new head (old tail)'],
      code: {
        python: `class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

def reverse(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next   # save
        curr.next = prev  # flip
        prev = curr       # advance
        curr = nxt
    return prev           # new head`,
        javascript: `function reverse(head) {
  let prev = null, curr = head;
  while (curr) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,
      },
      quiz: [
        q('What space complexity does in-place list reversal use?', ['O(N)', 'O(1)', 'O(N log N)', 'O(N^2)'], 1, 'Only a few pointers are needed → O(1) extra space.'),
        q('After reversing, what becomes the new head?', ['The old head', 'The old tail', 'The middle node', 'null'], 1, 'The last node becomes the first after all next pointers flip.'),
      ],
    },
    {
      lessonId: 'fast-slow-pointers', title: 'Fast & Slow Pointers', duration: '8 min',
      explanation: [
        T('Two pointers moving at different speeds solve many list problems: finding the **middle**, detecting a **cycle**, and finding the Nth-from-end.'),
        T('**Floyd’s cycle detection**: a fast pointer (2 steps) and slow pointer (1 step) meet if and only if there is a loop.'),
        TIP('The slow pointer lands on the middle exactly when the fast one reaches the end.'),
      ],
      keyConcepts: ['Two pointers at different speeds', 'Find the middle in one pass', 'Floyd’s algorithm detects cycles', 'No extra space needed'],
      code: {
        python: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
        javascript: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
      },
      quiz: [
        q('What does Floyd’s fast/slow pointer detect?', ['A sorted list', 'A cycle in the list', 'The list length only', 'Duplicates'], 1, 'If the fast pointer laps the slow one, they meet inside a cycle.'),
        q('How do you find the middle of a list in one pass?', ['Count then divide', 'Move slow by 1 and fast by 2 until fast ends', 'Reverse it', 'Sort it'], 1, 'When fast reaches the end, slow is at the middle.'),
      ],
    },
  ],
  queues: [
    {
      lessonId: 'queue-bfs', title: 'Queues & BFS', duration: '8 min',
      explanation: [
        T('A **queue** is FIFO (first-in, first-out). It is the engine of **Breadth-First Search**, exploring a graph level by level.'),
        T('Enqueue neighbors, dequeue the front, mark visited — the shortest path in an unweighted graph falls out naturally.'),
        TIP('Use a deque (double-ended queue) for O(1) pops from the front; a plain array shift is O(N).'),
      ],
      keyConcepts: ['FIFO order', 'BFS explores level by level', 'Finds shortest path in unweighted graphs', 'Use a deque for O(1) dequeue'],
      code: {
        python: `from collections import deque

def bfs(graph, start):
    visited = {start}
    q = deque([start])
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nb in graph[node]:
            if nb not in visited:
                visited.add(nb)
                q.append(nb)
    return order`,
        javascript: `function bfs(graph, start) {
  const visited = new Set([start]);
  const q = [start], order = [];
  let i = 0;
  while (i < q.length) {
    const node = q[i++];
    order.push(node);
    for (const nb of graph[node]) if (!visited.has(nb)) { visited.add(nb); q.push(nb); }
  }
  return order;
}`,
      },
      quiz: [
        q('What order does a queue use?', ['LIFO', 'FIFO', 'Sorted', 'Random'], 1, 'A queue is First-In, First-Out.'),
        q('Which traversal uses a queue?', ['DFS', 'BFS', 'Binary search', 'Quicksort'], 1, 'BFS uses a queue to visit nodes level by level.'),
      ],
    },
    {
      lessonId: 'sliding-window-deque', title: 'Deques & Sliding Windows', duration: '9 min',
      explanation: [
        T('A **deque** supports O(1) push/pop at both ends. It powers the **sliding window maximum** problem.'),
        T('Keep indices of useful candidates in the deque, dropping ones outside the window or smaller than the newcomer.'),
        WARN('Store indices so you can tell when a candidate has slid out of the window.'),
      ],
      keyConcepts: ['Deque = O(1) at both ends', 'Sliding-window maximum in O(N)', 'Front holds the current max index', 'Evict out-of-window indices'],
      code: {
        python: `from collections import deque

def max_sliding_window(nums, k):
    dq, res = deque(), []      # dq holds indices, values decreasing
    for i, n in enumerate(nums):
        while dq and nums[dq[-1]] < n: dq.pop()
        dq.append(i)
        if dq[0] == i - k: dq.popleft()   # evict out-of-window
        if i >= k - 1: res.append(nums[dq[0]])
    return res

print(max_sliding_window([1,3,-1,-3,5,3], 3))  # [3,3,5,5]`,
        javascript: `function maxSlidingWindow(nums, k) {
  const dq = [], res = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length && nums[dq[dq.length-1]] < nums[i]) dq.pop();
    dq.push(i);
    if (dq[0] === i - k) dq.shift();
    if (i >= k - 1) res.push(nums[dq[0]]);
  }
  return res;
}`,
      },
      quiz: [
        q('What makes a deque special?', ['Only one end', 'O(1) insertion/removal at both ends', 'It sorts data', 'It is a hash'], 1, 'A double-ended queue allows O(1) operations at the front and back.'),
        q('Why store indices (not values) in the sliding-window deque?', ['To save memory', 'To know when a candidate leaves the window', 'For sorting', 'No reason'], 1, 'Indices let you evict candidates that have slid out of the current window.'),
      ],
    },
  ],
  tries: [
    {
      lessonId: 'trie-insert-search', title: 'Building a Trie', duration: '8 min',
      explanation: [
        T('A **trie** (prefix tree) stores strings by character. Each node maps a character to a child, and a flag marks the end of a word.'),
        T('Insert and search are O(L) in the word length L — independent of how many words are stored.'),
        TIP('Tries excel at prefix queries: autocomplete, spell-check, and dictionaries.'),
      ],
      keyConcepts: ['Each edge is a character', 'A flag marks word endings', 'Insert/search are O(word length)', 'Great for prefix queries'],
      code: {
        python: `class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node['$'] = True          # end marker
    def search(self, word):
        node = self.root
        for c in word:
            if c not in node: return False
            node = node[c]
        return '$' in node`,
        javascript: `class Trie {
  constructor() { this.root = {}; }
  insert(word) { let n = this.root; for (const c of word) n = (n[c] ||= {}); n.$ = true; }
  search(word) { let n = this.root; for (const c of word) { if (!n[c]) return false; n = n[c]; } return !!n.$; }
}`,
      },
      quiz: [
        q('What does each edge in a trie represent?', ['A whole word', 'A single character', 'A number', 'A pointer to disk'], 1, 'Each edge represents one character; a path spells a prefix or word.'),
        q('What is the search time for a word of length L in a trie?', ['O(N)', 'O(L)', 'O(L^2)', 'O(1)'], 1, 'You follow L edges, independent of the number of stored words.'),
      ],
    },
    {
      lessonId: 'trie-prefix', title: 'Prefix Search & Autocomplete', duration: '8 min',
      explanation: [
        T('The trie’s superpower is **prefix matching**: walk to the prefix node, then collect every word beneath it.'),
        T('This is exactly how autocomplete suggests completions as you type.'),
        TIP('Store the count of words under each node to rank suggestions or answer "how many start with X?" instantly.'),
      ],
      keyConcepts: ['startsWith walks to the prefix node', 'Collect descendants for suggestions', 'Powers autocomplete', 'Node counts enable ranking'],
      code: {
        python: `def starts_with(trie, prefix):
    node = trie.root
    for c in prefix:
        if c not in node: return []
        node = node[c]
    words = []
    def dfs(n, path):
        if n.get('$'): words.append(prefix + path)
        for c, child in n.items():
            if c != '$': dfs(child, path + c)
    dfs(node, "")
    return words`,
        javascript: `function startsWith(trie, prefix) {
  let n = trie.root;
  for (const c of prefix) { if (!n[c]) return []; n = n[c]; }
  const words = [];
  (function dfs(node, path) {
    if (node.$) words.push(prefix + path);
    for (const c in node) if (c !== '$') dfs(node[c], path + c);
  })(n, "");
  return words;
}`,
      },
      quiz: [
        q('What real feature does trie prefix search power?', ['Video playback', 'Autocomplete', 'Encryption', 'Sorting'], 1, 'Walking to a prefix and collecting descendants is how autocomplete works.'),
        q('How do you answer "how many words start with X" instantly?', ['Scan all words', 'Store a count at each trie node', 'Sort the words', 'Use a stack'], 1, 'A per-node word count answers prefix-count queries in O(prefix length).'),
      ],
    },
  ],
  backtracking: [
    {
      lessonId: 'backtracking-permutations', title: 'Permutations & Subsets', duration: '9 min',
      explanation: [
        T('**Backtracking** builds candidates incrementally and abandons a path as soon as it cannot lead to a solution.'),
        T('Generating **permutations** or **subsets** is the canonical example: choose, recurse, then **undo the choice** (backtrack).'),
        TIP('The "choose → explore → un-choose" pattern is the heart of every backtracking solution.'),
      ],
      keyConcepts: ['Build candidates incrementally', 'Choose, recurse, un-choose', 'Prune impossible branches early', 'Exponential but pruned search'],
      code: {
        python: `def permutations(nums):
    res = []
    def backtrack(path, remaining):
        if not remaining:
            res.append(path[:]); return
        for i in range(len(remaining)):
            path.append(remaining[i])                  # choose
            backtrack(path, remaining[:i] + remaining[i+1:])  # explore
            path.pop()                                 # un-choose
    backtrack([], nums)
    return res

print(len(permutations([1,2,3])))  # 6`,
        javascript: `function permutations(nums) {
  const res = [];
  (function backtrack(path, rem) {
    if (!rem.length) { res.push([...path]); return; }
    for (let i = 0; i < rem.length; i++) {
      path.push(rem[i]);
      backtrack(path, [...rem.slice(0,i), ...rem.slice(i+1)]);
      path.pop();
    }
  })([], nums);
  return res;
}`,
      },
      quiz: [
        q('What is the core pattern of backtracking?', ['Sort then search', 'Choose, explore, un-choose', 'Hash then lookup', 'Divide and merge'], 1, 'Backtracking makes a choice, recurses, then undoes the choice to try alternatives.'),
        q('Why prune branches during backtracking?', ['To use more memory', 'To skip paths that cannot lead to a solution', 'To sort faster', 'It has no effect'], 1, 'Pruning avoids exploring branches that are already known to fail.'),
      ],
    },
    {
      lessonId: 'backtracking-constraints', title: 'Constraint Problems (N-Queens)', duration: '9 min',
      explanation: [
        T('Constraint-satisfaction problems like **N-Queens** and **Sudoku** are backtracking with a validity check before each choice.'),
        T('Place a piece only if it does not violate a rule; if you get stuck, backtrack and try the next option.'),
        WARN('Efficient constraint checks (sets for columns/diagonals) make the difference between fast and hopeless.'),
      ],
      keyConcepts: ['Validate before choosing', 'Backtrack on dead ends', 'Track constraints with sets', 'N-Queens / Sudoku are classic cases'],
      code: {
        python: `def solve_n_queens(n):
    cols, diag, anti = set(), set(), set()
    count = 0
    def place(r):
        nonlocal count
        if r == n: count += 1; return
        for c in range(n):
            if c in cols or (r-c) in diag or (r+c) in anti: continue
            cols.add(c); diag.add(r-c); anti.add(r+c)
            place(r+1)
            cols.discard(c); diag.discard(r-c); anti.discard(r+c)
    place(0)
    return count

print(solve_n_queens(4))  # 2`,
        javascript: `function solveNQueens(n) {
  const cols = new Set(), diag = new Set(), anti = new Set();
  let count = 0;
  (function place(r) {
    if (r === n) { count++; return; }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag.has(r-c) || anti.has(r+c)) continue;
      cols.add(c); diag.add(r-c); anti.add(r+c);
      place(r+1);
      cols.delete(c); diag.delete(r-c); anti.delete(r+c);
    }
  })(0);
  return count;
}`,
      },
      quiz: [
        q('What extra step do constraint problems add to backtracking?', ['Sorting', 'A validity check before each choice', 'Hashing', 'Caching'], 1, 'You verify a placement satisfies constraints before recursing.'),
        q('Why track columns/diagonals in sets for N-Queens?', ['For O(1) conflict checks', 'To sort the board', 'To save the answer', 'No reason'], 0, 'Sets give O(1) checks for whether a square is attacked.'),
      ],
    },
  ],
  // ---------------- Algorithm Mastery (+1 each) ----------------
  searching: [{
    lessonId: 'binary-search-variants', title: 'Binary Search Variants', duration: '9 min',
    explanation: [
      T('Beyond "find X", binary search finds **boundaries**: the first/last index satisfying a condition, or the insertion point.'),
      T('The key is a monotonic predicate: everything left of the boundary is false, everything right is true (or vice versa).'),
      TIP('"Binary search on the answer" solves optimization problems — search the answer range, not an array.'),
    ],
    keyConcepts: ['Find boundaries, not just values', 'Needs a monotonic predicate', 'Lower/upper bound patterns', 'Binary search on the answer'],
    code: {
      python: `def lower_bound(arr, target):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target: lo = mid + 1
        else: hi = mid
    return lo   # first index >= target

print(lower_bound([1,2,4,4,5], 4))  # 2`,
      javascript: `function lowerBound(arr, target) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < target) lo = mid + 1; else hi = mid;
  }
  return lo;
}`,
    },
    quiz: [
      q('What does lower_bound return?', ['The last match', 'First index >= target', 'The middle', 'A boolean'], 1, 'Lower bound is the first position where the value is not less than the target.'),
      q('Binary search requires the search space to be…', ['Random', 'Monotonic / ordered by the predicate', 'A hash map', 'A graph'], 1, 'Binary search needs a monotonic condition to discard half each step.'),
    ],
  }],
  sorting: [{
    lessonId: 'sorting-comparison', title: 'Choosing a Sort', duration: '8 min',
    explanation: [
      T('**Merge sort** is stable, O(N log N) worst-case, but uses O(N) space. **Quicksort** is in-place and fast on average but O(N²) worst-case.'),
      T('**Stability** matters when sorting by multiple keys — a stable sort preserves prior order for equal elements.'),
      TIP('Most language built-ins use a hybrid (Timsort/introsort) — reach for those before writing your own.'),
    ],
    keyConcepts: ['Merge sort: stable, O(N log N), O(N) space', 'Quicksort: in-place, avg O(N log N)', 'Stability preserves equal-key order', 'Prefer built-in hybrids'],
    code: {
      python: `# Stable multi-key sort: by age, then name
people = [("Bob", 30), ("Al", 30), ("Cy", 25)]
people.sort(key=lambda p: p[0])   # secondary key first
people.sort(key=lambda p: p[1])   # primary key (stable keeps name order)
print(people)`,
      javascript: `const people = [["Bob",30],["Al",30],["Cy",25]];
people.sort((a,b) => a[0].localeCompare(b[0]));
people.sort((a,b) => a[1] - b[1]); // stable: ties keep name order
console.log(people);`,
    },
    quiz: [
      q('Which sort is stable and O(N log N) in the worst case?', ['Quicksort', 'Merge sort', 'Bubble sort', 'Selection sort'], 1, 'Merge sort guarantees O(N log N) and is stable (at O(N) extra space).'),
      q('What does a stable sort preserve?', ['Nothing', 'Relative order of equal elements', 'Only ascending order', 'The array length'], 1, 'Equal elements keep their original relative order after a stable sort.'),
    ],
  }],
  recursion: [{
    lessonId: 'recursion-memoization', title: 'Recursion & Memoization', duration: '8 min',
    explanation: [
      T('Naive recursion can recompute the same subproblem many times (exponential). **Memoization** caches results to reuse them.'),
      T('It turns exponential recursion (like naive Fibonacci) into linear time by remembering answers.'),
      TIP('Memoization is top-down dynamic programming — same idea, recursive shape.'),
    ],
    keyConcepts: ['Naive recursion repeats work', 'Memoization caches subresults', 'Exponential → linear for Fibonacci', 'Top-down DP = memoized recursion'],
    code: {
      python: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2: return n
    return fib(n-1) + fib(n-2)

print(fib(50))  # instant, not exponential`,
      javascript: `function makeFib() {
  const memo = new Map();
  return function fib(n) {
    if (n < 2) return n;
    if (memo.has(n)) return memo.get(n);
    const r = fib(n-1) + fib(n-2);
    memo.set(n, r);
    return r;
  };
}
console.log(makeFib()(50));`,
    },
    quiz: [
      q('What does memoization do?', ['Sorts recursion', 'Caches subproblem results to avoid recomputation', 'Removes the base case', 'Adds threads'], 1, 'Memoization stores computed results so repeated subproblems are answered instantly.'),
      q('Memoized recursion is also known as…', ['Bottom-up DP', 'Top-down DP', 'Greedy', 'Divide and conquer'], 1, 'Caching recursive results is the top-down form of dynamic programming.'),
    ],
  }],
  twopointers: [{
    lessonId: 'two-pointers-patterns', title: 'Opposite & Same-Direction Pointers', duration: '8 min',
    explanation: [
      T('**Opposite-end** pointers (converging) solve pair-sum and palindrome checks on sorted data in O(N).'),
      T('**Same-direction** pointers (fast/slow) power in-place filtering, like removing duplicates.'),
      TIP('Two pointers replace a nested loop, dropping O(N²) to O(N) when data is sorted or you scan once.'),
    ],
    keyConcepts: ['Converging pointers for pair problems', 'Fast/slow for in-place edits', 'Requires sorted data or single scan', 'O(N²) → O(N)'],
    code: {
      python: `def two_sum_sorted(arr, target):
    i, j = 0, len(arr) - 1
    while i < j:
        s = arr[i] + arr[j]
        if s == target: return [i, j]
        if s < target: i += 1
        else: j -= 1
    return []

print(two_sum_sorted([1,2,4,7,11], 15))  # [3, 4]`,
      javascript: `function twoSumSorted(arr, target) {
  let i = 0, j = arr.length - 1;
  while (i < j) {
    const s = arr[i] + arr[j];
    if (s === target) return [i, j];
    if (s < target) i++; else j--;
  }
  return [];
}`,
    },
    quiz: [
      q('Opposite-end two pointers require the data to be…', ['A graph', 'Sorted', 'Hashed', 'Reversed'], 1, 'Converging pointers rely on sorted order to decide which pointer to move.'),
      q('What complexity do two pointers typically achieve vs a nested loop?', ['O(N^2)', 'O(N)', 'O(2^N)', 'O(N!)'], 1, 'A single coordinated scan turns O(N²) brute force into O(N).'),
    ],
  }],
  dp: [{
    lessonId: 'dp-tabulation', title: 'Tabulation (Bottom-Up DP)', duration: '9 min',
    explanation: [
      T('**Tabulation** builds a DP table from the smallest subproblems up, filling entries in order — no recursion.'),
      T('Define the state, the recurrence (how a state depends on smaller ones), and the base cases. Then iterate.'),
      TIP('Many DP solutions can drop to O(1) extra space by keeping only the last row/values needed.'),
    ],
    keyConcepts: ['Build the table smallest-first', 'Define state + recurrence + base case', 'No recursion / no stack overflow', 'Often space-optimizable'],
    code: {
      python: `def climb_stairs(n):
    # ways to reach step n taking 1 or 2 steps
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(climb_stairs(5))  # 8`,
      javascript: `function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}`,
    },
    quiz: [
      q('How does tabulation differ from memoization?', ['It uses recursion', 'It builds the table bottom-up, iteratively', 'It is slower always', 'It needs a hash map'], 1, 'Tabulation fills the DP table iteratively from base cases up, without recursion.'),
      q('What three things define a DP solution?', ['Loop, array, print', 'State, recurrence, base case', 'Hash, sort, search', 'Push, pop, peek'], 1, 'You define the state, how states relate (recurrence), and the base cases.'),
    ],
  }],
  // ---------------- Cloud & DevOps ----------------
  'docker-compose': [
    {
      lessonId: 'compose-services', title: 'Multi-Service Apps', duration: '8 min',
      explanation: [
        T('**Docker Compose** defines a multi-container app in one `docker-compose.yml` and starts it all with `docker compose up`.'),
        T('Each **service** is a container; Compose builds/pulls images, creates a shared network, and wires them together.'),
        TIP('`depends_on` controls start order, but use healthchecks to wait until a dependency is actually ready.'),
      ],
      keyConcepts: ['One YAML describes the whole stack', 'Each service is a container', 'Shared network by service name', 'up/down manage the lifecycle'],
      code: {
        bash: `# docker-compose.yml
services:
  web:
    build: .
    ports: ["3000:3000"]
    depends_on: [db]
    environment:
      DATABASE_URL: postgres://db:5432/app
  db:
    image: postgres:16
    volumes: ["pgdata:/var/lib/postgresql/data"]

volumes:
  pgdata:`,
      },
      quiz: [
        q('What does a single docker-compose.yml describe?', ['One container only', 'A whole multi-container app', 'A database schema', 'A CI pipeline'], 1, 'Compose defines all services, networks, and volumes for a multi-container app.'),
        q('How does the web service reach the db service?', ['By public IP', 'By the service name "db" as a hostname', 'By email', 'It cannot'], 1, 'Compose puts services on a shared network where they resolve each other by name.'),
      ],
    },
    {
      lessonId: 'compose-env-scaling', title: 'Config, Env & Scaling', duration: '7 min',
      explanation: [
        T('Keep configuration out of images: pass **environment variables** and use `.env` files so the same image runs in dev and prod.'),
        T('Scale a stateless service with `docker compose up --scale web=3`; a load balancer or reverse proxy fronts the instances.'),
        WARN('Never bake secrets into images. Inject them at runtime via env or a secrets manager.'),
      ],
      keyConcepts: ['Configure via env vars, not baked images', '.env files per environment', 'Scale stateless services with --scale', 'Keep secrets out of images'],
      code: {
        bash: `# .env
POSTGRES_PASSWORD=devsecret

# reference it in compose
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}

# scale a stateless web tier
docker compose up --scale web=3 -d`,
      },
      quiz: [
        q('Where should configuration like DB URLs live?', ['Hardcoded in the image', 'In environment variables', 'In the Dockerfile FROM line', 'In git commit messages'], 1, 'Env vars keep the same image portable across environments.'),
        q('Which services can you safely scale with --scale?', ['Stateful databases', 'Stateless services', 'Any service', 'None'], 1, 'Stateless services scale horizontally; stateful ones need special handling.'),
      ],
    },
  ],
  'docker-basics': [{
    lessonId: 'docker-run-basics', title: 'Running Containers', duration: '7 min',
    explanation: [
      T('`docker run` starts a container from an image. Flags control ports (`-p`), env (`-e`), detach (`-d`), and interactivity (`-it`).'),
      T('`docker ps` lists running containers; `docker logs` shows output; `docker exec` runs a command inside a running container.'),
      TIP('Containers are disposable — treat them as cattle, not pets. Rebuild rather than patch in place.'),
    ],
    keyConcepts: ['docker run starts from an image', '-p publishes ports, -d detaches', 'ps/logs/exec inspect containers', 'Containers are disposable'],
    code: {
      bash: `# Run nginx in the background, port 8080
docker run -d -p 8080:80 --name web nginx

docker ps                 # list running
docker logs web           # view output
docker exec -it web sh    # shell inside
docker stop web && docker rm web`,
    },
    quiz: [
      q('What does docker run -d do?', ['Deletes a container', 'Runs it detached (in the background)', 'Downloads Docker', 'Debugs the image'], 1, '-d runs the container in the background (detached).'),
      q('How do you get a shell inside a running container?', ['docker build', 'docker exec -it <name> sh', 'docker rm', 'docker pull'], 1, 'docker exec runs a command (like a shell) inside a running container.'),
    ],
  }],
  'k8s-basics': [{
    lessonId: 'k8s-pods-deployments', title: 'Pods, Deployments & Services', duration: '9 min',
    explanation: [
      T('A **Pod** is the smallest unit — one or more containers sharing a network. You rarely create Pods directly.'),
      T('A **Deployment** manages a set of identical Pods, handling rollouts, scaling, and self-healing (recreating failed Pods).'),
      T('A **Service** gives a stable network endpoint and load-balances across the Deployment’s Pods.'),
      TIP('Declare the desired state in YAML; Kubernetes continuously reconciles reality to match it.'),
    ],
    keyConcepts: ['Pod = smallest deployable unit', 'Deployment manages/heals Pods', 'Service = stable endpoint + load balancing', 'Declarative desired-state model'],
    code: {
      bash: `# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: web }
spec:
  replicas: 3
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
        - name: web
          image: nginx:1.27
          ports: [{ containerPort: 80 }]`,
    },
    quiz: [
      q('What manages a set of identical Pods and heals failures?', ['A Service', 'A Deployment', 'A Volume', 'A Namespace'], 1, 'A Deployment maintains the desired number of Pods and recreates failed ones.'),
      q('What provides a stable endpoint across Pods?', ['A Pod', 'A Service', 'A container', 'A node'], 1, 'A Service gives a stable virtual IP/DNS name and load-balances to Pods.'),
    ],
  }],
  'k8s-advanced': [{
    lessonId: 'k8s-config-scaling', title: 'ConfigMaps, Secrets & Autoscaling', duration: '9 min',
    explanation: [
      T('**ConfigMaps** hold non-secret config; **Secrets** hold sensitive values — both injected into Pods as env vars or files.'),
      T('The **Horizontal Pod Autoscaler** adds/removes Pods based on CPU or custom metrics, matching capacity to load.'),
      WARN('Kubernetes Secrets are base64-encoded, not encrypted by default — enable encryption at rest and RBAC.'),
    ],
    keyConcepts: ['ConfigMaps for config, Secrets for sensitive data', 'Inject as env vars or mounted files', 'HPA autoscales Pods on metrics', 'Secure Secrets with encryption + RBAC'],
    code: {
      bash: `# Autoscale the web deployment between 2 and 10 pods at 70% CPU
kubectl autoscale deployment web --min=2 --max=10 --cpu-percent=70

# Create a secret and reference it
kubectl create secret generic db --from-literal=password=s3cret`,
    },
    quiz: [
      q('What does the Horizontal Pod Autoscaler do?', ['Encrypts data', 'Adds/removes Pods based on load metrics', 'Deletes the cluster', 'Builds images'], 1, 'The HPA scales the number of Pods up or down based on CPU/custom metrics.'),
      q('Are Kubernetes Secrets encrypted by default?', ['Yes, always', 'No — they are only base64-encoded unless you enable encryption', 'They cannot store data', 'Only in the cloud'], 1, 'Secrets are base64 by default; enable encryption at rest and RBAC to protect them.'),
    ],
  }],
  // ---------------- AI ----------------
  'reinforcement-learning': [{
    lessonId: 'rl-q-learning', title: 'Q-Learning Basics', duration: '9 min',
    explanation: [
      T('**Reinforcement learning** trains an **agent** to maximize reward by interacting with an **environment** through states and actions.'),
      T('**Q-learning** learns a table Q(state, action) estimating future reward, updated with the Bellman equation after each step.'),
      T('The **exploration vs exploitation** trade-off (epsilon-greedy) balances trying new actions against using known-good ones.'),
      TIP('Reward shaping is powerful but risky — a poorly designed reward makes the agent game the metric.'),
    ],
    keyConcepts: ['Agent maximizes cumulative reward', 'Q(s,a) estimates future value', 'Bellman update after each step', 'Epsilon-greedy balances explore/exploit'],
    code: {
      python: `import random

def q_update(Q, s, a, r, s2, alpha=0.1, gamma=0.9):
    best_next = max(Q[s2].values()) if Q[s2] else 0
    Q[s][a] += alpha * (r + gamma * best_next - Q[s][a])

def choose(Q, s, actions, eps=0.1):
    if random.random() < eps:
        return random.choice(actions)      # explore
    return max(actions, key=lambda a: Q[s].get(a, 0))  # exploit`,
    },
    quiz: [
      q('What does Q(state, action) estimate?', ['The current reward only', 'Expected future reward of taking that action', 'The number of states', 'A probability'], 1, 'Q-values estimate the expected cumulative future reward of an action in a state.'),
      q('What does epsilon-greedy balance?', ['Speed vs memory', 'Exploration vs exploitation', 'CPU vs GPU', 'Train vs test'], 1, 'With probability epsilon the agent explores; otherwise it exploits the best-known action.'),
    ],
  }],
  'huggingface-transformers': [{
    lessonId: 'hf-pipelines', title: 'Transformers & Pipelines', duration: '8 min',
    explanation: [
      T('**Hugging Face Transformers** gives pretrained models for text, vision, and audio via a simple `pipeline` API.'),
      T('A **pipeline** bundles tokenizer + model + post-processing, so tasks like sentiment or summarization are one line.'),
      TIP('Start with a pretrained pipeline; fine-tune only when a general model is not accurate enough for your domain.'),
    ],
    keyConcepts: ['Pretrained models for many tasks', 'pipeline() bundles the full flow', 'Tokenizer + model + post-processing', 'Fine-tune only when needed'],
    code: {
      python: `from transformers import pipeline

# Sentiment analysis in one line
clf = pipeline("sentiment-analysis")
print(clf("I love how clear this lesson is!"))
# [{'label': 'POSITIVE', 'score': 0.99}]

# Summarization
summarizer = pipeline("summarization")
print(summarizer("Long article text ...", max_length=40))`,
    },
    quiz: [
      q('What does a Hugging Face pipeline bundle?', ['Only the model', 'Tokenizer + model + post-processing', 'A database', 'A web server'], 1, 'A pipeline wraps the tokenizer, model, and output processing into one call.'),
      q('When should you fine-tune instead of using a pretrained pipeline?', ['Always', 'When the general model is not accurate enough for your domain', 'Never', 'Only for images'], 1, 'Reach for fine-tuning when the off-the-shelf model underperforms on your specific data.'),
    ],
  }],
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
  console.log('Connected.\n');
  let added = 0;
  for (const [slug, lessons] of Object.entries(EXTENSIONS)) {
    const course = await Course.findOne({ slug });
    if (!course) { console.log(`  ⚠ ${slug} not found`); continue; }
    const existing = new Set(course.lessons.map((l) => l.lessonId));
    const fresh = lessons.filter((l) => !existing.has(l.lessonId));
    if (fresh.length === 0) { console.log(`  ⏭ ${slug} (already extended)`); continue; }
    course.lessons.push(...fresh);
    await course.save();
    added += fresh.length;
    console.log(`  ✓ ${slug.padEnd(26)} +${fresh.length} → ${course.lessons.length} lessons`);
  }
  console.log(`\nAdded ${added} lessons.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
