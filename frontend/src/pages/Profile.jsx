import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { ShieldCheck, ShieldAlert, LogOut, Mail, User as UserIcon, Sparkles, AtSign, MousePointer2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Input } from '../components/ui';
import { API } from '../utils/api';
import { useEntitlements } from '../hooks/useEntitlements';
import { getTrail, setTrail, TRAIL_COLORS } from '../utils/cursorTrail';

function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on}
      className="relative w-10 h-6 rounded-full transition-colors cursor-pointer border"
      style={{ background: on ? 'var(--cz-accent)' : 'var(--cz-elevated)', borderColor: on ? 'var(--cz-accent)' : 'var(--cz-line)' }}>
      <span className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-all" style={{ left: on ? '18px' : '2px', width: 18, height: 18 }} />
    </button>
  );
}

function TrailSlider({ label, value, min, max, onChange, disabled }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] mb-1"><span className="text-muted">{label}</span><span className="font-mono text-faint">{value}</span></div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" style={{ accentColor: 'var(--cz-accent)' }} disabled={disabled} />
    </div>
  );
}

function CursorTrailCard() {
  const [cfg, setCfg] = useState(getTrail);
  const update = (patch) => setCfg(setTrail(patch));
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MousePointer2 size={15} className="text-accent" /> Cursor trail</CardTitle>
        <Toggle on={cfg.enabled} onClick={() => update({ enabled: !cfg.enabled })} />
      </CardHeader>
      <CardBody className={`flex flex-col gap-4 ${cfg.enabled ? '' : 'opacity-50'}`}>
        <div>
          <div className="text-[12px] text-muted mb-2">Color</div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(TRAIL_COLORS).map(([name, val]) => (
              <button key={name} onClick={() => update({ color: name })} title={name} disabled={!cfg.enabled}
                className="w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
                style={{ background: val, borderColor: cfg.color === name ? 'var(--cz-text)' : 'transparent' }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TrailSlider label="Length" value={cfg.length} min={4} max={30} disabled={!cfg.enabled} onChange={(v) => update({ length: v })} />
          <TrailSlider label="Thickness" value={cfg.thickness} min={1} max={8} disabled={!cfg.enabled} onChange={(v) => update({ thickness: v })} />
          <TrailSlider label="Glow" value={cfg.glow} min={0} max={8} disabled={!cfg.enabled} onChange={(v) => update({ glow: v })} />
        </div>
        <p className="text-[12px] text-faint m-0">Changes apply instantly. Auto-off on touch devices and reduced-motion.</p>
      </CardBody>
    </Card>
  );
}

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

function BillingCard() {
  const navigate = useNavigate();
  const { data, loading, refresh } = useEntitlements();
  const [busy, setBusy] = useState(false);
  const cancel = async () => {
    setBusy(true);
    try { await API.post('/api/billing/cancel', {}); await refresh(); } catch { /* ignore */ }
    setBusy(false);
  };
  const pct = (used, limit) => (limit ? Math.min(100, Math.round((used / limit) * 100)) : 0);
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles size={15} className="text-accent" /> Plan &amp; billing</CardTitle>
        {!loading && data && <Badge tone={data.plan === 'free' ? 'neutral' : 'accent'}>{data.planName || data.plan}</Badge>}
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        {loading || !data ? (
          <p className="text-muted text-sm m-0">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {[['Executions', 'executions', 'executionsPerDay'], ['AI calls', 'aiCalls', 'aiCallsPerDay']].map(([label, uk, lk]) => (
                <div key={uk}>
                  <div className="flex items-center justify-between text-[12px] mb-1"><span className="text-muted">{label} today</span><span className="font-mono text-faint">{data.usage[uk]} / {data.limits[lk]}</span></div>
                  <div className="h-2 rounded-full bg-elevated border border-line overflow-hidden"><div className="h-full rounded-full bg-accent" style={{ width: `${pct(data.usage[uk], data.limits[lk])}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => navigate('/pricing')}>{data.plan === 'free' ? 'Upgrade' : 'Change plan'}</Button>
              {data.plan !== 'free' && <Button size="sm" variant="secondary" onClick={cancel} disabled={busy}>Cancel</Button>}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function UsernameCard({ initial }) {
  const [username, setUsername] = useState(initial || '');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true); setMsg('');
    try { const { data } = await API.put('/api/users/username', { username }); setMsg(`Claimed @${data.username}`); }
    catch (e) { setMsg(e.response?.data?.message || 'Could not set username.'); }
    setSaving(false);
  };
  return (
    <Card className="mb-4">
      <CardHeader><CardTitle className="flex items-center gap-2"><AtSign size={15} /> Public handle</CardTitle></CardHeader>
      <CardBody className="flex flex-col gap-2">
        <p className="text-[13px] text-muted m-0">Claim a username for your public profile at <span className="font-mono">/u/&lt;name&gt;</span>.</p>
        <div className="flex gap-2 max-w-sm">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_handle" />
          <Button onClick={save} disabled={saving}>Save</Button>
        </div>
        {msg && <div className="text-[12px] text-accent">{msg}</div>}
      </CardBody>
    </Card>
  );
}

export default function Profile() {
  const [user, setUser] = useState(() => {
    try { const u = localStorage.getItem('userInfo'); return u ? JSON.parse(u) : null; } catch { return null; }
  });
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const enable2FA = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/users/2fa/generate');
      setQrCode(data.qrCode); setSecret(data.secret); setLoading(false);
    } catch { setMsg('Failed to generate 2FA token.'); setLoading(false); }
  };

  const verifyAndActivate2FA = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/users/2fa/verify', { token: verifyCode });
      setMsg(data.message);
      setQrCode(null);
      const updatedUser = { ...user, isTwoFactorEnabled: true };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setLoading(false);
    } catch { setMsg('Verification failed. Invalid token.'); setLoading(false); }
  };

  const logout = async () => {
    try { await axios.post('/api/users/logout'); } catch (err) { console.error('Logout error', err); }
    localStorage.removeItem('userInfo');
    window.location.assign('/login');
  };

  if (!user) return null;
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
        <h1 className="text-[24px] font-extrabold tracking-tight m-0 mb-5">Profile &amp; settings</h1>

        {/* Identity */}
        <Card className="mb-4">
          <CardBody className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-[22px] font-extrabold text-accent-fg shrink-0" style={{ background: 'linear-gradient(135deg, var(--cz-accent), #7c93ff)' }}>{initials}</span>
            <div className="min-w-0">
              <div className="text-[19px] font-bold text-text truncate">{user.name || 'User'}</div>
              <div className="flex items-center gap-1.5 text-[13px] text-muted mt-0.5"><Mail size={14} /> {user.email}</div>
              <div className="mt-2"><Badge tone="accent">{(user.role || 'student').toUpperCase()}</Badge></div>
            </div>
          </CardBody>
        </Card>

        {/* Account fields */}
        <Card className="mb-4">
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[12px] font-semibold text-muted mb-1 flex items-center gap-1.5"><UserIcon size={13} /> Name</div>
              <div className="text-[14px] text-text bg-elevated border border-line rounded-lg px-3 py-2">{user.name}</div>
            </div>
            <div>
              <div className="text-[12px] font-semibold text-muted mb-1 flex items-center gap-1.5"><Mail size={13} /> Email</div>
              <div className="text-[14px] text-text bg-elevated border border-line rounded-lg px-3 py-2 truncate">{user.email}</div>
            </div>
          </CardBody>
        </Card>

        {/* Security / 2FA */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Two-factor authentication</CardTitle>
            {user.isTwoFactorEnabled
              ? <Badge tone="success"><ShieldCheck size={12} /> Enabled</Badge>
              : <Badge tone="warning"><ShieldAlert size={12} /> Off</Badge>}
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            {user.isTwoFactorEnabled ? (
              <p className="text-[13px] text-muted m-0">Your account is protected with an authenticator app. Great job.</p>
            ) : !qrCode ? (
              <>
                <p className="text-[13px] text-muted m-0">Add a second layer of security with a TOTP authenticator (Google Authenticator, Authy…).</p>
                <Button className="self-start" onClick={enable2FA} disabled={loading}>{loading ? 'Generating…' : 'Enable 2FA'}</Button>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <img src={qrCode} alt="2FA QR code" className="w-40 h-40 rounded-lg border border-line bg-white p-2" />
                <div className="flex flex-col gap-3 flex-1">
                  <p className="text-[13px] text-muted m-0">Scan the QR with your authenticator, then enter the 6-digit code to activate.</p>
                  {secret && <code className="text-[12px] text-faint break-all font-mono">{secret}</code>}
                  <div className="flex gap-2 max-w-xs">
                    <Input value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="123456" maxLength={6} />
                    <Button onClick={verifyAndActivate2FA} disabled={loading}>{loading ? 'Verifying…' : 'Verify'}</Button>
                  </div>
                </div>
              </div>
            )}
            {msg && <div className="text-[13px] text-accent bg-accent/10 border border-accent/25 rounded-lg px-3 py-2">{msg}</div>}
          </CardBody>
        </Card>

        {/* Plan & billing */}
        <BillingCard />

        {/* Public handle */}
        <UsernameCard initial={user.username} />

        {/* Cursor trail */}
        <CursorTrailCard />

        {/* Danger */}
        <Card>
          <CardBody className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-bold text-text">Sign out</div>
              <div className="text-[13px] text-muted">End your session on this device.</div>
            </div>
            <Button variant="danger" onClick={logout}><LogOut size={15} /> Sign out</Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
