import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Heart, MessageSquare, CheckCircle2, Pin, Send } from 'lucide-react';
import { API as axios } from '../utils/api';
import API_BASE from '../utils/api';
import { Button, Input, Textarea, Select, Badge, EmptyState, Spinner } from '../components/ui';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const CATS = ['all', 'general', 'help', 'showcase', 'bug', 'discussion'];
const CAT_TONE = { general: 'accent', help: 'warning', showcase: 'success', bug: 'danger', discussion: 'info' };

export default function Forum() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const authHeaders = { headers: { Authorization: `Bearer ${user?.token}` } };
  const API = `${API_BASE}/api/discussions`;

  const [view, setView] = useState('list');
  const [threads, setThreads] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeThread, setActiveThread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newTags, setNewTags] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const loadThreads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category, sort: sortBy, page: currentPage, limit: 15 });
      if (searchTerm) params.set('search', searchTerm);
      const res = await axios.get(`${API}/all?${params}`, authHeaders);
      setThreads(res.data.threads || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) { console.error('Failed to load threads:', err); }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadThreads(); }, [category, sortBy, currentPage]);

  const handleSearch = (e) => { e.preventDefault(); setCurrentPage(1); loadThreads(); };
  const openThread = async (id) => {
    setLoading(true);
    try { const res = await axios.get(`${API}/thread/${id}`, authHeaders); setActiveThread(res.data); setView('thread'); } catch { alert('Failed to load thread'); }
    setLoading(false);
  };
  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setLoading(true);
    try {
      const tags = newTags.split(',').map((t) => t.trim()).filter(Boolean);
      await axios.post(API, { title: newTitle, content: newContent, category: newCategory, tags, lessonId: 'general' }, authHeaders);
      setNewTitle(''); setNewContent(''); setNewTags(''); setView('list'); loadThreads();
    } catch (err) { alert(err.response?.data?.message || 'Failed to create thread'); }
    setLoading(false);
  };
  const handleReply = async () => {
    if (!replyContent.trim() || !activeThread) return;
    setLoading(true);
    try { const res = await axios.post(`${API}/${activeThread._id}/reply`, { content: replyContent }, authHeaders); setActiveThread(res.data); setReplyContent(''); } catch { alert('Failed to post reply'); }
    setLoading(false);
  };
  const handleLikeThread = async (id) => {
    try { await axios.put(`${API}/${id}/like`, {}, authHeaders); if (activeThread?._id === id) openThread(id); else loadThreads(); } catch (err) { console.error('Like failed:', err); }
  };
  const handleLikeReply = async (replyIdx) => {
    if (!activeThread) return;
    try { await axios.put(`${API}/${activeThread._id}/reply/${replyIdx}/like`, {}, authHeaders); openThread(activeThread._id); } catch (err) { console.error('Reply like failed:', err); }
  };
  const handleResolve = async () => { if (!activeThread) return; try { await axios.put(`${API}/${activeThread._id}/resolve`, {}, authHeaders); openThread(activeThread._id); } catch (err) { console.error('Resolve failed:', err); } };
  const handlePin = async () => { if (!activeThread) return; try { await axios.put(`${API}/${activeThread._id}/pin`, {}, authHeaders); openThread(activeThread._id); } catch (err) { console.error('Pin failed:', err); } };

  const timeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
  };

  // ── List view ──
  const renderList = () => (
    <div className="max-w-4xl mx-auto px-6 py-8 pb-16">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft size={15} /> Dashboard</Button>
          <h1 className="text-[24px] font-extrabold tracking-tight m-0">Discussion Forum</h1>
        </div>
        <Button onClick={() => setView('new')}><Plus size={15} /> New thread</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {CATS.map((c) => (
            <button key={c} onClick={() => { setCategory(c); setCurrentPage(1); }}
              className={`px-3 h-8 rounded-lg text-[12px] font-semibold capitalize border transition-colors cursor-pointer ${category === c ? 'bg-accent text-accent-fg border-accent' : 'bg-surface text-muted border-line hover:text-text'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="w-36"><Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="sm"><option value="latest">Latest</option><option value="popular">Popular</option><option value="unanswered">Unanswered</option></Select></div>
        <form onSubmit={handleSearch} className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <Input className="pl-9 w-56" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search threads…" />
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted text-sm"><Spinner /> Loading…</div>
      ) : threads.length === 0 ? (
        <EmptyState icon="💬" title="No threads yet" hint="Start the conversation." action={<Button size="sm" onClick={() => setView('new')}>New thread</Button>} />
      ) : (
        <div className="flex flex-col gap-2">
          {threads.map((t) => (
            <button key={t._id} onClick={() => openThread(t._id)} className="text-left bg-surface border border-line rounded-xl p-4 cursor-pointer transition-all hover:border-accent hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-1.5">
                {t.isPinned && <Pin size={13} className="text-accent" />}
                <Badge tone={CAT_TONE[t.category] || 'neutral'}>{t.category}</Badge>
                {t.isResolved && <Badge tone="success"><CheckCircle2 size={11} /> Resolved</Badge>}
              </div>
              <div className="text-[15px] font-bold text-text">{t.title}</div>
              <div className="flex items-center gap-3 mt-2 text-[12px] text-muted">
                <span>{t.author?.name || 'Anonymous'}</span>
                <span>·</span><span>{timeAgo(t.createdAt)}</span>
                <span className="flex items-center gap-1"><Heart size={12} /> {t.likes?.length || 0}</span>
                <span className="flex items-center gap-1"><MessageSquare size={12} /> {t.replies?.length || 0}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>Prev</Button>
          <span className="text-[13px] text-muted font-mono">{currentPage} / {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );

  // ── Thread view ──
  const renderThread = () => (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => { setView('list'); setActiveThread(null); }}><ArrowLeft size={15} /> Back</Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleResolve}><CheckCircle2 size={14} /> {activeThread?.isResolved ? 'Unresolve' : 'Resolve'}</Button>
          <Button variant="secondary" size="sm" onClick={handlePin}><Pin size={14} /> {activeThread?.isPinned ? 'Unpin' : 'Pin'}</Button>
        </div>
      </div>

      {activeThread && (
        <>
          <div className="bg-surface border border-line rounded-xl p-5 mb-4 shadow-[var(--cz-shadow-sm)]">
            <div className="flex items-center gap-2 mb-2">
              <Badge tone={CAT_TONE[activeThread.category] || 'neutral'}>{activeThread.category}</Badge>
              {activeThread.isResolved && <Badge tone="success"><CheckCircle2 size={11} /> Resolved</Badge>}
            </div>
            <h1 className="text-[22px] font-extrabold tracking-tight m-0">{activeThread.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-[12px] text-muted">
              <span>{activeThread.author?.name || 'Anonymous'}</span><span>·</span><span>{timeAgo(activeThread.createdAt)}</span>
            </div>
            <p className="text-[14px] text-text leading-relaxed whitespace-pre-wrap mt-4 m-0">{activeThread.content}</p>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={() => handleLikeThread(activeThread._id)}><Heart size={14} /> {activeThread.likes?.length || 0}</Button>
            </div>
          </div>

          <div className="text-[13px] font-bold uppercase tracking-wide text-faint mb-3">{activeThread.replies?.length || 0} replies</div>
          <div className="flex flex-col gap-2 mb-5">
            {activeThread.replies?.map((r, i) => (
              <div key={i} className="bg-surface border border-line rounded-xl p-4">
                <div className="flex items-center gap-2 text-[12px] text-muted mb-1.5">
                  <span className="font-semibold text-text">{r.author?.name || 'Anonymous'}</span><span>·</span><span>{timeAgo(r.createdAt)}</span>
                </div>
                <p className="text-[14px] text-text leading-relaxed whitespace-pre-wrap m-0">{r.content}</p>
                <button onClick={() => handleLikeReply(i)} className="flex items-center gap-1 mt-2 text-[12px] text-muted hover:text-accent transition-colors bg-transparent border-0 cursor-pointer"><Heart size={13} /> {r.likes?.length || 0}</button>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 flex flex-col gap-3">
            <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write a reply…" rows={3} />
            <Button className="self-end" onClick={handleReply} disabled={loading}><Send size={14} /> Reply</Button>
          </div>
        </>
      )}
    </div>
  );

  // ── New thread view ──
  const renderNew = () => (
    <div className="max-w-2xl mx-auto px-6 py-8 pb-16">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={() => setView('list')}><ArrowLeft size={15} /> Back</Button>
        <h1 className="text-[24px] font-extrabold tracking-tight m-0">New thread</h1>
      </div>
      <div className="bg-surface border border-line rounded-xl p-5 flex flex-col gap-4">
        <div><label className="text-[12px] font-semibold text-muted block mb-1.5">Title</label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What's your question or topic?" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[12px] font-semibold text-muted block mb-1.5">Category</label>
            <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              {CATS.filter((c) => c !== 'all').map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </Select>
          </div>
          <div><label className="text-[12px] font-semibold text-muted block mb-1.5">Tags (comma-sep)</label><Input value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="arrays, sorting" /></div>
        </div>
        <div><label className="text-[12px] font-semibold text-muted block mb-1.5">Content</label><Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Describe it in detail…" rows={7} /></div>
        <Button className="self-end" onClick={handleCreate} disabled={loading}>Post thread</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      {view === 'list' ? renderList() : view === 'thread' ? renderThread() : renderNew()}
    </div>
  );
}
