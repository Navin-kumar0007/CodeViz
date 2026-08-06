/**
 * HTML & CSS - Learning Path
 * The foundation of every web page.
 */

export const HTML_CSS_PATH = {
    id: 'html-css',
    title: 'HTML & CSS',
    icon: '🎨',
    category: 'Web Development',
    description: 'Structure content with HTML and style it with modern CSS — from tags to responsive layouts.',
    prerequisites: [],
    lessons: [
        {
            id: 'html-structure',
            title: 'HTML Structure',
            duration: '6 min',
            explanation: [
                { type: 'text', content: '**HTML** describes the structure of a page using **elements** wrapped in tags, like `<p>text</p>`. The browser renders these into what you see.' },
                { type: 'text', content: 'Use semantic tags — `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>` — so the meaning is clear to browsers, search engines, and screen readers.' },
                { type: 'tip', content: 'Every page starts with `<!DOCTYPE html>` and wraps content in `<html>`, `<head>` (metadata) and `<body>` (visible content).' },
            ],
            keyConcepts: [
                'Elements are defined by tags: <tag>content</tag>',
                'Attributes add info: <a href="...">',
                'Semantic tags describe meaning, not just looks',
                'head holds metadata; body holds visible content',
            ],
            code: {
                html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Page</title>
  </head>
  <body>
    <header><h1>Welcome</h1></header>
    <main>
      <article>
        <p>Hello, <a href="/about">learn more</a>.</p>
      </article>
    </main>
  </body>
</html>`,
            },
            quiz: [
                {
                    question: 'What do semantic tags like <nav> and <article> provide?',
                    options: ['Faster internet', 'Meaning that helps browsers, SEO, and screen readers', 'Automatic styling', 'A database'],
                    correct: 1,
                    explanation: 'Semantic elements communicate structure and meaning, improving accessibility and SEO.',
                },
                {
                    question: 'Which section holds page metadata like the title and charset?',
                    options: ['<body>', '<head>', '<footer>', '<main>'],
                    correct: 1,
                    explanation: 'The <head> holds metadata; the <body> holds the visible content.',
                },
            ],
        },
        {
            id: 'css-styling',
            title: 'Styling with CSS',
            duration: '7 min',
            explanation: [
                { type: 'text', content: '**CSS** styles HTML. A rule targets elements with a **selector** and sets **properties**: `p { color: blue; }`.' },
                { type: 'text', content: 'Select by tag (`p`), class (`.card`), or id (`#hero`). Classes are the workhorse — reusable across many elements.' },
                { type: 'text', content: 'The **box model** wraps every element: content → padding → border → margin. Understanding it is key to spacing.' },
            ],
            keyConcepts: [
                'A rule = selector + { property: value; }',
                'Target by tag, .class, or #id',
                'The box model: content, padding, border, margin',
                'Later, more specific rules override earlier ones',
            ],
            code: {
                css: `/* Selector + properties */
.card {
  color: #1a1a1a;
  background: #fff;
  padding: 16px;          /* space inside the border */
  border: 1px solid #ddd;
  margin: 12px;           /* space outside the border */
  border-radius: 8px;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}`,
            },
            quiz: [
                {
                    question: 'Which selector targets elements with class="card"?',
                    options: ['#card', '.card', 'card', '*card'],
                    correct: 1,
                    explanation: 'A leading dot (.card) selects by class; a hash (#) selects by id.',
                },
                {
                    question: 'In the box model, what is the order from inside out?',
                    options: ['margin, border, padding, content', 'content, padding, border, margin', 'border, content, margin, padding', 'padding, content, margin, border'],
                    correct: 1,
                    explanation: 'It goes content → padding → border → margin, from the inside out.',
                },
            ],
        },
        {
            id: 'responsive-layout',
            title: 'Responsive Layouts',
            duration: '8 min',
            explanation: [
                { type: 'text', content: '**Flexbox** lays out items in a row or column with easy alignment and spacing — ideal for navbars, cards, and toolbars.' },
                { type: 'text', content: '**Media queries** apply styles only at certain screen sizes, so a layout adapts from mobile to desktop.' },
                { type: 'tip', content: 'Design mobile-first: write the base styles for small screens, then add media queries for larger ones.' },
            ],
            keyConcepts: [
                'display: flex lays children in a flexible row/column',
                'justify-content and align-items position items',
                'gap adds consistent spacing between items',
                'Media queries adapt styles to screen width',
            ],
            code: {
                css: `.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

/* Stack the nav on small screens */
@media (max-width: 600px) {
  .nav {
    flex-direction: column;
    align-items: stretch;
  }
}`,
            },
            quiz: [
                {
                    question: 'What does display: flex enable?',
                    options: ['A database connection', 'Flexible row/column layout with alignment control', 'Animations only', 'Server rendering'],
                    correct: 1,
                    explanation: 'Flexbox arranges children in a flexible line with powerful alignment and spacing.',
                },
                {
                    question: 'What is a media query used for?',
                    options: ['Playing videos', 'Applying styles at specific screen sizes', 'Fetching data', 'Compressing images'],
                    correct: 1,
                    explanation: 'Media queries let you apply CSS conditionally based on viewport size, enabling responsive design.',
                },
            ],
        },
    ],
};
