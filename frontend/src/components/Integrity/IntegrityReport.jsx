import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle, Info } from 'lucide-react';
import { API } from '../../utils/api';

const OVERALL = {
  'looks-original': { label: 'Looks original', tone: 'text-success', dot: 'var(--cz-success)' },
  'some-signals': { label: 'Some signals', tone: 'text-warning', dot: 'var(--cz-warning)' },
  'review-suggested': { label: 'Review suggested', tone: 'text-hard', dot: 'var(--cz-hard)' },
  'insufficient-data': { label: 'Not enough data', tone: 'text-muted', dot: 'var(--cz-line)' },
};
const LEVEL = { high: 'text-hard', medium: 'text-warning', ok: 'text-success' };

/**
 * IntegrityReport — shows authorship SIGNALS for a submission (typed vs pasted,
 * paste bursts, an AI-style hint). Framed explicitly as signals, never proof.
 * Fetches itself from /api/integrity/submission/:id.
 */
export default function IntegrityReport({ submissionId, onClose }) {
  const [report, setReport] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    API.get(`/api/integrity/submission/${submissionId}`)
      .then((r) => { if (!cancelled) setReport(r.data); })
      .catch((e) => { if (!cancelled) setErr(e.response?.data?.message || 'Could not load report'); });
    return () => { cancelled = true; };
  }, [submissionId]);

  const a = report?.authorship;
  const ov = OVERALL[report?.overall] || OVERALL['insufficient-data'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(8,10,20,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="bg-surface border border-line rounded-2xl shadow-[var(--cz-shadow-md)] w-full max-w-lg max-h-[88vh] overflow-auto"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          <div className="flex items-center gap-2.5 px-5 h-14 border-b border-line sticky top-0 bg-surface">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Shield size={16} /></span>
            <span className="text-[15px] font-bold">Authorship signals</span>
            <button onClick={onClose} className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-elevated border border-line"><X size={15} /></button>
          </div>

          {err && <div className="p-6 text-hard text-[14px]">{err}</div>}
          {!report && !err && <div className="p-10 text-center text-muted text-[14px]">Loading…</div>}

          {report && (
            <div className="p-5 flex flex-col gap-5">
              {/* Overall */}
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ background: ov.dot }} />
                <span className={`text-[16px] font-extrabold ${ov.tone}`}>{ov.label}</span>
              </div>

              {/* Typed vs pasted */}
              {a && a.typedPct !== null ? (
                <div>
                  <div className="flex justify-between text-[12px] font-semibold text-muted mb-1.5">
                    <span>Typed {a.typedPct}%</span><span>Pasted {a.pastePct}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden flex bg-elevated border border-line">
                    <div style={{ width: `${a.typedPct}%`, background: 'var(--cz-success)' }} />
                    <div style={{ width: `${a.pastePct}%`, background: 'var(--cz-warning)' }} />
                  </div>
                  <div className="flex gap-4 mt-2.5 text-[12px] text-muted">
                    <span>⌨ {a.keystrokes} edits</span>
                    <span>📋 {a.pasteEvents.length} pastes</span>
                    {a.biggestPaste > 0 && <span>largest paste {a.biggestPaste} chars</span>}
                    {a.durationMs > 0 && <span>⏱ {Math.round(a.durationMs / 1000)}s</span>}
                  </div>
                </div>
              ) : (
                <div className="text-[13px] text-muted">No authorship telemetry was recorded for this submission.</div>
              )}

              {/* AI signal */}
              {report.aiSignal && typeof report.aiSignal.aiProbability === 'number' && (
                <div className="bg-elevated border border-line rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[13px] font-bold"><Info size={14} className="text-accent" /> AI-style hint (unreliable)</div>
                  <div className="text-[13px] text-muted mt-1.5">~{report.aiSignal.aiProbability}% AI-style patterns — a weak signal, not proof. {report.aiSignal.analysis}</div>
                </div>
              )}

              {/* Flags */}
              {report.flags?.length > 0 && (
                <div className="flex flex-col gap-2">
                  {report.flags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-[13px]">
                      <AlertTriangle size={14} className={`${LEVEL[f.level] || 'text-muted'} shrink-0 mt-0.5`} />
                      <span className="text-text">{f.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer / consent */}
              <div className="text-[12px] text-muted leading-relaxed bg-elevated border border-line rounded-xl p-3.5">
                ⚖️ {report.disclaimer}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
