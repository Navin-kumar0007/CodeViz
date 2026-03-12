/* eslint-disable react-hooks/purity */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll } from 'framer-motion';

/* ════════════════════════════════════════════
   HOME PAGE — Highly Interactive & Innovative
   7 Slides, Unique Transitions, Enhanced Demos
   ════════════════════════════════════════════ */

const Home = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('userInfo');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [ripples, setRipples] = useState([]);

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const addRipple = (e) => {
        // Only add ripples if we click outside buttons/links
        if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'a') return;
        const drop = { x: e.clientX, y: e.clientY, id: Date.now() };
        setRipples(prev => [...prev, drop]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== drop.id)), 1000);
    };

    return (
        <div style={s.page} onClick={addRipple}>
            {/* 4. Fluid Ripples */}
            {ripples.map(r => (
                <motion.div key={r.id} initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 4, opacity: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ position: 'fixed', left: r.x - 50, top: r.y - 50, width: 100, height: 100, border: '2px solid var(--accent-blue)', borderRadius: '50%', pointerEvents: 'none', zIndex: 9999 }} />
            ))}
            
            {/* Ambient Nebula Glows */}
            <div style={{ ...s.blurGlow, top: '-20%', left: '-10%', background: '#c678dd' }} />
            <div style={{ ...s.blurGlow, top: '40%', right: '-20%', background: '#00f2fe' }} />

            {/* 1. Dynamic Mouse Spotlight */}
            <div style={{
                ...s.spotlight,
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(97,218,251,0.06), transparent 40%)`
            }} />

            <FloatingBackground mousePos={mousePos} />
            <Navbar navigate={navigate} isLoggedIn={isLoggedIn} />

            {/* Slide 1: Hero */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 1 }}
            >
                <HeroSection navigate={navigate} />
            </motion.div>

            {/* Slide 2: Sorting (Transition: 3D Depth Zoom) */}
            <motion.section
                id="demo"
                initial={{ scale: 0.8, opacity: 0, z: -100 }}
                whileInView={{ scale: 1, opacity: 1, z: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ type: "spring", stiffness: 50 }}
                style={s.section}
            >
                <div style={s.sectionHeader}>
                    <h2 style={s.h2}>Visualize the Logic</h2>
                    <p style={s.h2Sub}>Pick an algorithm and watch the numbers shift in real-time.</p>
                </div>
                <EnhancedSortDemo />
            </motion.section>

            {/* Slide 3: Roadmap (Transition: Side-Swipe Parallax) */}
            <motion.section
                id="path"
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ ...s.section, background: 'rgba(255,255,255,0.01)' }}
            >
                <div style={s.sectionHeader}>
                    <h2 style={s.h2}>Master the Curriculum</h2>
                    <p style={s.h2Sub}>A comprehensive 17+ module roadmap to technical excellence.</p>
                </div>
                <DenseSkillTree />
            </motion.section>

            {/* Slide 4: Features (Transition: Grid Reveal / 3D Flip) */}
            <motion.section
                id="features"
                initial={{ rotateX: 45, opacity: 0 }}
                whileInView={{ rotateX: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 1 }}
                style={s.section}
            >
                <div style={s.sectionHeader}>
                    <h2 style={s.h2}>Engineered for Mastery</h2>
                    <p style={s.h2Sub}>Professional-grade tools for modern developers.</p>
                </div>
                <div style={s.featureGrid}>
                    <FeatureCard icon="🔬" title="Memory Inspector" desc="Visualize pointers, stack frames, and heap allocation." color="var(--accent-blue)" />
                    <FeatureCard icon="🤖" title="AI Code Narrator" desc="Line-by-line audio and text explanation of your logic." color="var(--accent-purple)" />
                    <FeatureCard icon="🏁" title="Performance Race" desc="Compare time complexities with real-world datasets." color="var(--accent-green)" />
                    <FeatureCard icon="🧩" title="Concept Mapping" desc="Connect themes between recursion and dynamic programming." color="var(--accent-red)" />
                    <FeatureCard icon="📱" title="Universal Sync" desc="Code on any device with instant cloud synchronization." color="var(--accent-yellow)" />
                    <FeatureCard icon="📊" title="Analytics Engine" desc="Identify your weak areas with deep behavioral metrics." color="var(--accent-cyan)" />
                </div>
            </motion.section>

            {/* Slide 5: Quiz (Transition: Focus Blur) */}
            <motion.section
                initial={{ filter: "blur(20px)", opacity: 0 }}
                whileInView={{ filter: "blur(0px)", opacity: 1 }}
                viewport={{ once: false, amount: 0.6 }}
                transition={{ duration: 0.8 }}
                style={{ ...s.section, background: 'rgba(255,255,255,0.01)' }}
            >
                <div style={s.sectionHeader}>
                    <h2 style={s.h2}>Instant Assessment</h2>
                    <p style={s.h2Sub}>Test your cross-language proficiency with interactive challenges.</p>
                </div>
                <MultiQuizEngine />
            </motion.section>

            {/* Slide 6: Multi-Lang (Transition: Console Slide-Up) */}
            <motion.section
                initial={{ y: 200, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ type: "spring", damping: 15 }}
                style={s.section}
            >
                <div style={s.sectionHeader}>
                    <h2 style={s.h2}>Polyglot Playground</h2>
                    <p style={s.h2Sub}>The same visual lesson, available in 7 major languages.</p>
                </div>
                <PolyglotEngine />
            </motion.section>

            {/* Slide 7: CTA (Transition: Radial Expansion) */}
            <motion.section
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.8 }}
                transition={{ duration: 0.6 }}
                style={s.finalCta}
            >
                <div style={s.statsWrapper}>
                    <StatItem num="12K+" label="Visual Learners" />
                    <StatItem num="18+" label="Core Modules" />
                    <StatItem num="7" label="Languages" />
                    <StatItem num="98%" label="Satisfaction" />
                </div>
                <div style={s.premiumPanel}>
                    <h2 style={{ ...s.h2, fontSize: '48px', marginBottom: '20px' }}>Ready to Start?</h2>
                    <p style={{ marginBottom: '40px', color: '#888', maxWidth: '600px', margin: '0 auto 40px' }}>Join the community of thousands who chose to see their code, not just read it.</p>
                    <button onClick={() => navigate('/signup')} style={s.ultimateBtn}>Join CodeViz Free</button>
                </div>
            </motion.section>

            <footer style={s.footer}>
                <div style={s.footerLeft}>
                    <span style={s.logoText}>CodeViz</span>
                    <p style={{ fontSize: '12px', color: '#444' }}>Beyond the syntax. Into the logic.</p>
                </div>
                <div style={s.footerMeta}>
                    <span>Privacy Policy</span> • <span>Terms of Service</span> • <span>Contact Us</span>
                </div>
            </footer>
        </div>
    );
};

/* ───────── Slide Components ───────── */

const HeroSection = ({ navigate }) => {
    // 3. Live Typing Terminal
    const fullCode = `void dfs(int u) {
    visited[u] = true;
    viz.step(u); 
    for(int v : adj[u]) {
        if(!visited[v]) dfs(v);
    }
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
        }, 40);
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
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={s.ultraBadge}>
                        <span style={s.pulseDot} /> NEURAL RENDERING ENGINE v3.0
                    </motion.div>
                    <KineticText text="Architect the " style={s.h1} spanText="Future." spanStyle={s.gradientText} />
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} style={s.subText}>
                        CodeViz transforms dry syntax into immersive, interactive, high-fidelity 3D geometric journeys. Watch every pointer, array shift, and recursion depth come to life in radiant detail.
                    </motion.p>
                    <div style={s.ctaGroup}>
                        <MagneticButton onClick={() => navigate('/signup')} style={s.primaryBtn}>Initialize Adventure</MagneticButton>
                        <MagneticButton onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })} style={s.secondaryBtn}>Explore Demos</MagneticButton>
                    </div>
                </div>
                <TiltCard>
                    <div style={s.heroConsole}>
                        <div style={s.consoleTop}>
                            <div style={s.consoleDots}><span style={{ ...s.cDot, background: '#ff5f56' }} /><span style={{ ...s.cDot, background: '#ffbd2e' }} /><span style={{ ...s.cDot, background: '#27c93f' }} /></div>
                            <div style={s.consoleTab}>recursive_dfs.cpp</div>
                        </div>
                        <div style={s.consoleBody}>
                            <pre style={s.consoleCode}>
                                {typedCode}
                                <span style={{ opacity: cursorVisible ? 1 : 0, color: '#fff' }}>▋</span>
                            </pre>
                        </div>
                        <div style={s.consoleOverlay}>
                            <div style={s.vizStatus}>3D PERSPECTIVE: ON</div>
                        </div>
                    </div>
                </TiltCard>
            </div>
        </section>
    );
};

