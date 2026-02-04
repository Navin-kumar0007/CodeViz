import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // SAVE THE GOLDEN TICKET 🎟️
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate('/'); // Go to Dashboard
      } else {
        setError(data.message);
      }
    } catch {
      setError('Server error. Is the backend running?');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Welcome Back</h2>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>

        <p style={{ color: '#aaa', marginTop: '15px', fontSize: '14px' }}>
          New here? <Link to="/signup" style={{ color: '#007acc' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

// CSS-in-JS Styles (Dark Theme)
const containerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e1e' };
const cardStyle = { background: '#252526', padding: '40px', borderRadius: '10px', width: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', textAlign: 'center' };
const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: '#fff', outline: 'none' };
const buttonStyle = { padding: '12px', borderRadius: '5px', border: 'none', background: '#007acc', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const errorStyle = { background: '#e53935', color: 'white', padding: '10px', borderRadius: '5px', fontSize: '12px', marginBottom: '10px' };

export default Login;