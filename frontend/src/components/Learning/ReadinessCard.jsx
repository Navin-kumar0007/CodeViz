import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gauge, ArrowUpRight } from 'lucide-react';
import { API } from '../../utils/api';

const SIGNALS = [
  { key: 'volume', label: 'Volume' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'breadth', label: 'Breadth' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'retention', label: 'Retention' },
];

// Band → a semantic color class; SVG ring uses currentColor so it inherits it.
function bandColor(score) {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-accent';
  if (score >= 40) return 'text-warning';
  return 'text-muted';
}

const R = 52;
const CIRC = 2 * Math.PI * R;

// Job-readiness score: one honest number from real signals, with the top levers to raise it.
export default function ReadinessCard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get('/api/progress/readiness').then((r) => setData(r.data)).catch(() => setData(null));
  }, []);

  if (!data) return null;
  const color = bandColor(data.score);
  const offset = CIRC * (1 - data.score / 100);

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 shadow-[var(--cz-shadow-sm)]">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Gauge size={16} /></span>
        <div>
          <div className="text-[15px] font-bold leading-tight">Job readiness</div>
          <div className="text-[12px] text-faint">How interview-ready you are, from your real activity</div>
        </div>
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        {/* Ring gauge */}
        <div className={`relative shrink-0 ${color}`} style={{ width: 128, height: 128 }}>
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={R} fill="none" stroke="var(--cz-line)" strokeWidth="10" />
            <motion.circle
              cx="64" cy="64" r={R} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={CIRC} transform="rotate(-90 64 64)"
              initial={{ strokeDashoffset: CIRC }} animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[30px] font-extrabold tabular-nums text-text leading-none">{data.score}</span>
            <span className="text-[11px] font-semibold mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Band + signal bars */}
        <div className="flex-1 min-w-[180px]">
          <div className={`text-[15px] font-extrabold ${color}`}>{data.band}</div>
          <div className="text-[12px] text-faint mb-2.5">{data.solved} solved · {data.byDifficulty?.medium || 0}M / {data.byDifficulty?.hard || 0}H</div>
          <div className="flex flex-col gap-1.5">
            {SIGNALS.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span className="text-[11px] text-muted w-16 shrink-0">{s.label}</span>
                <span className="flex-1 h-1.5 rounded-full bg-elevated overflow-hidden">
                  <motion.span
                    className="block h-full rounded-full bg-accent"
                    initial={{ width: 0 }} animate={{ width: `${data.signals?.[s.key] || 0}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </span>
                <span className="text-[11px] text-faint tabular-nums w-8 text-right">{data.signals?.[s.key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top levers */}
      {data.levers?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-line flex flex-col gap-2">
          <div className="text-[11px] font-bold uppercase tracking-wide text-faint">Raise your score</div>
          {data.levers.map((l) => (
            <div key={l.key} className="flex items-start gap-2">
              <ArrowUpRight size={15} className="text-accent shrink-0 mt-0.5" />
              <div>
                <span className="text-[13px] font-semibold">{l.label}</span>
                <span className="text-[12.5px] text-muted"> — {l.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
