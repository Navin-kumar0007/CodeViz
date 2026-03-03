import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StreakCounter from '../components/Gamification/StreakCounter';
import XPBar from '../components/Gamification/XPBar';
import DailyChallengeWidget from '../components/Gamification/DailyChallengeWidget';
import AlgorithmDNA from '../components/Gamification/AlgorithmDNA';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const [gamification, setGamification] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.token) {
      fetch('http://localhost:5001/api/gamification/checkin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(checkInData => {
          if (checkInData.xpAwarded > 0) console.log(`🎉 Earned ${checkInData.xpAwarded} XP!`);
          return fetch('http://localhost:5001/api/gamification/stats', {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
        })
        .then(res => res.json())
        .then(stats => setGamification(stats))
        .catch(err => console.error('Gamification sync failed:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const modules = [
    { path: '/practice', icon: '⟩_', label: 'Practice', desc: 'Code editor with execution and AI assist', color: 'var(--accent-blue)' },
    { path: '/learn', icon: '📖', label: 'Learn', desc: 'DSA courses with step-by-step visualization', color: 'var(--accent-green)' },
    { path: '/roadmap', icon: '🗺️', label: 'Roadmap', desc: 'Interactive skill tree for your learning journey', color: '#a855f7' },
    { path: '/quiz-creator', icon: '✏️', label: 'Quiz Creator', desc: 'Build and share custom coding quizzes', color: 'var(--accent-yellow)' },
    { path: '/classroom', icon: '🏫', label: 'Classroom', desc: 'Join live instructor sessions', color: 'var(--accent-purple)' },
    { path: '/room', icon: '👥', label: 'Collab Room', desc: 'Real-time peer-to-peer coding', color: 'var(--accent-cyan)' },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.brand}>
            <span style={styles.brandCode}>{'{'}</span> CodeViz
            <span className="cursor-blink">_</span>
            <span style={styles.brandCode}>{'}'}</span>
          </h1>
          <p style={styles.greeting}>
            <span style={styles.prompt}>$</span> Welcome back, <span style={styles.userName}>{user?.name || 'Guest'}</span>
          </p>
        </div>
        <div style={styles.headerRight}>
          {gamification && (
            <div style={styles.statsRow}>
              <XPBar xp={gamification.xp} level={gamification.level} />
              <StreakCounter streak={gamification.streak} />
            </div>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn}>logout</button>
        </div>
      </header>

      {/* Daily Challenge & DNA Row */}
      <div style={styles.widgetsRow}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <DailyChallengeWidget />
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <AlgorithmDNA />
        </div>
      </div>

      {/* Module Grid */}
      <div style={styles.grid}>
        {modules.map(mod => (
          <div
            key={mod.path}
            style={styles.card}
            onClick={() => navigate(mod.path)}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = mod.color;
              e.currentTarget.style.boxShadow = `0 0 20px ${mod.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ ...styles.cardIcon, color: mod.color }}>{mod.icon}</div>
            <h3 style={styles.cardTitle}>{mod.label}</h3>
            <p style={styles.cardDesc}>{mod.desc}</p>
            <span style={{ ...styles.cardArrow, color: mod.color }}>→</span>
          </div>
        ))}
      </div>

      {/* Role-based panels */}
      {(user?.role === 'instructor' || user?.role === 'admin') && (
        <div style={styles.roleSection}>
          <p style={styles.roleBadge}>// {user.role} tools</p>
          <div style={styles.roleGrid}>
            {user.role === 'instructor' && (
              <div style={styles.roleCard} onClick={() => navigate('/instructor')}>
                <span>📊</span> Analytics Dashboard
              </div>
            )}
            {user.role === 'admin' && (
              <div style={styles.roleCard} onClick={() => navigate('/admin')}>
                <span>⚙</span> Admin Panel
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '28px 32px',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '36px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  brand: {
    margin: 0,
    fontFamily: 'var(--font-code)',
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-bright)',
  },
  brandCode: {
    color: 'var(--accent-blue)',
    fontWeight: 400,
  },
  greeting: {
    fontFamily: 'var(--font-code)',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
  prompt: {
    color: 'var(--accent-green)',
    fontWeight: 700,
  },
  userName: {
    color: 'var(--accent-yellow)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  logoutBtn: {
    fontFamily: 'var(--font-code)',
    fontSize: '12px',
    padding: '6px 14px',
    background: 'transparent',
    border: '1px solid var(--accent-red)',
    color: 'var(--accent-red)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    maxWidth: '1000px',
  },
  widgetsRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '32px',
    flexWrap: 'wrap',
    maxWidth: '1000px'
  },
  card: {
    position: 'relative',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '24px 20px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
  },
  cardIcon: {
    fontSize: '28px',
    fontFamily: 'var(--font-code)',
    marginBottom: '10px',
  },
  cardTitle: {
    margin: 0,
    fontFamily: 'var(--font-code)',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text-bright)',
    marginBottom: '6px',
  },
  cardDesc: {
    margin: 0,
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.4,
  },
  cardArrow: {
    position: 'absolute',
    bottom: '14px',
    right: '16px',
    fontFamily: 'var(--font-code)',
    fontSize: '18px',
    opacity: 0.6,
  },
  roleSection: {
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)',
  },
  roleBadge: {
    fontFamily: 'var(--font-code)',
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '12px',
  },
  roleGrid: {
    display: 'flex',
    gap: '12px',
  },
  roleCard: {
    fontFamily: 'var(--font-code)',
    fontSize: '13px',
    padding: '12px 20px',
    background: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    transition: 'var(--transition-fast)',
  },
};

export default Dashboard;