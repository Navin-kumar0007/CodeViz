/**
 * React Essentials - Learning Path
 * Modern React with function components and hooks.
 */

export const REACT_PATH = {
    id: 'react',
    title: 'React Essentials',
    icon: '⚛️',
    category: 'Web Development',
    description: 'Build interactive UIs with modern React — components, JSX, props, state, and hooks.',
    prerequisites: [],
    lessons: [
        {
            id: 'components-jsx',
            title: 'Components & JSX',
            duration: '7 min',
            explanation: [
                { type: 'text', content: 'A **React component** is a JavaScript function that returns UI. React calls your function and renders whatever it returns to the screen.' },
                { type: 'text', content: '**JSX** lets you write HTML-like markup inside JavaScript. It is not a string — it compiles to function calls that create elements.' },
                { type: 'tip', content: 'Component names must start with a Capital letter. `<Button />` is a component; `<button />` is a plain HTML tag.' },
            ],
            keyConcepts: [
                'Components are functions that return JSX',
                'JSX must return a single root element (use a fragment <>…</> to group)',
                'Use {curly braces} to embed JavaScript expressions in JSX',
                'Reuse components to compose bigger UIs',
            ],
            code: {
                javascript: `// A simple React component
function Welcome() {
  const name = "Ada";
  return (
    <div className="card">
      <h1>Hello, {name}!</h1>
      <p>Welcome to React.</p>
    </div>
  );
}

// Composing components
function App() {
  return (
    <>
      <Welcome />
      <Welcome />
    </>
  );
}`,
                typescript: `// A typed React component
function Welcome(): JSX.Element {
  const name: string = "Ada";
  return (
    <div className="card">
      <h1>Hello, {name}!</h1>
      <p>Welcome to React.</p>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <>
      <Welcome />
      <Welcome />
    </>
  );
}`,
            },
            quiz: [
                {
                    question: 'What does a React function component return?',
                    options: ['A string of HTML', 'JSX describing the UI', 'A CSS file', 'A database row'],
                    correct: 1,
                    explanation: 'A component returns JSX, which React turns into real DOM elements.',
                },
                {
                    question: 'How do you embed a JavaScript value inside JSX?',
                    options: ['With {curly braces}', 'With [square brackets]', 'With $dollar signs', 'With "quotes"'],
                    correct: 0,
                    explanation: 'Curly braces let you drop any JavaScript expression into JSX, e.g. {name}.',
                },
            ],
        },
        {
            id: 'props-state',
            title: 'Props & State',
            duration: '8 min',
            explanation: [
                { type: 'text', content: '**Props** pass data from a parent to a child component. They are read-only — a component never changes its own props.' },
                { type: 'text', content: '**State** is data a component owns and can change over time. The `useState` hook gives you a value and a setter; calling the setter re-renders the component.' },
                { type: 'warning', content: 'Never mutate state directly (e.g. `count++`). Always call the setter (`setCount(count + 1)`) so React knows to re-render.' },
            ],
            keyConcepts: [
                'Props flow down (parent → child) and are read-only',
                'useState returns [value, setValue]',
                'Calling the setter triggers a re-render',
                'State is local to the component that declares it',
            ],
            code: {
                javascript: `import { useState } from "react";

// Props: greeting is passed in by the parent
function Greeting({ greeting }) {
  return <p>{greeting}</p>;
}

// State: the counter owns and updates "count"
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Greeting greeting="Click the button!" />
      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}`,
                typescript: `import { useState } from "react";

function Greeting({ greeting }: { greeting: string }) {
  return <p>{greeting}</p>;
}

function Counter() {
  const [count, setCount] = useState<number>(0);
  return (
    <div>
      <Greeting greeting="Click the button!" />
      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}`,
            },
            quiz: [
                {
                    question: 'Which statement about props is true?',
                    options: ['A component can freely change its props', 'Props are read-only', 'Props only hold numbers', 'Props are stored in a database'],
                    correct: 1,
                    explanation: 'Props are read-only inputs passed from the parent; a component never mutates them.',
                },
                {
                    question: 'What happens when you call a useState setter?',
                    options: ['Nothing until refresh', 'The component re-renders with the new value', 'The page reloads', 'It throws an error'],
                    correct: 1,
                    explanation: 'Calling the setter updates state and schedules a re-render.',
                },
            ],
        },
        {
            id: 'effects-lists',
            title: 'Effects & Rendering Lists',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'The **useEffect** hook runs code after render — for side effects like fetching data, subscriptions, or timers.' },
                { type: 'text', content: 'The dependency array controls when it runs: `[]` = once on mount; `[x]` = whenever `x` changes; omitted = after every render.' },
                { type: 'text', content: 'Render lists by mapping an array to JSX. Each item needs a stable, unique **key** so React can track changes efficiently.' },
                { type: 'tip', content: 'Return a cleanup function from useEffect (e.g. clearInterval) to avoid leaks.' },
            ],
            keyConcepts: [
                'useEffect runs side effects after render',
                'The dependency array controls how often it runs',
                'Map arrays to JSX to render lists',
                'Every list item needs a unique key prop',
            ],
            code: {
                javascript: `import { useState, useEffect } from "react";

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id); // cleanup
  }, []); // run once on mount

  return <p>{time.toLocaleTimeString()}</p>;
}

function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  );
}`,
                typescript: `import { useState, useEffect } from "react";

function Clock() {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{time.toLocaleTimeString()}</p>;
}

type Todo = { id: number; text: string };
function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  );
}`,
            },
            quiz: [
                {
                    question: 'When does useEffect with an empty dependency array [] run?',
                    options: ['After every render', 'Once, after the first render (mount)', 'Never', 'Only on unmount'],
                    correct: 1,
                    explanation: 'An empty array means the effect runs a single time when the component mounts.',
                },
                {
                    question: 'Why does each item in a rendered list need a key?',
                    options: ['For styling', 'So React can efficiently track which items changed', 'It is optional decoration', 'To sort the list'],
                    correct: 1,
                    explanation: 'Keys give each element a stable identity so React updates the DOM efficiently.',
                },
            ],
        },
    ],
};
