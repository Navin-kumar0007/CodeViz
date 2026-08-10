import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Trophy, Zap, Flame, CheckCircle2, Code2, GraduationCap, Swords, ListChecks,
  Target, BarChart3, Flag, Search, Map, ArrowRight, ArrowUpRight, Award,
} from 'lucide-react';
import StreakCounter from '../components/Gamification/StreakCounter';
import XPBar from '../components/Gamification/XPBar';
import AlgorithmDNA from '../components/Gamification/AlgorithmDNA';
import SkillTreeWidget from '../components/Gamification/SkillTreeWidget';
import FocusPlan from '../components/Learning/FocusPlan';
import OnboardingModal, { shouldOnboard } from '../components/Onboarding/OnboardingModal';
import { Badge, Button } from '../components/ui';
import { useCountUp } from '../hooks/useCountUp';
import { getFx } from '../utils/effects';
import API_BASE from '../utils/api';

const MODULES = [
  { Icon: Code2, title: 'Practice IDE', desc: 'Write, run & visualize algorithms', path: '/practice' },
  { Icon: GraduationCap, title: 'Academy', desc: 'Structured learning pathways', path: '/learn' },
  { Icon: Swords, title: 'Battle Arena', desc: 'Real-time code battles', path: '/room' },
  { Icon: ListChecks, title: 'Problem Vault', desc: 'Browse & solve challenges', path: '/problems' },
  { Icon: Target, title: 'Interview Prep', desc: 'AI-guided mock interviews', path: '/interview-prep' },
  { Icon: BarChart3, title: 'Progress Reports', desc: 'Track your growth', path: '/progress' },
];

const QUICK = [
  { label: 'Daily Challenge', path: '/daily-challenge', Icon: Flame },
  { label: 'Algo Race', path: '/algo-race', Icon: Flag },
  { label: 'Code Review', path: '/code-review', Icon: Search },
  { label: 'Concept Map', path: '/concept-map', Icon: Map },
  { label: 'Certificates', path: '/certificates', Icon: Award },
];

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const TONE = {
  accent: { chip: 'text-accent', v: '--cz-accent' },
  warning: { chip: 'text-warning', v: '--cz-warning' },
  danger: { chip: 'text-hard', v: '--cz-hard' },
  success: { chip: 'text-success', v: '--cz-success' },
};

// ---- Shared motion ----
const EASE = [0.22, 1, 0.36, 1];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } } };
const popIn = { hidden: { opacity: 0, y: 14, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } } };
const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } };

function StatTile({ Icon, value, label, tone = 'accent' }) {
  const t = TONE[tone];
  const reduce = useReducedMotion();
  const shown = useCountUp(Number(value) || 0, { enabled: getFx().countUp });
  return (
    <motion.div
      variants={reduce ? undefined : popIn}
      whileHover={reduce ? undefined : { y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="group relative flex items-center gap-3 border border-line rounded-xl px-4 py-3.5 min-w-0 shadow-[var(--cz-shadow-sm)] hover:shadow-[var(--cz-shadow-md)] overflow-hidden transition-shadow"
      style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(${t.v}) 12%, var(--cz-surface)), var(--cz-surface) 60%)` }}
    >
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `var(${t.v})` }} />
      <motion.span
        whileHover={reduce ? undefined : { rotate: -8, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 12 }}
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t.chip}`}
        style={{ background: `color-mix(in srgb, var(${t.v}) 18%, transparent)`, border: `1px solid color-mix(in srgb, var(${t.v}) 35%, transparent)` }}
      >
        <Icon size={17} strokeWidth={2.2} />
      </motion.span>
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="text-[20px] font-bold text-text tabular-nums">{shown}</span>
        <span className="text-[11px] text-muted truncate">{label}</span>
      </div>
    </motion.div>
  );
}

