import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, ArrowRight, Flame } from 'lucide-react';
import { API } from '../utils/api';
import { Spinner, EmptyState, DifficultyBadge, Badge } from '../components/ui';
import { track } from '../utils/analytics';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

// Self-grade after recalling a problem — mirrors the SM-2 grades on the server.
const GRADES = [
  { key: 'again', label: 'Again', hint: 'Forgot it', cls: 'border-hard/40 text-hard hover:bg-hard/10' },
  { key: 'hard', label: 'Hard', hint: 'Struggled', cls: 'border-warning/40 text-warning hover:bg-warning/10' },
  { key: 'good', label: 'Good', hint: 'Recalled', cls: 'border-accent/40 text-accent hover:bg-accent/10' },
  { key: 'easy', label: 'Easy', hint: 'Effortless', cls: 'border-success/40 text-success hover:bg-success/10' },
];

export default function Review() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(null); // problemId being graded

  useEffect(() => {
    API.get('/api/review/due')
      .then((r) => { setItems(r.data.items || []); setTotal(r.data.total || 0); })
      .catch(() => { setItems([]); setTotal(0); });
  }, []);

  const grade = async (problemId, g) => {
    setBusy(problemId);
    try {
      await API.post(`/api/review/${problemId}/grade`, { grade: g });
      track('review_graded', { grade: g });
      setItems((prev) => prev.filter((it) => it.problem?._id !== problemId));
    } catch { /* leave it in the queue on error */ } finally { setBusy(null); }
  };

  const due = items?.length || 0;

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Repeat size={20} /></span>
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight m-0">Review</h1>
            <p className="text-muted text-[13px] m-0">Spaced repetition — problems you&apos;ve solved come back on a decay curve so they actually stick.</p>
          </div>
        </div>

        {items && (
          <div className="flex items-center gap-2 mb-5 mt-4">
            <Badge tone={due > 0 ? 'accent' : 'neutral'}>{due} due today</Badge>
            <Badge tone="neutral">{total} tracked</Badge>
            {due > 0 && <span className="text-[12px] text-faint inline-flex items-center gap-1"><Flame size={13} className="text-warning" /> clear the queue to lock in the memory</span>}
          </div>
        )}

        {!items ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : due === 0 ? (
          <EmptyState
            icon="✅"
            title={total > 0 ? "You're all caught up" : 'Nothing to review yet'}
            hint={total > 0
              ? 'No problems are due right now. Solved problems resurface here over time — check back tomorrow.'
              : 'Solve problems in Practice and they’ll come back here for spaced review so they stick.'}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {items.map((it) => (
                <motion.div
                  key={it._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: -12, transition: { duration: 0.25 } }}
                  className="bg-surface border border-line rounded-2xl p-4 shadow-[var(--cz-shadow-sm)] overflow-hidden"
                >
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-bold truncate">{it.problem?.title || 'Problem'}</span>
                        {it.problem?.difficulty && <DifficultyBadge difficulty={it.problem.difficulty} />}
                        {it.lapses > 0 && <Badge tone="warning">lapsed ×{it.lapses}</Badge>}
                      </div>
                      <div className="text-[12px] text-faint mt-1">
                        {it.problem?.category || 'General'} · reviewed {it.reps}× · ease {it.ease?.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/problems/${it.problem?.slug}`)}
                      className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-lg px-3 py-2 cursor-pointer border border-line text-muted hover:text-text hover:border-accent transition-colors"
                    >
                      Open <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-3.5">
                    {GRADES.map((g) => (
                      <button
                        key={g.key}
                        disabled={busy === it.problem?._id}
                        onClick={() => grade(it.problem?._id, g.key)}
                        className={`flex flex-col items-center gap-0.5 rounded-lg border py-2 cursor-pointer transition-colors disabled:opacity-50 ${g.cls}`}
                      >
                        <span className="text-[13px] font-bold">{g.label}</span>
                        <span className="text-[10px] opacity-70">{g.hint}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
