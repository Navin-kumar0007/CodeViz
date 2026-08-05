import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Wand2, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, Badge, Button, Select, Textarea, Spinner, DifficultyBadge } from '../components/ui';
import { Gate } from '../components/billing/Gate';
import { API } from '../utils/api';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const LANGS = ['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'go'];

function ScoreBar({ label, score }) {
  const tone = score >= 75 ? 'var(--cz-success)' : score >= 50 ? 'var(--cz-warning)' : 'var(--cz-hard)';
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] mb-1"><span className="text-muted capitalize">{label.replace(/([A-Z])/g, ' $1')}</span><span className="font-mono tabular-nums" style={{ color: tone }}>{score}</span></div>
      <div className="h-2 rounded-full bg-elevated border border-line overflow-hidden"><div className="h-full rounded-full" style={{ width: `${score}%`, background: tone }} /></div>
    </div>
  );
}

function NextCard() {
  const navigate = useNavigate();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); API.get('/api/ai/mentor/next').then((r) => setRec(r.data)).catch(() => setRec(null)).finally(() => setLoading(false)); };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles size={15} className="text-accent" /> What to solve next</CardTitle>
        <Button variant="ghost" size="sm" onClick={load}><RefreshCw size={14} /></Button>
      </CardHeader>
      <CardBody>
        {loading ? <div className="flex items-center gap-2 text-muted text-sm"><Spinner size={15} /> Thinking…</div>
          : !rec ? <p className="text-muted text-sm m-0">Could not load a recommendation.</p>
            : (
              <div className="flex flex-col gap-3">
                <p className="text-[14px] text-text m-0">{rec.reason}</p>
                {rec.problem ? (
                  <div className="flex items-center justify-between gap-3 bg-elevated border border-line rounded-lg px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold text-text truncate">{rec.problem.title}</div>
                      <div className="mt-1"><DifficultyBadge level={rec.problem.difficulty} /></div>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/problems/${rec.problem.slug}`)}>Solve <ArrowRight size={14} /></Button>
                  </div>
                ) : null}
              </div>
            )}
      </CardBody>
    </Card>
  );
}

function GenerateCard() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState([]);
  const [err, setErr] = useState('');
  const gen = async () => {
    setBusy(true); setErr(''); setMade([]);
    try { const { data } = await API.post('/api/ai/generate-problem', { difficulty, count: 1 }); setMade(data.problems || []); }
    catch (e) { setErr(e.response?.data?.message || 'Could not generate.'); }
    setBusy(false);
  };
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Wand2 size={15} className="text-accent" /> Generate a problem</CardTitle></CardHeader>
      <CardBody className="flex flex-col gap-3">
        <p className="text-[13px] text-muted m-0">A fresh AI problem at your chosen level, added to the bank.</p>
        <div className="flex gap-2 items-center">
          <div className="w-40"><Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></Select></div>
          <Button onClick={gen} disabled={busy}>{busy ? <><Spinner size={14} /> Generating…</> : 'Generate'}</Button>
        </div>
        {err && <div className="text-[13px] text-danger">{err}</div>}
        {made.map((p) => (
          <button key={p._id} onClick={() => navigate(`/problems/${p.slug}`)} className="text-left bg-elevated border border-line rounded-lg px-4 py-3 cursor-pointer hover:border-accent transition-colors">
            <div className="flex items-center justify-between gap-2"><span className="text-[14px] font-semibold text-text truncate">{p.title}</span><DifficultyBadge level={p.difficulty} /></div>
          </button>
        ))}
      </CardBody>
    </Card>
  );
}

function ReviewCard() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState(null);
  const [err, setErr] = useState('');
  const run = async () => {
    if (!code.trim()) return;
    setBusy(true); setErr(''); setReview(null);
    try { const { data } = await API.post('/api/ai/mentor/review', { code, language }); setReview(data); }
    catch (e) { setErr(e.response?.data?.message || 'Could not review.'); }
    setBusy(false);
  };
  return (
    <Card className="lg:col-span-2">
      <CardHeader><CardTitle className="flex items-center gap-2"><Bot size={15} className="text-accent" /> Review my code</CardTitle></CardHeader>
      <CardBody className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="w-40"><Select value={language} onChange={(e) => setLanguage(e.target.value)}>{LANGS.map((l) => <option key={l} value={l}>{l}</option>)}</Select></div>
          <Textarea rows={10} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste code for an AI review…" className="font-mono" />
          <Button className="self-start" onClick={run} disabled={busy}>{busy ? <><Spinner size={14} /> Reviewing…</> : 'Review'}</Button>
          {err && <div className="text-[13px] text-danger">{err}</div>}
        </div>
        <div>
          {!review ? <div className="h-full flex items-center justify-center text-muted text-[13px]">Review appears here.</div> : (
            <div className="flex flex-col gap-3">
              {typeof review.overallScore === 'number' && (
                <div className="flex items-center gap-2"><Badge tone={review.overallScore >= 70 ? 'success' : 'warning'}>Score {review.overallScore}</Badge></div>
              )}
              {review.categories && Object.entries(review.categories).map(([k, v]) => <ScoreBar key={k} label={k} score={v.score} />)}
              {review.summary && <p className="text-[13px] text-muted m-0 mt-1">{review.summary}</p>}
              {review.review && <p className="text-[13px] text-text m-0 whitespace-pre-wrap">{review.review}</p>}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default function Mentor() {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Bot size={20} /></span>
          <h1 className="text-[24px] font-extrabold tracking-tight m-0">AI Mentor</h1>
          <Badge tone="accent">Pro</Badge>
        </div>
        <p className="text-muted text-[14px] mt-1 mb-6">Personalized next steps, fresh problems, and deep reviews of your code.</p>

        <Gate feature="ai-mentor" fallback={
          <div className="flex flex-col items-center text-center gap-3 py-16 bg-surface border border-line rounded-xl">
            <span className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/12 text-accent border border-accent/25"><Bot size={24} /></span>
            <div className="text-[16px] font-bold">AI Mentor is a Pro feature</div>
            <div className="text-[13px] text-muted max-w-sm">Get personalized recommendations, AI-generated problems, and rubric code reviews.</div>
            <Button onClick={() => navigate('/pricing')}>See plans <ArrowRight size={15} /></Button>
          </div>
        }>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <NextCard />
            <GenerateCard />
            <ReviewCard />
          </div>
        </Gate>
      </div>
    </div>
  );
}
