import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import StreakCounter from '../components/Gamification/StreakCounter';
import XPBar from '../components/Gamification/XPBar';
import DailyChallengeWidget from '../components/Gamification/DailyChallengeWidget';
import AlgorithmDNA from '../components/Gamification/AlgorithmDNA';
import SkillTreeWidget from '../components/Gamification/SkillTreeWidget';
import API_BASE from '../utils/api';

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
      fetch(`${API_BASE}/api/gamification/checkin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(checkInData => {
          if (checkInData.xpAwarded > 0) console.log(`🎉 Earned ${checkInData.xpAwarded} XP!`);
          return fetch(`${API_BASE}/api/gamification/stats`, {
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
      title: '📚 Core',
      subtitle: 'Build your DSA skills from the ground up',
      color: '#61DAFB',
      items: [
        { path: '/practice', icon: '⟩_', label: 'Practice', desc: 'Code editor with execution & AI assist', accent: 'var(--accent-blue)' },
        { path: '/problems', icon: '📋', label: 'Problems', desc: 'Browse and solve coding challenges', accent: 'var(--accent-orange)' },
        { path: '/learn', icon: '📖', label: 'Learn', desc: 'Step-by-step DSA visualization', accent: 'var(--accent-green)' },
        { path: '/roadmap', icon: '🗺️', label: 'Roadmap', desc: 'Interactive skill tree for your journey', accent: '#a855f7' },
        { path: '/concept-map', icon: '🕸️', label: 'Concept Map', desc: 'Visualize your knowledge connections', accent: '#48bb78' },
        { path: '/git-learn', icon: '🐙', label: 'Git Learn', desc: 'Master version control visually', accent: '#f56565' },
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
        { path: '/peer-review', icon: '👀', label: 'Peer Review', desc: 'Review and learn from peer code', accent: '#4299e1' },
      ]
    },
    {
      title: '🛠️ Tools',
      subtitle: 'AI-powered coding utilities',
      color: '#98C379',
      items: [
        { path: '/code-review', icon: '🤖', label: 'Code Review', desc: 'AI reviews your code quality', accent: 'var(--accent-green)' },
        { path: '/test-lab', icon: '🧪', label: 'Test Lab', desc: 'Test code with custom inputs', accent: 'var(--accent-red)' },
        { path: '/translator', icon: '🌐', label: 'Translate', desc: 'Convert code between languages', accent: 'var(--accent-cyan)' },
        { path: '/quiz-creator', icon: '✏️', label: 'Quiz Creator', desc: 'Build & share coding quizzes', accent: 'var(--accent-yellow)' },
        { path: '/algo-race', icon: '🏎️', label: 'Algo Race', desc: 'Race against friends or AI', accent: '#ed8936' },
      ]
    },
    {
      title: '🚀 Grow',
      subtitle: 'Get interview-ready with real practice',
      color: '#E5C07B',
      items: [
        { path: '/interview-prep', icon: '🎯', label: 'Interview Prep', desc: 'Timed mock interviews with DSA', accent: '#fc8181' },
        { path: '/video-lessons', icon: '🎬', label: 'Video Lessons', desc: 'Watch topic explanations', accent: '#9f7aea' },
        { path: '/progress', icon: '📊', label: 'Reports', desc: 'Weekly analytics & weak areas', accent: '#4fd1c5' },
        { path: '/sessions', icon: '🎥', label: 'Sessions', desc: 'Record & replay coding sessions', accent: 'var(--accent-blue)' },
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
      <style>{`
        @keyframes shimmer { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
      `}</style>
      {/* ═══ HERO HEADER ═══ */}
      <header style={S.hero}>
        <div style={S.heroLeft}>
          <KineticText
            text="Welcome back to "
            spanText="CodeViz Engine."
            style={S.h1}
            spanStyle={S.gradientText}
          />
          <p style={S.greeting}>
            <span style={S.prompt}>$</span> Session active, <span style={S.userName}>{user?.name || 'Guest'}</span>
          </p>
        </div>
        <div style={S.heroRight}>
          {gamification && (
            <div style={S.statsRow}>
              <XPBar xp={gamification.xp} level={gamification.level} />
              <StreakCounter streak={gamification.streak} />
            </div>
          )}
          <button onClick={handleLogout} style={S.logoutBtn}>[ disconnect ]</button>
        </div>
      </header>

      {/* ═══ QUICK ACTIONS ROW ═══ */}
      <div style={S.quickRow}>
        {quickActions.map((qa, i) => (
          <motion.div key={qa.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <TiltCard
              onClick={() => navigate(qa.path)}
              style={S.quickBtn}
              onMouseEnter={e => { e.currentTarget.style.borderColor = qa.color; e.currentTarget.style.background = `${qa.color}15`; e.currentTarget.style.boxShadow = `0 0 20px ${qa.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '24px', opacity: 0.9 }}>{qa.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-bright)', letterSpacing: '0.5px' }}>{qa.label.toUpperCase()}</span>
            </TiltCard>
          </motion.div>
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
              <div onClick={() => navigate('/daily-challenge')} style={S.continueCard}>
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
          <SkillTreeWidget />
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
            {section.items.map((item, i) => (
              <motion.div key={item.path} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 * i }}>
                <TiltCard
                  onClick={() => navigate(item.path)}
                  style={S.featureCard}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = item.accent;
                    e.currentTarget.style.boxShadow = `0 10px 30px ${item.accent}15`;
                    e.currentTarget.style.background = `radial-gradient(150px circle at top right, ${item.accent}10, transparent)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'var(--bg-surface)';
                  }}
                >
                  <div style={{ ...S.featureIcon, color: item.accent, textShadow: `0 0 15px ${item.accent}80` }}>{item.icon}</div>
                  <div style={S.featureInfo}>
                    <h3 style={{ ...S.featureLabel, textShadow: `0 0 10px ${item.accent}40` }}>{item.label}</h3>
                    <p style={S.featureDesc}>{item.desc}</p>
                  </div>
                  <span style={{ ...S.featureArrow, color: item.accent }}>→</span>
                </TiltCard>
              </motion.div>
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
              <TiltCard onClick={() => navigate('/instructor')} style={S.featureCard}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(86,182,194,0.15)'; e.currentTarget.style.background = 'radial-gradient(150px circle at top right, rgba(86,182,194,0.1), transparent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-surface)'; }}>
                <div style={{ ...S.featureIcon, color: 'var(--accent-cyan)' }}>📈</div>
                <div style={S.featureInfo}>
                  <h3 style={S.featureLabel}>Analytics Dashboard</h3>
                  <p style={S.featureDesc}>Student progress & performance</p>
                </div>
                <span style={{ ...S.featureArrow, color: 'var(--accent-cyan)' }}>→</span>
              </TiltCard>
            )}
            {user.role === 'admin' && (
              <TiltCard onClick={() => navigate('/admin')} style={S.featureCard}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-red)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(224,108,117,0.15)'; e.currentTarget.style.background = 'radial-gradient(150px circle at top right, rgba(224,108,117,0.1), transparent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-surface)'; }}>
                <div style={{ ...S.featureIcon, color: 'var(--accent-red)' }}>⚙</div>
                <div style={S.featureInfo}>
                  <h3 style={S.featureLabel}>Admin Panel</h3>
                  <p style={S.featureDesc}>Users, settings & system management</p>
                </div>
                <span style={{ ...S.featureArrow, color: 'var(--accent-red)' }}>→</span>
              </TiltCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ───────── Utility Widgets ───────── */

const KineticText = ({ text, style, spanText, spanStyle }) => {
  const [display, setDisplay] = useState(text.split('').map(() => '!'));
  const [spanDisplay, setSpanDisplay] = useState(spanText ? spanText.split('').map(() => '!') : []);

  useEffect(() => {
    let iterations = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const interval = setInterval(() => {
      setDisplay(prev => prev.map((char, index) => {
        if (index < iterations) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }));
      if (spanText) {
        setSpanDisplay(prev => prev.map((char, index) => {
          if (index < iterations) return spanText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }));
      }
      if (iterations >= Math.max(text.length, spanText ? spanText.length : 0)) clearInterval(interval);
      iterations += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text, spanText]);

  return (
    <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={style}>
      {display.join('')}
      {spanText && <span style={spanStyle}>{spanDisplay.join('')}</span>}
    </motion.h1>
  );
};

const TiltCard = ({ children, style, onClick, onMouseEnter, onMouseLeave }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useTransform(y, [-0.5, 0.5], ["5deg", "-5deg"]);
  const ry = useTransform(x, [-0.5, 0.5], ["-5deg", "5deg"]);

  return (
    <motion.div
      style={{ ...style, perspective: '1200px', rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={(e) => {
        x.set(0); y.set(0);
        if (onMouseLeave) onMouseLeave(e);
      }}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

/* ═══ STYLES ═══ */
/* ═══ STYLES ═══ */
const S = {
  container: {
    padding: '40px',
    maxWidth: '1400px',
    margin: '0 auto',
    color: 'var(--text-primary)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    position: 'relative',
    zIndex: 10,
    background: '#050508',
    backgroundImage: `
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '30px 30px',
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(10,10,15,0.3)',
    backdropFilter: 'blur(50px)',
    padding: '60px',
    borderRadius: '32px',
    border: '1px solid rgba(13,242,242,0.1)',
    boxShadow: '0 40px 100px rgba(0,0,0,0.9), inset 0 0 40px rgba(13,242,242,0.05)',
    flexWrap: 'wrap',
    gap: '30px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    zIndex: 2,
  },
  h1: {
    fontSize: 'clamp(38px, 6vw, 64px)',
    fontWeight: 950,
    lineHeight: 1.0,
    letterSpacing: '-2px',
    margin: 0
  },
  gradientText: {
    background: 'linear-gradient(135deg, #0df2f2 0%, #a45afe 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 60px rgba(13,242,242,0.4)',
    animation: 'shimmer 4s linear infinite',
  },
  prompt: {
    color: 'var(--accent-green)',
    fontWeight: 800,
    marginRight: '8px',
    textShadow: '0 0 10px var(--accent-green)',
  },
  greeting: {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-code)',
  },
  userName: {
    color: 'var(--accent-blue)',
    fontWeight: 700,
    textShadow: '0 0 10px rgba(97,218,251,0.5)',
  },
  heroRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '20px',
    zIndex: 2,
  },
  statsRow: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.4)',
    padding: '15px 25px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
  },
  logoutBtn: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
    padding: '8px 16px',
    fontFamily: 'var(--font-code)',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },

  /* Quick Actions */
  quickRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
  },
  quickBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: 'rgba(10, 10, 15, 0.3)',
    padding: '35px 25px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(50px)',
    height: '100%',
    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s, border-color 0.4s',
  },

  /* Grid Layout */
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    gap: '40px',
    alignItems: 'start',
  },

  /* Features Sections */
  sectionsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '50px',
  },
  sectionHeader: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '15px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 950,
    letterSpacing: '-1px',
    textShadow: '0 0 20px rgba(255,255,255,0.2)',
  },
  sectionSub: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-code)',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  featureCard: {
    background: 'rgba(10, 10, 15, 0.3)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '32px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(50px)',
    height: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s, border-color 0.4s',
  },
  featureIcon: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  featureInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  featureLabel: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-bright)',
  },
  featureDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  featureArrow: {
    position: 'absolute',
    bottom: '25px',
    right: '25px',
    fontSize: '20px',
    fontWeight: 900,
    opacity: 0.8,
  },

  /* Sidebar Widgets */
  sidePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  widget: {
    background: 'var(--bg-secondary)',
    borderRadius: '20px',
    padding: '25px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(20px)',
  },
  widgetTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'var(--text-bright)',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
};

export default Dashboard;