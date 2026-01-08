import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h2 style={{margin:0}}>CodeViz <span style={{fontSize:'12px', color:'#aaa'}}>v1.0</span></h2>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
           <span style={{color: '#fff'}}>Welcome, {user ? user.name : 'Guest'}!</span>
           <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
        </div>
      </header>

      <div style={gridStyle}>
        {/* OPTION 1: PRACTICE MODE */}
        <div style={cardStyle} onClick={() => navigate('/practice')}>
          <div style={{fontSize: '40px', marginBottom:'10px'}}>🛠️</div>
          <h3>Practice Playground</h3>
          <p style={{color:'#aaa'}}>Write code, visualize execution, and debug in real-time.</p>
        </div>

        {/* OPTION 2: LEARNING MODE (Coming Soon) */}
        <div style={cardStyle} onClick={() => alert("Learning Mode Coming Soon!")}>
          <div style={{fontSize: '40px', marginBottom:'10px'}}>🎓</div>
          <h3>Structured Learning</h3>
          <p style={{color:'#aaa'}}>Step-by-step courses on Data Structures & Algorithms.</p>
        </div>

        {/* OPTION 3: CLASSROOM (Coming Soon) */}
        <div style={cardStyle} onClick={() => alert("Classroom Mode Coming Soon!")}>
          <div style={{fontSize: '40px', marginBottom:'10px'}}>🏫</div>
          <h3>Join Classroom</h3>
          <p style={{color:'#aaa'}}>Connect with your instructor for live sessions.</p>
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle = { minHeight: '100vh', background: '#1e1e1e', color: '#fff', padding: '20px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #333' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' };
const cardStyle = { background: '#252526', padding: '30px', borderRadius: '10px', cursor: 'pointer', transition: '0.3s', border: '1px solid #333', textAlign:'center' };
const logoutBtnStyle = { padding: '8px 16px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Dashboard;