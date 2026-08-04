import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Zap, Flame, CheckCircle2, Code2, GraduationCap, Swords, ListChecks,
  Target, BarChart3, Flag, Search, Map, ArrowRight, ArrowUpRight,
} from 'lucide-react';
import StreakCounter from '../components/Gamification/StreakCounter';
import XPBar from '../components/Gamification/XPBar';
import AlgorithmDNA from '../components/Gamification/AlgorithmDNA';
import SkillTreeWidget from '../components/Gamification/SkillTreeWidget';
import { Badge, Button } from '../components/ui';
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
];

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const TONE = {
  accent: 'text-accent bg-accent/12', warning: 'text-warning bg-warning/12',
  danger: 'text-hard bg-hard/12', success: 'text-success bg-success/12',
};

function StatTile({ Icon, value, label, tone = 'accent' }) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-line rounded-xl px-4 py-3.5 min-w-0 shadow-[var(--cz-shadow-sm)]">
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TONE[tone]}`}>
        <Icon size={17} strokeWidth={2.2} />
      </span>
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="text-[20px] font-bold text-text tabular-nums">{value}</span>
        <span className="text-[11px] text-muted truncate">{label}</span>
      </div>
    </div>
  );
}

function Panel({ title, right, children, className = '', bodyClass = '' }) {
  return (
    <div className={`flex flex-col bg-surface border border-line rounded-xl min-w-0 overflow-hidden shadow-[var(--cz-shadow-sm)] ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 h-11 border-b border-line shrink-0">
        <span className="text-[13px] font-bold text-text">{title}</span>
        {right}
      </div>
      <div className={`flex-1 min-h-0 ${bodyClass}`}>{children}</div>
    </div>
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
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const [gamification, setGamification] = useState(null);
  const [time, setTime] = useState('');
  const [greeting, setGreeting] = useState('');

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

  return (
    <div className="min-h-full bg-bg text-text overflow-x-hidden" style={FONT}>
      <div className="w-full px-6 py-6 pb-16">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-line">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight leading-tight m-0">
              {greeting}, <span className="text-accent">{firstName}</span>
            </h1>
            <p className="text-muted text-[13px] m-0 mt-0.5">Welcome back — keep the momentum going.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] text-muted tabular-nums">{time}</span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile Icon={Trophy} value={gamification?.level || 1} label="Current level" tone="warning" />
          <StatTile Icon={Zap} value={gamification?.xp || 0} label="Total XP" tone="accent" />
          <StatTile Icon={Flame} value={streak} label="Day streak" tone="danger" />
          <StatTile Icon={CheckCircle2} value={gamification?.problemsSolved || 0} label="Problems solved" tone="success" />
        </div>

        {/* Progress + Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          <Panel title="Progress & Streak" right={<Badge tone="success">Live</Badge>} className="lg:col-span-7 min-h-[168px]" bodyClass="p-4 flex flex-col justify-center gap-4 overflow-x-auto">
            {gamification ? <XPBar xp={gamification.xp} level={gamification.level} /> : <div className="h-3 rounded bg-elevated animate-pulse" />}
            {gamification ? <StreakCounter streak={gamification.streak} /> : <div className="h-3 rounded bg-elevated animate-pulse w-2/3" />}
          </Panel>

          <Panel title="Daily Mission" right={<Target size={15} className="text-accent" />} className="lg:col-span-5" bodyClass="p-4 flex flex-col gap-3">
            <h3 className="text-[15px] font-bold text-text m-0">Solve a Medium problem</h3>
            <p className="text-[13px] text-muted leading-relaxed m-0">Complete any medium challenge to earn bonus XP and extend your streak.</p>
            <div className="flex gap-2">
              <Badge tone="accent">+50 XP</Badge>
              <Badge tone="warning">+1 streak</Badge>
            </div>
            <Button size="md" className="self-start mt-0.5" onClick={() => navigate('/problems')}>
              Accept mission <ArrowRight size={15} />
            </Button>
          </Panel>
        </div>

        {/* Quick launch */}
        <SectionLabel>Quick launch</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m, i) => (
            <motion.button
              key={m.path}
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}
              onClick={() => navigate(m.path)}
              className="group relative flex items-center gap-3 text-left bg-surface border border-line rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-accent hover:-translate-y-0.5"
            >
              <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-accent/12 text-accent border border-accent/25 group-hover:bg-accent group-hover:text-accent-fg transition-colors">
                <m.Icon size={19} strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-bold text-text truncate">{m.title}</span>
                <span className="block text-[12px] text-muted truncate">{m.desc}</span>
              </span>
              <ArrowUpRight size={16} className="ml-auto shrink-0 text-muted opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all" />
            </motion.button>
          ))}
        </div>

        {/* Widgets — fixed height, scroll inside so legacy widgets never overflow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Panel title="Algorithm DNA" right={<Badge tone="accent">AI analysis</Badge>} className="h-[320px]" bodyClass="p-4 overflow-auto">
            <AlgorithmDNA />
          </Panel>
          <Panel title="Skill Architecture" className="h-[320px]" bodyClass="p-4 overflow-auto">
            <SkillTreeWidget />
          </Panel>
        </div>

        {/* Explore */}
        <SectionLabel>Explore more</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK.map((q) => (
            <button
              key={q.path}
              onClick={() => navigate(q.path)}
              className="flex items-center gap-2.5 bg-surface border border-line rounded-lg px-4 py-3 cursor-pointer transition-all hover:border-accent hover:-translate-y-0.5 min-w-0"
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-elevated text-muted"><q.Icon size={16} /></span>
              <span className="text-[13px] font-semibold text-text flex-1 text-left truncate">{q.label}</span>
              <ArrowRight size={14} className="text-muted shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
