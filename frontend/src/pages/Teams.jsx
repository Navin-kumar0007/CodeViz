import { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, X, Crown, ShieldCheck, Copy, Check } from 'lucide-react';
import { API } from '../utils/api';
import { Button, Input, Spinner, EmptyState, Badge } from '../components/ui';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const STATUS = { active: 'success', trialing: 'accent', inactive: 'warning', cancelled: 'neutral' };

export default function Teams() {
  const [teams, setTeams] = useState(null);
  const [name, setName] = useState('');
  const [seats, setSeats] = useState(5);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState('');

  const load = () => API.get('/api/teams/mine').then((r) => setTeams(r.data)).catch(() => setTeams([]));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true); setErr('');
    try { await API.post('/api/teams', { name, seats: Number(seats) }); setName(''); setSeats(5); load(); }
    catch (e2) { setErr(e2?.response?.data?.message || 'Could not create team'); }
    finally { setCreating(false); }
  };

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Users size={20} /></span>
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight m-0">Teams</h1>
            <p className="text-muted text-[13px] m-0">Seat-based team &amp; EDU access. Members inherit the team plan while it&apos;s active.</p>
          </div>
        </div>

        {/* Create */}
        <form onSubmit={create} className="bg-surface border border-line rounded-2xl p-5 my-6 shadow-[var(--cz-shadow-sm)]">
          <div className="text-[13px] font-bold mb-3">Create a team</div>
          <div className="flex gap-2 flex-wrap items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-[12px] text-muted">Team name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="CS Department" required />
            </div>
            <div className="w-24">
              <label className="text-[12px] text-muted">Seats</label>
              <Input type="number" min={1} max={1000} value={seats} onChange={(e) => setSeats(e.target.value)} />
            </div>
            <Button type="submit" disabled={creating}>{creating ? <><Spinner size={14} /> Creating</> : <><Plus size={15} /> Create</>}</Button>
          </div>
          {err && <div className="text-[12.5px] text-danger bg-danger/10 border border-danger/25 rounded-lg px-3 py-2 mt-3">{err}</div>}
        </form>

        {!teams ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : teams.length === 0 ? (
          <EmptyState icon="👥" title="No teams yet" hint="Create a team above to manage seats and invite members." />
        ) : (
          <div className="flex flex-col gap-4">
            {teams.map((t) => <TeamCard key={t.id} team={t} onChange={load} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamCard({ team, onChange }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await API.post(`/api/teams/${team.id}/members`, { email }); setEmail(''); onChange(); }
    catch (e2) { setErr(e2?.response?.data?.message || 'Could not add member'); }
    finally { setBusy(false); }
  };
  const remove = async (userId) => {
    try { await API.delete(`/api/teams/${team.id}/members/${userId}`); onChange(); } catch { /* ignore */ }
  };
  const copyInvite = async () => {
    try { await navigator.clipboard.writeText(team.inviteCode); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* blocked */ }
  };

  const full = team.seatsUsed >= team.seats;

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 shadow-[var(--cz-shadow-sm)]">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[16px] font-bold">{team.name}</span>
        <Badge tone={STATUS[team.status] || 'neutral'}>{team.status}</Badge>
        <span className="ml-auto text-[13px] text-muted">Seats <b className="text-text">{team.seatsUsed}/{team.seats}</b></span>
      </div>

      {!team.active && (
        <div className="text-[12.5px] text-warning bg-warning/10 border border-warning/25 rounded-lg px-3 py-2 mt-3">
          Pending activation — members don&apos;t inherit the plan until the team is active. An admin activates it (or billing will, once live).
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 text-[12px] text-faint">
        <span>Invite code</span>
        <button onClick={copyInvite} className="inline-flex items-center gap-1.5 font-mono text-[12px] bg-elevated border border-line rounded-lg px-2.5 py-1 cursor-pointer hover:border-accent transition-colors">
          {team.inviteCode} {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
        </button>
      </div>

      {/* Members */}
      <div className="flex flex-col gap-1.5 mt-4">
        {team.members.map((m) => (
          <div key={m.user} className="flex items-center gap-2.5 bg-elevated border border-line rounded-lg px-3 py-2">
            {m.role === 'owner' ? <Crown size={14} className="text-warning shrink-0" /> : <ShieldCheck size={14} className="text-muted shrink-0" />}
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold truncate">{m.name || m.email}</div>
              <div className="text-[11px] text-faint truncate">{m.email} · {m.role}</div>
            </div>
            {m.role !== 'owner' && (
              <button onClick={() => remove(m.user)} aria-label="Remove member" className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 cursor-pointer transition-colors"><X size={14} /></button>
            )}
          </div>
        ))}
      </div>

      {/* Add member */}
      <form onSubmit={add} className="flex gap-2 mt-3">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={full ? 'No seats left — add seats' : 'invite by email'} disabled={full} required className="flex-1" />
        <Button type="submit" size="sm" disabled={busy || full}>{busy ? <Spinner size={13} /> : <><UserPlus size={14} /> Invite</>}</Button>
      </form>
      {err && <div className="text-[12px] text-danger mt-2">{err}</div>}
    </div>
  );
}
