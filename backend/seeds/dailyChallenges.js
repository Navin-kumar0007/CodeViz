/**
 * 🌱 Daily Challenge seeder — populates a rotating set of daily coding
 * challenges (indexed 0..N). /api/challenges/today picks one by day-of-year.
 * Run: node seeds/dailyChallenges.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const DailyChallenge = require('../models/DailyChallenge');

const CHALLENGES = [
  {
    title: 'Sum to N', difficulty: 'easy', category: 'math',
    description: 'Print the sum of all integers from 1 to 10 (inclusive).',
    starterCode: 'total = 0\nfor i in range(1, 11):\n    total += i\nprint(total)',
    expectedOutput: '55', hints: ['Loop from 1 to 10 and accumulate.'], xpReward: 25,
  },
  {
    title: 'Nth Fibonacci', difficulty: 'easy', category: 'recursion',
    description: 'Print the 10th Fibonacci number (0-indexed: F0=0, F1=1). Answer is 55.',
    starterCode: 'def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\nprint(fib(10))',
    expectedOutput: '55', hints: ['Iterate, keeping the last two values.'], xpReward: 30,
  },
  {
    title: 'Factorial', difficulty: 'easy', category: 'math',
    description: 'Print 5! (factorial of 5).',
    starterCode: 'r = 1\nfor i in range(1, 6):\n    r *= i\nprint(r)',
    expectedOutput: '120', hints: ['Multiply 1*2*3*4*5.'], xpReward: 25,
  },
  {
    title: 'Max of List', difficulty: 'easy', category: 'arrays',
    description: 'Print the maximum of [3, 7, 2, 9, 4].',
    starterCode: 'nums = [3, 7, 2, 9, 4]\nprint(max(nums))',
    expectedOutput: '9', hints: ['Scan and track the largest.'], xpReward: 25,
  },
  {
    title: 'Reverse a String', difficulty: 'easy', category: 'strings',
    description: 'Print the reverse of the string "codeviz".',
    starterCode: 's = "codeviz"\nprint(s[::-1])',
    expectedOutput: 'zivedoc', hints: ['Slicing with a negative step reverses.'], xpReward: 25,
  },
  {
    title: 'Count Vowels', difficulty: 'medium', category: 'strings',
    description: 'Print how many vowels are in "education". Answer is 5.',
    starterCode: 's = "education"\nprint(sum(1 for c in s if c in "aeiou"))',
    expectedOutput: '5', hints: ['Check membership in "aeiou".'], xpReward: 35,
  },
  {
    title: 'Binary Search Index', difficulty: 'medium', category: 'searching',
    description: 'Print the index of 7 in the sorted list [1,3,5,7,9]. Answer is 3.',
    starterCode: 'arr = [1,3,5,7,9]\nlo, hi = 0, len(arr)-1\nwhile lo <= hi:\n    mid = (lo+hi)//2\n    if arr[mid] == 7: print(mid); break\n    elif arr[mid] < 7: lo = mid+1\n    else: hi = mid-1',
    expectedOutput: '3', hints: ['Standard binary search.'], xpReward: 40,
  },
  {
    title: 'Bubble Sort First', difficulty: 'medium', category: 'sorting',
    description: 'Sort [5,2,9,1] ascending and print the whole list.',
    starterCode: 'a = [5,2,9,1]\na.sort()\nprint(a)',
    expectedOutput: '[1, 2, 5, 9]', hints: ['Any correct sort works.'], xpReward: 35,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await DailyChallenge.deleteMany({});
    const docs = CHALLENGES.map((c, i) => ({ ...c, language: 'python', challengeIndex: i }));
    await DailyChallenge.insertMany(docs);
    console.log(`✅ Seeded ${docs.length} daily challenges.`);
    process.exit(0);
  } catch (err) {
    console.error('Daily challenge seed failed:', err.message);
    process.exit(1);
  }
}

seed();
