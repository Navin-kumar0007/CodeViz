import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react';
import { API } from '../utils/api';
import { Button, Input, Select, Badge, Spinner } from '../components/ui';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const CATEGORIES = ['Foundations', 'Web Development', 'Languages', 'Data Structures', 'Algorithm Mastery', 'Backend Engineering', 'Databases', 'System Design', 'Software Quality', 'Security', 'Artificial Intelligence', 'Cloud & DevOps'];

export default function AdminContent() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(null);
  const [problems, setProblems] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ topic: '', category: 'Web Development', lessonCount: 3 });

  const loadCourses = () => API.get('/api/courses/admin/all').then((r) => setCourses(r.data)).catch(() => setCourses([]));
  const loadProblems = () => API.get('/api/problems').then((r) => setProblems(Array.isArray(r.data) ? r.data : (r.data.problems || []))).catch(() => setProblems([]));
  useEffect(() => { loadCourses(); loadProblems(); }, []);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 4000); };

  const generateCourse = async () => {
    if (!form.topic.trim()) return;
    setBusy('gen'); setMsg('Generating course (AI, may take a moment)…');
    try {
      const { data } = await API.post('/api/courses/generate', form);
      flash(`✓ Created "${data.title}" (${data.lessons} lessons)`);
      setForm({ ...form, topic: '' });
      loadCourses();
    } catch (e) { flash(`✗ ${e.response?.data?.message || 'Generation failed'}`); }
    setBusy('');
  };

  const togglePublish = async (c) => {
    setBusy(c.slug);
    try { await API.patch(`/api/courses/${c.slug}`, { published: !c.published }); loadCourses(); }
    catch { flash('✗ Failed'); }
    setBusy('');
  };
  const deleteCourse = async (c) => {
    if (!window.confirm(`Delete course "${c.title}"? This cannot be undone.`)) return;
    setBusy(c.slug);
    try { await API.delete(`/api/courses/${c.slug}`); flash(`Deleted ${c.title}`); loadCourses(); }
    catch { flash('✗ Failed'); }
    setBusy('');
  };
  const deleteProblem = async (p) => {
    if (!window.confirm(`Delete problem "${p.title}"?`)) return;
    setBusy(p.slug);
    try { await API.delete(`/api/problems/${p.slug}`); flash(`Deleted ${p.title}`); loadProblems(); }
    catch { flash('✗ Failed'); }
    setBusy('');
  };
  const genEditorial = async (p) => {
    setBusy(p.slug); setMsg(`Generating editorial for ${p.title}…`);
    try { await API.post(`/api/problems/${p.slug}/editorial/generate`); flash(`✓ Editorial ready for ${p.title}`); }
    catch (e) { flash(`✗ ${e.response?.data?.error || 'Failed'}`); }
    setBusy('');
  };

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-5xl mx-auto px-6 py-8 pb-16">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}><ArrowLeft size={15} /> Admin</Button>
        <h1 className="text-[24px] font-extrabold tracking-tight mt-4">🗂️ Content management</h1>
        <p className="text-muted text-[13px] mt-1">Add, publish, and delete courses & problems.</p>
        {msg && <div className="mt-3 text-[13px] text-accent bg-accent/10 border border-accent/25 rounded-lg px-3 py-2">{msg}</div>}

        {/* Add course */}
        <div className="mt-6 bg-surface border border-line rounded-2xl p-5 shadow-[var(--cz-shadow-sm)]">
          <div className="text-[13px] font-bold flex items-center gap-2 mb-3"><Sparkles size={15} className="text-accent" /> Generate a new course (AI)</div>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]"><Input placeholder="Topic, e.g. GraphQL" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></div>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={form.lessonCount} onChange={(e) => setForm({ ...form, lessonCount: Number(e.target.value) })}>
              {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} lessons</option>)}
            </Select>
            <Button onClick={generateCourse} disabled={busy === 'gen' || !form.topic.trim()}>
              {busy === 'gen' ? <><Spinner size={14} /> Generating…</> : <><Plus size={15} /> Generate</>}
            </Button>
          </div>
        </div>

        {/* Courses */}
        <div className="flex items-center gap-2 mt-8 mb-3">
          <h2 className="text-[15px] font-bold">Courses {courses && `(${courses.length})`}</h2>
          <button onClick={loadCourses} className="text-muted hover:text-text bg-transparent border-0 cursor-pointer"><RefreshCw size={14} /></button>
        </div>
        {!courses ? <div className="py-6 flex justify-center"><Spinner /></div> : (
          <div className="flex flex-col gap-1.5">
            {courses.map((c) => (
              <div key={c.slug} className="flex items-center gap-3 bg-surface border border-line rounded-xl px-4 py-2.5">
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-semibold truncate">{c.title}</span>
                  <span className="block text-[11px] text-muted truncate">{c.category} · {c.lessonCount} lessons · {c.slug}</span>
                </span>
                <Badge tone={c.published ? 'success' : 'neutral'}>{c.published ? 'Published' : 'Draft'}</Badge>
                <button onClick={() => togglePublish(c)} disabled={busy === c.slug} title={c.published ? 'Unpublish' : 'Publish'} className="text-muted hover:text-accent bg-transparent border-0 cursor-pointer">
                  {c.published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => deleteCourse(c)} disabled={busy === c.slug} title="Delete" className="text-muted hover:text-hard bg-transparent border-0 cursor-pointer"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}

        {/* Problems */}
        <h2 className="text-[15px] font-bold mt-8 mb-3">Problems {problems && `(${problems.length})`}</h2>
        {!problems ? <div className="py-6 flex justify-center"><Spinner /></div> : (
          <div className="flex flex-col gap-1.5">
            {problems.slice(0, 60).map((p) => (
              <div key={p.slug} className="flex items-center gap-3 bg-surface border border-line rounded-xl px-4 py-2.5">
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-semibold truncate">{p.title}</span>
                  <span className="block text-[11px] text-muted truncate">{p.difficulty} · {p.category} · {p.editorial ? 'has editorial' : 'no editorial'}</span>
                </span>
                <button onClick={() => genEditorial(p)} disabled={busy === p.slug} title="Generate editorial" className="text-[11px] font-semibold text-accent hover:underline bg-transparent border-0 cursor-pointer">✍️ Editorial</button>
                <button onClick={() => deleteProblem(p)} disabled={busy === p.slug} title="Delete" className="text-muted hover:text-hard bg-transparent border-0 cursor-pointer"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
