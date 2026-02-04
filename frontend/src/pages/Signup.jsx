import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server error.');
      console.error(err);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Create Account</h2>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
          <button type="submit" style={buttonStyle}>Sign Up</button>
        </form>

        <p style={{ color: '#aaa', marginTop: '15px', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#007acc' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const containerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e1e' };
const cardStyle = { background: '#252526', padding: '40px', borderRadius: '10px', width: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', textAlign: 'center' };
const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: '#fff', outline: 'none' };
const buttonStyle = { padding: '12px', borderRadius: '5px', border: 'none', background: '#2ea043', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const errorStyle = { background: '#e53935', color: 'white', padding: '10px', borderRadius: '5px', fontSize: '12px', marginBottom: '10px' };

export default Signup;