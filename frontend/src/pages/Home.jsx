import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';

/* ────────────────────────  HOME PAGE  ──────────────────────── */
const Home = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('userInfo');

    return (
        <div style={s.page}>
            {/* Sticky Nav */}
            <nav style={s.nav}>
                <span style={s.logo}>{'{'} <span style={s.logoAccent}>CodeViz</span> {'}'}</span>
                <div style={s.navLinks}>
                    <a href="#features" style={s.navLink}>Features</a>
                    <a href="#demo" style={s.navLink}>Try It</a>
                    <a href="#path" style={s.navLink}>Courses</a>
                    <a href="#compare" style={s.navLink}>Why Us</a>
                    {isLoggedIn ? (
                        <button onClick={() => navigate('/')} style={s.navBtn}>Go to Dashboard →</button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} style={s.navLinkBtn}>Sign In</button>
                            <button onClick={() => navigate('/signup')} style={s.navBtn}>Get Started Free</button>
                        </>
                    )}
                </div>
            </nav>

            {/* ── Section 1: Hero ── */}
            <section style={s.hero}>
                <Motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={s.heroText}>
                    <div style={s.badge}>{'>'} Learn DSA • Visualize Algorithms • Build Skills</div>
                    <h1 style={s.h1}>
                        See Your Code<br />
                        <span style={s.gradient}>Come Alive</span>
                        <span className="cursor-blink">_</span>
                    </h1>
                    <p style={s.sub}>
                        The only platform that lets you <strong>watch algorithms execute step-by-step</strong>,
                        learn with an AI tutor, and practice in 4 languages — all in one place.
                    </p>
                    <div style={s.langRow}>
                        {['Python', 'JavaScript', 'Java', 'C++'].map((l, i) => (
                            <Motion.span key={l} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }} style={s.pill}>{l}</Motion.span>
                        ))}
                    </div>
                    <div style={s.ctaRow}>
                        {isLoggedIn ? (
                            <Motion.button onClick={() => navigate('/')} style={s.primary} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                Open Dashboard →
                            </Motion.button>
                        ) : (
                            <>
                                <Motion.button onClick={() => navigate('/signup')} style={s.primary} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    🚀 Start Learning — Free
                                </Motion.button>
                                <Motion.button onClick={() => navigate('/login')} style={s.secondary} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    Sign In →
                                </Motion.button>
                            </>
                        )}
                    </div>
                </Motion.div>

                <Motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={s.codeWin}>
                    <div style={s.codeBar}>
                        <span style={{ ...s.dot, background: '#E06C75' }} />
                        <span style={{ ...s.dot, background: '#E5C07B' }} />
                        <span style={{ ...s.dot, background: '#98C379' }} />
                        <span style={s.codeFile}>bubble_sort.py</span>
                    </div>
                    <pre style={s.code}>{`def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`}</pre>
                    <div style={s.codeOut}>
                        <span style={{ color: 'var(--accent-green)' }}>✓ Visualize each swap!</span><br />
                        <span style={{ color: 'var(--text-muted)' }}>{'>'} Output: [12, 22, 25, 34, 64]</span>
                    </div>
                </Motion.div>
            </section>

            {/* ── Section 2: How It Works ── */}
            <section style={{ ...s.section, background: 'var(--bg-secondary)' }}>
                <h2 style={s.h2}>How It Works</h2>
                <p style={s.sectionSub}>Three steps to master Data Structures & Algorithms</p>
                <div style={s.stepsRow}>
                    {[
                        { num: '01', icon: '📖', title: 'Learn the Concept', desc: 'Read visual explanations with syntax-highlighted code in your preferred language. Every topic breaks down the "why" before the "how".', color: 'var(--accent-blue)' },
                        { num: '02', icon: '🧪', title: 'Watch It Execute', desc: 'See algorithms run step-by-step with animated visualizations. Watch variables change, pointers move, and stacks grow in real-time.', color: 'var(--accent-green)' },
                        { num: '03', icon: '🏆', title: 'Prove Your Skills', desc: 'Solve tricky quizzes, edge-case problems, and output-prediction questions. Earn XP, maintain streaks, and climb the leaderboard.', color: 'var(--accent-purple)' },
                    ].map((step, i) => (
                        <Motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} style={s.stepCard}>
                            <div style={{ ...s.stepNum, color: step.color }}>{step.num}</div>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{step.icon}</div>
                            <h3 style={{ ...s.h3, color: step.color }}>{step.title}</h3>
                            <p style={s.cardDesc}>{step.desc}</p>
                        </Motion.div>
                    ))}
                </div>
            </section>

            {/* ── Section 3: Interactive Demo ── */}
            <section id="demo" style={s.section}>
                <h2 style={s.h2}>Try It Right Now — No Signup Needed</h2>
                <p style={s.sectionSub}>Pick an algorithm and watch it sort in real-time</p>
                <LiveSortDemo />
            </section>

            {/* ── Section 4: Features ── */}
            <section id="features" style={{ ...s.section, background: 'var(--bg-secondary)' }}>
                <h2 style={s.h2}>Everything You Need to Master Coding</h2>
                <div style={s.featGrid}>
                    {[
                        { icon: '🔬', title: 'Live Visualization', desc: 'Watch variables, stacks, and memory change step-by-step as your code runs — not just output, the entire process.', color: 'var(--accent-blue)' },
                        { icon: '🎓', title: 'Structured Courses', desc: 'Beginner to Advanced — carefully ordered topics with prerequisites so you never feel lost.', color: 'var(--accent-green)' },
                        { icon: '🤖', title: 'AI Tutor', desc: 'Stuck? Ask the AI tutor anything. It adapts explanations to your level — no more generic answers.', color: 'var(--accent-yellow)' },
                        { icon: '🎮', title: 'XP & Streaks', desc: 'Daily check-ins, XP rewards, streak tracking, and a competitive leaderboard to keep you motivated.', color: 'var(--accent-red)' },
                        { icon: '👥', title: 'Collab Rooms', desc: 'Code together in real-time with shared editors, live cursors, and instant chat.', color: 'var(--accent-cyan)' },
                        { icon: '🏫', title: 'Live Classrooms', desc: 'Instructors can host live sessions, assign quizzes, and track student progress with analytics.', color: 'var(--accent-purple)' },
                    ].map((f, i) => (
                        <Motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={s.featCard}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.boxShadow = `0 0 20px ${f.color}22`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
                            <h3 style={{ ...s.h3, color: f.color }}>{f.title}</h3>
                            <p style={s.cardDesc}>{f.desc}</p>
                        </Motion.div>
                    ))}
                </div>
            </section>

            {/* ── Section 5: Learning Path ── */}
            <section id="path" style={s.section}>
                <h2 style={s.h2}>Your Learning Journey</h2>
                <p style={s.sectionSub}>A structured roadmap from beginner to interview-ready</p>
                <div style={s.pathContainer}>
                    {[
                        { name: 'Basics', icon: '📦', level: 'Beginner', color: 'var(--accent-green)' },
                        { name: 'Arrays', icon: '📊', level: 'Beginner', color: 'var(--accent-green)' },
                        { name: 'Strings', icon: '📝', level: 'Beginner', color: 'var(--accent-green)' },
                        { name: 'Searching', icon: '🔍', level: 'Intermediate', color: 'var(--accent-yellow)' },
                        { name: 'Sorting', icon: '📈', level: 'Intermediate', color: 'var(--accent-yellow)' },
                        { name: 'Recursion', icon: '🔄', level: 'Intermediate', color: 'var(--accent-yellow)' },
                        { name: 'Hash Maps', icon: '🗂️', level: 'Intermediate', color: 'var(--accent-yellow)' },
                        { name: 'Stacks', icon: '📚', level: 'Advanced', color: 'var(--accent-red)' },
                        { name: 'Linked Lists', icon: '🔗', level: 'Advanced', color: 'var(--accent-red)' },
                        { name: 'Queues', icon: '🚶', level: 'Advanced', color: 'var(--accent-red)' },
                    ].map((c, i) => (
                        <Motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} style={s.pathNode}>
                            <div style={s.pathIcon}>{c.icon}</div>
                            <div style={s.pathName}>{c.name}</div>
                            <div style={{ ...s.pathBadge, background: `${c.color}20`, color: c.color, borderColor: `${c.color}40` }}>{c.level}</div>
                            {i < 9 && <div style={s.pathArrow}>→</div>}
                        </Motion.div>
                    ))}
                </div>
            </section>

            {/* ── Section 6: Why CodeViz vs Others ── */}
            <section id="compare" style={{ ...s.section, background: 'var(--bg-secondary)' }}>
                <h2 style={s.h2}>Why CodeViz?</h2>
                <p style={s.sectionSub}>See how we compare to other learning platforms</p>
                <div style={s.tableWrap}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>Feature</th>
                                <th style={{ ...s.th, color: 'var(--accent-blue)' }}>CodeViz</th>
                                <th style={s.th}>LeetCode</th>
                                <th style={s.th}>HackerRank</th>
                                <th style={s.th}>Codecademy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Step-by-step Visualization', '✅', '❌', '❌', '❌'],
                                ['AI Tutor', '✅', '🔒 Premium', '❌', '🔒 Premium'],
                                ['Multi-language (4+)', '✅', '✅', '✅', '❌'],
                                ['Real-time Collab Rooms', '✅', '❌', '❌', '❌'],
                                ['Live Classrooms', '✅', '❌', '❌', '❌'],
                                ['Gamification (XP/Streaks)', '✅', '✅', '✅', '❌'],
                                ['Free & Open Source', '✅', '❌', '❌', '❌'],
                                ['Tricky Edge-Case Quizzes', '✅', '❌', '❌', '❌'],
                            ].map((row, i) => (
                                <tr key={i} style={i % 2 === 0 ? { background: 'var(--bg-surface)' } : {}}>
                                    <td style={s.td}>{row[0]}</td>
                                    <td style={{ ...s.td, fontWeight: 600 }}>{row[1]}</td>
                                    <td style={s.td}>{row[2]}</td>
                                    <td style={s.td}>{row[3]}</td>
                                    <td style={s.td}>{row[4]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── Section 7: Interactive Quiz Teaser ── */}
            <section style={s.section}>
                <h2 style={s.h2}>Think You Know DSA? Try This!</h2>
                <p style={s.sectionSub}>A taste of the tricky questions you'll find inside</p>
                <QuizTeaser />
            </section>

            {/* ── Section 8: Multi-Language Code ── */}
            <section style={{ ...s.section, background: 'var(--bg-secondary)' }}>
                <h2 style={s.h2}>Write Once, Learn in 4 Languages</h2>
                <p style={s.sectionSub}>Every lesson shows code in Python, JavaScript, Java & C++ side-by-side</p>
                <MultiLangPreview />
            </section>

            {/* ── Section 9: Stats + Final CTA ── */}
            <section style={s.section}>
                <div style={s.statsGrid}>
                    {[
                        { icon: '🎓', num: '10', label: 'Structured Courses', detail: 'Beginner → Advanced' },
                        { icon: '🌐', num: '4', label: 'Languages', detail: 'Python, JS, Java, C++' },
                        { icon: '🧠', num: '240+', label: 'Quiz Questions', detail: 'Including tricky edge cases' },
                        { icon: '⚡', num: '∞', label: 'Practice Sessions', detail: 'Unlimited code execution' },
                    ].map((stat, i) => (
                        <Motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={s.statCard}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                            <div style={s.statNum}>{stat.num}</div>
                            <div style={s.statLabel}>{stat.label}</div>
                            <div style={s.statDetail}>{stat.detail}</div>
                        </Motion.div>
                    ))}
                </div>
                <div style={s.finalCTA}>
                    <h2 style={s.h2}>Ready to See Your Code Come Alive?</h2>
                    <p style={{ ...s.sectionSub, marginBottom: '24px' }}>Join thousands of developers mastering DSA the visual way</p>
                    {isLoggedIn ? (
                        <Motion.button onClick={() => navigate('/')} style={{ ...s.primary, fontSize: '18px', padding: '16px 40px' }} whileHover={{ scale: 1.05 }}>
                            Go to Dashboard →
                        </Motion.button>
                    ) : (
                        <div style={s.ctaRow}>
                            <Motion.button onClick={() => navigate('/signup')} style={{ ...s.primary, fontSize: '18px', padding: '16px 40px' }} whileHover={{ scale: 1.05 }}>
                                🚀 Start Learning — It's Free
                            </Motion.button>
                            <Motion.button onClick={() => navigate('/login')} style={{ ...s.secondary, fontSize: '16px', padding: '14px 30px' }} whileHover={{ scale: 1.05 }}>
                                Already have an account? Sign In
                            </Motion.button>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer style={s.footer}>
                <span style={s.logo}>{'{'} <span style={s.logoAccent}>CodeViz</span> {'}'}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-code)' }}>
                    © 2026 CodeViz — Learn DSA Visually
                </span>
            </footer>
        </div>
    );
};

/* ───────── Sub-Component: Live Sort Demo ───────── */
const LiveSortDemo = () => {
    const [arr, setArr] = useState([64, 34, 25, 12, 22, 11, 90, 45]);
    const [sorting, setSorting] = useState(false);
    const [activeIdx, setActiveIdx] = useState([-1, -1]);
    const [sorted, setSorted] = useState(false);
    const [algo, setAlgo] = useState('bubble');
    const timeouts = useRef([]);

    const reset = () => {
        timeouts.current.forEach(clearTimeout);
        setArr(Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10));
        setSorting(false);
        setSorted(false);
        setActiveIdx([-1, -1]);
    };

    const runSort = () => {
        setSorting(true);
        setSorted(false);
        const a = [...arr];
        const steps = [];

        if (algo === 'bubble') {
            for (let i = 0; i < a.length; i++)
                for (let j = 0; j < a.length - i - 1; j++) {
                    steps.push({ i: j, j: j + 1, arr: [...a] });
                    if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; steps.push({ i: j, j: j + 1, arr: [...a] }); }
                }
        } else {
            for (let i = 1; i < a.length; i++) {
                let key = a[i], j = i - 1;
                while (j >= 0 && a[j] > key) { steps.push({ i: j, j: j + 1, arr: [...a] }); a[j + 1] = a[j]; j--; }
                a[j + 1] = key;
                steps.push({ i: j + 1, j: i, arr: [...a] });
            }
        }

        steps.forEach((step, idx) => {
            const t = setTimeout(() => {
                setArr(step.arr);
                setActiveIdx([step.i, step.j]);
                if (idx === steps.length - 1) setTimeout(() => { setSorting(false); setSorted(true); setActiveIdx([-1, -1]); }, 200);
            }, idx * 100);
            timeouts.current.push(t);
        });
    };

    const maxVal = Math.max(...arr);
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                {['bubble', 'insertion'].map(a => (
                    <button key={a} onClick={() => { if (!sorting) setAlgo(a); }} style={{ ...s.algoTab, ...(algo === a ? s.algoTabActive : {}) }}>
                        {a === 'bubble' ? 'Bubble Sort' : 'Insertion Sort'}
                    </button>
                ))}
            </div>
            <div style={s.barContainer}>
                {arr.map((val, i) => (
                    <div key={i} style={{
                        width: '40px', height: `${(val / maxVal) * 180}px`,
                        background: activeIdx.includes(i) ? 'var(--accent-red)' : sorted ? 'var(--accent-green)' : 'var(--accent-blue)',
                        borderRadius: '4px 4px 0 0', transition: 'all 100ms ease',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px',
                        fontSize: '11px', fontFamily: 'var(--font-code)', color: '#fff', fontWeight: 600,
                    }}>{val}</div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                <button onClick={runSort} disabled={sorting} style={{ ...s.primary, opacity: sorting ? 0.5 : 1, padding: '10px 24px', fontSize: '14px' }}>
                    {sorting ? '⏳ Sorting...' : '▶ Run'}
                </button>
                <button onClick={reset} style={{ ...s.secondary, padding: '10px 24px', fontSize: '14px' }}>🔄 Randomize</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '10px', fontFamily: 'var(--font-code)' }}>
                {sorted ? '✅ Sorted! Click Randomize to try again' : `Watch ${algo === 'bubble' ? 'Bubble' : 'Insertion'} Sort in action — compare both!`}
            </p>
        </div>
    );
};

