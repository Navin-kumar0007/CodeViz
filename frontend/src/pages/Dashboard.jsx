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
import { Card, CardHeader, CardTitle, CardBody, Badge, Button } from '../components/ui';
import API_BASE from '../utils/api';

const MODULES = [
  { Icon: Code2, title: 'Practice IDE', desc: 'Write, run and visualize algorithms step by step', path: '/practice' },
  { Icon: GraduationCap, title: 'Academy', desc: 'Structured, hands-on learning pathways', path: '/learn' },
  { Icon: Swords, title: 'Battle Arena', desc: 'Real-time competitive code battles', path: '/room' },
  { Icon: ListChecks, title: 'Problem Vault', desc: 'Browse and solve algorithm challenges', path: '/problems' },
  { Icon: Target, title: 'Interview Prep', desc: 'AI-guided mock technical interviews', path: '/interview-prep' },
  { Icon: BarChart3, title: 'Progress Reports', desc: 'Track your growth over time', path: '/progress' },
];

const QUICK = [
  { label: 'Daily Challenge', path: '/daily-challenge', Icon: Flame },
  { label: 'Algo Race', path: '/algo-race', Icon: Flag },
  { label: 'Code Review', path: '/code-review', Icon: Search },
  { label: 'Concept Map', path: '/concept-map', Icon: Map },
];

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

function StatTile({ Icon, value, label, tone = 'accent' }) {
  const toneCls = { accent: 'text-accent bg-accent/12', warning: 'text-warning bg-warning/12', danger: 'text-hard bg-hard/12', success: 'text-success bg-success/12' }[tone];
  return (
    <Card className="p-5 flex items-center gap-3.5 min-w-0">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${toneCls}`}>
        <Icon size={20} strokeWidth={2} />
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-faint truncate">{label}</span>
        <span className="text-[24px] font-extrabold text-text tabular-nums leading-none">{value}</span>
      </div>
    </Card>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-4 mb-5 mt-10">
      <span className="text-[12px] font-bold uppercase tracking-[1.6px] text-faint whitespace-nowrap">{children}</span>
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
      <div className="w-full px-6 md:px-8 py-7 pb-20">
        {/* Header */}
        <motion.header
          initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
          className="flex flex-wrap items-end justify-between gap-4 pb-7 mb-9 border-b border-line"
        >
          <div>
            <h1 className="text-[32px] font-extrabold tracking-tight leading-tight m-0">
              {greeting}, <span className="text-accent">{firstName}</span>
            </h1>
            <p className="text-muted text-[15px] m-0 mt-1.5">Welcome back to your observatory. Keep the momentum going.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-muted tabular-nums">{time}</span>
            <Button variant="secondary" size="md" onClick={handleLogout}>Sign out</Button>
          </div>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatTile Icon={Trophy} value={gamification?.level || 1} label="Current level" tone="warning" />
          <StatTile Icon={Zap} value={gamification?.xp || 0} label="Total XP" tone="accent" />
          <StatTile Icon={Flame} value={streak} label="Day streak" tone="danger" />
          <StatTile Icon={CheckCircle2} value={gamification?.problemsSolved || 0} label="Problems solved" tone="success" />
        </div>

        {/* Progress + Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
          <Card className="lg:col-span-7 min-w-0 overflow-hidden">
            <CardHeader className="px-6 py-4">
              <CardTitle>Progress &amp; Streak</CardTitle>
              <Badge tone="success">Live</Badge>
            </CardHeader>
            <CardBody className="p-6 flex flex-col justify-center gap-5 min-h-[180px] overflow-x-auto">
              {gamification ? <XPBar xp={gamification.xp} level={gamification.level} /> : <div className="h-4 rounded bg-elevated animate-pulse" />}
              {gamification ? <StreakCounter streak={gamification.streak} /> : <div className="h-4 rounded bg-elevated animate-pulse w-2/3" />}
            </CardBody>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader className="px-6 py-4"><CardTitle className="flex items-center gap-2"><Target size={16} className="text-accent" /> Daily Mission</CardTitle></CardHeader>
            <CardBody className="p-6 flex flex-col gap-4">
              <h3 className="text-[17px] font-bold text-text m-0">Solve a Medium problem</h3>
              <p className="text-sm text-muted leading-relaxed m-0">Complete any medium-difficulty challenge to earn bonus XP and extend your streak.</p>
              <div className="flex gap-2">
                <Badge tone="accent">+50 XP</Badge>
                <Badge tone="warning">+1 streak</Badge>
              </div>
              <Button size="lg" className="self-start mt-1" onClick={() => navigate('/problems')}>
                Accept mission <ArrowRight size={16} />
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Quick launch */}
        <SectionLabel>Quick launch</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m, i) => (
            <motion.button
              key={m.path}
              initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}
              onClick={() => navigate(m.path)}
              className="group relative text-left bg-surface border border-line rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:border-accent hover:-translate-y-1 hover:shadow-[var(--cz-shadow-lg)]"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-accent/12 text-accent border border-accent/25 group-hover:bg-accent group-hover:text-accent-fg transition-colors">
                <m.Icon size={22} strokeWidth={2} />
              </div>
              <h3 className="text-[16px] font-bold text-text m-0">{m.title}</h3>
              <p className="text-[13px] text-muted leading-relaxed m-0 mt-1.5 pr-6">{m.desc}</p>
              <ArrowUpRight size={18} className="absolute top-6 right-6 text-muted opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all" />
            </motion.button>
          ))}
        </div>

        {/* Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          <Card className="min-h-[340px] min-w-0 overflow-hidden">
            <CardHeader className="px-6 py-4"><CardTitle>Algorithm DNA</CardTitle><Badge tone="accent">AI analysis</Badge></CardHeader>
            <CardBody className="p-6 overflow-x-auto"><AlgorithmDNA /></CardBody>
          </Card>
          <Card className="min-h-[340px] min-w-0 overflow-hidden">
            <CardHeader className="px-6 py-4"><CardTitle>Skill Architecture</CardTitle></CardHeader>
            <CardBody className="p-6 overflow-x-auto"><SkillTreeWidget /></CardBody>
          </Card>
        </div>

        {/* Explore */}
        <SectionLabel>Explore more</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK.map((q) => (
            <button
              key={q.path}
              onClick={() => navigate(q.path)}
              className="flex items-center gap-3 bg-surface border border-line rounded-xl px-5 py-4 cursor-pointer transition-all hover:border-accent hover:-translate-y-0.5"
            >
              <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-elevated text-muted"><q.Icon size={18} /></span>
              <span className="text-[13px] font-semibold text-text flex-1 text-left">{q.label}</span>
              <ArrowRight size={15} className="text-muted" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
