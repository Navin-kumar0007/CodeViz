import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hexagon, Trophy, Zap, Flame, CheckCircle2, Eye, ArrowRight, ShieldCheck, Award, Keyboard } from 'lucide-react';
import { Button } from '../components/ui';
import { API } from '../utils/api';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

function Stat({ Icon, value, label }) {
  return (
    <div className="bg-surface border border-line rounded-xl px-4 py-3 flex items-center gap-3 shadow-[var(--cz-shadow-sm)]">
      <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent/12 text-accent shrink-0"><Icon size={17} /></span>
      <div className="leading-tight"><div className="text-[18px] font-bold tabular-nums">{value}</div><div className="text-[11px] text-muted">{label}</div></div>
    </div>
  );
}

/** Public SEO profile — /u/:handle (username or id). */
export default function PublicProfile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    API.get(`/api/users/public/${handle}`).then((r) => setP(r.data)).catch(() => setError(true));
  }, [handle]);

  return (
    <div className="min-h-screen bg-bg text-text" style={FONT}>
      <header className="border-b border-line">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-accent border border-accent/40 bg-accent/12"><Hexagon size={14} strokeWidth={2.5} /></span>
            <span className="text-[15px] font-extrabold tracking-tight text-text">CodeViz</span>
          </button>
          <Button size="sm" onClick={() => navigate('/signup')}>Join <ArrowRight size={14} /></Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-10">
        {error ? (
          <div className="text-center py-24 text-muted">Profile not found.</div>
        ) : !p ? (
          <div className="text-center py-24 text-muted">Loading…</div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-[24px] font-extrabold text-accent-fg shrink-0" style={{ background: 'linear-gradient(135deg, var(--cz-accent), #7c93ff)' }}>
                {p.name?.substring(0, 2).toUpperCase()}
              </span>
              <div>
                <h1 className="text-[24px] font-extrabold tracking-tight m-0">{p.name}</h1>
                {p.username && <div className="text-[13px] text-muted">@{p.username}</div>}
                {p.bio && <p className="text-[14px] text-muted mt-1 m-0 max-w-lg">{p.bio}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <Stat Icon={Trophy} value={p.stats.level} label="Level" />
              <Stat Icon={Zap} value={p.stats.xp} label="XP" />
              <Stat Icon={Flame} value={p.stats.streak} label="Streak" />
              <Stat Icon={CheckCircle2} value={p.stats.problemsSolved} label="Solved" />
            </div>

            {/* Proof of work — authorship-verified, employer-facing */}
            {p.authorship?.scoredSolutions > 0 && (() => {
              const a = p.authorship;
              const tone = a.confidence === 'high' ? 'success' : a.confidence === 'moderate' ? 'accent' : 'warning';
              const c = `var(--cz-${tone})`;
              const mix = (pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
              return (
                <div className="rounded-2xl border p-5 mb-8" style={{ borderColor: mix(35), background: `color-mix(in srgb, ${c} 7%, var(--cz-surface))` }}>
                  <div className="flex items-start gap-3.5">
                    <span className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border" style={{ background: mix(15), color: c, borderColor: mix(30) }}><ShieldCheck size={22} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-extrabold">Proof of work</span>
                        <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border" style={{ background: mix(12), color: c, borderColor: mix(25) }}>Verified by CodeViz</span>
                      </div>
                      <p className="text-[13.5px] text-muted m-0 mt-1.5 leading-relaxed">
                        <b className="text-text inline-flex items-center gap-1"><Keyboard size={14} /> {a.typedPct}% hand-typed</b> across scored solutions —
                        {' '}<b className="text-text">{a.verifiedSolutions}</b> of <b className="text-text">{a.scoredSolutions}</b> are authorship-verified (typed, not pasted). Authorship is measured from live editor telemetry, not self-reported.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Skills — solved problems by area, split by difficulty */}
            {p.skills?.length > 0 && (
              <>
                <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-faint mb-3">Verified skills</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {p.skills.slice(0, 8).map((s) => (
                    <div key={s.category} className="bg-surface border border-line rounded-xl px-4 py-3 shadow-[var(--cz-shadow-sm)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold capitalize">{String(s.category).replace(/_/g, ' ')}</span>
                        <span className="text-[13px] font-bold tabular-nums">{s.solved}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
                        {s.easy > 0 && <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success" />{s.easy} easy</span>}
                        {s.medium > 0 && <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning" />{s.medium} med</span>}
                        {s.hard > 0 && <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-hard" />{s.hard} hard</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Certificates — verifiable credentials */}
            {p.certificates?.length > 0 && (
              <>
                <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-faint mb-3">Certificates</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {p.certificates.map((c) => (
                    <button key={c.credentialId} onClick={() => navigate(`/verify/${c.credentialId}`)} className="text-left bg-surface border border-line rounded-xl p-4 cursor-pointer transition-all hover:border-accent hover:-translate-y-0.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-accent/12 text-accent shrink-0"><Award size={17} /></span>
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-text truncate">{c.courseName}</div>
                          <div className="text-[12px] text-muted flex items-center gap-1"><ShieldCheck size={12} className="text-success" /> Verify credential</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {p.shares?.length > 0 && (
              <>
                <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-faint mb-3">Shared visualizations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {p.shares.map((s) => (
                    <button key={s.token} onClick={() => navigate(`/share/${s.token}`)} className="text-left bg-surface border border-line rounded-xl p-4 cursor-pointer transition-all hover:border-accent hover:-translate-y-0.5">
                      <div className="text-[14px] font-semibold text-text truncate">{s.title}</div>
                      <div className="flex items-center gap-3 mt-1.5 text-[12px] text-muted">
                        <span className="font-mono uppercase text-accent">{s.language}</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {s.views}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
