/**
 * Modern JavaScript - Learning Path
 * The language features that power modern web apps.
 */

export const MODERN_JS_PATH = {
    id: 'modern-javascript',
    title: 'Modern JavaScript',
    icon: '🟨',
    category: 'Web Development',
    description: 'Master the modern JS you use every day — scope, async/await, and functional array methods.',
    prerequisites: [],
    lessons: [
        {
            id: 'scope-closures',
            title: 'Variables, Scope & Closures',
            duration: '7 min',
            explanation: [
                { type: 'text', content: 'Use **let** and **const** (not `var`). `const` cannot be reassigned; `let` can. Both are **block-scoped** — they exist only inside the `{}` they are declared in.' },
                { type: 'text', content: 'A **closure** is a function that remembers variables from where it was created, even after that outer function has returned. It powers callbacks and private state.' },
                { type: 'warning', content: 'Avoid `var` — it is function-scoped and leaks out of blocks, causing subtle bugs.' },
            ],
            keyConcepts: [
                'const = no reassignment; let = reassignable',
                'let/const are block-scoped',
                'A closure remembers its outer variables',
                'Closures enable private state and factories',
            ],
            code: {
                javascript: `// Closure: makeCounter returns a function that
// "remembers" its own private count.
function makeCounter() {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
}

const next = makeCounter();
console.log(next()); // 1
console.log(next()); // 2`,
                typescript: `function makeCounter(): () => number {
  let count = 0;
  return (): number => {
    count += 1;
    return count;
  };
}

const next = makeCounter();
console.log(next()); // 1
console.log(next()); // 2`,
            },
            quiz: [
                {
                    question: 'Which keyword declares a value that cannot be reassigned?',
                    options: ['var', 'let', 'const', 'def'],
                    correct: 2,
                    explanation: 'const creates a binding that cannot be reassigned (though objects it holds can still mutate).',
                },
                {
                    question: 'What is a closure?',
                    options: ['A closed browser tab', 'A function that remembers variables from where it was created', 'A type of loop', 'A CSS rule'],
                    correct: 1,
                    explanation: 'A closure captures and remembers variables from its enclosing scope.',
                },
            ],
        },
        {
            id: 'async-await',
            title: 'Promises & async/await',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'JavaScript is single-threaded, so slow work (network, timers) is **asynchronous**. A **Promise** represents a value that will arrive later.' },
                { type: 'text', content: '**async/await** lets you write async code that reads like synchronous code. `await` pauses until a Promise resolves.' },
                { type: 'text', content: 'Wrap awaits in **try/catch** to handle errors (a rejected Promise throws).' },
                { type: 'tip', content: 'An async function always returns a Promise, even if you return a plain value.' },
            ],
            keyConcepts: [
                'A Promise is a future value (pending → fulfilled/rejected)',
                'await pauses until the Promise settles',
                'async functions always return a Promise',
                'Handle errors with try/catch around await',
            ],
            code: {
                javascript: `async function getUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    const user = await res.json();
    return user;
  } catch (err) {
    console.error("Failed to load user:", err);
    return null;
  }
}

getUser(1).then((u) => console.log(u));`,
                typescript: `async function getUser(id: number): Promise<unknown> {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    return await res.json();
  } catch (err) {
    console.error("Failed to load user:", err);
    return null;
  }
}`,
            },
            quiz: [
                {
                    question: 'What does await do?',
                    options: ['Deletes a Promise', 'Pauses until the Promise settles and returns its value', 'Creates a loop', 'Blocks all other tabs'],
                    correct: 1,
                    explanation: 'await suspends the async function until the awaited Promise resolves, then yields its value.',
                },
                {
                    question: 'What does an async function always return?',
                    options: ['undefined', 'A Promise', 'A string', 'Nothing'],
                    correct: 1,
                    explanation: 'async functions wrap their return value in a Promise automatically.',
                },
            ],
        },
        {
            id: 'array-methods',
            title: 'Functional Array Methods',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'Modern JS favors **declarative** array methods over manual loops. **map** transforms each item, **filter** keeps items that pass a test, **reduce** folds an array into one value.' },
                { type: 'text', content: 'These methods return new arrays (map/filter) without mutating the original — safer and easier to reason about.' },
                { type: 'tip', content: 'Chain them: `nums.filter(isEven).map(double)` reads top-to-bottom like a pipeline.' },
            ],
            keyConcepts: [
                'map transforms every element into a new array',
                'filter keeps elements passing a predicate',
                'reduce accumulates elements into a single value',
                'These methods do not mutate the original array',
            ],
            code: {
                javascript: `const nums = [1, 2, 3, 4, 5, 6];

const evens = nums.filter((n) => n % 2 === 0);   // [2,4,6]
const doubled = evens.map((n) => n * 2);          // [4,8,12]
const total = doubled.reduce((sum, n) => sum + n, 0); // 24

console.log(evens, doubled, total);`,
                typescript: `const nums: number[] = [1, 2, 3, 4, 5, 6];

const evens = nums.filter((n) => n % 2 === 0);
const doubled = evens.map((n) => n * 2);
const total = doubled.reduce((sum, n) => sum + n, 0);

console.log(evens, doubled, total);`,
            },
            quiz: [
                {
                    question: 'Which method folds an array into a single value?',
                    options: ['map', 'filter', 'reduce', 'forEach'],
                    correct: 2,
                    explanation: 'reduce accumulates elements into one result using an accumulator.',
                },
                {
                    question: 'What does map return?',
                    options: ['The same array mutated', 'A new array of transformed items', 'A single number', 'Nothing'],
                    correct: 1,
                    explanation: 'map returns a new array where each element is the result of the callback.',
                },
            ],
        },
    ],
};
