import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg text-text" style={FONT}>
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-line" style={{ background: 'color-mix(in srgb, var(--cz-bg) 82%, transparent)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-accent border border-accent/40 bg-accent/12"><Hexagon size={16} strokeWidth={2.5} /></span>
            <span className="text-[17px] font-extrabold tracking-tight text-text">CodeViz</span>
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={() => navigate('/home')}>Home</Button>
            <Button variant="primary" size="md" onClick={() => navigate('/signup')}>Get started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Our mission</span>
          <h1 className="text-[40px] md:text-[48px] font-extrabold tracking-tight leading-[1.08] mt-3 m-0 text-balance">
            Make algorithms <span style={{ background: 'linear-gradient(90deg, var(--cz-accent), #7c93ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>impossible to not understand.</span>
          </h1>
          <p className="text-muted text-[17px] max-w-2xl mx-auto mt-5 leading-relaxed">
            CodeViz turns abstract code into something you can watch, step through, and reason about — so the moment logic clicks arrives sooner, for everyone.
          </p>
        </motion.div>
      </section>

      {/* Pillars */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ y: 16, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.05 * i }}
              className="bg-surface border border-line rounded-2xl p-6 shadow-[var(--cz-shadow-sm)]"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25 mb-4"><p.Icon size={21} strokeWidth={2} /></div>
              <h3 className="text-[17px] font-bold m-0">{p.title}</h3>
              <p className="text-[14px] text-muted leading-relaxed m-0 mt-2">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section className="bg-elevated border-y border-line">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Built with</span>
          <h2 className="text-[26px] font-extrabold tracking-tight mt-2 mb-6 m-0">A modern, real-execution stack</h2>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {STACK.map((t) => (
              <span key={t} className="text-[13px] font-medium text-text bg-surface border border-line rounded-full px-4 py-2">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section id="founder" className="max-w-3xl mx-auto px-6 py-16 scroll-mt-20">
        <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Founder</span>
        <div className="mt-4 flex flex-col sm:flex-row items-start gap-5 bg-surface border border-line rounded-2xl p-6 shadow-[var(--cz-shadow-sm)]">
          <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-[22px] font-extrabold text-accent-fg shrink-0" style={{ background: 'linear-gradient(135deg, var(--cz-accent), #7c93ff)' }}>NK</span>
          <div>
            <div className="text-[18px] font-bold m-0">Navin Kumar</div>
            <div className="text-[13px] text-accent font-semibold">Founder &amp; Engineer</div>
            <p className="text-[14px] text-muted leading-relaxed mt-2 m-0">
              I built CodeViz because the moment an algorithm finally “clicks” shouldn’t depend on staring at static code.
              Seeing data structures move — pointers gliding, values swapping, recursion unfolding — makes the abstract concrete.
              The goal is simple: make algorithms impossible to <i>not</i> understand, for learners and educators alike.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <h2 className="text-[30px] font-extrabold tracking-tight m-0">Come see your code run.</h2>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Button size="lg" onClick={() => navigate('/signup')}>Get started free <ArrowRight size={16} /></Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>Sign in</Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
