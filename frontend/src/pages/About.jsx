import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Hexagon, Eye, Gamepad2, Bot, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui';
import PublicFooter from '../components/marketing/PublicFooter';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

const PILLARS = [
  { Icon: Eye, title: 'Visualize', desc: 'Seeing is understanding. Every algorithm deserves a visual story — not a wall of text.' },
  { Icon: Gamepad2, title: 'Gamify', desc: 'Learning should feel like play. XP, streaks and challenges build mastery through engagement.' },
  { Icon: Bot, title: 'Augment', desc: "AI doesn't replace thinking — it accelerates it. Our Socratic tutor guides, never just solves." },
];

const STACK = ['React 19', 'Vite', 'Node · Express', 'MongoDB', 'Socket.IO', 'Docker', 'GDB · JDI', 'Gemini · Groq'];

const EASE = [0.22, 1, 0.36, 1];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } };
const popIn = { hidden: { opacity: 0, scale: 0.9, y: 12 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

export default function About() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const v = (variants) => (reduce ? undefined : variants);
  const inView = reduce ? {} : { variants: stagger, initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.25 } };

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
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer">
            <motion.span
              whileHover={reduce ? undefined : { rotate: 90, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-accent border border-accent/40 bg-accent/12"
            >
              <Hexagon size={16} strokeWidth={2.5} />
            </motion.span>
            <span className="text-[17px] font-extrabold tracking-tight text-text">CodeViz</span>
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={() => navigate('/home')}>Home</Button>
            <Button variant="primary" size="md" onClick={() => navigate('/signup')}>Get started</Button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(800px circle at 50% -10%, color-mix(in srgb, var(--cz-accent) 13%, transparent), transparent 60%)' }}
          animate={reduce ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center"
          variants={v(stagger)}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? undefined : 'show'}
        >
          <motion.span variants={v(popIn)} className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Our mission</motion.span>
          <motion.h1 variants={v(fadeUp)} className="text-[40px] md:text-[48px] font-extrabold tracking-tight leading-[1.08] mt-3 m-0 text-balance">
            Make algorithms{' '}
            <motion.span
              className="inline-block"
              style={{ background: 'linear-gradient(90deg, var(--cz-accent), #7c93ff, var(--cz-accent))', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              animate={reduce ? undefined : { backgroundPosition: ['0% center', '200% center'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              impossible to not understand.
            </motion.span>
          </motion.h1>
          <motion.p variants={v(fadeUp)} className="text-muted text-[17px] max-w-2xl mx-auto mt-5 leading-relaxed">
            CodeViz turns abstract code into something you can watch, step through, and reason about — so the moment logic clicks arrives sooner, for everyone.
          </motion.p>
        </motion.div>
      </section>

      {/* Pillars */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5" {...inView}>
          {PILLARS.map((p) => (
            <motion.div
              key={p.title}
              variants={v(fadeUp)}
              whileHover={reduce ? undefined : { y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="bg-surface border border-line rounded-2xl p-6 shadow-[var(--cz-shadow-sm)] hover:shadow-[var(--cz-shadow-md)] hover:border-accent/40 transition-[box-shadow,border-color]"
            >
              <motion.div
                whileHover={reduce ? undefined : { rotate: -8, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25 mb-4"
              >
                <p.Icon size={21} strokeWidth={2} />
              </motion.div>
              <h3 className="text-[17px] font-bold m-0">{p.title}</h3>
              <p className="text-[14px] text-muted leading-relaxed m-0 mt-2">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Tech — marquee */}
      <section className="bg-elevated border-y border-line">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Built with</span>
          <h2 className="text-[26px] font-extrabold tracking-tight mt-2 mb-8 m-0">A modern, real-execution stack</h2>
          <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
            <motion.div
              className="flex gap-2.5 w-max"
              animate={reduce ? undefined : { x: ['0%', '-50%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              {[...STACK, ...STACK].map((t, i) => (
                <span key={`${t}-${i}`} className="text-[13px] font-medium text-text bg-surface border border-line rounded-full px-4 py-2 whitespace-nowrap">{t}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section id="founder" className="max-w-3xl mx-auto px-6 py-16 scroll-mt-20">
        <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={reduce ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.55, ease: EASE }}>
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Founder</span>
          <motion.div
            whileHover={reduce ? undefined : { y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="mt-4 flex flex-col sm:flex-row items-start gap-5 bg-surface border border-line rounded-2xl p-6 shadow-[var(--cz-shadow-sm)] hover:shadow-[var(--cz-shadow-md)] transition-shadow"
          >
            <motion.span
              whileHover={reduce ? undefined : { rotate: 6, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-[22px] font-extrabold text-accent-fg shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--cz-accent), #7c93ff)' }}
            >
              NK
            </motion.span>
            <div>
              <div className="text-[18px] font-bold m-0">Navin Kumar</div>
              <div className="text-[13px] text-accent font-semibold">Founder &amp; Engineer</div>
              <p className="text-[14px] text-muted leading-relaxed mt-2 m-0">
                I built CodeViz because the moment an algorithm finally “clicks” shouldn’t depend on staring at static code.
                Seeing data structures move — pointers gliding, values swapping, recursion unfolding — makes the abstract concrete.
                The goal is simple: make algorithms impossible to <i>not</i> understand, for learners and educators alike.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <motion.h2 initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={reduce ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE }} className="text-[30px] font-extrabold tracking-tight m-0">Come see your code run.</motion.h2>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
            <Button size="lg" onClick={() => navigate('/signup')}>Get started free <ArrowRight size={16} /></Button>
          </motion.div>
          <motion.div whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>Sign in</Button>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
