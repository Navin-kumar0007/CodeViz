/* eslint-disable react-hooks/purity */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE from '../utils/api';

const NeuralBackground = ({ mousePos }) => {
  // Generate static particles
  const [particles] = useState(() => Array.from({ length: 60 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 2 + 0.5,
    delay: Math.random() * 5
  })));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, background: '#050505' }}>
      <motion.div style={{
        position: 'absolute', inset: -500,
        background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(97,218,251,0.08), transparent 40%)`,
        transition: '0.1s ease-out'
      }} />
      {particles.map((p, i) => (
        <motion.div
          key={i}
          animate={{
            y: ["0vh", "100vh"],
            x: [0, Math.sin(p.delay) * 50, 0]
          }}
          transition={{ duration: 15 / p.speed, repeat: Infinity, ease: "linear", delay: p.delay }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `-10%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'rgba(97,218,251,0.3)',
            boxShadow: '0 0 10px rgba(97,218,251,0.5)',
            opacity: Math.random() * 0.5 + 0.2
          }}
        />
      ))}
      {/* Subtle Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

const LiquidInput = ({ type, placeholder, value, onChange, icon, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: '25px' }}>
      <motion.div
        animate={{ width: isFocused ? '100%' : '0%' }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: 'var(--accent-purple)', boxShadow: '0 0 10px var(--accent-purple)', borderRadius: '2px' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s' }}>
        <span style={{ marginRight: '15px', fontSize: '20px', color: isFocused ? 'var(--accent-purple)' : '#555', transition: '0.3s' }}>
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
            color: '#fff',
            fontSize: '15px',
            width: '100%',
            outline: 'none',
            fontFamily: 'monospace',
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
        padding: '18px',
        borderRadius: '12px',
        border: 'none',
        background: isLoading ? 'transparent' : 'linear-gradient(45deg, var(--accent-purple), var(--accent-blue))',
        color: 'white',
        fontWeight: 900,
        fontSize: '15px',
        cursor: isLoading ? 'default' : 'pointer',
        boxShadow: isLoading ? 'none' : '0 10px 30px rgba(186,104,200,0.2)',
        position: 'relative',
        overflow: 'hidden',
        letterSpacing: '1px',
      }}
    >
      {isLoading ? <span style={{ color: 'var(--accent-purple)' }}>FABRICATING ENTITY...</span> : children}
      {!isLoading && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'skewX(-20deg)' }}
        />
      )}
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, border: '1px solid var(--accent-purple)', borderRadius: '12px', pointerEvents: 'none' }} />
      )}
    </motion.button>
  );
};

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle, scanning, success
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const navigate = useNavigate();

  // If already logged in, redirect to Dashboard
  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (user) navigate('/', { replace: true });
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setStatus('scanning');
    setError('');

    try {
      // Fake delay for biometric scan effect
      await new Promise(r => setTimeout(r, 1800));

      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
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
    } catch (err) {
      setError('Connection to mainframe lost. Check neural link.');
      setStatus('idle');
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -60, scale: 0.7, x: '50vw', filter: 'blur(30px)' }}
      animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, rotateY: 60, scale: 0.7, x: '-50vw', filter: 'blur(30px)', transition: { duration: 0.4, ease: "easeIn" } }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.3, damping: 20 }}
      style={{ perspective: '2000px', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}>

      <NeuralBackground mousePos={mousePos} />

      <AnimatePresence>
        {status !== 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 2, filter: 'blur(30px)', transition: { duration: 1.2, ease: 'easeIn' } }}
            style={{ position: 'relative', zIndex: 10, perspective: '1000px' }}
          >
            <motion.div
              whileHover={{ rotateX: (mousePos.y - window.innerHeight / 2) * -0.02, rotateY: (mousePos.x - window.innerWidth / 2) * 0.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                background: 'rgba(15, 15, 20, 0.65)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                padding: '50px',
                borderRadius: '24px',
                width: '420px',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Biometric Scanner Laser - Purple accent for Signup */}
              <AnimatePresence>
                {status === 'scanning' && (
                  <motion.div
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', left: 0, right: 0, height: '4px',
                      background: 'var(--accent-purple)',
                      boxShadow: '0 0 30px 5px var(--accent-purple)',
                      zIndex: 50,
                      pointerEvents: 'none',
                      opacity: 0.8
                    }}
                  />
                )}
              </AnimatePresence>

              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  style={{ fontSize: '40px', marginBottom: '15px', color: 'var(--accent-purple)' }}
                >
                  ⎈
                </motion.div>
                <h2 style={{ color: '#fff', fontSize: '30px', fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>
                  Construct <span style={{ color: 'var(--accent-purple)' }}>Entity</span>
                </h2>
                <p style={{ color: '#888', fontSize: '13px', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  Initialize New Sequence
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

              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
                <LiquidInput type="text" placeholder="Designation (Name)" value={name} onChange={(e) => setName(e.target.value)} icon="🏷️" disabled={status !== 'idle'} />
                <LiquidInput type="email" placeholder="Identity Marker (Email)" value={email} onChange={(e) => setEmail(e.target.value)} icon="👤" disabled={status !== 'idle'} />
                <LiquidInput type="password" placeholder="Pass-phrase" value={password} onChange={(e) => setPassword(e.target.value)} icon="🔑" disabled={status !== 'idle'} />

                <div style={{ marginTop: '5px' }}>
                  <MagneticButton isLoading={status === 'scanning'}>
                    INITIALIZE SEQUENCE
                  </MagneticButton>
                </div>
              </form>

              <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '13px', color: '#666' }}>
                Existing entity? <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 700 }}>Authenticate bio-signature</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Shatter / Transition */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ position: 'absolute', zIndex: 100, textAlign: 'center', color: 'var(--accent-purple)', background: 'rgba(0,0,0,0.8)', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '80px', marginBottom: '20px' }}>
              ✓
            </motion.div>
            <h2 style={{ fontSize: '32px', letterSpacing: '4px', fontWeight: 900, textTransform: 'uppercase' }}>ENTITY FABRICATED</h2>
            <p style={{ color: '#aaa', marginTop: '10px', fontFamily: 'monospace' }}>Routing to Code Domain...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Signup;