const EnhancedSortDemo = () => {
    const [arr, setArr] = useState([64, 34, 25, 12, 22, 11, 90, 45]);
    const [algo, setAlgo] = useState('bubble');
    const [sorting, setSorting] = useState(false);
    const [active, setActive] = useState([-1, -1]);
    const max = Math.max(...arr);

    const bubbleSort = async (a) => {
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < a.length - i - 1; j++) {
                setActive([j, j + 1]);
                await new Promise(r => setTimeout(r, 80));
                if (a[j] > a[j + 1]) {
                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                    setArr([...a]);
                }
            }
        }
    };

    const selectionSort = async (a) => {
        for (let i = 0; i < a.length; i++) {
            let min = i;
            for (let j = i + 1; j < a.length; j++) {
                setActive([min, j]);
                await new Promise(r => setTimeout(r, 80));
                if (a[j] < a[min]) min = j;
            }
            [a[i], a[min]] = [a[min], a[i]];
            setArr([...a]);
        }
    };

    const insertionSort = async (a) => {
        for (let i = 1; i < a.length; i++) {
            let key = a[i];
            let j = i - 1;
            setActive([i, j]);
            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j];
                j = j - 1;
                setActive([i, j]);
                setArr([...a]);
                await new Promise(r => setTimeout(r, 80));
            }
            a[j + 1] = key;
            setArr([...a]);
        }
    };

    const runSort = async () => {
        setSorting(true);
        const a = [...arr];
        if (algo === 'bubble') await bubbleSort(a);
        else if (algo === 'selection') await selectionSort(a);
        else if (algo === 'insertion') await insertionSort(a);
        setActive([-1, -1]);
        setSorting(false);
    };

    return (
        <div style={s.demoContainer}>
            <div style={s.algoTabs}>
                {['bubble', 'selection', 'insertion'].map(n => (
                    <button key={n} onClick={() => setAlgo(n)} style={{ ...s.algoTab, background: algo === n ? 'rgba(97,218,251,0.1)' : 'transparent', color: algo === n ? '#61dafb' : '#555' }}>{n.toUpperCase()}</button>
                ))}
            </div>
            <div style={s.visualizerBox}>
                {arr.map((v, i) => (
                    <motion.div key={i} layout style={{
                        width: '45px',
                        height: `${(v / max) * 160 + 40}px`,
                        background: active.includes(i) ? 'var(--accent-red)' : 'var(--accent-blue)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        color: active.includes(i) ? '#fff' : 'rgba(0,0,0,0.6)',
                        fontSize: '11px',
                        fontWeight: 800,
                        paddingTop: '10px',
                        boxShadow: active.includes(i) ? '0 0 20px var(--accent-red)' : 'none'
                    }}>
                        {v}
                    </motion.div>
                ))}
            </div>
            <div style={s.vizControls}>
                <button onClick={runSort} disabled={sorting} style={s.runBtn}>{sorting ? 'Sorting...' : `Run ${algo}`}</button>
                <button onClick={() => setArr(arr.map(() => Math.floor(Math.random() * 80) + 10))} style={s.randBtn}>Randomize</button>
            </div>
        </div>
    );
};

