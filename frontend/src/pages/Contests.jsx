import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, ArrowRight } from 'lucide-react';
import { API } from '../utils/api';
import { Badge, Spinner, EmptyState } from '../components/ui';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const TONE = { live: 'success', upcoming: 'accent', ended: 'neutral' };

function when(c) {
  const start = new Date(c.startAt), end = new Date(c.endAt);
  if (c.status === 'upcoming') return `Starts ${start.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  if (c.status === 'live') return `Ends ${end.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  return `Ended ${end.toLocaleDateString()}`;
}

export default function Contests() {
  const navigate = useNavigate();
  const [contests, setContests] = useState(null);

  useEffect(() => {
    API.get('/api/contests').then((r) => setContests(r.data)).catch(() => setContests([]));
  }, []);

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Trophy size={20} /></span>
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight m-0">Contests</h1>
            <p className="text-muted text-[13px] m-0">Timed, rated challenges. Solve fast, climb the board.</p>
          </div>
        </div>

        {!contests ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : contests.length === 0 ? (
          <EmptyState icon="🏆" title="No contests yet" hint="Weekly contests are coming soon — check back." />
        ) : (
          <div className="flex flex-col gap-3">
            {contests.map((c) => (
              <motion.button
                key={c.slug}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/contests/${c.slug}`)}
                className="group text-left bg-surface border border-line rounded-2xl p-5 cursor-pointer hover:border-accent transition-colors shadow-[var(--cz-shadow-sm)]"
              >
                <div className="flex items-center gap-2.5">
                  <Badge tone={TONE[c.status]}>{c.status === 'live' ? '🔴 Live' : c.status}</Badge>
                  <span className="text-[17px] font-extrabold tracking-tight">{c.title}</span>
                  <ArrowRight size={16} className="ml-auto text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[13.5px] text-muted mt-2 leading-relaxed">{c.description}</p>
                <div className="flex gap-4 text-[12px] text-faint mt-3"><span className="flex items-center gap-1"><Clock size={13} /> {when(c)}</span></div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
