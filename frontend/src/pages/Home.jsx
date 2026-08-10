import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import {
  Hexagon, Play, Bot, Boxes, Users, Trophy, Code2, ArrowRight, Check,
  Sparkles, GitBranch, Gauge,
} from 'lucide-react';
import { Button } from '../components/ui';
import PublicFooter from '../components/marketing/PublicFooter';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

const FEATURES = [
  { Icon: Play, title: 'Motion-Flow visualization', desc: 'Watch elements arc and swap, pointers glide, and comparisons resolve — algorithms in motion, not static boxes.' },
  { Icon: Code2, title: '8 languages, real execution', desc: 'Python, JS, TypeScript, Java, C, C++, Go, Rust — run in a secure sandbox with real debugger-driven traces.' },
  { Icon: Bot, title: 'AI Socratic tutor', desc: 'Guides you with questions instead of handing answers, and explains your bug on your own visualization.' },
  { Icon: Boxes, title: 'Practice & interviews', desc: 'A problem vault, autograder, daily challenges, and AI-guided mock interviews to get you job-ready.' },
  { Icon: Users, title: 'Live classrooms', desc: 'Real-time collaborative rooms, whiteboard, session replay and analytics — teach and learn together.' },
  { Icon: Trophy, title: 'Gamified progress', desc: 'XP, streaks, a skill tree and certificates keep momentum high and learning sticky.' },
];

const STEPS = [
  { Icon: Code2, title: 'Write code', desc: 'Pick a language and write or load an example in the editor.' },
  { Icon: Gauge, title: 'Run & trace', desc: 'Execute in a secure sandbox — every step of state is captured.' },
  { Icon: Sparkles, title: 'See it move', desc: 'Step through an animated visualization of your algorithm running.' },
];

const LANGS = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++', 'Go', 'Rust'];

