import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StreakCounter from '../components/Gamification/StreakCounter';
import XPBar from '../components/Gamification/XPBar';
import AlgorithmDNA from '../components/Gamification/AlgorithmDNA';
import SkillTreeWidget from '../components/Gamification/SkillTreeWidget';
import API_BASE from '../utils/api';

/* ════════════════════════════════════════════
   Dashboard — Digital Observatory Command Center
   Phase 12: Premium 2026 Redesign
   ════════════════════════════════════════════ */

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const [gamification, setGamification] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.token) {
      fetch(`${API_BASE}/api/gamification/stats`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(stats => setGamification(stats))
      .catch(err => console.error('Gamification sync failed:', err));
    }

    // Time and greeting
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      if (hours < 12) setGreeting('Good Morning');
      else if (hours < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };
    updateTime();
    const t = setInterval(updateTime, 30000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const firstName = user?.name?.split(' ')[0] || 'Developer';

  /* Navigation Modules */
  const modules = [
    { icon: '⟩_', title: 'Practice IDE', desc: 'Write, run, and visualize algorithms', path: '/practice', accent: '#00E5EE' },
    { icon: '📚', title: 'Academy', desc: 'Structured learning pathways', path: '/learn', accent: '#7C3AED' },
    { icon: '⚔️', title: 'Battle Arena', desc: 'Real-time code battles', path: '/room', accent: '#F43F5E' },
    { icon: '🧩', title: 'Problem Vault', desc: 'Browse algorithm challenges', path: '/problems', accent: '#F59E0B' },
    { icon: '🎯', title: 'Interview Prep', desc: 'Mock interviews with AI', path: '/interview-prep', accent: '#10B981' },
    { icon: '📊', title: 'Progress Reports', desc: 'Track your growth', path: '/progress', accent: '#00E5EE' },
  ];

  const quickLinks = [
    { label: 'Daily Challenge', path: '/daily-challenge', icon: '🔥' },
    { label: 'Algo Race', path: '/algo-race', icon: '🏁' },
    { label: 'Code Review', path: '/code-review', icon: '🔍' },
    { label: 'Concept Map', path: '/concept-map', icon: '🗺️' },
  ];

  return (
    <div style={S.wrapper}>
      {/* ── Welcome Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={S.header}
      >
        <div style={S.headerLeft}>
          <h1 style={S.greeting}>{greeting}, <span style={S.gradientName}>{firstName}</span></h1>
          <p style={S.subGreeting}>Welcome back to your observatory. Keep building momentum.</p>
        </div>
        <div style={S.headerRight}>
          <span style={S.timeDisplay}>{currentTime}</span>
          <button onClick={handleLogout} style={S.logoutBtn}>Sign Out</button>
        </div>
      </motion.header>

      {/* ── Main Bento Grid ── */}
      <div style={S.bentoGrid}>

        {/* Row 1: Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }} style={{ ...S.glassCard, gridColumn: 'span 3' }}
        >
          <div style={S.statIcon}>🏆</div>
          <span style={S.statValue}>{gamification?.level || 1}</span>
          <span style={S.statLabel}>Current Level</span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }} style={{ ...S.glassCard, gridColumn: 'span 3' }}
        >
          <div style={S.statIcon}>⚡</div>
          <span style={S.statValue}>{gamification?.xp || 0}</span>
          <span style={S.statLabel}>Total XP</span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }} style={{ ...S.glassCard, gridColumn: 'span 3' }}
        >
          <div style={S.statIcon}>🔥</div>
          <span style={S.statValue}>{typeof gamification?.streak === 'object' ? (gamification.streak?.current || 0) : (gamification?.streak || 0)}</span>
          <span style={S.statLabel}>Day Streak</span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }} style={{ ...S.glassCard, gridColumn: 'span 3' }}
        >
          <div style={S.statIcon}>✅</div>
          <span style={S.statValue}>{gamification?.problemsSolved || 0}</span>
          <span style={S.statLabel}>Problems Solved</span>
        </motion.div>

        {/* Row 2: XP Progress + Daily Mission */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ ...S.panelCard, gridColumn: 'span 7' }}
        >
          <div style={S.panelHeader}>
            <span style={S.panelTitle}>Progress & Streak</span>
            <span style={S.panelBadge}>LIVE</span>
          </div>
          <div style={S.progressContent}>
            {gamification && <XPBar xp={gamification.xp} level={gamification.level} />}
            <div style={{ height: '16px' }} />
            {gamification && <StreakCounter streak={gamification.streak} />}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{ ...S.panelCard, gridColumn: 'span 5', background: 'linear-gradient(135deg, rgba(0,229,238,0.04), rgba(124,58,237,0.04))' }}
        >
          <div style={S.panelHeader}>
            <span style={S.panelTitle}>🎯 Daily Mission</span>
          </div>
          <div style={S.missionContent}>
            <h3 style={S.missionTitle}>Solve a Medium Problem</h3>
            <p style={S.missionDesc}>Complete any medium-difficulty algorithm challenge to earn bonus XP.</p>
            <div style={S.missionReward}>
              <span style={S.rewardBadge}>+50 XP</span>
              <span style={S.rewardBadge}>+1 🔥 Streak</span>
            </div>
            <button onClick={() => navigate('/problems')} style={S.missionBtn}>
              Accept Mission →
            </button>
          </div>
        </motion.div>

        {/* Row 3: Navigation Modules */}
        <div style={{ gridColumn: 'span 12' }}>
          <div style={S.sectionLabel}>
            <span style={S.labelText}>Quick Launch</span>
            <span style={S.labelLine} />
          </div>
          <div style={S.moduleGrid}>
            {modules.map((mod, i) => (
              <motion.div
                key={mod.path}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i + 0.4 }}
                whileHover={{ y: -4, borderColor: `${mod.accent}30` }}
                onClick={() => navigate(mod.path)}
                style={S.moduleCard}
              >
                <div style={{ ...S.moduleIcon, background: `${mod.accent}12`, border: `1px solid ${mod.accent}20` }}>
                  <span style={{ fontSize: '22px' }}>{mod.icon}</span>
                </div>
                <h3 style={S.moduleTitle}>{mod.title}</h3>
                <p style={S.moduleDesc}>{mod.desc}</p>
                <span style={{ ...S.moduleArrow, color: mod.accent }}>→</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row 4: Algorithm DNA + Skill Tree */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ ...S.panelCard, gridColumn: 'span 6', minHeight: '360px' }}
        >
          <div style={S.panelHeader}>
            <span style={S.panelTitle}>🧬 Algorithm DNA</span>
            <span style={{ ...S.panelBadge, background: 'rgba(124,58,237,0.1)', color: '#9F67FF' }}>AI ANALYSIS</span>
          </div>
          <div style={S.widgetWrap}><AlgorithmDNA /></div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          style={{ ...S.panelCard, gridColumn: 'span 6', minHeight: '360px' }}
        >
          <div style={S.panelHeader}>
            <span style={S.panelTitle}>🗺️ Skill Architecture</span>
          </div>
          <div style={S.widgetWrap}><SkillTreeWidget /></div>
        </motion.div>

        {/* Row 5: Quick Links */}
        <div style={{ gridColumn: 'span 12' }}>
          <div style={S.sectionLabel}>
            <span style={S.labelText}>Explore More</span>
            <span style={S.labelLine} />
          </div>
          <div style={S.quickGrid}>
            {quickLinks.map((ql, i) => (
              <motion.button
                key={ql.path}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * i + 0.7 }}
                whileHover={{ y: -2, borderColor: 'rgba(0,229,238,0.2)' }}
                onClick={() => navigate(ql.path)}
                style={S.quickLink}
              >
                <span style={{ fontSize: '18px' }}>{ql.icon}</span>
                <span style={S.quickLabel}>{ql.label}</span>
                <span style={S.quickArrow}>→</span>
              </motion.button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Styles — Digital Observatory Dashboard
   ═══════════════════════════════════════════ */
const S = {
  wrapper: {
    padding: '24px 32px 48px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
  },

  // Header
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '32px', paddingBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  headerLeft: {},
  greeting: {
    fontSize: '28px', fontWeight: 800, color: '#E8E8ED',
    letterSpacing: '-0.02em', marginBottom: '4px',
  },
  gradientName: {
    background: 'linear-gradient(135deg, #00E5EE, #7C3AED)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  subGreeting: { fontSize: '14px', color: '#5A5A6A' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  timeDisplay: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: '14px',
    color: '#5A5A6A', fontWeight: 500,
  },
  logoutBtn: {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
    color: '#9898A6', padding: '8px 20px', borderRadius: '100px',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
  },

  // Bento Grid
  bentoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '16px',
  },

  // Stat Cards (top row)
  glassCard: {
    background: 'rgba(17, 17, 22, 0.6)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
    padding: '24px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px', textAlign: 'center',
    transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
  },
  statIcon: { fontSize: '28px', marginBottom: '4px' },
  statValue: {
    fontSize: '32px', fontWeight: 800, color: '#E8E8ED',
    fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em',
  },
  statLabel: { fontSize: '12px', color: '#5A5A6A', fontWeight: 500 },

  // Panel Cards
  panelCard: {
    background: 'rgba(17, 17, 22, 0.6)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
    padding: '24px', transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
  },
  panelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px',
  },
  panelTitle: { fontSize: '14px', fontWeight: 700, color: '#E8E8ED' },
  panelBadge: {
    fontSize: '9px', fontWeight: 700, padding: '3px 10px',
    borderRadius: '100px', background: 'rgba(0,229,238,0.1)',
    color: '#00E5EE', letterSpacing: '1px',
  },
  progressContent: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1,
  },

  // Daily Mission
  missionContent: { display: 'flex', flexDirection: 'column', gap: '12px' },
  missionTitle: { fontSize: '18px', fontWeight: 700, color: '#E8E8ED' },
  missionDesc: { fontSize: '13px', color: '#9898A6', lineHeight: 1.6 },
  missionReward: { display: 'flex', gap: '8px' },
  rewardBadge: {
    fontSize: '11px', fontWeight: 700, padding: '4px 12px',
    borderRadius: '100px', background: 'rgba(0,229,238,0.08)',
    color: '#00E5EE', border: '1px solid rgba(0,229,238,0.15)',
  },
  missionBtn: {
    background: 'linear-gradient(135deg, #00E5EE, #7C3AED)', color: '#fff',
    border: 'none', padding: '10px 24px', borderRadius: '100px',
    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0,229,238,0.2)', transition: 'all 0.2s',
    alignSelf: 'flex-start', marginTop: '4px',
  },

  // Section Labels
  sectionLabel: {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
  },
  labelText: {
    fontSize: '11px', fontWeight: 700, color: '#5A5A6A',
    textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap',
  },
  labelLine: {
    flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)',
  },

  // Module Grid
  moduleGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
  },
  moduleCard: {
    background: 'rgba(17,17,22,0.6)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px',
    padding: '22px', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
    position: 'relative', overflow: 'hidden',
  },
  moduleIcon: {
    width: '44px', height: '44px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '14px',
  },
  moduleTitle: { fontSize: '15px', fontWeight: 700, color: '#E8E8ED', marginBottom: '4px' },
  moduleDesc: { fontSize: '12px', color: '#5A5A6A', lineHeight: 1.5 },
  moduleArrow: {
    position: 'absolute', top: '22px', right: '22px',
    fontSize: '16px', fontWeight: 700, opacity: 0.5,
  },

  // Widget Wrap
  widgetWrap: {
    flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },

  // Quick Links
  quickGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
  },
  quickLink: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'rgba(17,17,22,0.5)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px', padding: '16px 20px', cursor: 'pointer',
    transition: 'all 0.3s ease', fontFamily: "'Inter', sans-serif",
  },
  quickLabel: { fontSize: '13px', fontWeight: 600, color: '#E8E8ED', flex: 1 },
  quickArrow: { fontSize: '14px', color: '#5A5A6A' },
};

export default Dashboard;