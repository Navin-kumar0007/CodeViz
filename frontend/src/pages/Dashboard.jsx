import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StreakCounter from '../components/Gamification/StreakCounter';
import XPBar from '../components/Gamification/XPBar';
import AlgorithmDNA from '../components/Gamification/AlgorithmDNA';
import SkillTreeWidget from '../components/Gamification/SkillTreeWidget';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button } from '../components/ui';
import API_BASE from '../utils/api';

const MODULES = [
  { icon: '⟩_', title: 'Practice IDE', desc: 'Write, run, and visualize algorithms', path: '/practice' },
  { icon: '📚', title: 'Academy', desc: 'Structured learning pathways', path: '/learn' },
  { icon: '⚔️', title: 'Battle Arena', desc: 'Real-time code battles', path: '/room' },
  { icon: '🧩', title: 'Problem Vault', desc: 'Browse algorithm challenges', path: '/problems' },
  { icon: '🎯', title: 'Interview Prep', desc: 'Mock interviews with AI', path: '/interview-prep' },
  { icon: '📊', title: 'Progress Reports', desc: 'Track your growth', path: '/progress' },
];

const QUICK = [
  { label: 'Daily Challenge', path: '/daily-challenge', icon: '🔥' },
  { label: 'Algo Race', path: '/algo-race', icon: '🏁' },
  { label: 'Code Review', path: '/code-review', icon: '🔍' },
  { label: 'Concept Map', path: '/concept-map', icon: '🗺️' },
];

function StatTile({ icon, value, label }) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</span>
        <span className="text-base opacity-80">{icon}</span>
      </div>
      <span className="text-[26px] font-extrabold text-text tabular-nums leading-none mt-1">{value}</span>
    </Card>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-3 mt-2">
      <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-faint whitespace-nowrap">{children}</span>
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

  useEffect(() => {
    if (!localStorage.getItem('userInfo')) navigate('/login');
  }, [navigate]);

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
    <div className="min-h-full bg-bg text-text" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="max-w-[1320px] mx-auto px-6 md:px-8 py-6 pb-14">
        {/* Header */}
        <motion.header
          initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
          className="flex items-center justify-between gap-4 pb-5 mb-5 border-b border-line"
        >
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight m-0">
              {greeting}, <span className="text-accent">{firstName}</span>
            </h1>
            <p className="text-muted text-sm m-0 mt-0.5">Welcome back to your observatory. Keep the momentum going.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted tabular-nums">{time}</span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatTile icon="🏆" value={gamification?.level || 1} label="Current level" />
          <StatTile icon="⚡" value={gamification?.xp || 0} label="Total XP" />
          <StatTile icon="🔥" value={streak} label="Day streak" />
          <StatTile icon="✅" value={gamification?.problemsSolved || 0} label="Problems solved" />
        </div>

        {/* Progress + Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-2">
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Progress &amp; Streak</CardTitle>
              <Badge tone="success">Live</Badge>
            </CardHeader>
            <CardBody className="flex flex-col justify-center gap-4">
              {gamification ? <XPBar xp={gamification.xp} level={gamification.level} /> : <div className="h-4 rounded bg-elevated animate-pulse" />}
              {gamification ? <StreakCounter streak={gamification.streak} /> : <div className="h-4 rounded bg-elevated animate-pulse w-2/3" />}
            </CardBody>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader><CardTitle>🎯 Daily Mission</CardTitle></CardHeader>
            <CardBody className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-text m-0">Solve a Medium problem</h3>
              <p className="text-[13px] text-muted leading-relaxed m-0">Complete any medium-difficulty challenge to earn bonus XP and extend your streak.</p>
              <div className="flex gap-2">
                <Badge tone="accent">+50 XP</Badge>
                <Badge tone="warning">+1 🔥 Streak</Badge>
              </div>
              <Button className="self-start mt-1" onClick={() => navigate('/problems')}>Accept mission →</Button>
            </CardBody>
          </Card>
        </div>

        {/* Quick launch */}
        <SectionLabel>Quick launch</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {MODULES.map((m, i) => (
            <motion.button
              key={m.path}
              initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}
              onClick={() => navigate(m.path)}
              className="group relative text-left bg-surface border border-line rounded-xl p-5 cursor-pointer transition-all hover:border-accent hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-[22px] bg-elevated border border-line group-hover:border-accent/40 transition-colors">{m.icon}</div>
              <h3 className="text-[15px] font-bold text-text m-0">{m.title}</h3>
              <p className="text-[12px] text-muted leading-snug m-0 mt-1">{m.desc}</p>
              <span className="absolute top-5 right-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity font-bold">→</span>
            </motion.button>
          ))}
        </div>

        {/* Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Card className="min-h-[340px]">
            <CardHeader><CardTitle>🧬 Algorithm DNA</CardTitle><Badge tone="accent">AI analysis</Badge></CardHeader>
            <CardBody><AlgorithmDNA /></CardBody>
          </Card>
          <Card className="min-h-[340px]">
            <CardHeader><CardTitle>🗺️ Skill Architecture</CardTitle></CardHeader>
            <CardBody><SkillTreeWidget /></CardBody>
          </Card>
        </div>

        {/* Explore */}
        <SectionLabel>Explore more</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK.map((q) => (
            <button
              key={q.path}
              onClick={() => navigate(q.path)}
              className="flex items-center gap-3 bg-surface border border-line rounded-xl px-4 py-3.5 cursor-pointer transition-all hover:border-accent hover:-translate-y-0.5"
            >
              <span className="text-lg">{q.icon}</span>
              <span className="text-[13px] font-semibold text-text flex-1 text-left">{q.label}</span>
              <span className="text-muted text-sm">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