function Panel({ title, right, children, className = '', bodyClass = '', variants }) {
  return (
    <motion.div variants={variants} className={`flex flex-col bg-surface border border-line rounded-xl min-w-0 overflow-hidden shadow-[var(--cz-shadow-sm)] ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 h-11 border-b border-line shrink-0">
        <span className="text-[13px] font-bold text-text">{title}</span>
        {right}
      </div>
      <div className={`flex-1 min-h-0 ${bodyClass}`}>{children}</div>
    </motion.div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-7">
      <span className="text-[11px] font-bold uppercase tracking-[1.4px] text-faint whitespace-nowrap">{children}</span>
      <span className="flex-1 h-px bg-line" />
    </div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const [gamification, setGamification] = useState(null);
  const [time, setTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [onboard, setOnboard] = useState(shouldOnboard);

  useEffect(() => { if (!localStorage.getItem('userInfo')) navigate('/login'); }, [navigate]);

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (info?.token) {
      fetch(`${API_BASE}/api/gamification/stats`, { headers: { Authorization: `Bearer ${info.token}` } })
        .then((r) => r.json()).then(setGamification).catch((e) => console.error('Gamification sync failed:', e));
    }
    const tick = () => {
      const now = new Date();
      const h = now.getHours();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };
  const firstName = user?.name?.split(' ')[0] || 'Developer';
  const streak = typeof gamification?.streak === 'object' ? (gamification.streak?.current || 0) : (gamification?.streak || 0);

  // On-mount reveal helper (above the fold → animate immediately, not on scroll)
  const reveal = reduce ? {} : { variants: stagger, initial: 'hidden', animate: 'show' };

  return (
    <div className="min-h-full bg-bg text-text overflow-x-hidden" style={FONT}>
      <div className="w-full px-6 py-6 pb-16">
        {/* Header */}
        <motion.header
          initial={reduce ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-line"
        >
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight leading-tight m-0">
              {greeting},{' '}
              <span style={{ background: 'linear-gradient(90deg, var(--cz-accent), #94a6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{firstName}</span>
            </h1>
            <p className="text-muted text-[13px] m-0 mt-0.5">Welcome back — keep the momentum going.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] text-muted tabular-nums">{time}</span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </motion.header>

        {/* Stats */}
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" {...reveal}>
          <StatTile Icon={Trophy} value={gamification?.level || 1} label="Current level" tone="warning" />
          <StatTile Icon={Zap} value={gamification?.xp || 0} label="Total XP" tone="accent" />
          <StatTile Icon={Flame} value={streak} label="Day streak" tone="danger" />
          <StatTile Icon={CheckCircle2} value={gamification?.problemsSolved || 0} label="Problems solved" tone="success" />
        </motion.div>

        {/* Progress + Mission */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4" {...reveal}>
          <Panel variants={reduce ? undefined : fadeUp} title="Progress & Streak" right={<Badge tone="success">Live</Badge>} className="lg:col-span-7 min-h-[168px]" bodyClass="p-4 flex flex-col justify-center gap-4 overflow-x-auto">
            {gamification ? <XPBar xp={gamification.xp} level={gamification.level} /> : <div className="h-3 rounded bg-elevated animate-pulse" />}
            {gamification ? <StreakCounter streak={gamification.streak} /> : <div className="h-3 rounded bg-elevated animate-pulse w-2/3" />}
          </Panel>

          <Panel variants={reduce ? undefined : fadeUp} title="Daily Mission" right={<Target size={15} className="text-accent" />} className="lg:col-span-5" bodyClass="p-4 flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-text m-0">Solve a Medium problem</h3>
            <p className="text-[13px] text-muted leading-relaxed m-0">Complete any medium challenge to earn bonus XP and extend your streak.</p>
            <div className="flex gap-2">
              <Badge tone="accent">+50 XP</Badge>
              <Badge tone="warning">+1 streak</Badge>
            </div>
            <motion.div className="self-start mt-0.5" whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
              <Button size="md" onClick={() => navigate('/problems')}>
                Accept mission <ArrowRight size={15} />
              </Button>
            </motion.div>
          </Panel>
        </motion.div>

        {/* Adaptive focus — "it knows what you don't know" */}
        <motion.div className="mt-4" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <FocusPlan />
        </motion.div>

        {/* Quick launch */}
        <SectionLabel>Quick launch</SectionLabel>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={reduce ? undefined : stagger} initial={reduce ? false : 'hidden'} whileInView={reduce ? undefined : 'show'} viewport={{ once: true, amount: 0.2 }}>
          {MODULES.map((m) => (
            <motion.button
              key={m.path}
              variants={reduce ? undefined : popIn}
              whileHover={reduce ? undefined : { y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              onClick={() => navigate(m.path)}
              className="group relative flex items-center gap-3 text-left bg-surface border border-line rounded-xl p-4 cursor-pointer hover:border-accent hover:shadow-[var(--cz-shadow-md)] transition-[border-color,box-shadow]"
            >
              <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-accent/12 text-accent border border-accent/25 group-hover:bg-accent group-hover:text-accent-fg transition-colors">
                <m.Icon size={19} strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-bold text-text truncate">{m.title}</span>
                <span className="block text-[12px] text-muted truncate">{m.desc}</span>
              </span>
              <ArrowUpRight size={16} className="ml-auto shrink-0 text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent transition-all" />
            </motion.button>
          ))}
        </motion.div>

        {/* Widgets — fixed height, scroll inside so legacy widgets never overflow */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4" variants={reduce ? undefined : stagger} initial={reduce ? false : 'hidden'} whileInView={reduce ? undefined : 'show'} viewport={{ once: true, amount: 0.15 }}>
          <Panel variants={reduce ? undefined : fadeUp} title="Algorithm DNA" right={<Badge tone="accent">AI analysis</Badge>} className="h-[320px]" bodyClass="p-4 overflow-auto">
            <AlgorithmDNA />
          </Panel>
          <Panel variants={reduce ? undefined : fadeUp} title="Skill Architecture" className="h-[320px]" bodyClass="p-4 overflow-auto">
            <SkillTreeWidget />
          </Panel>
        </motion.div>

        {/* Explore */}
        <SectionLabel>Explore more</SectionLabel>
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={reduce ? undefined : stagger} initial={reduce ? false : 'hidden'} whileInView={reduce ? undefined : 'show'} viewport={{ once: true, amount: 0.3 }}>
          {QUICK.map((q) => (
            <motion.button
              key={q.path}
              variants={reduce ? undefined : popIn}
              whileHover={reduce ? undefined : { y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              onClick={() => navigate(q.path)}
              className="flex items-center gap-2.5 bg-surface border border-line rounded-lg px-4 py-3 cursor-pointer hover:border-accent transition-colors min-w-0"
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-elevated text-muted"><q.Icon size={16} /></span>
              <span className="text-[13px] font-semibold text-text flex-1 text-left truncate">{q.label}</span>
              <ArrowRight size={14} className="text-muted shrink-0" />
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {onboard && <OnboardingModal onClose={() => setOnboard(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
