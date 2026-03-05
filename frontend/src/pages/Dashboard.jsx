import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StreakCounter from '../components/Gamification/StreakCounter';
import XPBar from '../components/Gamification/XPBar';
import DailyChallengeWidget from '../components/Gamification/DailyChallengeWidget';
import AlgorithmDNA from '../components/Gamification/AlgorithmDNA';

/* ═══════════════════════════════════════════
   Dashboard — Feature Showcase Homepage
   Organized into sections matching sidebar groups
   ═══════════════════════════════════════════ */

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

  /* ── Feature Sections ── */
  const featureSections = [
    {
      title: '📚 Learn & Practice',
      subtitle: 'Build your DSA skills from the ground up',
      color: '#61DAFB',
      items: [
        { path: '/practice', icon: '⟩_', label: 'Practice', desc: 'Code editor with execution & AI assist', accent: 'var(--accent-blue)' },
        { path: '/learn', icon: '📖', label: 'Learn', desc: 'Step-by-step DSA visualization', accent: 'var(--accent-green)' },
        { path: '/roadmap', icon: '🗺️', label: 'Roadmap', desc: 'Interactive skill tree for your journey', accent: '#a855f7' },
        { path: '/quiz-creator', icon: '✏️', label: 'Quiz Creator', desc: 'Build & share coding quizzes', accent: 'var(--accent-yellow)' },
      ]
    },
    {
      title: '🤝 Collaborate',
      subtitle: 'Learn together, grow faster',
      color: '#C678DD',
      items: [
        { path: '/room', icon: '👥', label: 'Collab Room', desc: 'Real-time peer coding sessions', accent: 'var(--accent-cyan)' },
        { path: '/classroom', icon: '🏫', label: 'Classroom', desc: 'Join live instructor sessions', accent: 'var(--accent-purple)' },
        { path: '/campus', icon: '🎓', label: 'Campus', desc: 'Manage classes & assignments', accent: 'var(--accent-orange)' },
        { path: '/forum', icon: '💬', label: 'Forum', desc: 'Discuss, ask & answer questions', accent: '#f6ad55' },
      ]
    },
    {
      title: '🛠️ Dev Tools',
      subtitle: 'AI-powered coding utilities',
      color: '#98C379',
      items: [
        { path: '/code-review', icon: '🤖', label: 'Code Review', desc: 'AI reviews your code quality', accent: 'var(--accent-green)' },
        { path: '/test-lab', icon: '🧪', label: 'Test Lab', desc: 'Test code with custom inputs', accent: 'var(--accent-red)' },
        { path: '/translator', icon: '🌐', label: 'Translate', desc: 'Convert code between languages', accent: 'var(--accent-cyan)' },
        { path: '/sessions', icon: '🎥', label: 'Sessions', desc: 'Record & replay coding sessions', accent: 'var(--accent-blue)' },
      ]
    },
    {
      title: '🚀 Career Prep',
      subtitle: 'Get interview-ready with real practice',
      color: '#E5C07B',
      items: [
        { path: '/interview-prep', icon: '🎯', label: 'Interview Prep', desc: 'Timed mock interviews with DSA', accent: '#fc8181' },
        { path: '/video-lessons', icon: '🎬', label: 'Video Lessons', desc: 'Watch topic explanations', accent: '#9f7aea' },
        { path: '/progress', icon: '📊', label: 'Reports', desc: 'Weekly analytics & weak areas', accent: '#4fd1c5' },
      ]
    },
  ];

  /* ── Quick Actions ── */
  const quickActions = [
    { path: '/practice', icon: '⟩_', label: 'Practice', color: 'var(--accent-blue)' },
    { path: '/interview-prep', icon: '🎯', label: 'Interview', color: '#fc8181' },
    { path: '/learn', icon: '📖', label: 'Learn', color: 'var(--accent-green)' },
    { path: '/forum', icon: '💬', label: 'Forum', color: '#f6ad55' },
  ];

  return (
    <div style={S.container}>
      {/* ═══ HERO HEADER ═══ */}
      <header style={S.hero}>
        <div style={S.heroLeft}>
          <h1 style={S.brand}>
            <span style={S.brandCode}>{'{'}</span> CodeViz
            <span className="cursor-blink">_</span>
            <span style={S.brandCode}>{'}'}</span>
          </h1>
          <p style={S.greeting}>
            <span style={S.prompt}>$</span> Welcome back, <span style={S.userName}>{user?.name || 'Guest'}</span>
          </p>
        </div>
        <div style={S.heroRight}>
          {gamification && (
            <div style={S.statsRow}>
              <XPBar xp={gamification.xp} level={gamification.level} />
              <StreakCounter streak={gamification.streak} />
            </div>
          )}
          <button onClick={handleLogout} style={S.logoutBtn}>logout</button>
        </div>
      </header>

      {/* ═══ QUICK ACTIONS ROW ═══ */}
      <div style={S.quickRow}>
        {quickActions.map(qa => (
          <button key={qa.path} onClick={() => navigate(qa.path)} style={S.quickBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = qa.color; e.currentTarget.style.background = `${qa.color}10`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}>
            <span style={{ fontSize: '22px' }}>{qa.icon}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{qa.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ CONTINUE WHERE YOU LEFT OFF ═══ */}
      {(() => {
        const lastAutoSave = (() => {
          try { return JSON.parse(localStorage.getItem('codeviz_autosave')); } catch { return null; }
        })();
        if (!lastAutoSave) return null;
        return (
          <div style={S.continueWidget}>
            <h3 style={S.sectionLabel}>⏩ Continue Where You Left Off</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div onClick={() => navigate('/practice')} style={S.continueCard}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>⟩_</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-bright)', marginBottom: '4px' }}>
                  Practice — {(lastAutoSave.language || 'python').toUpperCase()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                  {(lastAutoSave.code || '').slice(0, 60)}…
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', opacity: 0.6 }}>
                  {lastAutoSave.timestamp ? new Date(lastAutoSave.timestamp).toLocaleString() : ''}
                </div>
              </div>
              <div onClick={() => navigate('/learn')} style={S.continueCard}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>📖</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-bright)', marginBottom: '4px' }}>Learning Path</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Continue your DSA journey</div>
              </div>
              <div onClick={() => navigate('/challenge')} style={S.continueCard}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>🏆</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-bright)', marginBottom: '4px' }}>Daily Challenge</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Today&apos;s challenge awaits</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ GAMIFICATION WIDGETS ═══ */}
      <div style={S.widgetsRow}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <DailyChallengeWidget />
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <AlgorithmDNA />
        </div>
      </div>

      {/* ═══ FEATURE SECTIONS ═══ */}
      {featureSections.map(section => (
        <div key={section.title} style={S.section}>
          <div style={S.sectionHeader}>
            <h2 style={{ ...S.sectionTitle, color: section.color }}>{section.title}</h2>
            <span style={S.sectionSub}>{section.subtitle}</span>
          </div>
          <div style={S.featureGrid}>
            {section.items.map(item => (
              <div
                key={item.path}
                style={S.featureCard}
                onClick={() => navigate(item.path)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = item.accent;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 20px ${item.accent}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ ...S.featureIcon, color: item.accent }}>{item.icon}</div>
                <div style={S.featureInfo}>
                  <h3 style={S.featureLabel}>{item.label}</h3>
                  <p style={S.featureDesc}>{item.desc}</p>
                </div>
                <span style={{ ...S.featureArrow, color: item.accent }}>→</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ═══ ROLE-BASED TOOLS ═══ */}
      {(user?.role === 'instructor' || user?.role === 'admin') && (
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <h2 style={{ ...S.sectionTitle, color: 'var(--accent-red)' }}>🔧 Admin & Instructor</h2>
            <span style={S.sectionSub}>Management tools</span>
          </div>
          <div style={S.featureGrid}>
            {user.role === 'instructor' && (
              <div style={S.featureCard} onClick={() => navigate('/instructor')}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ ...S.featureIcon, color: 'var(--accent-cyan)' }}>📈</div>
                <div style={S.featureInfo}>
                  <h3 style={S.featureLabel}>Analytics Dashboard</h3>
                  <p style={S.featureDesc}>Student progress & performance</p>
                </div>
                <span style={{ ...S.featureArrow, color: 'var(--accent-cyan)' }}>→</span>
              </div>
            )}
            {user.role === 'admin' && (
              <div style={S.featureCard} onClick={() => navigate('/admin')}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-red)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ ...S.featureIcon, color: 'var(--accent-red)' }}>⚙</div>
                <div style={S.featureInfo}>
                  <h3 style={S.featureLabel}>Admin Panel</h3>
                  <p style={S.featureDesc}>Users, settings & system management</p>
                </div>
                <span style={{ ...S.featureArrow, color: 'var(--accent-red)' }}>→</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══ STYLES ═══ */
const S = {
  container: {
    minHeight: '100vh',
    padding: '24px 32px 40px',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },

  /* ── Hero ── */
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  heroLeft: {},
  heroRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  brand: {
    margin: 0,
    fontFamily: 'var(--font-code)',
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-bright)',
  },
  brandCode: { color: 'var(--accent-blue)', fontWeight: 400 },
  greeting: {
    fontFamily: 'var(--font-code)',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
  prompt: { color: 'var(--accent-green)', fontWeight: 700 },
  userName: { color: 'var(--accent-yellow)' },
  statsRow: { display: 'flex', gap: '16px', alignItems: 'center' },
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

  /* ── Quick Actions ── */
  quickRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  quickBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '14px 20px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    minWidth: '90px',
    color: 'var(--text-primary)',
  },

  /* ── Continue Widget ── */
  continueWidget: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
  },
  continueCard: {
    background: 'var(--bg-hover)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    minWidth: '180px',
    flex: '1',
  },

  /* ── Widgets ── */
  widgetsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },

  /* ── Feature Sections ── */
  section: {
    marginBottom: '28px',
  },
  sectionHeader: {
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
  },
  sectionSub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  sectionLabel: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 600,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
  },
  featureCard: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '16px 18px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
  },
  featureIcon: {
    fontSize: '26px',
    fontFamily: 'var(--font-code)',
    lineHeight: 1,
    flexShrink: 0,
  },
  featureInfo: {
    flex: 1,
    minWidth: 0,
  },
  featureLabel: {
    margin: 0,
    fontFamily: 'var(--font-code)',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-bright)',
    marginBottom: '3px',
  },
  featureDesc: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  featureArrow: {
    fontFamily: 'var(--font-code)',
    fontSize: '18px',
    opacity: 0.5,
    flexShrink: 0,
  },
};

export default Dashboard;