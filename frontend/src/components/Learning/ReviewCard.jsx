import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, ArrowRight } from 'lucide-react';
import { API } from '../../utils/api';

// Dashboard nudge: how many solved problems are due for spaced review. Stays out of
// the way (renders nothing) until the user actually has a queue.
export default function ReviewCard() {
  const navigate = useNavigate();
  const [due, setDue] = useState(0);

  useEffect(() => {
    API.get('/api/review/due').then((r) => setDue(r.data.due || 0)).catch(() => setDue(0));
  }, []);

  if (due <= 0) return null;

  return (
    <button
      onClick={() => navigate('/review')}
      className="w-full text-left flex items-center gap-3.5 bg-accent/8 border border-accent/25 rounded-2xl px-5 py-4 cursor-pointer hover:bg-accent/12 transition-colors"
    >
      <span className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-accent/15 text-accent border border-accent/30"><Repeat size={19} /></span>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-bold">{due} {due === 1 ? 'problem is' : 'problems are'} due for review</div>
        <p className="text-[13px] text-muted m-0 mt-0.5">Spaced repetition keeps what you&apos;ve solved from fading. A few minutes now locks it in.</p>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent">Review <ArrowRight size={15} /></span>
    </button>
  );
}
