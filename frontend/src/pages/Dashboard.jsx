import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StreakCounter from '../components/Gamification/StreakCounter';
import XPBar from '../components/Gamification/XPBar';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const [gamification, setGamification] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.token) {
      // 1. Perform Daily Check-in
      fetch('http://localhost:5001/api/gamification/checkin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(checkInData => {
          if (checkInData.xpAwarded > 0) {
            console.log(`🎉 Earned ${checkInData.xpAwarded} XP!`);
          }
          // 2. Fetch Latest Stats
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

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '5px' }}>CodeViz <span style={{ fontSize: '12px', color: '#aaa' }}>v1.0</span></h2>
          {gamification && (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <XPBar xp={gamification.xp} level={gamification.level} />
              <StreakCounter streak={gamification.streak} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fff', fontWeight: 'bold' }}>{user ? user.name : 'Guest'}</div>
            <div style={roleBadgeStyle}>{user?.role || 'Guest'}</div>
          </div>
          <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
        </div>
      </header>

      <div style={gridStyle}>
        {/* OPTION 1: PRACTICE MODE */}
        <div style={cardStyle} onClick={() => navigate('/practice')}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛠️</div>
          <h3>Practice Playground</h3>
          <p style={{ color: '#aaa' }}>Write code, visualize execution, and debug in real-time.</p>
        </div>

        {/* OPTION 2: LEARNING MODE */}
        <div style={cardStyle} onClick={() => navigate('/learn')}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
          <h3>Structured Learning</h3>
          <p style={{ color: '#aaa' }}>Step-by-step courses on Data Structures & Algorithms.</p>
        </div>

        {/* OPTION 3: QUIZ CREATOR */}
        <div style={cardStyle} onClick={() => navigate('/quiz-creator')}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>✏️</div>
          <h3>Create Quiz</h3>
          <p style={{ color: '#aaa' }}>Build custom quizzes for learners to practice.</p>
        </div>

        {/* OPTION 4: CLASSROOM MODE */}
        <div style={cardStyle} onClick={() => navigate('/classroom')}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏫</div>
          <h3>Join Classroom</h3>
          <p style={{ color: '#aaa' }}>Connect with your instructor for live sessions.</p>
        </div>

        {/* OPTION 5: INSTRUCTOR ANALYTICS (Only for instructors) */}
        {user?.role === 'instructor' && (
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '1px solid #667eea' }} onClick={() => navigate('/instructor')}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
            <h3>Analytics Dashboard</h3>
            <p style={{ color: '#aaa' }}>View student progress and classroom performance.</p>
          </div>
        )}

        {/* OPTION 6: ADMIN PANEL (Only for admins) */}
        {user?.role === 'admin' && (
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #2d1b1b, #1e1e2e)', border: '1px solid #e53935' }} onClick={() => navigate('/admin')}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛡️</div>
            <h3>Admin Panel</h3>
            <p style={{ color: '#aaa' }}>Manage users, roles, and system settings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const containerStyle = { minHeight: '100vh', background: '#1e1e1e', color: '#fff', padding: '20px' };
const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '40px',
  paddingBottom: '20px',
  borderBottom: '1px solid #333',
  flexWrap: 'wrap', // 📱 Allow wrapping
  gap: '20px'       // 📱 Space between wrapped items
};
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' };
const cardStyle = { background: '#252526', padding: '30px', borderRadius: '10px', cursor: 'pointer', transition: '0.3s', border: '1px solid #333', textAlign: 'center' };
const logoutBtnStyle = { padding: '8px 16px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };

const roleBadgeStyle = { fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' };

export default Dashboard;