const DenseSkillTree = () => {
    // 2. Interactive Physics Roadmap
    const constraintsRef = useRef(null);
    return (
        <div style={s.treeView} ref={constraintsRef}>
            <div style={s.treeGrid}>
                <PhysicsNode constraintsRef={constraintsRef} icon="📦" label="Basics" col="var(--accent-blue)" />
                <PhysicsNode constraintsRef={constraintsRef} icon="📊" label="Arrays" col="var(--accent-green)" />
                <PhysicsNode constraintsRef={constraintsRef} icon="🔤" label="Strings" col="var(--accent-cyan)" />
                <PhysicsNode constraintsRef={constraintsRef} icon="🥞" label="Stacks" col="var(--accent-purple)" />
                <PhysicsNode constraintsRef={constraintsRef} icon="🚶" label="Queues" col="var(--accent-yellow)" />
                <PhysicsNode constraintsRef={constraintsRef} icon="🔍" label="Searching" col="var(--accent-orange)" />
                <PhysicsNode constraintsRef={constraintsRef} icon="🕸️" label="Graph" col="var(--accent-red)" />
                <PhysicsNode constraintsRef={constraintsRef} icon="🧠" label="DP" col="var(--accent-blue)" />
            </div>
            <div style={s.treeLines}>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.1, pointerEvents: 'none' }}>
                    <line x1="12.5%" y1="25%" x2="37.5%" y2="25%" stroke="white" strokeWidth="1" />
                    <line x1="37.5%" y1="25%" x2="62.5%" y2="25%" stroke="white" strokeWidth="1" />
                    <line x1="62.5%" y1="25%" x2="87.5%" y2="25%" stroke="white" strokeWidth="1" />
                    <line x1="12.5%" y1="75%" x2="37.5%" y2="75%" stroke="white" strokeWidth="1" />
                    <line x1="37.5%" y1="75%" x2="62.5%" y2="75%" stroke="white" strokeWidth="1" />
                    <line x1="62.5%" y1="75%" x2="87.5%" y2="75%" stroke="white" strokeWidth="1" />
                </svg>
            </div>
            <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                * Yes, you can drag and throw the nodes.
            </div>
        </div>
    );
};