const EASE = [0.22, 1, 0.36, 1];
const staggerParent = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } };
const popIn = { hidden: { opacity: 0, scale: 0.9, y: 12 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

// ---- Live sorting visual: bars continuously bubble-sort, then reshuffle ----
const START_BARS = [
  { id: 1, val: 42 }, { id: 2, val: 88 }, { id: 3, val: 30 }, { id: 4, val: 66 },
  { id: 5, val: 54 }, { id: 6, val: 96 }, { id: 7, val: 24 }, { id: 8, val: 74 },
];

function HeroSortDemo({ reduce }) {
  const [bars, setBars] = useState(START_BARS);
  const [active, setActive] = useState([0, 1]);

  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => {
      setBars((prev) => {
        // one bubble pass step: find first adjacent inversion, swap it
        for (let i = 0; i < prev.length - 1; i += 1) {
          if (prev[i].val > prev[i + 1].val) {
            const next = prev.slice();
            [next[i], next[i + 1]] = [next[i + 1], next[i]];
            setActive([i, i + 1]);
            return next;
          }
        }
        // already sorted → reshuffle
        setActive([-1, -1]);
        return [...prev].sort(() => Math.random() - 0.5);
      });
    }, 720);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="relative w-full max-w-md mx-auto rounded-2xl border border-line bg-surface shadow-[var(--cz-shadow-md)] overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 h-9 border-b border-line bg-elevated">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
        <span className="ml-2 text-[11px] font-mono text-faint">bubble_sort.py — live trace</span>
      </div>
      <div className="flex items-end justify-center gap-2 h-52 px-6 pb-6 pt-8">
        {bars.map((b, i) => {
          const isActive = i === active[0] || i === active[1];
          return (
            <motion.div
              key={b.id}
              layout
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="rounded-t-md w-8 flex items-start justify-center pt-1"
              style={{
                height: `${b.val}%`,
                background: isActive
                  ? 'linear-gradient(180deg, #7c93ff, var(--cz-accent))'
                  : 'linear-gradient(180deg, color-mix(in srgb, var(--cz-accent) 55%, transparent), color-mix(in srgb, var(--cz-accent) 30%, transparent))',
                boxShadow: isActive ? '0 0 18px color-mix(in srgb, var(--cz-accent) 55%, transparent)' : 'none',
              }}
            >
              <span className="text-[10px] font-mono font-bold text-white/90">{b.val}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Self-typing code editor mockup (loops) ----
const CODE_LINES = [
  'def bubble_sort(arr):',
  '    for i in range(len(arr)):',
  '        for j in range(len(arr) - i - 1):',
  '            if arr[j] > arr[j + 1]:',
  '                arr[j], arr[j+1] = arr[j+1], arr[j]',
  '    return arr',
];
const CODE = CODE_LINES.join('\n');

function TypingCode({ reduce }) {
  const [n, setN] = useState(reduce ? CODE.length : 0);

  useEffect(() => {
    if (reduce) return undefined;
    let i = 0;
    let phase = 'typing';
    let pause = 0;
    const id = setInterval(() => {
      if (phase === 'typing') {
        if (i < CODE.length) { i += 1; setN(i); } else { phase = 'hold'; pause = 0; }
      } else {
        pause += 1;
        if (pause > 34) { i = 0; setN(0); phase = 'typing'; }
      }
    }, 40);
    return () => clearInterval(id);
  }, [reduce]);

  const shown = CODE.slice(0, n);
  const lines = shown.split('\n');

  return (
    <div className="w-full rounded-2xl border border-line bg-surface shadow-[var(--cz-shadow-md)] overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 h-9 border-b border-line bg-elevated">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
        <span className="ml-2 text-[11px] font-mono text-faint">bubble_sort.py</span>
      </div>
      <pre className="m-0 p-5 text-[13px] leading-[1.7] font-mono overflow-x-auto" style={{ minHeight: 190 }}>
        {CODE_LINES.map((_, li) => (
          <div key={li} className="flex">
            <span className="select-none text-faint pr-4 w-8 text-right shrink-0">{li + 1}</span>
            <code className="text-text whitespace-pre">
              {lines[li] || ''}
              {li === lines.length - 1 && n < CODE.length && (
                <motion.span
                  className="inline-block w-[7px] h-[15px] align-middle ml-[1px] rounded-[1px]"
                  style={{ background: 'var(--cz-accent)' }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                />
              )}
            </code>
          </div>
        ))}
      </pre>
      <div className="flex items-center gap-2 px-5 h-9 border-t border-line bg-elevated text-[11px] font-mono">
        {n >= CODE.length ? (
          <span className="flex items-center gap-1.5 text-success"><Play size={11} /> traced 24 steps · ready to visualize</span>
        ) : (
          <span className="text-faint">typing…</span>
        )}
      </div>
    </div>
  );
}

// ---- Count-up number that fires when scrolled into view ----
function Counter({ to, suffix = '', duration = 1.4, reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (reduce || !inView) return undefined;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return <span ref={ref}>{n}{suffix}</span>;
}

export default function Home() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const v = (variants) => (reduce ? undefined : variants);
  const inView = reduce ? {} : { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.25 } };

  return (
    <div className="min-h-screen bg-bg text-text" style={FONT}>
      {/* Nav */}
      <motion.header
        initial={reduce ? false : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="sticky top-0 z-50 border-b border-line"
        style={{ background: 'color-mix(in srgb, var(--cz-bg) 82%, transparent)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.span
              whileHover={reduce ? undefined : { rotate: 90, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-accent border border-accent/40 bg-accent/12"
            >
              <Hexagon size={16} strokeWidth={2.5} />
            </motion.span>
            <span className="text-[17px] font-extrabold tracking-tight">CodeViz</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-[14px] text-muted">
            <a href="#features" className="hover:text-text transition-colors no-underline text-inherit">Features</a>
            <a href="#how" className="hover:text-text transition-colors no-underline text-inherit">How it works</a>
            <a href="#languages" className="hover:text-text transition-colors no-underline text-inherit">Languages</a>
            <button onClick={() => navigate('/about')} className="hover:text-text transition-colors bg-transparent border-0 cursor-pointer text-inherit text-[14px]">About</button>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={() => navigate('/login')}>Sign in</Button>
            <Button variant="primary" size="md" onClick={() => navigate('/signup')}>Get started</Button>
          </div>
        </div>
      </motion.header>

      {/* Hero — two column: copy + live visual */}
      <section className="relative overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(900px circle at 70% -10%, color-mix(in srgb, var(--cz-accent) 16%, transparent), transparent 60%)' }}
          animate={reduce ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            className="text-center lg:text-left"
            variants={v(staggerParent)}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? undefined : 'show'}
          >
            <motion.span
              variants={v(popIn)}
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-accent bg-accent/10 border border-accent/25 rounded-full px-3 py-1 mb-6"
            >
              <motion.span animate={reduce ? undefined : { rotate: [0, 15, -15, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                <Sparkles size={13} />
              </motion.span>
              Learn algorithms by seeing them run
            </motion.span>
            <motion.h1 variants={v(fadeUp)} className="text-[42px] md:text-[56px] font-extrabold tracking-tight leading-[1.05] m-0 text-balance">
              See your code<br />
              <motion.span
                className="inline-block"
                style={{
                  background: 'linear-gradient(90deg, var(--cz-accent), #7c93ff, var(--cz-accent))',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={reduce ? undefined : { backgroundPosition: ['0% center', '200% center'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                come to life.
              </motion.span>
            </motion.h1>
            <motion.p variants={v(fadeUp)} className="text-muted text-[17px] md:text-[19px] max-w-xl mx-auto lg:mx-0 mt-5 leading-relaxed">
              An all-in-one platform to write, run and <b className="text-text font-semibold">visualize</b> algorithms across 8 languages — with an AI tutor, live classrooms, and interview prep.
            </motion.p>
            <motion.div variants={v(fadeUp)} className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-8">
              <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                <Button size="lg" onClick={() => navigate('/signup')}>Start visualizing — free <ArrowRight size={16} /></Button>
              </motion.div>
              <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>Sign in</Button>
              </motion.div>
            </motion.div>
            <motion.p variants={v(fadeUp)} className="text-faint text-[13px] mt-4">No credit card required · Free forever for the basics</motion.p>
          </motion.div>

          {/* Right: live sorting visual */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 40, rotate: -2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          >
            <HeroSortDemo reduce={reduce} />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Capabilities</span>
          <h2 className="text-[30px] font-extrabold tracking-tight mt-2 m-0">Everything to learn code, in one place</h2>
        </div>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" variants={v(staggerParent)} {...inView}>
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={v(fadeUp)}
              whileHover={reduce ? undefined : { y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="group bg-surface border border-line rounded-2xl p-6 shadow-[var(--cz-shadow-sm)] hover:shadow-[var(--cz-shadow-md)] hover:border-accent/40 transition-[box-shadow,border-color]"
            >
              <motion.div
                whileHover={reduce ? undefined : { rotate: -8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25 mb-4"
              >
                <f.Icon size={21} strokeWidth={2} />
              </motion.div>
              <h3 className="text-[16px] font-bold m-0">{f.title}</h3>
              <p className="text-[14px] text-muted leading-relaxed m-0 mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-elevated border-y border-line">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">How it works</span>
            <h2 className="text-[30px] font-extrabold tracking-tight mt-2 m-0">From code to clarity in three steps</h2>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" variants={v(staggerParent)} {...inView}>
            {STEPS.map((s, i) => (
              <motion.div key={s.title} variants={v(fadeUp)} className="bg-surface border border-line rounded-2xl p-6 relative">
                <span className="absolute top-5 right-5 text-[13px] font-mono font-bold text-faint">0{i + 1}</span>
                <motion.div
                  whileHover={reduce ? undefined : { scale: 1.08, rotate: 6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25 mb-4"
                >
                  <s.Icon size={21} strokeWidth={2} />
                </motion.div>
                <h3 className="text-[16px] font-bold m-0">{s.title}</h3>
                <p className="text-[14px] text-muted leading-relaxed m-0 mt-2">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* From code to motion — typing editor */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Write it, watch it</span>
            <h2 className="text-[30px] font-extrabold tracking-tight mt-2 m-0 text-balance">Your code becomes a visualization — instantly</h2>
            <p className="text-muted text-[16px] leading-relaxed mt-4 max-w-lg">
              Type any algorithm and hit run. A real debugger captures every step, then CodeViz replays it as motion — values swapping, pointers gliding, the call stack unfolding.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {['Real execution — not a canned animation', 'Step forward & back through every state', 'Same experience across all 8 languages'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-[15px] text-text">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-success/15 text-success shrink-0"><Check size={13} strokeWidth={3} /></span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <motion.div className="inline-block" whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                <Button size="lg" onClick={() => navigate('/signup')}>Try it now <ArrowRight size={16} /></Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <TypingCode reduce={reduce} />
          </motion.div>
        </div>
      </section>

      {/* Languages — infinite marquee */}
      <section id="languages" className="max-w-4xl mx-auto px-6 py-16 text-center">
        <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Languages</span>
        <h2 className="text-[30px] font-extrabold tracking-tight mt-2 mb-8 m-0">Real execution, real traces</h2>
        <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
          <motion.div
            className="flex gap-3 w-max"
            animate={reduce ? undefined : { x: ['0%', '-50%'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            {[...LANGS, ...LANGS].map((l, i) => (
              <span key={`${l}-${i}`} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text bg-surface border border-line rounded-full px-4 py-2 whitespace-nowrap">
                <Check size={14} className="text-success" /> {l}
              </span>
            ))}
          </motion.div>
        </div>
        <p className="text-muted text-[14px] mt-8 flex items-center justify-center gap-2"><GitBranch size={15} /> C/C++ via GDB · Java via JDI · full call-stacks &amp; recursion</p>
      </section>

      {/* Stats band — count up */}
      <section className="border-y border-line bg-elevated">
        <motion.div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center" variants={v(staggerParent)} {...inView}>
          {[
            { node: <Counter to={8} reduce={reduce} />, l: 'Languages' },
            { node: <Counter to={50} suffix="+" reduce={reduce} />, l: 'Practice problems' },
            { node: <Counter to={100} suffix="%" reduce={reduce} />, l: 'Animated traces' },
            { node: 'GDB · JDI', l: 'Real debuggers' },
          ].map((s) => (
            <motion.div key={s.l} variants={v(popIn)}>
              <div className="text-[30px] font-extrabold tracking-tight text-accent tabular-nums">{s.node}</div>
              <div className="text-[13px] text-muted mt-1">{s.l}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why it's different — honest value/trust markers (no fabricated social proof) */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Why it&apos;s different</span>
          <h2 className="text-[30px] font-extrabold tracking-tight mt-2 m-0">Understanding, not memorization</h2>
        </div>
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" variants={v(staggerParent)} {...inView}>
          {[
            ['Real execution, not canned clips', 'Your code runs in a secure, network-isolated sandbox and a real debugger captures every step — the animation is your program, not a pre-recorded demo.'],
            ['Watch it, don’t just read it', 'Arrays swap, pointers glide, recursion unfolds. Concepts that take pages to explain click in a single animation.'],
            ['Free where others paywall', 'Editorials, animated lessons and practice are open — no locked solutions, no drip-fed content.'],
          ].map(([title, body]) => (
            <motion.div
              key={title}
              variants={v(fadeUp)}
              whileHover={reduce ? undefined : { y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="bg-surface border border-line rounded-2xl p-6 shadow-[var(--cz-shadow-sm)] hover:shadow-[var(--cz-shadow-md)] transition-shadow"
            >
              <div className="flex items-center gap-2 text-accent mb-2"><Check size={16} strokeWidth={2.5} /><span className="text-[15px] font-bold text-text">{title}</span></div>
              <p className="text-[14px] text-muted leading-relaxed m-0">{body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          {...inView}
          variants={v(popIn)}
          className="rounded-3xl border border-accent/30 p-10 md:p-14 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--cz-accent) 12%, var(--cz-surface)), var(--cz-surface))' }}
        >
          <motion.div
            aria-hidden
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full -z-0"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--cz-accent) 22%, transparent), transparent 70%)' }}
            animate={reduce ? undefined : { x: [0, 20, 0], y: [0, 15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative z-10">
            <h2 className="text-[32px] md:text-[38px] font-extrabold tracking-tight m-0 text-balance">Ready to see your code?</h2>
            <p className="text-muted text-[16px] max-w-xl mx-auto mt-3">Join learners mastering algorithms visually. Free to start — no card required.</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
              <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                <Button size="lg" onClick={() => navigate('/signup')}>Create free account <ArrowRight size={16} /></Button>
              </motion.div>
              <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
                <Button variant="secondary" size="lg" onClick={() => navigate('/about')}>Learn more</Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}
