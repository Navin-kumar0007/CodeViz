import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, ArrowRight, Radio, Plus } from 'lucide-react';
import { API } from '../utils/api';
import { Badge, Spinner, EmptyState, Input, Button } from '../components/ui';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };

export default function MyClassrooms() {
  const navigate = useNavigate();
  const [data, setData] = useState(null); // { teaching, enrolled }
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [err, setErr] = useState('');

  const load = () => API.get('/api/classrooms/my').then((r) => setData(r.data)).catch(() => setData({ teaching: [], enrolled: [] }));
  useEffect(() => { load(); }, []);

  const join = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setJoining(true); setErr('');
    try { await API.post('/api/classrooms/join', { code: code.trim().toUpperCase() }); setCode(''); load(); }
    catch (e2) { setErr(e2?.response?.data?.message || 'Could not join — check the code.'); }
    finally { setJoining(false); }
  };

  const ClassCard = (c, role) => (
    <button
      key={c._id}
      onClick={() => navigate(`/campus/${c._id}`)}
      className="w-full text-left flex items-center gap-3.5 bg-surface border border-line rounded-2xl px-5 py-4 cursor-pointer hover:border-accent hover:-translate-y-0.5 transition-all shadow-[var(--cz-shadow-sm)]"
    >
      <span className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><School size={20} /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-bold truncate">{c.name}</span>
          {c.isLive && <Badge tone="danger"><Radio size={11} className="inline mr-1" />Live</Badge>}
          {role === 'teaching' && <Badge tone="accent">You teach</Badge>}
        </div>
        <div className="text-[12.5px] text-muted mt-0.5 truncate">
          {role !== 'teaching' && c.instructor?.name ? `${c.instructor.name} · ` : ''}{c.students?.length || 0} members{role === 'teaching' ? ` · code ${c.code}` : ''}
        </div>
      </div>
      <ArrowRight size={17} className="text-faint shrink-0" />
    </button>
  );

  const teaching = data?.teaching || [];
  const enrolled = data?.enrolled || [];

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><School size={20} /></span>
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight m-0">My Classes</h1>
            <p className="text-muted text-[13px] m-0">Your enrolled classes and the ones you teach — assignments, announcements, grades, and live sessions.</p>
          </div>
        </div>

        {/* Join by code */}
        <form onSubmit={join} className="flex gap-2 mb-7">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter class code (e.g. ABC123)" className="flex-1 uppercase" maxLength={6} />
          <Button type="submit" disabled={joining}>{joining ? <Spinner size={14} /> : <><Plus size={15} /> Join</>}</Button>
        </form>
        {err && <div className="text-[12.5px] text-danger bg-danger/10 border border-danger/25 rounded-lg px-3 py-2 -mt-4 mb-6">{err}</div>}

        {!data ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <>
            {teaching.length > 0 && (
              <>
                <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-faint mb-3">Teaching</h2>
                <div className="flex flex-col gap-3 mb-8">{teaching.map((c) => ClassCard(c, 'teaching'))}</div>
              </>
            )}
            <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-faint mb-3">Enrolled</h2>
            {enrolled.length === 0 ? (
              <EmptyState icon="🎓" title="No classes yet" hint="Ask your instructor for a class code and join above." />
            ) : (
              <div className="flex flex-col gap-3">{enrolled.map((c) => ClassCard(c, 'enrolled'))}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
