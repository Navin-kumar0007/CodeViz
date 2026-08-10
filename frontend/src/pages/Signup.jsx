import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Spinner } from '../components/ui';
import API_BASE from '../utils/api';
import { track, identify } from '../utils/analytics';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userInfo')) navigate('/', { replace: true });
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, ref: new URLSearchParams(window.location.search).get('ref') || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        identify(data._id, { email: data.email, role: data.role });
        track('signed_up');
        const pendingCode = sessionStorage.getItem('pendingClassroomCode');
        if (pendingCode) {
          sessionStorage.removeItem('pendingClassroomCode');
          navigate('/classroom', { state: { autoJoinCode: pendingCode } });
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Could not create your account.');
        setLoading(false);
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text grid lg:grid-cols-2" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Brand / hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 border-r border-line relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, var(--cz-accent), transparent 55%)' }} />
        <div className="relative flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center text-accent text-lg font-black border border-accent/40 bg-accent/15">⬡</span>
          <span className="text-lg font-extrabold tracking-tight">CodeViz</span>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight m-0">Learn by<br />seeing it run.</h2>
          <p className="text-muted mt-3 max-w-sm">Join thousands practicing algorithms with animated visualizations, an AI Socratic tutor, live classrooms, and interview prep — all in one place.</p>
          <ul className="mt-6 flex flex-col gap-2 text-[13px] text-muted list-none p-0">
            <li className="flex items-center gap-2"><span className="text-success">✓</span> Animated, debugger-driven visualization</li>
            <li className="flex items-center gap-2"><span className="text-success">✓</span> 8 languages, real execution</li>
            <li className="flex items-center gap-2"><span className="text-success">✓</span> AI tutor, daily challenges, gamified XP</li>
          </ul>
        </div>
        <div className="relative font-mono text-[11px] text-faint">© {new Date().getFullYear()} CodeViz</div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="w-9 h-9 rounded-lg flex items-center justify-center text-accent text-lg font-black border border-accent/40 bg-accent/15">⬡</span>
            <span className="text-lg font-extrabold tracking-tight">CodeViz</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight m-0">Create your account</h1>
          <p className="text-muted text-sm mt-1 mb-6">Free to start. No credit card required.</p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-muted">Full name</label>
              <Input size="lg" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-muted">Email</label>
              <Input size="lg" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-muted">Password</label>
              <Input size="lg" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
            </div>

            {error && (
              <div className="text-[13px] text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full mt-1">
              {loading ? <><Spinner size={15} /> Creating account…</> : 'Create account'}
            </Button>
          </form>

          <p className="text-muted text-sm text-center mt-6">
            Already have an account? <Link to="/login" className="text-accent no-underline font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
