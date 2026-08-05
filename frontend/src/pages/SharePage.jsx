import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hexagon, Eye, ArrowRight, Code2 } from 'lucide-react';
import Canvas from '../components/Visualizer/Canvas';
import { Button } from '../components/ui';
import { API } from '../utils/api';

/** Public share page — /share/:token. Rich view: viz replay + code + CTA. */
export default function SharePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [share, setShare] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    API.get(`/api/share/${token}`).then((r) => setShare(r.data)).catch(() => setError(true));
  }, [token]);

  return (
    <div className="min-h-screen bg-bg text-text" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-accent border border-accent/40 bg-accent/12"><Hexagon size={14} strokeWidth={2.5} /></span>
            <span className="text-[15px] font-extrabold tracking-tight text-text">CodeViz</span>
          </button>
          <Button size="sm" onClick={() => navigate('/signup')}>Try it free <ArrowRight size={14} /></Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {error ? (
          <div className="text-center py-24 text-muted">This visualization doesn’t exist or was removed.</div>
        ) : !share ? (
          <div className="text-center py-24 text-muted">Loading…</div>
        ) : (
          <>
            <div className="mb-4">
              <h1 className="text-[26px] font-extrabold tracking-tight m-0">{share.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-[13px] text-muted">
                <span className="font-mono uppercase text-accent">{share.language}</span>
                {share.author?.name && <span>by {share.author.name}</span>}
                <span className="flex items-center gap-1"><Eye size={13} /> {share.views}</span>
              </div>
            </div>

            {/* Visualization */}
            <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-[var(--cz-shadow-md)] mb-5">
              <div className="h-[420px] overflow-auto p-3">
                {share.trace?.length
                  ? <Canvas traceData={share.trace} stepIndex={stepIndex} setStepIndex={setStepIndex} />
                  : <div className="h-full flex items-center justify-center text-muted text-sm">No trace was captured for this share.</div>}
              </div>
            </div>

            {/* Code */}
            <div className="bg-surface border border-line rounded-xl overflow-hidden mb-8">
              <div className="flex items-center gap-2 px-4 h-10 border-b border-line text-[12px] font-bold text-muted"><Code2 size={14} /> Source</div>
              <pre className="p-4 m-0 text-[13px] font-mono overflow-x-auto text-text leading-relaxed">{share.code}</pre>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-accent/30 p-8 text-center" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--cz-accent) 12%, var(--cz-surface)), var(--cz-surface))' }}>
              <h2 className="text-[22px] font-extrabold tracking-tight m-0">See your own code come to life.</h2>
              <p className="text-muted text-sm mt-2 mb-5">Animated, debugger-driven visualization across 8 languages — free to start.</p>
              <Button size="lg" onClick={() => navigate('/signup')}>Start visualizing — free <ArrowRight size={16} /></Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
