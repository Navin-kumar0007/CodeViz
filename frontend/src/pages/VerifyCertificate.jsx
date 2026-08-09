import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldX, Hexagon, Award } from 'lucide-react';
import { API } from '../utils/api';
import { Spinner } from '../components/ui';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

// Public credential verification — anyone with the link can confirm authenticity.
export default function VerifyCertificate() {
  const { credentialId } = useParams();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancelled = false;
    API.get(`/api/certificates/verify/${credentialId}`)
      .then((r) => { if (!cancelled) setState({ loading: false, data: r.data }); })
      .catch(() => { if (!cancelled) setState({ loading: false, notFound: true }); });
    return () => { cancelled = true; };
  }, [credentialId]);

  const d = state.data;
  const valid = d?.valid;

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center px-6 py-12" style={FONT}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-accent border border-accent/40 bg-accent/12"><Hexagon size={16} strokeWidth={2.5} /></span>
          <span className="text-[17px] font-extrabold tracking-tight">CodeViz</span>
        </div>

        {state.loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : state.notFound || !d ? (
          <div className="bg-surface border border-line rounded-2xl p-8 text-center shadow-[var(--cz-shadow-sm)]">
            <ShieldX size={40} className="text-hard mx-auto mb-3" />
            <div className="text-[18px] font-bold">Certificate not found</div>
            <p className="text-muted text-[13px] mt-1">No credential matches <span className="font-mono">{credentialId}</span>.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="rounded-2xl border p-8 text-center relative overflow-hidden shadow-[var(--cz-shadow-md)]"
            style={{ borderColor: valid ? 'color-mix(in srgb, var(--cz-success) 40%, transparent)' : 'var(--cz-line)', background: 'linear-gradient(135deg, color-mix(in srgb, var(--cz-accent) 8%, var(--cz-surface)), var(--cz-surface))' }}
          >
            <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--cz-accent) 16%, transparent), transparent 70%)' }} />
            <div className="relative">
              <div className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1 rounded-full mb-5 ${valid ? 'text-success bg-success/12 border border-success/30' : 'text-hard bg-hard/12 border border-hard/30'}`}>
                {valid ? <><ShieldCheck size={14} /> Verified authentic</> : <><ShieldX size={14} /> Signature mismatch</>}
              </div>
              <Award size={40} className="text-accent mx-auto mb-3" />
              <div className="text-[12px] uppercase tracking-wide text-muted font-bold">Certificate of {d.type || 'mastery'}</div>
              <div className="text-[26px] font-extrabold tracking-tight mt-1">{d.holder}</div>
              <div className="text-[14px] text-muted mt-1">has completed</div>
              <div className="text-[18px] font-bold text-accent mt-1">{d.courseName}</div>
              <div className="flex items-center justify-center gap-5 text-[13px] text-muted mt-5">
                {d.score !== null && d.score !== undefined && <span>Score <b className="text-text">{d.score}%</b></span>}
                {d.lessonsCompleted > 0 && <span><b className="text-text">{d.lessonsCompleted}</b> lessons</span>}
                <span>{new Date(d.issueDate).toLocaleDateString()}</span>
              </div>
              <div className="text-[11px] font-mono text-faint mt-5 pt-4 border-t border-line">Credential ID · {d.credentialId}</div>
            </div>
          </motion.div>
        )}
        <p className="text-center text-faint text-[11px] mt-5">Credentials are cryptographically signed and verified by CodeViz.</p>
      </div>
    </div>
  );
}
