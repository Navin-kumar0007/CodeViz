/**
 * Web Security - Learning Path
 * Defend web apps against the most common attacks.
 */

export const WEB_SECURITY_PATH = {
    id: 'web-security',
    title: 'Web Security',
    icon: '🛡️',
    category: 'Security',
    description: 'Understand and defend against the most common web vulnerabilities — XSS, injection, and broken auth.',
    prerequisites: [],
    lessons: [
        {
            id: 'xss',
            title: 'Cross-Site Scripting (XSS)',
            duration: '7 min',
            explanation: [
                { type: 'text', content: '**XSS** happens when an app renders untrusted input as HTML, letting an attacker run JavaScript in another user’s browser — stealing sessions or data.' },
                { type: 'text', content: 'The fix: **never inject raw input into the DOM**. Escape output, and prefer safe APIs (`textContent`, React’s default escaping) over `innerHTML`.' },
                { type: 'warning', content: 'Setting `element.innerHTML = userInput` is the classic XSS bug. Treat all user input as hostile.' },
            ],
            keyConcepts: [
                'XSS runs attacker JS in a victim’s browser',
                'Caused by rendering untrusted input as HTML',
                'Escape output; avoid innerHTML with user data',
                'Frameworks like React escape by default',
            ],
            code: {
                javascript: `// ❌ Vulnerable: injects raw input as HTML
element.innerHTML = userInput;

// ✅ Safe: treats input as text, not markup
element.textContent = userInput;

// ✅ Safe in React (auto-escaped)
function Comment({ text }) {
  return <p>{text}</p>;
}`,
            },
            quiz: [
                {
                    question: 'What makes an app vulnerable to XSS?',
                    options: ['Using HTTPS', 'Rendering untrusted input as HTML', 'Hashing passwords', 'Using a database'],
                    correct: 1,
                    explanation: 'XSS occurs when untrusted input is inserted into the page as executable HTML/JS.',
                },
                {
                    question: 'Which is the safer way to show user text?',
                    options: ['element.innerHTML = input', 'element.textContent = input', 'eval(input)', 'document.write(input)'],
                    correct: 1,
                    explanation: 'textContent treats the value as plain text, so scripts do not execute.',
                },
            ],
        },
        {
            id: 'injection',
            title: 'Injection Attacks',
            duration: '8 min',
            explanation: [
                { type: 'text', content: '**Injection** (e.g. SQL injection) happens when user input is concatenated into a query, letting attackers alter its meaning — reading or destroying data.' },
                { type: 'text', content: 'The fix: **parameterized queries** (a.k.a. prepared statements). The input is sent separately from the query and can never be executed as code.' },
                { type: 'tip', content: 'The same rule applies to NoSQL, shell commands, and any interpreter: never build commands by string concatenation of user input.' },
            ],
            keyConcepts: [
                'Injection alters a query’s meaning via input',
                'Never concatenate user input into queries',
                'Use parameterized / prepared statements',
                'Validate and constrain input as defense-in-depth',
            ],
            code: {
                javascript: `// ❌ Vulnerable: input becomes part of the SQL
db.query("SELECT * FROM users WHERE name = '" + name + "'");
// name = "'; DROP TABLE users; --"  ➜ disaster

// ✅ Safe: parameterized query
db.query("SELECT * FROM users WHERE name = ?", [name]);`,
            },
            quiz: [
                {
                    question: 'How do you prevent SQL injection?',
                    options: ['Hide the error messages', 'Use parameterized queries', 'Use a longer table name', 'Disable the database'],
                    correct: 1,
                    explanation: 'Parameterized queries keep input separate from the query, so it can never run as code.',
                },
                {
                    question: 'Why is string-concatenating user input into a query dangerous?',
                    options: ['It is slow', 'Input can change the query’s meaning', 'It uses more memory', 'It is fine actually'],
                    correct: 1,
                    explanation: 'Concatenation lets crafted input become part of the executable query.',
                },
            ],
        },
        {
            id: 'auth-sessions',
            title: 'Authentication & Sessions',
            duration: '8 min',
            explanation: [
                { type: 'text', content: 'Never store passwords in plain text. **Hash** them with a slow, salted algorithm like **bcrypt** so a database leak does not reveal them.' },
                { type: 'text', content: 'After login, identify users with a **session cookie** or **JWT**. Mark cookies `HttpOnly` and `Secure` so JavaScript and network sniffers can’t steal them.' },
                { type: 'text', content: '**CSRF** tricks a logged-in user’s browser into making an unwanted request. Defend with CSRF tokens or `SameSite` cookies.' },
                { type: 'warning', content: 'A leaked plain-text password database is catastrophic. Always hash + salt.' },
            ],
            keyConcepts: [
                'Hash + salt passwords (e.g. bcrypt) — never store plaintext',
                'Use HttpOnly, Secure cookies for sessions',
                'JWTs must be signed and verified server-side',
                'Defend CSRF with tokens or SameSite cookies',
            ],
            code: {
                javascript: `const bcrypt = require("bcrypt");

// Register: store only the hash
const hash = await bcrypt.hash(password, 12);

// Login: compare, never decrypt
const ok = await bcrypt.compare(input, hash);

// Set a secure session cookie
res.cookie("token", jwt, {
  httpOnly: true,
  secure: true,
  sameSite: "strict"
});`,
            },
            quiz: [
                {
                    question: 'How should passwords be stored?',
                    options: ['As plain text', 'Salted and hashed (e.g. bcrypt)', 'In a cookie', 'Base64 encoded'],
                    correct: 1,
                    explanation: 'Salted, slow hashing means a leaked database does not expose real passwords.',
                },
                {
                    question: 'What does the HttpOnly cookie flag do?',
                    options: ['Speeds up the site', 'Blocks JavaScript from reading the cookie', 'Encrypts the whole page', 'Disables cookies'],
                    correct: 1,
                    explanation: 'HttpOnly prevents client-side JS from accessing the cookie, mitigating token theft via XSS.',
                },
            ],
        },
    ],
};