/* ───────── Sub-Component: Quiz Teaser ───────── */
const QuizTeaser = () => {
    const questions = [
        { q: 'What does this Python code print?\narr = [1, 2, 3]\narr.append([4, 5])\nprint(len(arr))', opts: ['3', '4', '5', 'Error'], ans: 1, why: 'append() adds [4,5] as a single element — so arr = [1, 2, 3, [4, 5]], length = 4.' },
        { q: 'What is the time complexity of Binary Search?', opts: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], ans: 1, why: 'Binary Search halves the search space each step — O(log n).' },
        { q: 'In JavaScript, what does [10, 9, 8].sort() return?', opts: ['[8, 9, 10]', '[10, 9, 8]', '[10, 8, 9]', 'Error'], ans: 2, why: 'JS sort() converts to strings by default: "10" < "8" < "9" lexicographically → [10, 8, 9].' },
    ];
    const [idx, setIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const q = questions[idx];

    const next = () => { setIdx((idx + 1) % questions.length); setSelected(null); };

    return (
        <div style={s.quizCard}>
            <div style={s.quizQ}>
                <pre style={{ margin: 0, fontFamily: 'var(--font-code)', fontSize: '14px', whiteSpace: 'pre-wrap', color: 'var(--text-bright)', lineHeight: 1.6 }}>{q.q}</pre>
            </div>
            <div style={s.quizOpts}>
                {q.opts.map((opt, i) => (
                    <button key={i} onClick={() => setSelected(i)} style={{
                        ...s.quizOpt,
                        borderColor: selected === null ? 'var(--border-color)' : i === q.ans ? 'var(--accent-green)' : selected === i ? 'var(--accent-red)' : 'var(--border-color)',
                        background: selected === null ? 'var(--bg-surface)' : i === q.ans ? 'rgba(152,195,121,0.1)' : selected === i ? 'rgba(224,108,117,0.1)' : 'var(--bg-surface)',
                    }}>
                        <span style={s.quizOptLetter}>{String.fromCharCode(65 + i)}</span> {opt}
                    </button>
                ))}
            </div>
            {selected !== null && (
                <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={s.quizExplain}>
                    <span style={{ color: selected === q.ans ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                        {selected === q.ans ? '✅ Correct!' : '❌ Not quite.'}
                    </span>{' '}
                    {q.why}
                    <br />
                    <button onClick={next} style={{ ...s.primary, marginTop: '12px', padding: '8px 20px', fontSize: '13px' }}>Next Question →</button>
                </Motion.div>
            )}
        </div>
    );
};

/* ───────── Sub-Component: Multi-Language Preview ───────── */
const MultiLangPreview = () => {
    const [lang, setLang] = useState('python');
    const snippets = {
        python: `# Python - Binary Search
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
        javascript: `// JavaScript - Binary Search
function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
        java: `// Java - Binary Search
public static int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
        cpp: `// C++ - Binary Search
int binarySearch(vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    };
    const labels = { python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++' };
    return (
        <div style={s.codeWin2}>
            <div style={s.langTabs}>
                {Object.keys(labels).map(l => (
                    <button key={l} onClick={() => setLang(l)} style={{ ...s.langTab, ...(lang === l ? s.langTabActive : {}) }}>{labels[l]}</button>
                ))}
            </div>
            <pre style={s.code2}>{snippets[lang]}</pre>
        </div>
    );
};

/* ───────── Styles ───────── */
const s = {
    page: { background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' },
    nav: { position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 32px', background: 'rgba(30,30,46,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)' },
    logo: { fontFamily: 'var(--font-code)', fontSize: '16px', fontWeight: 700, color: 'var(--text-muted)' },
    logoAccent: { color: 'var(--accent-blue)' },
    navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
    navLink: { fontFamily: 'var(--font-code)', fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' },
    navLinkBtn: { fontFamily: 'var(--font-code)', fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' },
    navBtn: { fontFamily: 'var(--font-code)', fontSize: '13px', padding: '8px 18px', background: 'var(--accent-blue)', color: '#111', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 },

    hero: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '60px', padding: '80px 40px 60px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh', flexWrap: 'wrap' },
    heroText: { flex: 1, minWidth: '320px', maxWidth: '550px' },
    badge: { display: 'inline-block', padding: '6px 16px', background: 'rgba(97,218,251,0.1)', border: '1px solid rgba(97,218,251,0.25)', borderRadius: '20px', fontSize: '12px', color: 'var(--accent-blue)', marginBottom: '20px', fontFamily: 'var(--font-code)' },
    h1: { fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px', fontFamily: 'var(--font-code)' },
    gradient: { background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    sub: { fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 25px' },
    langRow: { display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' },
    pill: { padding: '5px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', fontSize: '12px', color: 'var(--accent-green)', fontFamily: 'var(--font-code)' },
    ctaRow: { display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' },
    primary: { padding: '14px 32px', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-code)', boxShadow: '0 4px 20px rgba(97,218,251,0.3)' },
    secondary: { padding: '14px 32px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-code)' },

    codeWin: { flex: 1, minWidth: '320px', maxWidth: '480px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
    codeBar: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' },
    dot: { width: '12px', height: '12px', borderRadius: '50%' },
    codeFile: { marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' },
    code: { padding: '20px', margin: 0, fontSize: '13px', lineHeight: 1.7, color: 'var(--accent-blue)', fontFamily: 'var(--font-code)', overflow: 'hidden' },
    codeOut: { padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-color)', fontSize: '12px', fontFamily: 'var(--font-code)', lineHeight: 1.6 },

    section: { padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' },
    h2: { textAlign: 'center', fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-code)', marginBottom: '12px', color: 'var(--text-bright)' },
    h3: { fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-code)', margin: '0 0 6px' },
    sectionSub: { textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px', fontSize: '14px' },

    /* How it works */
    stepsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' },
    stepCard: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '28px', textAlign: 'center', transition: 'all 0.25s' },
    stepNum: { fontFamily: 'var(--font-code)', fontSize: '36px', fontWeight: 800, opacity: 0.3, marginBottom: '4px' },

    featGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
    featCard: { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '28px', transition: 'all 0.25s', cursor: 'default' },
    cardDesc: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 },

    barContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', height: '200px', padding: '10px 0' },
    algoTab: { fontFamily: 'var(--font-code)', fontSize: '13px', padding: '8px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' },
    algoTabActive: { background: 'var(--accent-blue)', color: '#111', borderColor: 'var(--accent-blue)', fontWeight: 600 },

    /* Learning path */
    pathContainer: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', alignItems: 'center' },
    pathNode: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '14px 12px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', minWidth: '85px', position: 'relative' },
    pathIcon: { fontSize: '24px' },
    pathName: { fontSize: '11px', fontFamily: 'var(--font-code)', color: 'var(--text-bright)', fontWeight: 600 },
    pathBadge: { fontSize: '9px', fontFamily: 'var(--font-code)', padding: '2px 8px', borderRadius: '10px', border: '1px solid', fontWeight: 600, letterSpacing: '0.3px' },
    pathArrow: { position: 'absolute', right: '-14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-blue)', fontFamily: 'var(--font-code)', fontSize: '14px', fontWeight: 700 },

    /* Comparison table */
    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '13px' },
    th: { padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' },
    td: { padding: '10px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' },

    /* Quiz teaser */
    quizCard: { maxWidth: '600px', margin: '0 auto', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' },
    quizQ: { padding: '24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' },
    quizOpts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '20px' },
    quizOpt: { fontFamily: 'var(--font-code)', fontSize: '13px', padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
    quizOptLetter: { fontWeight: 700, color: 'var(--accent-blue)', fontSize: '14px', minWidth: '18px' },
    quizExplain: { padding: '16px 20px', borderTop: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 },

    /* Multi-lang */
    codeWin2: { maxWidth: '700px', margin: '0 auto', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' },
    langTabs: { display: 'flex', borderBottom: '1px solid var(--border-color)' },
    langTab: { flex: 1, padding: '10px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
    langTabActive: { background: 'var(--bg-hover)', color: 'var(--accent-blue)', borderBottom: '2px solid var(--accent-blue)' },
    code2: { padding: '20px', margin: 0, fontSize: '13px', lineHeight: 1.7, color: 'var(--accent-green)', fontFamily: 'var(--font-code)', overflow: 'auto', maxHeight: '320px' },

    /* Stats */
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '60px' },
    statCard: { textAlign: 'center', padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px' },
    statNum: { fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-code)', color: 'var(--accent-blue)' },
    statLabel: { fontSize: '13px', color: 'var(--text-bright)', fontFamily: 'var(--font-code)', marginTop: '4px', fontWeight: 600 },
    statDetail: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' },
    finalCTA: { textAlign: 'center' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderTop: '1px solid var(--border-color)' },
};

export default Home;
