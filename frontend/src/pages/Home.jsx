import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hexagon, Play, Bot, Boxes, Users, Trophy, Code2, ArrowRight, Check,
  Sparkles, GitBranch, Gauge,
} from 'lucide-react';
import { Button } from '../components/ui';

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

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg text-text" style={FONT}>
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-line" style={{ background: 'color-mix(in srgb, var(--cz-bg) 82%, transparent)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-accent border border-accent/40 bg-accent/12"><Hexagon size={16} strokeWidth={2.5} /></span>
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
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(900px circle at 50% -10%, color-mix(in srgb, var(--cz-accent) 14%, transparent), transparent 60%)' }} />
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-accent bg-accent/10 border border-accent/25 rounded-full px-3 py-1 mb-6">
              <Sparkles size={13} /> Learn algorithms by seeing them run
            </span>
            <h1 className="text-[44px] md:text-[58px] font-extrabold tracking-tight leading-[1.05] m-0 text-balance">
              See your code<br /><span style={{ background: 'linear-gradient(90deg, var(--cz-accent), #7c93ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>come to life.</span>
            </h1>
            <p className="text-muted text-[17px] md:text-[19px] max-w-2xl mx-auto mt-5 leading-relaxed">
              An all-in-one platform to write, run and <b className="text-text font-semibold">visualize</b> algorithms across 8 languages — with an AI tutor, live classrooms, and interview prep.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Button size="lg" onClick={() => navigate('/signup')}>Start visualizing — free <ArrowRight size={16} /></Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>Sign in</Button>
            </div>
            <p className="text-faint text-[13px] mt-4">No credit card required · Free forever for the basics</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Capabilities</span>
          <h2 className="text-[30px] font-extrabold tracking-tight mt-2 m-0">Everything to learn code, in one place</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ y: 16, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.04 * i }}
              className="bg-surface border border-line rounded-2xl p-6 shadow-[var(--cz-shadow-sm)] hover:shadow-[var(--cz-shadow-md)] hover:border-accent/40 transition-all"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25 mb-4"><f.Icon size={21} strokeWidth={2} /></div>
              <h3 className="text-[16px] font-bold m-0">{f.title}</h3>
              <p className="text-[14px] text-muted leading-relaxed m-0 mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-elevated border-y border-line">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">How it works</span>
            <h2 className="text-[30px] font-extrabold tracking-tight mt-2 m-0">From code to clarity in three steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="bg-surface border border-line rounded-2xl p-6 relative">
                <span className="absolute top-5 right-5 text-[13px] font-mono font-bold text-faint">0{i + 1}</span>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25 mb-4"><s.Icon size={21} strokeWidth={2} /></div>
                <h3 className="text-[16px] font-bold m-0">{s.title}</h3>
                <p className="text-[14px] text-muted leading-relaxed m-0 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="max-w-4xl mx-auto px-6 py-16 text-center">
        <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Languages</span>
        <h2 className="text-[30px] font-extrabold tracking-tight mt-2 mb-6 m-0">Real execution, real traces</h2>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {LANGS.map((l) => (
            <span key={l} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text bg-surface border border-line rounded-full px-4 py-2">
              <Check size={14} className="text-success" /> {l}
            </span>
          ))}
        </div>
        <p className="text-muted text-[14px] mt-6 flex items-center justify-center gap-2"><GitBranch size={15} /> C/C++ via GDB · Java via JDI · full call-stacks &amp; recursion</p>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-accent/30 p-10 md:p-14 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--cz-accent) 12%, var(--cz-surface)), var(--cz-surface))' }}>
          <h2 className="text-[32px] md:text-[38px] font-extrabold tracking-tight m-0 text-balance">Ready to see your code?</h2>
          <p className="text-muted text-[16px] max-w-xl mx-auto mt-3">Join learners mastering algorithms visually. Free to start — no card required.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <Button size="lg" onClick={() => navigate('/signup')}>Create free account <ArrowRight size={16} /></Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/about')}>Learn more</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-[13px] text-muted">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-accent border border-accent/40 bg-accent/12"><Hexagon size={12} strokeWidth={2.5} /></span>
            <span className="font-bold text-text">CodeViz</span>
            <span className="text-faint">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/about')} className="bg-transparent border-0 cursor-pointer text-inherit hover:text-text transition-colors">About</button>
            <button onClick={() => navigate('/login')} className="bg-transparent border-0 cursor-pointer text-inherit hover:text-text transition-colors">Sign in</button>
            <button onClick={() => navigate('/signup')} className="bg-transparent border-0 cursor-pointer text-inherit hover:text-text transition-colors">Get started</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
