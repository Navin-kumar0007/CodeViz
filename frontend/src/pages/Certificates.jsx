import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, ExternalLink, ArrowLeft } from 'lucide-react';
import { API } from '../utils/api';
import { Button, EmptyState, Spinner } from '../components/ui';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

export default function Certificates() {
  const navigate = useNavigate();
  const [certs, setCerts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    API.get('/api/certificates/my')
      .then((r) => { if (!cancelled) setCerts(Array.isArray(r.data) ? r.data : []); })
      .catch(() => { if (!cancelled) setCerts([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-4xl mx-auto px-6 py-8 pb-16">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft size={15} /> Dashboard</Button>
        <div className="flex items-center gap-2.5 mt-4 mb-6">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Award size={20} /></span>
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight m-0">Your certificates</h1>
            <p className="text-muted text-[13px] m-0">Verifiable credentials earned by completing courses.</p>
          </div>
        </div>

        {!certs ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : certs.length === 0 ? (
          <EmptyState icon="🎓" title="No certificates yet" hint="Complete every lesson in a course to earn a verifiable certificate." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certs.map((c) => (
              <motion.div
                key={c.credentialId}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl border border-accent/30 p-6 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--cz-accent) 10%, var(--cz-surface)), var(--cz-surface))' }}
              >
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--cz-accent) 18%, transparent), transparent 70%)' }} />
                <div className="relative">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-accent"><ShieldCheck size={13} /> Certificate of {c.type || 'mastery'}</div>
                  <div className="text-[19px] font-extrabold tracking-tight mt-2">{c.courseName}</div>
                  <div className="flex gap-4 text-[12px] text-muted mt-2">
                    {c.score !== null && c.score !== undefined && <span>Score {c.score}%</span>}
                    {c.lessonsCompleted > 0 && <span>{c.lessonsCompleted} lessons</span>}
                    <span>{new Date(c.issueDate || c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[11px] font-mono text-faint mt-3">{c.credentialId}</div>
                  <button
                    onClick={() => navigate(`/verify/${c.credentialId}`)}
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    View & verify <ExternalLink size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
