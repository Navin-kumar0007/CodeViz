import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { API } from '../../utils/api';
import { DifficultyBadge, Badge } from '../ui';

/**
 * FocusPlan — the adaptive "it knows what you don't know" widget. Surfaces the
 * user's weak areas, targeted unsolved problems, and the next lesson to resume.
 */
export default function FocusPlan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    API.get('/api/progress/focus')
      .then((r) => { if (!cancelled) setPlan(r.data); })
      .catch(() => { if (!cancelled) setErr(true); });
    return () => { cancelled = true; };
  }, []);

  if (err) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-surface border border-line rounded-2xl p-5 shadow-[var(--cz-shadow-sm)]"
    >
      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Target size={16} /></span>
        <span className="text-[15px] font-bold">Your focus</span>
        <Badge tone="accent" className="ml-auto"><Sparkles size={12} /> Adaptive</Badge>
      </div>

      {!plan ? (
        <div className="py-6 text-center text-muted text-[13px]">Analyzing your progress…</div>
      ) : (
        <>
          <p className="text-[13.5px] text-muted leading-relaxed mt-1 mb-4">{plan.summary}</p>

          {/* Weak areas */}
          {plan.weakAreas?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {plan.weakAreas.map((w) => (
                <span key={w.name} className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-elevated border border-line text-text">
                  {w.name.replace(/_/g, ' ')}{w.accuracy !== null ? ` · ${w.accuracy}%` : ''}
                </span>
              ))}
            </div>
          )}

          {/* Recommended problems */}
          {plan.recommendedProblems?.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-faint mb-0.5">Recommended for you</div>
              {plan.recommendedProblems.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => navigate(`/problems/${p.slug}`)}
                  className="group flex items-center gap-3 text-left bg-elevated border border-line rounded-xl px-3.5 py-2.5 cursor-pointer hover:border-accent transition-colors"
                >
                  <DifficultyBadge difficulty={p.difficulty} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-semibold text-text truncate">{p.title}</span>
                    <span className="block text-[11px] text-muted truncate">{p.reason}</span>
                  </span>
                  <ArrowRight size={15} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Resume lesson */}
          {plan.nextLesson && (
            <button
              onClick={() => navigate('/learn')}
              className="w-full flex items-center gap-2.5 bg-accent/10 border border-accent/25 rounded-xl px-3.5 py-2.5 cursor-pointer hover:bg-accent/16 transition-colors"
            >
              <BookOpen size={15} className="text-accent shrink-0" />
              <span className="flex-1 min-w-0 text-left">
                <span className="block text-[11px] text-muted">Continue learning</span>
                <span className="block text-[13.5px] font-semibold text-text truncate">{plan.nextLesson.lessonTitle} · {plan.nextLesson.courseTitle}</span>
              </span>
              <ArrowRight size={15} className="text-accent shrink-0" />
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