const MultiQuizEngine = () => {
    const [quizIdx, setQuizIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const quizzes = [
        { lang: 'Python', q: 'Which is used for List Comprehension?', opts: ['( )', '[ ]', '{ }', '< >'], ans: 1, info: '[x for x in list] is Pythonic.' },
        { lang: 'Java', q: 'How do you create a Pointer?', opts: ['*', '&', 'Object obj', 'new Obj()'], ans: 3, info: 'Java handles memory via references & "new".' },
        { lang: 'JS', q: 'What is the type of NaN?', opts: ['NaN', 'number', 'undefined', 'object'], ans: 1, info: 'typeof NaN is actually "number"!' }
    ];

    const cur = quizzes[quizIdx];

    return (
        <div style={s.quizHost}>
            <div style={s.quizHeaderBox}>
                <span style={s.quizLang}>{cur.lang} Challenge</span>
                <span style={s.quizPg}>{quizIdx + 1} / 3</span>
            </div>
            <p style={s.quizText}>{cur.q}</p>
            <div style={s.quizOptions}>
                {cur.opts.map((o, i) => (
                    <button key={i} onClick={() => setSelected(i)} style={{
                        ...s.quizBtn,
                        borderColor: selected === i ? (i === cur.ans ? 'var(--accent-green)' : 'var(--accent-red)') : 'rgba(255,255,255,0.05)',
                        background: selected === i ? (i === cur.ans ? 'rgba(152,195,121,0.05)' : 'rgba(224,108,117,0.05)') : 'transparent'
                    }}>
                        {o} {selected === i && (i === cur.ans ? '✅' : '❌')}
                    </button>
                ))}
            </div>
            {selected !== null && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>{cur.info}</p>
                    <button onClick={() => { setQuizIdx((quizIdx + 1) % 3); setSelected(null); }} style={s.nextBtn}>Next Challenge →</button>
                </div>
            )}
        </div>
    );
};

