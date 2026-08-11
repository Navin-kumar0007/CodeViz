import { useState, useEffect } from 'react';
import { Gift, Copy, Check } from 'lucide-react';
import { API } from '../../utils/api';
import { track } from '../../utils/analytics';

// Referral invite — copy your link, earn XP when friends join.
export default function InviteCard() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    API.get('/api/users/referral').then((r) => setData(r.data)).catch(() => setData(null));
  }, []);

  if (!data) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      track('invite_link_copied');
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 shadow-[var(--cz-shadow-sm)]">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Gift size={16} /></span>
        <span className="text-[15px] font-bold">Invite friends</span>
        {data.count > 0 && <span className="ml-auto text-[12px] font-bold text-success bg-success/12 border border-success/25 rounded-full px-2.5 py-0.5">{data.count} joined</span>}
      </div>
      <p className="text-[13px] text-muted leading-relaxed mt-1 mb-3">Share your link — you earn <b className="text-text">+40 XP</b> for each friend who joins, and they get a <b className="text-text">+15 XP</b> head start.</p>
      <div className="flex gap-2">
        <input readOnly value={data.link} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 text-[12.5px] font-mono bg-elevated border border-line rounded-lg px-3 py-2.5 text-muted" />
        <button onClick={copy} className={`shrink-0 inline-flex items-center gap-1.5 text-[13px] font-bold rounded-lg px-4 py-2.5 cursor-pointer border transition-colors ${copied ? 'bg-success/12 text-success border-success/30' : 'bg-accent text-white border-accent'}`}>
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
    </div>
  );
}
