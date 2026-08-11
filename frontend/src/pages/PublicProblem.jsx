import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Play, BookOpen } from 'lucide-react';
import PublicShell from '../components/marketing/PublicShell';
import { DifficultyBadge, Badge, Button, Spinner, EmptyState } from '../components/ui';
import { API } from '../utils/api';
import { useSEO } from '../hooks/useSEO';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

export default function PublicProblem() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(undefined);
  const loggedIn = !!localStorage.getItem('userInfo');

  useEffect(() => {
    API.get(`/api/public/problems/${slug}`).then((r) => setP(r.data)).catch(() => setP(null));
  }, [slug]);

  useSEO({
    title: p ? `${p.title} — CodeViz` : 'Problem — CodeViz',
    description: p ? `${p.title} (${p.difficulty}). ${String(p.description || '').replace(/[#*`>]/g, '').slice(0, 150)}` : 'Solve coding problems with animated solutions on CodeViz.',
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  const solve = () => navigate(loggedIn ? `/problems/${slug}` : '/signup');

  return (
    <PublicShell>
      <div className="max-w-3xl mx-auto px-6 py-10" style={FONT}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/explore')}><ArrowLeft size={15} /> All problems</Button>

        {p === undefined ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : p === null ? (
          <EmptyState icon="🔍" title="Problem not found" hint="It may have been removed." />
        ) : (
          <>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <h1 className="text-[28px] font-extrabold tracking-tight m-0">{p.title}</h1>
              <DifficultyBadge difficulty={p.difficulty} />
            </div>
            <div className="flex gap-1.5 flex-wrap mt-3">
              {(p.topics || []).map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
              {p.acceptance !== null && <Badge tone="accent">{p.acceptance}% solved</Badge>}
              {p.hasEditorial && <Badge tone="success"><BookOpen size={12} /> Editorial</Badge>}
            </div>

            {/* Description */}
            <div className="mt-6 text-[15px] text-text leading-relaxed whitespace-pre-wrap">{p.description}</div>

            {/* Examples */}
            {p.examples?.length > 0 && (
              <div className="mt-6">
                <div className="text-[11px] font-bold uppercase tracking-wide text-faint mb-2">Examples</div>
                {p.examples.map((ex, i) => (
                  <div key={i} className="bg-elevated border border-line rounded-xl p-4 mb-2 font-mono text-[13px]">
                    <div><span className="text-muted">Input:</span> {ex.input}</div>
                    <div><span className="text-muted">Output:</span> {ex.output}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {p.constraints?.length > 0 && (
              <div className="mt-5">
                <div className="text-[11px] font-bold uppercase tracking-wide text-faint mb-2">Constraints</div>
                <ul className="text-[13.5px] text-muted pl-5 flex flex-col gap-1 m-0">
                  {p.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            {/* Solve CTA — the conversion point */}
            <div className="mt-8 rounded-2xl border border-accent/30 p-6 text-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--cz-accent) 10%, var(--cz-surface)), var(--cz-surface))' }}>
              <div className="text-[16px] font-bold">Solve it — and <span className="text-accent">watch your code run</span></div>
              <p className="text-muted text-[13.5px] mt-1 max-w-md mx-auto">Write a solution in 8 languages, run it in a secure sandbox, and see the algorithm animate step by step. {p.hintCount > 0 && `${p.hintCount} hints available. `}Free to start.</p>
              <Button size="lg" className="mt-4" onClick={solve}>
                {loggedIn ? <><Play size={16} /> Open the solver</> : <><Lock size={15} /> Sign up free to solve</>}
              </Button>
            </div>
          </>
        )}
      </div>
    </PublicShell>
  );
}