const PolyglotEngine = () => {
    const [lang, setLang] = useState('cpp');
    const examples = {
        cpp: 'struct Node {\n  int val;\n  Node *next;\n};',
        java: 'class Node {\n  int val;\n  Node next;\n}',
        python: 'class Node:\n    def __init__(self, x):\n        self.val = x\n        self.next = None',
        go: 'type Node struct {\n    val  int\n    next *Node\n}',
        ts: 'interface Node {\n  val: number;\n  next: Node | null;\n}'
    };
    return (
        <div style={s.polyHost}>
            <div style={s.polySidebar}>
                {Object.keys(examples).map(l => (
                    <button key={l} onClick={() => setLang(l)} style={{ ...s.polyTab, color: lang === l ? '#fff' : '#444', borderLeft: lang === l ? '2px solid var(--accent-blue)' : 'none' }}>{l.toUpperCase()}</button>
                ))}
            </div>
            <div style={s.polyCode}>
                {/* 5. Code Execution Scanner */}
                <motion.div
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--accent-purple)', boxShadow: '0 0 20px 2px var(--accent-purple)', opacity: 0.5, zIndex: 5, pointerEvents: 'none' }}
                />
                <pre style={{ margin: 0, fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{examples[lang]}</pre>
                <div style={s.polyOverlay}>LIVE COMPILER EMULATION ACTIVE</div>
            </div>
        </div>
    );
};

/* ───────── Utility Widgets ───────── */

const KineticText = ({ text, style, spanText, spanStyle }) => {
    const [display, setDisplay] = useState(text.split('').map(() => '!'));
    const [spanDisplay, setSpanDisplay] = useState(spanText ? spanText.split('').map(() => '!') : []);

    useEffect(() => {
        let iterations = 0;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        const interval = setInterval(() => {
            setDisplay(prev => prev.map((char, index) => {
                if (index < iterations) return text[index];
                return chars[Math.floor(Math.random() * chars.length)];
            }));
            if (spanText) {
                setSpanDisplay(prev => prev.map((char, index) => {
                    if (index < iterations) return spanText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }));
            }
            if (iterations >= Math.max(text.length, spanText ? spanText.length : 0)) clearInterval(interval);
            iterations += 1 / 3;
        }, 30);
        return () => clearInterval(interval);
    }, [text, spanText]);

    return (
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={style}>
            {display.join('')}<br />
            {spanText && <span style={spanStyle}>{spanDisplay.join('')}</span>}
        </motion.h1>
    );
};

const MagneticButton = ({ children, onClick, style }) => {
    const ref = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const mouseMove = (e) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPos({ x: middleX * 0.45, y: middleY * 0.45 });
    };
    const mouseLeave = () => setPos({ x: 0, y: 0 });

    return (
        <motion.button ref={ref} onMouseMove={mouseMove} onMouseLeave={mouseLeave} onClick={onClick}
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            style={style}
        >
            {children}
        </motion.button>
    );
};

const PhysicsNode = ({ constraintsRef, icon, label, col }) => (
    <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        dragSnapToOrigin={true}
        whileHover={{ scale: 1.1, cursor: 'grab' }}
        whileDrag={{ scale: 1.2, cursor: 'grabbing', zIndex: 100 }}
        style={s.treeNode}
    >
        <div style={{ ...s.nodeBox, background: col }}>{icon}</div>
        <span style={s.nodeText}>{label}</span>
    </motion.div>
);

const StatItem = ({ num, label }) => (
    <div style={s.statItem}>
        <div style={s.statVal}>{num}</div>
        <div style={s.statLabel}>{label}</div>
    </div>
);

