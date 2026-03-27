import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE from '../utils/api';

const NeuralBackground = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, background: 'var(--bg-primary)' }} />
);

const LiquidInput = ({ type, placeholder, value, onChange, icon, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-muted)', borderRadius: '10px', padding: '14px 16px', border: `1px solid ${isFocused ? 'var(--accent-teal)' : 'var(--border-color)'}`, transition: 'border-color 0.2s', boxShadow: isFocused ? '0 0 0 3px rgba(13,148,136,0.1)' : 'none' }}>
        <span style={{ marginRight: '12px', fontSize: '18px', color: isFocused ? 'var(--accent-teal)' : 'var(--text-muted)', transition: '0.2s' }}>
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            width: '100%',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            opacity: disabled ? 0.5 : 1
          }}
          required
        />
      </div>
    </div>
  );
};

const MagneticButton = ({ children, isLoading }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const mouseMove = (e) => {
    if (isLoading) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPos({ x: middleX * 0.3, y: middleY * 0.3 });
  };
  const mouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={mouseMove}
      onMouseLeave={mouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      type="submit"
      disabled={isLoading}
      style={{
        width: '100%',
        padding: '14px',
        borderRadius: '10px',
        border: 'none',
        background: isLoading ? 'rgba(17,17,22,0.5)' : 'linear-gradient(135deg, #00E5EE, #7C3AED)',
        color: isLoading ? '#5A5A6A' : 'white',
        fontWeight: 600,
        fontSize: '14px',
        cursor: isLoading ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
        transition: 'all 0.2s',
      }}
    >
      {isLoading ? <span>Signing in...</span> : children}
      {!isLoading && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'skewX(-20deg)' }}
        />
      )}
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--accent-cyan)', borderRadius: '12px', pointerEvents: 'none' }} />
      )}
    </motion.button>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle, scanning, success
  const navigate = useNavigate();

  // If already logged in, redirect to Dashboard
  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (user) navigate('/', { replace: true });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('scanning');
    setError('');

    try {
      // Fake delay for biometric scan effect
      await new Promise(r => setTimeout(r, 1800));

      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // SAVE THE GOLDEN TICKET 🎟️
        localStorage.setItem('userInfo', JSON.stringify(data));
        setStatus('success');

        // Wait for shatter/success animation to finish
        setTimeout(() => {
          const pendingCode = sessionStorage.getItem('pendingClassroomCode');
          if (pendingCode) {
            sessionStorage.removeItem('pendingClassroomCode');
            navigate('/classroom', { state: { autoJoinCode: pendingCode } });
          } else {
            navigate('/'); // Go to Dashboard
          }
        }, 1500);
      } else {
        setError(data.message);
        setStatus('idle');
      }
    } catch {
      setError('Connection to mainframe lost. Check neural link.');
      setStatus('idle');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -60, scale: 0.7, x: '50vw', filter: 'blur(30px)' }}
      animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, rotateY: 60, scale: 0.7, x: '-50vw', filter: 'blur(30px)', transition: { duration: 0.4, ease: "easeIn" } }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.3, damping: 20 }}
      style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080C', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      <NeuralBackground />

      <AnimatePresence>
        {status !== 'success' && (
            <motion.div
              style={{ position: 'relative', zIndex: 10, perspective: '1000px' }}
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                background: 'rgba(17,17,22,0.7)',
                padding: '48px',
                borderRadius: '20px',
                width: '420px',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Biometric Scanner Laser */}
              <AnimatePresence>
                {status === 'scanning' && (
                  <motion.div
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', left: 0, right: 0, height: '4px',
                      background: 'var(--accent-cyan)',
                      boxShadow: '0 0 30px 5px var(--accent-cyan)',
                      zIndex: 50,
                      pointerEvents: 'none',
                      opacity: 0.8
                    }}
                  />
                )}
              </AnimatePresence>

              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px', color: 'var(--accent-teal)' }}>⬡</div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
                  Welcome back
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                  Sign in to your CodeViz account
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    style={{ background: 'rgba(255, 50, 50, 0.1)', color: '#ff5f56', padding: '12px', borderRadius: '8px', fontSize: '12px', border: '1px solid rgba(255, 50, 50, 0.2)', textAlign: 'center', fontWeight: 600 }}
                  >
                    [!] {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
                <LiquidInput type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} icon="✉" disabled={status !== 'idle'} />
                <LiquidInput type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} icon="🔒" disabled={status !== 'idle'} />
                
                <Link to="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none', alignSelf: 'flex-end', marginTop: '-12px', marginBottom: '16px', fontWeight: 600, fontFamily: 'var(--font-code)' }}>
                  Forgot Password?
                </Link>

                <div style={{ marginTop: '15px' }}>
                  <MagneticButton isLoading={status === 'scanning'}>
                    Sign In →
                  </MagneticButton>
                </div>
              </form>

              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Don&apos;t have an account? <Link to="/signup" style={{ color: 'var(--accent-teal)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Shatter / Transition */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ position: 'absolute', zIndex: 100, textAlign: 'center', color: '#00E5EE', background: 'rgba(8,8,12,0.95)', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(20px)' }}
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '80px', marginBottom: '20px' }}>
              ✓
            </motion.div>
            <h2 style={{ fontSize: '28px', letterSpacing: '2px', fontWeight: 800, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Session Established</h2>
            <p style={{ color: '#5A5A6A', marginTop: '10px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>Routing to workspace...</p>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Login;