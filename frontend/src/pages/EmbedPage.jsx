import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Canvas from '../components/Visualizer/Canvas';
import { API } from '../utils/api';

/**
 * Public, minimal embed of a shared visualization (for iframes / oEmbed).
 * /embed/:token — no chrome, just the animated Canvas replaying the stored trace.
 */
export default function EmbedPage() {
  const { token } = useParams();
  const [share, setShare] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    API.get(`/api/share/${token}`).then((r) => setShare(r.data)).catch(() => setError(true));
  }, [token]);

  return (
    <div className="h-screen w-screen bg-bg text-text flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="flex items-center justify-between px-3 h-9 border-b border-line shrink-0 text-[12px]">
        <span className="font-semibold truncate">{share?.title || 'Visualization'}</span>
        <a href={`${window.location.origin}/share/${token}`} target="_blank" rel="noreferrer" className="text-accent no-underline font-semibold shrink-0">CodeViz ↗</a>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-2">
        {error ? (
          <div className="h-full flex items-center justify-center text-muted text-sm">Visualization not found.</div>
        ) : share?.trace?.length ? (
          <Canvas traceData={share.trace} stepIndex={stepIndex} setStepIndex={setStepIndex} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted text-sm">Loading…</div>
        )}
      </div>
    </div>
  );
}