const FeatureCard = ({ icon, title, desc, color }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHover, setIsHover] = useState(false);
    return (
        <motion.div
            onMouseMove={e => {
                const r = e.currentTarget.getBoundingClientRect();
                setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
            }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            whileHover={{ y: -8, scale: 1.03 }}
            style={{ 
                ...s.fCard, 
                border: `1px solid rgba(255,255,255,0.08)`, 
                background: 'rgba(255,255,255,0.01)',
                backdropFilter: 'blur(10px)',
                position: 'relative', 
                overflow: 'hidden',
                boxShadow: isHover ? `0 15px 40px rgba(0,0,0,0.4)` : 'none'
            }}
        >
            <motion.div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, ${color}35 0%, transparent 70%)`,
                mixBlendMode: 'screen', opacity: isHover ? 1 : 0, transition: 'opacity 0.3s ease'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '32px', marginBottom: '16px', filter: `drop-shadow(0 0 10px ${color})` }}>{icon}</div>
                <h4 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '12px', color: '#fff', letterSpacing: '-0.5px' }}>{title}</h4>
                <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.7 }}>{desc}</p>
            </div>
        </motion.div>
    );
};

const Navbar = ({ navigate, isLoggedIn }) => (
    <div style={s.nav}>
        <div style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'monospace', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span style={{ color: 'var(--accent-blue)' }}>{'<'}</span>
            CodeViz
            <span style={{ color: 'var(--accent-purple)' }}>{'/>'}</span>
        </div>
        <div style={s.navItems}>
            <a href="#demo" style={s.navI}>Demo</a>
            <a href="#path" style={s.navI}>Curriculum</a>
            <a href="#features" style={s.navI}>Tech</a>
            {isLoggedIn ? (
                <button onClick={() => navigate('/')} style={s.loginBtn}>Console</button>
            ) : (
                <button onClick={() => navigate('/login')} style={s.loginBtn}>Initialize</button>
            )}
        </div>
    </div>
);

const TiltCard = ({ children }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rx = useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]);
    const ry = useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]);
    return (
        <motion.div style={{ perspective: '1200px', rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
            onMouseMove={e => {
                const r = e.currentTarget.getBoundingClientRect();
                x.set((e.clientX - r.left) / r.width - 0.5);
                y.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onMouseLeave={() => { x.set(0); y.set(0); }}
        >
            {children}
        </motion.div>
    );
};

const FloatingBackground = () => (
    <div style={s.floatBg}>
        {[...Array(12)].map((_, i) => (
            <motion.div key={i} animate={{ y: [0, -40, 0], rotate: [0, 15, 0], opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, fontSize: '20px', color: '#fff' }}
            >
                {['=>', '{ }', '[ ]', '++', '===', 'async', 'ptr'][i % 7]}
            </motion.div>
        ))}
        <div style={{ ...s.blurGlow, top: '10%', left: '5%', background: 'var(--accent-blue)' }} />
        <div style={{ ...s.blurGlow, bottom: '20%', right: '5%', background: 'var(--accent-purple)' }} />
    </div>
);

/* ───────── Advanced Styles ───────── */
/* ───────── Advanced Premium Styles (Stitch Inspired) ───────── */
const s = {
    page: { 
        background: '#050508', // Deepest charcoal
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        color: '#fff', 
        minHeight: '100vh', 
        fontFamily: '"Outfit", "Inter", system-ui, sans-serif', 
        overflowX: 'hidden' 
    },
    spotlight: { position: 'fixed', inset: 0, zIndex: 5, pointerEvents: 'none' },
    floatBg: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
    
    // Nebula Glows
    blurGlow: { position: 'absolute', width: '800px', height: '800px', borderRadius: '50%', filter: 'blur(200px)', opacity: 0.15 },

    // Glassmorphic Nav
    nav: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '1200px', zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: 'rgba(10, 10, 15, 0.4)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
    navItems: { display: 'flex', alignItems: 'center', gap: '35px' },
    navI: { color: '#a0a0ab', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s', letterSpacing: '0.5px' },
    loginBtn: { background: '#fff', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 800, letterSpacing: '0.5px', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,255,255,0.2)' },

    hero: { position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '140px 50px 100px' },
    heroContent: { maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap', justifyContent: 'center' },
    heroTextSide: { flex: '1 1 500px', minWidth: '400px', zIndex: 20 },
    ultraBadge: { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 18px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '30px', border: '1px solid rgba(0, 242, 254, 0.2)', fontSize: '12px', fontWeight: 800, color: '#00f2fe', marginBottom: '30px', boxShadow: '0 0 20px rgba(0,242,254,0.1)' },
    pulseDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 15px #00f2fe' },
    
    // Premium Typography
    h1: { fontSize: 'clamp(48px, 6vw, 85px)', fontWeight: 950, lineHeight: 1.05, marginBottom: '25px', letterSpacing: '-2px' },
    gradientText: { background: 'linear-gradient(135deg, #0df2f2 0%, #a45afe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 60px rgba(13,242,242,0.4)', paddingRight: '15px' },
    subText: { fontSize: '18px', color: '#aab', lineHeight: 1.6, marginBottom: '40px', maxWidth: '500px', fontWeight: 300, letterSpacing: '0.5px' },
    ctaGroup: { display: 'flex', gap: '20px', alignItems: 'center' },
    
    // Neon CTA
    primaryBtn: { background: 'linear-gradient(135deg, #0df2f2 0%, #1771f1 100%)', color: '#000', border: '1px solid #0df2f2', padding: '20px 48px', borderRadius: '12px', fontSize: '18px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 40px rgba(13,242,242,0.6), inset 0 0 15px rgba(255,255,255,0.4)', transition: 'transform 0.2s, box-shadow 0.2s', letterSpacing: '1px', textTransform: 'uppercase' },
    secondaryBtn: { background: 'rgba(255,255,255,0.01)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 48px', borderRadius: '12px', fontSize: '18px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(30px)', transition: 'background 0.2s, border-color 0.2s' },

    // 3D Massive Tilted Console
    heroConsole: { width: '560px', height: '360px', background: '#0a0a0f', borderRadius: '24px', border: '2px solid rgba(13,242,242,0.2)', overflow: 'hidden', boxShadow: '-30px 45px 90px rgba(0,0,0,0.9), 0 0 60px rgba(164, 90, 254, 0.15)', position: 'relative', transform: 'perspective(2000px) rotateY(-18deg) rotateX(12deg) scale(1.0)', transformStyle: 'preserve-3d', zIndex: 10 },
    consoleTop: { background: 'rgba(255,255,255,0.01)', padding: '12px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    consoleDots: { display: 'flex', gap: '8px' },
    cDot: { width: '12px', height: '12px', borderRadius: '50%' },
    consoleTab: { flex: 1, textAlign: 'center', fontSize: '12px', color: '#666', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' },
    consoleBody: { padding: '30px', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,242,254,0.02) 100%)' },
    consoleCode: { margin: 0, fontFamily: '"JetBrains Mono", monospace', fontSize: '16px', color: '#4facfe', lineHeight: 1.7, textShadow: '0 0 10px rgba(79,172,254,0.3)' },
    consoleOverlay: { position: 'absolute', bottom: '25px', right: '25px' },
    vizStatus: { background: 'rgba(164, 90, 254, 0.2)', color: '#a45afe', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 900, border: '1px solid rgba(164, 90, 254, 0.5)', boxShadow: '0 0 30px rgba(164,90,254,0.3)', letterSpacing: '2px', textTransform: 'uppercase' },

    section: { position: 'relative', zIndex: 10, padding: '120px 50px', maxWidth: '1400px', margin: '0 auto' },
    sectionHeader: { textAlign: 'center', marginBottom: '80px' },
    h2: { fontSize: '56px', fontWeight: 900, marginBottom: '20px', letterSpacing: '-1.5px' },
    h2Sub: { fontSize: '20px', color: '#666', maxWidth: '600px', margin: '0 auto' },

    demoContainer: { background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(50px)', padding: '60px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    algoTabs: { display: 'flex', gap: '15px', marginBottom: '50px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' },
    algoTab: { border: 'none', padding: '14px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s' },
    visualizerBox: { display: 'flex', alignItems: 'flex-end', gap: '12px', height: '260px', marginBottom: '60px', width: '100%', justifyContent: 'center' },
    vizControls: { display: 'flex', gap: '20px' },
    runBtn: { background: '#00f2fe', color: '#000', border: 'none', padding: '16px 36px', borderRadius: '12px', fontSize: '16px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 30px rgba(0,242,254,0.4)' },
    randBtn: { background: 'transparent', color: '#888', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 36px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s, color 0.2s' },

    treeView: { padding: '60px 0', position: 'relative', width: '100%', maxWidth: '900px', margin: '0 auto' },
    treeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '80px', justifyItems: 'center' },
    treeNode: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 10 },
    nodeBox: { width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' },
    nodeText: { fontSize: '14px', fontWeight: 800, color: '#666', letterSpacing: '1px' },

    quizHost: { maxWidth: '850px', margin: '0 auto', background: 'rgba(10, 10, 15, 0.7)', backdropFilter: 'blur(50px)', padding: '60px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 50px 120px rgba(0,0,0,0.8)' },
    quizHeaderBox: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' },
    quizLang: { fontSize: '14px', fontWeight: 900, color: '#c678dd', letterSpacing: '1.5px', textTransform: 'uppercase' },
    quizPg: { fontSize: '14px', color: '#555', fontWeight: 700 },
    quizText: { fontSize: '26px', fontWeight: 800, marginBottom: '40px', textAlign: 'center', lineHeight: 1.5 },
    quizOptions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    quizBtn: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', color: '#fff', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s', fontSize: '16px', fontWeight: 600 },
    nextBtn: { background: 'linear-gradient(135deg, #c678dd 0%, #9f7aea 100%)', color: '#000', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 30px rgba(198,120,221,0.4)', marginTop: '30px', justifySelf: 'end' },

    polyHost: { display: 'flex', background: '#050508', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', height: '400px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' },
    polySidebar: { width: '180px', background: 'rgba(255,255,255,0.01)', padding: '30px 0', borderRight: '1px solid rgba(255,255,255,0.05)' },
    polyTab: { width: '100%', background: 'transparent', border: 'none', padding: '16px 30px', textAlign: 'left', fontSize: '13px', fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace', color: '#666', transition: 'color 0.2s' },
    polyCode: { flex: 1, padding: '50px', position: 'relative', background: '#0a0a0f' },
    polyOverlay: { position: 'absolute', top: '20px', right: '20px', fontSize: '12px', fontWeight: 900, color: '#444', letterSpacing: '1px' },

    featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px' },
    fCard: { padding: '50px', background: 'rgba(10, 10, 15, 0.3)', backdropFilter: 'blur(50px)', borderRadius: '32px', border: '1px solid rgba(13,242,242,0.1)', transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s', cursor: 'pointer', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' },

    finalCta: { padding: '160px 50px', textAlign: 'center', position: 'relative' },
    statsWrapper: { display: 'flex', justifyContent: 'center', gap: '100px', marginBottom: '120px', flexWrap: 'wrap' },
    statItem: { textAlign: 'center' },
    statVal: { fontSize: '64px', fontWeight: 950, background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px', textShadow: '0 0 30px rgba(0,242,254,0.3)' },
    statLabel: { fontSize: '16px', fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '2px' },
    premiumPanel: { maxWidth: '1000px', margin: '0 auto', padding: '120px 50px', background: 'radial-gradient(ellipse at top, rgba(0, 242, 254, 0.1) 0%, rgba(10,10,15,0.6) 70%)', borderRadius: '48px', border: '1px solid rgba(0,242,254,0.15)', boxShadow: '0 60px 150px rgba(0,0,0,0.8), inset 0 0 50px rgba(0,242,254,0.05)', backdropFilter: 'blur(40px)' },
    ultimateBtn: { background: '#fff', color: '#000', padding: '24px 60px', borderRadius: '20px', fontSize: '20px', fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 30px 60px rgba(255,255,255,0.2), inset 0 0 20px rgba(0,0,0,0.1)', transition: 'transform 0.2s', letterSpacing: '1px' },

    footer: { padding: '100px 50px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#050508' },
    footerLeft: { display: 'flex', flexDirection: 'column', gap: '10px' },
    footerMeta: { fontSize: '14px', color: '#444', display: 'flex', gap: '30px', fontWeight: 600 },
    logoText: { fontSize: '32px', fontWeight: 950, marginBottom: '15px', color: '#fff', letterSpacing: '-1px' }
};


export default Home;
