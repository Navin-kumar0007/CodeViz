import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Trophy, Check, Play } from 'lucide-react';
import { API } from '../utils/api';
import { Badge, Button, DifficultyBadge, Spinner, EmptyState } from '../components/ui';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

function useCountdown(target) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!target) return undefined;
    const tick = () => setLeft(target - Date.now());
    const t0 = setTimeout(tick, 30);   // first update async (avoids setState-in-effect)
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(t0); clearInterval(id); };
  }, [target]);
  if (!target || left <= 0) return null;
  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return d > 0 ? `${d}d ${h}h ${m}m` : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function ContestDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState(undefined);
  const [board, setBoard] = useState([]);
  const [tab, setTab] = useState('problems');
  const [busy, setBusy] = useState(false);

  const load = () => API.get(`/api/contests/${slug}`).then((r) => setC(r.data)).catch(() => setC(null));
  const loadBoard = () => API.get(`/api/contests/${slug}/leaderboard`).then((r) => setBoard(r.data)).catch(() => {});
  useEffect(() => {
    load(); loadBoard();
    const id = setInterval(loadBoard, 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const countdown = useCountdown(c && c.status !== 'ended' ? new Date(c.status === 'upcoming' ? c.startAt : c.endAt).getTime() : null);

  const register = async () => {
    setBusy(true);
    try { await API.post(`/api/contests/${slug}/register`); await load(); } catch { /* ignore */ }
    setBusy(false);
  };

  if (c === undefined) return <div className="min-h-full flex items-center justify-center bg-bg"><Spinner /></div>;
  if (c === null) return <div className="min-h-full bg-bg text-text" style={FONT}><div className="max-w-3xl mx-auto px-6 py-10"><EmptyState icon="🏆" title="Contest not found" /></div></div>;

  const solved = new Set(c.myScore?.solved || []);

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
        <Button variant="ghost" size="sm" onClick={() => navigate('/contests')}><ArrowLeft size={15} /> Contests</Button>

        {/* Header */}
        <div className="mt-4 rounded-2xl border border-accent/30 p-6" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--cz-accent) 10%, var(--cz-surface)), var(--cz-surface))' }}>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge tone={c.status === 'live' ? 'success' : c.status === 'upcoming' ? 'accent' : 'neutral'}>{c.status === 'live' ? '🔴 Live' : c.status}</Badge>
            <h1 className="text-[24px] font-extrabold tracking-tight m-0">{c.title}</h1>
          </div>
          <p className="text-[14px] text-muted mt-2 leading-relaxed">{c.description}</p>
          <div className="flex items-center gap-5 mt-4 flex-wrap">
            {countdown && <span className="flex items-center gap-1.5 text-[14px] font-bold text-accent tabular-nums"><Clock size={15} /> {c.status === 'upcoming' ? 'Starts in' : 'Ends in'} {countdown}</span>}
            <span className="flex items-center gap-1.5 text-[13px] text-muted"><Trophy size={14} /> {c.participants} registered</span>
            {c.registered ? <Badge tone="success"><Check size={12} /> Registered · {c.myScore?.score ?? 0} pts</Badge>
              : c.status !== 'ended' && <Button size="sm" onClick={register} disabled={busy}>Register</Button>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-line mt-6">
          {['problems', 'leaderboard'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 h-10 text-[13px] font-semibold uppercase tracking-wide border-b-2 -mb-px cursor-pointer transition-colors ${tab === t ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-text'}`}>{t}</button>
          ))}
        </div>

        {tab === 'problems' && (
          <div className="mt-4 flex flex-col gap-2">
            {c.status === 'upcoming' ? (
              <EmptyState icon="⏳" title="Problems revealed at start" hint="Register now — the set unlocks when the contest goes live." />
            ) : c.problems.length === 0 ? (
              <EmptyState icon="📭" title="No problems" />
            ) : c.problems.map((p, i) => (
              <div key={p.slug} className="flex items-center gap-3 bg-surface border border-line rounded-xl px-4 py-3">
                <span className="font-mono text-[12px] text-faint w-5">{String.fromCharCode(65 + i)}</span>
                <DifficultyBadge difficulty={p.difficulty} />
                <span className="flex-1 min-w-0 text-[14.5px] font-semibold truncate">{p.title}</span>
                {solved.has(p._id) || solved.has(p.slug) ? <Badge tone="success"><Check size={12} /> Solved</Badge> : null}
                <Button size="sm" variant={c.status === 'live' ? 'primary' : 'secondary'} onClick={() => navigate(`/problems/${p.slug}?contest=${slug}`)}>
                  <Play size={13} /> {c.status === 'live' ? 'Solve' : 'View'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="mt-4">
            {board.length === 0 ? <EmptyState icon="🏆" title="No entries yet" hint="Be the first to score." /> : (
              <div className="flex flex-col gap-1">
                {board.map((e) => (
                  <div key={e.rank} className="flex items-center gap-3 bg-surface border border-line rounded-lg px-4 py-2.5">
                    <span className={`font-mono text-[13px] font-bold w-7 ${e.rank <= 3 ? 'text-accent' : 'text-faint'}`}>#{e.rank}</span>
                    <span className="flex-1 min-w-0 text-[14px] font-semibold truncate">{e.user}</span>
                    <span className="text-[12px] text-muted">{e.solvedCount} solved</span>
                    <span className="text-[14px] font-extrabold text-accent tabular-nums">{e.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
