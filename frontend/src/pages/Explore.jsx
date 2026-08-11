import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import PublicShell from '../components/marketing/PublicShell';
import { DifficultyBadge, Badge, Spinner, Input } from '../components/ui';
import { API } from '../utils/api';
import { useSEO } from '../hooks/useSEO';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

export default function Explore() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState(null);
  const [q, setQ] = useState('');
  const [diff, setDiff] = useState('all');

  useSEO({
    title: 'Explore coding problems — CodeViz',
    description: 'Browse coding problems with animated, debugger-driven solutions. Practice data structures, algorithms and interview questions — watch your code run, step by step.',
  });

  useEffect(() => {
    API.get('/api/public/problems').then((r) => setProblems(r.data)).catch(() => setProblems([]));
  }, []);

  const filtered = (problems || []).filter((p) =>
    (diff === 'all' || p.difficulty === diff) &&
    (!q || p.title.toLowerCase().includes(q.toLowerCase()) || (p.topics || []).some((t) => t.includes(q.toLowerCase())))
  );

  return (
    <PublicShell>
      <div className="max-w-4xl mx-auto px-6 py-10" style={FONT}>
        <div className="text-center mb-8">
          <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-accent">Problem set</span>
          <h1 className="text-[32px] font-extrabold tracking-tight m-0 mt-2">Practice problems, visualized</h1>
          <p className="text-muted mt-2">Every problem comes with an animated, debugger-accurate solution. Sign up free to solve and watch your own code run.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center mb-5">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <Input placeholder="Search problems or topics" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 34 }} />
          </div>
          <div className="flex gap-1.5">
            {['all', 'easy', 'medium', 'hard'].map((d) => (
              <button key={d} onClick={() => setDiff(d)} className={`text-[12.5px] font-semibold px-3 py-2 rounded-lg border capitalize cursor-pointer transition-colors ${diff === d ? 'bg-accent text-white border-accent' : 'bg-surface border-line text-muted hover:border-accent'}`}>{d}</button>
            ))}
          </div>
        </div>

        {!problems ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="text-[12px] text-faint mb-1">{filtered.length} problems</div>
            {filtered.map((p, i) => (
              <motion.button
                key={p.slug}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.015, 0.3) }}
                onClick={() => navigate(`/explore/${p.slug}`)}
                className="group flex items-center gap-3 text-left bg-surface border border-line rounded-xl px-4 py-3 cursor-pointer hover:border-accent transition-colors"
              >
                <DifficultyBadge difficulty={p.difficulty} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[14.5px] font-semibold truncate">{p.title}</span>
                  <span className="block text-[11.5px] text-muted truncate">{(p.topics || []).slice(0, 3).join(' · ') || p.category}</span>
                </span>
                {p.acceptance !== null && <span className="text-[11px] text-faint hidden sm:block">{p.acceptance}% solved</span>}
                <ArrowRight size={15} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
