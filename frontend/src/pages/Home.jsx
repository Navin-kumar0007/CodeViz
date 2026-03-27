/* eslint-disable react-hooks/purity */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ════════════════════════════════════════════
   HOME PAGE — Digital Observatory Landing
   Phase 12: Premium 2026 Redesign
   ════════════════════════════════════════════ */

const Home = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('userInfo');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div style={s.page}>
            {/* Ambient Background Effects */}
            <div style={{ ...s.nebula, top: '-30%', left: '-15%', background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.08) 0%, transparent 70%)' }} />
            <div style={{ ...s.nebula, top: '30%', right: '-20%', background: 'radial-gradient(ellipse, rgba(0, 229, 238, 0.06) 0%, transparent 70%)' }} />
            <div style={{ ...s.nebula, bottom: '-10%', left: '30%', background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.05) 0%, transparent 70%)' }} />

            {/* Mouse Spotlight */}
            <div style={{
                ...s.spotlight,
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 238, 0.04), transparent 40%)`
            }} />

            {/* Floating Grid Pattern */}
            <FloatingGrid />

            <Navbar navigate={navigate} isLoggedIn={isLoggedIn} />

            {/* Section 1: Hero */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
            >
                <HeroSection navigate={navigate} />
            </motion.div>

            {/* Section 2: Features Grid */}
            <motion.section
                id="features"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                style={s.section}
            >
                <div style={s.sectionHeader}>
                    <span style={s.sectionTag}>CAPABILITIES</span>
                    <h2 style={s.h2}>Why CodeViz?</h2>
                    <p style={s.h2Sub}>Professional-grade tools that make algorithms come alive.</p>
                </div>
                <FeaturesGrid />
            </motion.section>

            {/* Section 3: Live Sorting Demo */}
            <motion.section
                id="demo"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                style={{ ...s.section, background: 'rgba(10, 10, 15, 0.5)' }}
            >
                <div style={s.sectionHeader}>
                    <span style={s.sectionTag}>LIVE DEMO</span>
                    <h2 style={s.h2}>Visualize the Logic</h2>
                    <p style={s.h2Sub}>Pick an algorithm and watch the numbers shift in real-time.</p>
                </div>
                <EnhancedSortDemo />
            </motion.section>

            {/* Section 4: Product Showcase */}
            <motion.section
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                style={s.section}
            >
                <ProductShowcase navigate={navigate} />
            </motion.section>

            {/* Section 5: Roadmap */}
            <motion.section
                id="path"
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                style={{ ...s.section, background: 'rgba(10, 10, 15, 0.5)' }}
            >
                <div style={s.sectionHeader}>
                    <span style={s.sectionTag}>CURRICULUM</span>
                    <h2 style={s.h2}>Master the Roadmap</h2>
                    <p style={s.h2Sub}>A comprehensive 17+ module pathway to technical excellence.</p>
                </div>
                <DenseSkillTree />
            </motion.section>

            {/* Section 6: Interactive Quiz */}
            <motion.section
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                style={s.section}
            >
                <div style={s.sectionHeader}>
                    <span style={s.sectionTag}>ASSESSMENT</span>
                    <h2 style={s.h2}>Instant Assessment</h2>
                    <p style={s.h2Sub}>Test your cross-language proficiency with interactive challenges.</p>
                </div>
                <MultiQuizEngine />
            </motion.section>

            {/* Section 7: Stats + CTA */}
            <motion.section
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                style={s.ctaSection}
            >
                <div style={s.statsRow}>
                    <StatItem num="10K+" label="Active Students" />
                    <StatItem num="500+" label="Visualizations" />
                    <StatItem num="50K+" label="Code Executions" />
                    <StatItem num="12" label="Languages" />
                </div>
                <div style={s.ctaBanner}>
                    <h2 style={{ ...s.h2, fontSize: '40px', marginBottom: '16px' }}>Ready to See Your Code?</h2>
                    <p style={{ color: '#9898A6', maxWidth: '550px', margin: '0 auto 32px', fontSize: '16px', lineHeight: '1.7' }}>
                        Join thousands of developers who chose to visualize algorithms, not just memorize them.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/signup')} style={s.ctaBtn}>Start Visualizing — Free</button>
                        <button onClick={() => navigate('/about')} style={s.ctaGhostBtn}>Learn About Us</button>
                    </div>
                    <p style={{ color: '#5A5A6A', fontSize: '12px', marginTop: '16px' }}>No credit card required. Free forever for basic features.</p>
                </div>
            </motion.section>

            <Footer navigate={navigate} />
        </div>
    );
};

/* ═══════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════ */

const FloatingGrid = () => (
    <div style={s.gridPattern}>
        {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
                key={i}
                animate={{ opacity: [0.02, 0.06, 0.02] }}
                transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                style={{
                    position: 'absolute',
                    width: '1px', height: '120px',
                    background: 'linear-gradient(to bottom, transparent, rgba(0,229,238,0.15), transparent)',
                    left: `${5 + i * 5}%`,
                    top: `${Math.random() * 80}%`,
                }}
            />
        ))}
    </div>
);

const Navbar = ({ navigate, isLoggedIn }) => (
    <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={s.navbar}
    >
        <div style={s.navLeft}>
            <span style={s.logoText}>Code<span style={s.logoAccent}>Viz</span></span>
        </div>
        <div style={s.navLinks}>
            <a href="#features" style={s.navLink}>Features</a>
            <a href="#demo" style={s.navLink}>Demo</a>
            <a href="#path" style={s.navLink}>Academy</a>
            <button onClick={() => navigate('/about')} style={s.navLink}>About</button>
        </div>
        <div style={s.navRight}>
            {isLoggedIn ? (
                <button onClick={() => navigate('/')} style={s.navCta}>Dashboard →</button>
            ) : (
                <>
                    <button onClick={() => navigate('/login')} style={s.navLogin}>Log In</button>
                    <button onClick={() => navigate('/signup')} style={s.navCta}>Get Started Free</button>
                </>
            )}
        </div>
    </motion.nav>
);

const HeroSection = ({ navigate }) => {
    const fullCode = `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`;
    const [typedCode, setTypedCode] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        let current = '';
        let i = 0;
        const interval = setInterval(() => {
            current += fullCode[i];
            setTypedCode(current);
            i++;
            if (i >= fullCode.length) clearInterval(interval);
        }, 35);
        return () => clearInterval(interval);
    }, [fullCode]);

    useEffect(() => {
        const cursorInt = setInterval(() => setCursorVisible(v => !v), 500);
        return () => clearInterval(cursorInt);
    }, []);

    return (
        <section style={s.hero}>
            <div style={s.heroContent}>
                <div style={s.heroTextSide}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={s.heroBadge}
                    >
                        <span style={s.pulseDot} /> Algorithm Visualization Platform
                    </motion.div>

                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        style={s.h1}
                    >
                        See Your Code{'\n'}
                        <span style={s.gradientText}>Come Alive</span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        style={s.subText}
                    >
                        The algorithm visualization platform that transforms how you learn, practice, and master Data Structures & Algorithms — with cinema-grade visuals and AI-powered guidance.
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        style={s.ctaGroup}
                    >
                        <button onClick={() => navigate('/signup')} style={s.ctaBtn}>
                            Start Visualizing — Free
                        </button>
                        <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} style={s.ctaGhostBtn}>
                            ▶ Watch Demo
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        style={s.trustBadges}
                    >
                        <span>⭐ 4.9/5 Rating</span>
                        <span style={s.trustDivider}>|</span>
                        <span>🎓 Used by 10,000+ students</span>
                        <span style={s.trustDivider}>|</span>
                        <span>🌐 12 Languages</span>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    style={s.heroVisual}
                >
                    <div style={s.heroConsole}>
                        <div style={s.consoleHeader}>
                            <div style={s.consoleDots}>
                                <span style={{ ...s.cDot, background: '#ff5f56' }} />
                                <span style={{ ...s.cDot, background: '#ffbd2e' }} />
                                <span style={{ ...s.cDot, background: '#27c93f' }} />
                            </div>
                            <span style={s.consoleTitle}>merge_sort.js</span>
                            <span style={s.consoleLang}>JavaScript</span>
                        </div>
                        <div style={s.consoleBody}>
                            <pre style={s.consoleCode}>
                                {typedCode}
                                <span style={{ opacity: cursorVisible ? 1 : 0, color: '#00E5EE' }}>▋</span>
                            </pre>
                        </div>
                    </div>

                    {/* Floating visualization preview beside the console */}
                    <div style={s.vizPreview}>
                        <div style={s.vizHeader}>Live Visualizer</div>
                        <div style={s.vizBars}>
                            {[38, 27, 43, 3, 9, 82, 10, 52, 61, 21].map((v, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [`${v}%`, `${Math.random() * 80 + 10}%`, `${v}%`] }}
                                    transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.15 }}
                                    style={{
                                        flex: 1,
                                        borderRadius: '3px 3px 0 0',
                                        background: i % 3 === 0
                                            ? 'linear-gradient(to top, rgba(0,229,238,0.3), rgba(0,229,238,0.7))'
                                            : i % 3 === 1
                                            ? 'linear-gradient(to top, rgba(124,58,237,0.3), rgba(124,58,237,0.6))'
                                            : 'linear-gradient(to top, rgba(255,255,255,0.1), rgba(255,255,255,0.25))',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const FeaturesGrid = () => {
    const features = [
        { icon: '🎬', title: 'Cinema Mode', desc: 'See algorithms in a cinematic, pan-and-zoom infinite canvas.', accent: '#00E5EE' },
        { icon: '🤖', title: 'AI Tutor', desc: 'Socratic AI that teaches you step-by-step, never gives direct answers.', accent: '#7C3AED' },
        { icon: '⚔️', title: 'Code Battles', desc: 'Real-time multiplayer coding duels with Chaos Mode sabotage.', accent: '#F43F5E' },
        { icon: '🧬', title: 'Algorithm DNA', desc: 'Your unique coding strengths mapped as a visual DNA profile.', accent: '#10B981' },
        { icon: '🛤️', title: 'Neural Pathways', desc: 'Adaptive learning roadmap that evolves with your mastery.', accent: '#F59E0B' },
        { icon: '📊', title: 'Live Visualization', desc: 'Watch arrays sort, trees balance, and graphs traverse in real-time.', accent: '#00E5EE' },
    ];

    return (
        <div style={s.featGrid}>
            {features.map((f, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ y: -6, borderColor: `${f.accent}33` }}
                    style={s.featCard}
                >
                    <div style={{ ...s.featIcon, background: `${f.accent}15`, border: `1px solid ${f.accent}25` }}>
                        <span style={{ fontSize: '24px' }}>{f.icon}</span>
                    </div>
                    <h3 style={s.featTitle}>{f.title}</h3>
                    <p style={s.featDesc}>{f.desc}</p>
                </motion.div>
            ))}
        </div>
    );
};

const ProductShowcase = ({ navigate }) => (
    <div style={s.showcase}>
        <div style={s.showcaseText}>
            <span style={s.sectionTag}>EXPERIENCE THE PLATFORM</span>
            <h2 style={{ ...s.h2, textAlign: 'left', marginTop: '12px' }}>The Future of Algorithm Practice</h2>
            <p style={{ color: '#9898A6', marginTop: '16px', lineHeight: '1.8', fontSize: '15px' }}>
                Stop memorizing solutions. Start understanding patterns. 
                CodeViz transforms every algorithm into an interactive visual experience — 
                with AI guidance, real-time execution tracing, and cinema-quality renders.
            </p>
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                    { icon: '✦', text: 'Integrated IDE + Live Visualizer', color: '#00E5EE' },
                    { icon: '✦', text: 'Trace every variable in real-time', color: '#7C3AED' },
                    { icon: '✦', text: 'Cinema Mode with pan & zoom', color: '#10B981' },
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: item.color, fontSize: '14px' }}>{item.icon}</span>
                        <span style={{ color: '#E8E8ED', fontSize: '14px' }}>{item.text}</span>
                    </div>
                ))}
            </div>
            <button onClick={() => navigate('/signup')} style={{ ...s.ctaBtn, marginTop: '32px' }}>
                Try It Now →
            </button>
        </div>
        <div style={s.showcaseVisual}>
            <div style={s.showcaseCard}>
                <div style={s.showcaseIDE}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ ...s.cDot, background: '#ff5f56' }} />
                        <span style={{ ...s.cDot, background: '#ffbd2e' }} />
                        <span style={{ ...s.cDot, background: '#27c93f' }} />
                    </div>
                    <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#9898A6', lineHeight: '1.8' }}>
{`function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    arr[mid] < target ? lo = mid+1 : hi = mid-1;
  }
  return -1;
}`}
                    </pre>
                </div>
                <div style={s.showcaseViz}>
                    <div style={{ fontSize: '10px', color: '#5A5A6A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Array State</div>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '80px' }}>
                        {[15, 25, 35, 42, 55, 63, 72, 88, 91].map((v, i) => (
                            <div key={i} style={{
                                flex: 1, height: `${v}%`,
                                background: i === 4 ? 'linear-gradient(to top, #00E5EE, #00b8c0)' : 'rgba(255,255,255,0.08)',
                                borderRadius: '3px 3px 0 0',
                                boxShadow: i === 4 ? '0 0 12px rgba(0,229,238,0.4)' : 'none',
                            }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#00E5EE', fontFamily: "'JetBrains Mono', monospace" }}>▲ mid = 4 → target found!</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const EnhancedSortDemo = () => {
    const [arr, setArr] = useState([64, 34, 25, 12, 22, 11, 90, 45]);
    const [algo, setAlgo] = useState('bubble');
    const [sorting, setSorting] = useState(false);
    const [active, setActive] = useState([-1, -1]);
    const max = Math.max(...arr);

    const bubbleSort = async (a) => {
        for (let i = 0; i < a.length; i++)
            for (let j = 0; j < a.length - i - 1; j++) {
                setActive([j, j + 1]);
                await new Promise(r => setTimeout(r, 80));
                if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; setArr([...a]); }
            }
    };
    const selectionSort = async (a) => {
        for (let i = 0; i < a.length; i++) {
            let min = i;
            for (let j = i + 1; j < a.length; j++) {
                setActive([min, j]); await new Promise(r => setTimeout(r, 80));
                if (a[j] < a[min]) min = j;
            }
            [a[i], a[min]] = [a[min], a[i]]; setArr([...a]);
        }
    };
    const insertionSort = async (a) => {
        for (let i = 1; i < a.length; i++) {
            let key = a[i], j = i - 1;
            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j]; j--;
                setActive([i, j]); setArr([...a]); await new Promise(r => setTimeout(r, 80));
            }
            a[j + 1] = key; setArr([...a]);
        }
    };

    const runSort = async () => {
        setSorting(true);
        const a = [...arr];
        if (algo === 'bubble') await bubbleSort(a);
        else if (algo === 'selection') await selectionSort(a);
        else await insertionSort(a);
        setActive([-1, -1]); setSorting(false);
    };

    return (
        <div style={s.demoContainer}>
            <div style={s.algoTabs}>
                {['bubble', 'selection', 'insertion'].map(n => (
                    <button key={n} onClick={() => setAlgo(n)} style={{
                        ...s.algoTab,
                        background: algo === n ? 'rgba(0,229,238,0.1)' : 'transparent',
                        color: algo === n ? '#00E5EE' : '#5A5A6A',
                        borderColor: algo === n ? 'rgba(0,229,238,0.3)' : 'rgba(255,255,255,0.06)',
                    }}>{n.charAt(0).toUpperCase() + n.slice(1)} Sort</button>
                ))}
            </div>
            <div style={s.visualizerBox}>
                {arr.map((v, i) => (
                    <motion.div key={i} layout style={{
                        width: '48px',
                        height: `${(v / max) * 160 + 40}px`,
                        background: active.includes(i)
                            ? 'linear-gradient(to top, #00E5EE, #00b8c0)'
                            : 'linear-gradient(to top, rgba(255,255,255,0.06), rgba(255,255,255,0.12))',
                        borderRadius: '6px 6px 0 0',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                        color: active.includes(i) ? '#050508' : '#5A5A6A',
                        fontSize: '11px', fontWeight: 800, paddingTop: '10px',
                        boxShadow: active.includes(i) ? '0 0 24px rgba(0,229,238,0.4)' : 'none',
                        transition: 'all 0.15s ease',
                    }}>{v}</motion.div>
                ))}
            </div>
            <div style={s.vizControls}>
                <button onClick={runSort} disabled={sorting} style={s.runBtn}>
                    {sorting ? '⟳ Sorting...' : `▶ Run ${algo.charAt(0).toUpperCase() + algo.slice(1)}`}
                </button>
                <button onClick={() => setArr(arr.map(() => Math.floor(Math.random() * 80) + 10))} style={s.randBtn}>
                    ↻ Randomize
                </button>
            </div>
        </div>
    );
};

const DenseSkillTree = () => {
    const modules = [
        { icon: '📦', label: 'Basics', color: '#00E5EE' },
        { icon: '📊', label: 'Arrays', color: '#7C3AED' },
        { icon: '🔤', label: 'Strings', color: '#00E5EE' },
        { icon: '🥞', label: 'Stacks', color: '#F59E0B' },
        { icon: '🚶', label: 'Queues', color: '#10B981' },
        { icon: '🔗', label: 'Linked Lists', color: '#7C3AED' },
        { icon: '🔍', label: 'Searching', color: '#00E5EE' },
        { icon: '🌳', label: 'Trees', color: '#F59E0B' },
        { icon: '🕸️', label: 'Graphs', color: '#F43F5E' },
        { icon: '🧠', label: 'DP', color: '#7C3AED' },
    ];

    return (
        <div style={s.treeView}>
            <div style={s.treeGrid}>
                {modules.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.08, borderColor: `${m.color}50` }}
                        style={s.treeNode}
                    >
                        <span style={{ fontSize: '24px' }}>{m.icon}</span>
                        <span style={{ fontSize: '11px', color: '#9898A6', fontWeight: 600 }}>{m.label}</span>
                        {i < modules.length - 1 && <div style={{ ...s.treeLine, background: `linear-gradient(to right, ${m.color}40, transparent)` }} />}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const MultiQuizEngine = () => {
    const [quizIdx, setQuizIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const quizzes = [
        { lang: 'Python', q: 'Which is used for List Comprehension?', opts: ['( )', '[ ]', '{ }', '< >'], ans: 1, info: '[x for x in list] is Pythonic.' },
        { lang: 'Java', q: 'How do you instantiate an object?', opts: ['*', '&', 'Object obj', 'new Obj()'], ans: 3, info: 'Java handles memory via references & "new".' },
        { lang: 'JS', q: 'What is the type of NaN?', opts: ['NaN', 'number', 'undefined', 'object'], ans: 1, info: 'typeof NaN is actually "number"!' }
    ];
    const cur = quizzes[quizIdx];

    return (
        <div style={s.quizHost}>
            <div style={s.quizHeader}>
                <span style={s.quizLang}>{cur.lang}</span>
                <span style={s.quizPg}>{quizIdx + 1} / {quizzes.length}</span>
            </div>
            <p style={s.quizText}>{cur.q}</p>
            <div style={s.quizOptions}>
                {cur.opts.map((o, i) => (
                    <button key={i} onClick={() => setSelected(i)} style={{
                        ...s.quizBtn,
                        borderColor: selected === i ? (i === cur.ans ? '#00E5EE' : '#F43F5E') : 'rgba(255,255,255,0.06)',
                        background: selected === i ? (i === cur.ans ? 'rgba(0,229,238,0.08)' : 'rgba(244,63,94,0.08)') : 'rgba(17,17,22,0.8)',
                    }}>{o}</button>
                ))}
            </div>
            {selected !== null && <p style={s.quizInfo}>{cur.info}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                {quizzes.map((_, i) => (
                    <button key={i} onClick={() => { setQuizIdx(i); setSelected(null); }} style={{
                        ...s.quizDot,
                        background: quizIdx === i ? '#00E5EE' : 'rgba(255,255,255,0.1)',
                    }} />
                ))}
            </div>
        </div>
    );
};

const StatItem = ({ num, label }) => (
    <div style={s.statItem}>
        <span style={s.statNum}>{num}</span>
        <span style={s.statLabel}>{label}</span>
    </div>
);

const Footer = ({ navigate }) => (
    <footer style={s.footer}>
        <div style={s.footerTop}>
            <div>
                <span style={s.logoText}>Code<span style={s.logoAccent}>Viz</span></span>
                <p style={{ color: '#5A5A6A', fontSize: '13px', marginTop: '8px', maxWidth: '280px' }}>
                    The algorithm visualization platform that transforms how you learn to code.
                </p>
            </div>
            <div style={s.footerLinks}>
                <div style={s.footerCol}>
                    <span style={s.footerColTitle}>Product</span>
                    <a href="#features" style={s.footerLink}>Features</a>
                    <a href="#demo" style={s.footerLink}>Live Demo</a>
                    <button onClick={() => navigate('/signup')} style={s.footerLink}>Sign Up</button>
                </div>
                <div style={s.footerCol}>
                    <span style={s.footerColTitle}>Company</span>
                    <button onClick={() => navigate('/about')} style={s.footerLink}>About</button>
                    <a href="#" style={s.footerLink}>Privacy</a>
                    <a href="#" style={s.footerLink}>Terms</a>
                </div>
                <div style={s.footerCol}>
                    <span style={s.footerColTitle}>Community</span>
                    <a href="#" style={s.footerLink}>GitHub</a>
                    <a href="#" style={s.footerLink}>Discord</a>
                    <a href="#" style={s.footerLink}>Twitter</a>
                </div>
            </div>
        </div>
        <div style={s.footerBottom}>
            <span style={{ color: '#4A4A58', fontSize: '12px' }}>© 2026 CodeViz. All rights reserved.</span>
        </div>
    </footer>
);

/* ═══════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════ */
const s = {
    page: {
        background: '#050508', minHeight: '100vh', color: '#E8E8ED', position: 'relative', overflow: 'hidden',
    },
    nebula: {
        position: 'fixed', width: '800px', height: '800px', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0,
    },
    spotlight: {
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    },
    gridPattern: {
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
    },

    // Navbar
    navbar: {
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 48px', background: 'rgba(5, 5, 8, 0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    navLeft: { display: 'flex', alignItems: 'center' },
    logoText: { fontSize: '22px', fontWeight: 800, color: '#E8E8ED', letterSpacing: '-0.02em' },
    logoAccent: { background: 'linear-gradient(135deg, #00E5EE, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    navLinks: { display: 'flex', gap: '32px', alignItems: 'center' },
    navLink: {
        color: '#9898A6', fontSize: '13px', fontWeight: 500, textDecoration: 'none',
        background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s',
        fontFamily: "'Inter', sans-serif",
    },
    navRight: { display: 'flex', gap: '12px', alignItems: 'center' },
    navLogin: {
        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#E8E8ED',
        padding: '8px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.2s',
    },
    navCta: {
        background: 'linear-gradient(135deg, #00E5EE, #00b8c0)', color: '#050508',
        border: 'none', padding: '8px 22px', borderRadius: '100px', fontSize: '13px', fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,229,238,0.2)', transition: 'all 0.2s',
    },

    // Hero
    hero: {
        minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1,
        padding: '120px 48px 80px',
    },
    heroContent: {
        maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '80px', width: '100%',
    },
    heroTextSide: { flex: 1, maxWidth: '560px' },
    heroBadge: {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
        background: 'rgba(0,229,238,0.06)', border: '1px solid rgba(0,229,238,0.15)',
        color: '#00E5EE', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '24px',
    },
    pulseDot: {
        width: '6px', height: '6px', borderRadius: '50%', background: '#00E5EE',
        boxShadow: '0 0 8px #00E5EE', animation: 'telemetryBlink 2s infinite',
        display: 'inline-block',
    },
    h1: {
        fontSize: '56px', fontWeight: 800, lineHeight: 1.1, color: '#E8E8ED',
        letterSpacing: '-0.03em', marginBottom: '20px', whiteSpace: 'pre-line',
    },
    gradientText: {
        background: 'linear-gradient(135deg, #00E5EE, #7C3AED)', WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    },
    subText: {
        fontSize: '16px', color: '#9898A6', lineHeight: 1.8, marginBottom: '32px', maxWidth: '480px',
    },
    ctaGroup: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    ctaBtn: {
        background: 'linear-gradient(135deg, #00E5EE, #7C3AED)', color: '#fff', border: 'none',
        padding: '14px 32px', borderRadius: '100px', fontSize: '15px', fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 4px 24px rgba(0,229,238,0.25), 0 4px 24px rgba(124,58,237,0.15)',
        transition: 'all 0.2s', letterSpacing: '0.3px',
    },
    ctaGhostBtn: {
        background: 'transparent', color: '#E8E8ED', border: '1px solid rgba(255,255,255,0.12)',
        padding: '14px 32px', borderRadius: '100px', fontSize: '15px', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s',
    },
    trustBadges: {
        display: 'flex', alignItems: 'center', gap: '12px', marginTop: '40px',
        fontSize: '12px', color: '#5A5A6A', flexWrap: 'wrap',
    },
    trustDivider: { color: '#2A2A30' },

    // Hero Console
    heroVisual: { flex: 1, position: 'relative', maxWidth: '520px' },
    heroConsole: {
        background: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    },
    consoleHeader: {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    consoleDots: { display: 'flex', gap: '6px' },
    cDot: { width: '10px', height: '10px', borderRadius: '50%', display: 'block' },
    consoleTitle: { fontSize: '12px', color: '#5A5A6A', fontFamily: "'JetBrains Mono', monospace" },
    consoleLang: {
        marginLeft: 'auto', fontSize: '10px', color: '#00E5EE', padding: '2px 8px',
        borderRadius: '100px', background: 'rgba(0,229,238,0.08)', fontWeight: 600,
    },
    consoleBody: { padding: '20px' },
    consoleCode: {
        fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#9898A6',
        lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap',
    },

    // Viz Preview
    vizPreview: {
        position: 'absolute', bottom: '-30px', right: '-30px',
        background: 'rgba(10, 10, 15, 0.95)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '16px', width: '200px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 20px rgba(0,229,238,0.05)',
    },
    vizHeader: { fontSize: '10px', color: '#5A5A6A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' },
    vizBars: { display: 'flex', gap: '3px', alignItems: 'flex-end', height: '80px' },

    // Sections
    section: {
        padding: '100px 48px', position: 'relative', zIndex: 1,
    },
    sectionHeader: { textAlign: 'center', marginBottom: '48px' },
    sectionTag: {
        display: 'inline-block', fontSize: '11px', fontWeight: 700, color: '#00E5EE',
        letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px',
    },
    h2: {
        fontSize: '36px', fontWeight: 800, color: '#E8E8ED', letterSpacing: '-0.02em',
        marginBottom: '12px',
    },
    h2Sub: {
        fontSize: '15px', color: '#9898A6', maxWidth: '500px', margin: '0 auto',
    },

    // Features Grid
    featGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
        maxWidth: '1000px', margin: '0 auto',
    },
    featCard: {
        background: 'rgba(17, 17, 22, 0.6)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px',
        cursor: 'default', transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    },
    featIcon: {
        width: '48px', height: '48px', borderRadius: '12px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
    },
    featTitle: { fontSize: '16px', fontWeight: 700, color: '#E8E8ED', marginBottom: '8px' },
    featDesc: { fontSize: '13px', color: '#9898A6', lineHeight: 1.6 },

    // Demo
    demoContainer: {
        maxWidth: '700px', margin: '0 auto', background: 'rgba(17,17,22,0.6)',
        backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: '32px', boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
    },
    algoTabs: { display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' },
    algoTab: {
        padding: '8px 20px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '100px',
        fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: 'transparent',
        transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
    },
    visualizerBox: {
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '6px',
        minHeight: '220px', padding: '20px',
    },
    vizControls: { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' },
    runBtn: {
        background: 'linear-gradient(135deg, #00E5EE, #00b8c0)', color: '#050508', border: 'none',
        padding: '10px 24px', borderRadius: '100px', fontSize: '13px', fontWeight: 700,
        cursor: 'pointer', transition: 'all 0.2s',
    },
    randBtn: {
        background: 'transparent', color: '#9898A6', border: '1px solid rgba(255,255,255,0.1)',
        padding: '10px 24px', borderRadius: '100px', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s',
    },

    // Product Showcase
    showcase: {
        maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px',
    },
    showcaseText: { flex: 1 },
    showcaseVisual: { flex: 1 },
    showcaseCard: {
        background: 'rgba(10,10,15,0.9)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        transform: 'perspective(1000px) rotateY(-3deg) rotateX(2deg)',
    },
    showcaseIDE: {
        padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    showcaseViz: { padding: '16px 20px 20px' },

    // Skill Tree
    treeView: { maxWidth: '900px', margin: '0 auto' },
    treeGrid: {
        display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap',
    },
    treeNode: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        padding: '20px 16px', borderRadius: '14px', background: 'rgba(17,17,22,0.6)',
        border: '1px solid rgba(255,255,255,0.06)', cursor: 'default',
        transition: 'all 0.3s ease', minWidth: '80px', position: 'relative',
    },
    treeLine: {
        position: 'absolute', right: '-8px', top: '50%', width: '8px', height: '2px',
    },

    // Quiz
    quizHost: {
        maxWidth: '550px', margin: '0 auto', background: 'rgba(17,17,22,0.6)',
        backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: '32px',
    },
    quizHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
    quizLang: {
        fontSize: '11px', fontWeight: 700, color: '#00E5EE', padding: '4px 12px',
        borderRadius: '100px', background: 'rgba(0,229,238,0.08)',
    },
    quizPg: { fontSize: '12px', color: '#5A5A6A' },
    quizText: { fontSize: '16px', color: '#E8E8ED', fontWeight: 600, marginBottom: '20px' },
    quizOptions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    quizBtn: {
        padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(17,17,22,0.8)', color: '#E8E8ED', fontSize: '13px', cursor: 'pointer',
        transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
    },
    quizInfo: { marginTop: '16px', fontSize: '13px', color: '#10B981', textAlign: 'center', fontStyle: 'italic' },
    quizDot: {
        width: '8px', height: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    },

    // Stats & CTA
    ctaSection: { padding: '80px 48px 60px', position: 'relative', zIndex: 1 },
    statsRow: {
        display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '60px', flexWrap: 'wrap',
    },
    statItem: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' },
    statNum: {
        fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em',
        background: 'linear-gradient(135deg, #00E5EE, #7C3AED)', WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    statLabel: { fontSize: '13px', color: '#5A5A6A', fontWeight: 500 },
    ctaBanner: {
        textAlign: 'center', padding: '60px 40px', borderRadius: '24px',
        background: 'rgba(10, 10, 15, 0.8)', border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
    },

    // Footer
    footer: {
        borderTop: '1px solid rgba(255,255,255,0.04)', padding: '48px 48px 24px',
        position: 'relative', zIndex: 1,
    },
    footerTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px' },
    footerLinks: { display: 'flex', gap: '60px' },
    footerCol: { display: 'flex', flexDirection: 'column', gap: '10px' },
    footerColTitle: { fontSize: '12px', fontWeight: 700, color: '#5A5A6A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
    footerLink: {
        fontSize: '13px', color: '#9898A6', textDecoration: 'none', cursor: 'pointer',
        background: 'none', border: 'none', textAlign: 'left', fontFamily: "'Inter', sans-serif",
        padding: 0, transition: 'color 0.2s',
    },
    footerBottom: {
        borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '20px', textAlign: 'center',
    },
};

export default Home;
