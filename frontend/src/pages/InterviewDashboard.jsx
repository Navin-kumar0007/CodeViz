import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play } from 'lucide-react';
import { Button, Badge, Spinner, EmptyState } from '../components/ui';
import { API as axios } from '../utils/api';
import API_BASE from '../utils/api';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

export default function InterviewDashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${user?.token}` } }), [user?.token]);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/interview/recruiter/sessions`, authHeaders);
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally { setLoading(false); }
  }, [authHeaders]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const createInvite = async () => {
    const email = prompt('Enter candidate email:');
    if (!email) return;
    try {
      const res = await axios.post(`${API_BASE}/api/interview/recruiter/create`, { candidateEmail: email, mode: 'mixed' }, authHeaders);
      alert(`Invite created! Link: ${window.location.origin}/live-interview/${res.data.session._id}`);
      fetchSessions();
    } catch { alert('Failed to create invite'); }
  };

  const highIntuition = sessions.filter((s) => s.totalScore > 70).length;

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight m-0">Recruit</h1>
            <p className="text-muted text-[13px] m-0 mt-1">Proof-of-work technical assessments.</p>
          </div>
          <Button onClick={createInvite}><Plus size={15} /> Create invite</Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface border border-line rounded-xl px-4 py-3 shadow-[var(--cz-shadow-sm)]">
            <div className="text-[24px] font-extrabold tabular-nums">{sessions.length}</div>
            <div className="text-[12px] text-muted">Total assessments</div>
          </div>
          <div className="bg-surface border border-line rounded-xl px-4 py-3 shadow-[var(--cz-shadow-sm)]">
            <div className="text-[24px] font-extrabold tabular-nums text-success">{highIntuition}</div>
            <div className="text-[12px] text-muted">High-intuition candidates</div>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-[var(--cz-shadow-sm)]">
          <div className="grid grid-cols-[1fr_100px_80px_110px] items-center gap-3 px-4 h-10 border-b border-line bg-elevated text-[11px] font-bold uppercase tracking-wide text-faint">
            <span>Candidate</span><span>Status</span><span>Score</span><span></span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted text-sm"><Spinner /> Loading…</div>
          ) : sessions.length === 0 ? (
            <EmptyState icon="🛡️" title="No assessments yet" hint="Create an invite to start assessing candidates." action={<Button size="sm" onClick={createInvite}>Create invite</Button>} />
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="grid grid-cols-[1fr_100px_80px_110px] items-center gap-3 px-4 py-3 border-b border-line last:border-0">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-text truncate">{s.candidateEmail || 'Anonymous'}</div>
                  <div className="text-[11px] font-mono text-faint">ID: {String(s.id).slice(-6)} · {new Date(s.date).toLocaleDateString()}</div>
                </div>
                <Badge tone={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge>
                <span className="text-[14px] font-bold tabular-nums">{s.totalScore}%</span>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/live-interview/${s.id}`)}><Play size={13} /> Replay</Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
