import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Heart, CheckCircle2, Circle, PlayCircle, Clock } from 'lucide-react';
import { API as axios } from '../utils/api';
import API_BASE from '../utils/api';
import { Button, Input, Textarea, Select, Badge, EmptyState, Spinner } from '../components/ui';

const FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const CATEGORIES = [
  { id: 'all', label: 'All' }, { id: 'arrays', label: 'Arrays' }, { id: 'strings', label: 'Strings' },
  { id: 'linked_lists', label: 'Lists' }, { id: 'trees', label: 'Trees' }, { id: 'graphs', label: 'Graphs' },
  { id: 'dynamic_programming', label: 'DP' }, { id: 'sorting', label: 'Sorting' }, { id: 'recursion', label: 'Recursion' },
  { id: 'intro', label: 'Intro' }, { id: 'other', label: 'Other' },
];

export default function VideoLessons() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const authHeaders = { headers: { Authorization: `Bearer ${user?.token}` } };
  const API = `${API_BASE}/api/videos`;

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '', topic: '', category: 'other', duration: 0 });
  const isInstructor = ['instructor', 'admin'].includes(user?.role);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadVideos(); }, [filterCat]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const params = filterCat !== 'all' ? `?category=${filterCat}` : '';
      const res = await axios.get(`${API}${params}`, authHeaders);
      setVideos(res.data);
    } catch (_err) { console.error('Failed to load videos:', _err); }
    setLoading(false);
  };

  const openVideo = async (id) => {
    try { const res = await axios.get(`${API}/${id}`, authHeaders); setSelectedVideo(res.data); } catch { alert('Failed to load video'); }
  };
  const handleComplete = async (id) => {
    try { await axios.put(`${API}/${id}/complete`, {}, authHeaders); setSelectedVideo((p) => p ? { ...p, completedBy: [...(p.completedBy || []), user._id] } : null); loadVideos(); } catch (err) { console.error(err); }
  };
  const handleLike = async (id) => {
    try { await axios.put(`${API}/${id}/like`, {}, authHeaders); openVideo(id); } catch (err) { console.error(err); }
  };
  const handleAddVideo = async () => {
    if (!form.title || !form.videoUrl || !form.topic) return;
    try {
      await axios.post(API, form, authHeaders);
      setShowForm(false);
      setForm({ title: '', description: '', videoUrl: '', topic: '', category: 'other', duration: 0 });
      loadVideos();
    } catch (err) { alert(err.response?.data?.message || 'Failed to add video'); }
  };
  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]+)/);
    return match ? match[1] : null;
  };
  const formatDuration = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  const grouped = videos.reduce((acc, v) => { const k = v.topic || 'Other'; (acc[k] ||= []).push(v); return acc; }, {});

  return (
    <div className="min-h-full bg-bg text-text" style={FONT}>
      <div className="max-w-6xl mx-auto px-6 py-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}><ArrowLeft size={15} /> Dashboard</Button>
            <h1 className="text-[24px] font-extrabold tracking-tight m-0">Video Lessons</h1>
          </div>
          {isInstructor && (
            <Button variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm(!showForm)}>
              {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add video</>}
            </Button>
          )}
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-surface border border-line rounded-xl p-4 mb-5 flex flex-col gap-3 shadow-[var(--cz-shadow-sm)]">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video title" />
            <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-2">
              <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="YouTube URL" />
              <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Topic slug" />
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
            </div>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} />
            <Button className="self-start" onClick={handleAddVideo}>Add video</Button>
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setFilterCat(c.id)}
              className={`px-3 h-8 rounded-lg text-[12px] font-semibold border transition-colors cursor-pointer ${filterCat === c.id ? 'bg-accent text-accent-fg border-accent' : 'bg-surface text-muted border-line hover:text-text hover:border-accent'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Player */}
        {selectedVideo && (
          <div className="bg-surface border border-line rounded-xl overflow-hidden mb-6 shadow-[var(--cz-shadow-md)]">
            <div className="flex items-center gap-3 px-4 h-12 border-b border-line">
              <Button variant="ghost" size="sm" onClick={() => setSelectedVideo(null)}><X size={15} /> Close</Button>
              <span className="text-[15px] font-bold text-text flex-1 truncate text-center">{selectedVideo.title}</span>
              <Button variant="secondary" size="sm" onClick={() => handleLike(selectedVideo._id)}><Heart size={14} /> {selectedVideo.likes?.length || 0}</Button>
              <Button variant={selectedVideo.completedBy?.includes(user?._id) ? 'primary' : 'secondary'} size="sm" onClick={() => handleComplete(selectedVideo._id)}>
                {selectedVideo.completedBy?.includes(user?._id) ? <><CheckCircle2 size={14} /> Completed</> : <><Circle size={14} /> Mark done</>}
              </Button>
            </div>
            <div className="aspect-video bg-black">
              {getYouTubeId(selectedVideo.videoUrl)
                ? <iframe src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.videoUrl)}`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={selectedVideo.title} />
                : <video src={selectedVideo.videoUrl} controls className="w-full h-full" />}
            </div>
            {selectedVideo.description && <p className="text-[13px] text-muted leading-relaxed px-4 py-3 m-0">{selectedVideo.description}</p>}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted text-sm"><Spinner /> Loading videos…</div>
        ) : videos.length === 0 ? (
          <EmptyState icon="🎬" title="No videos yet" hint={isInstructor ? 'Add some using the “Add video” button above.' : 'Check back later!'} />
        ) : (
          Object.entries(grouped).map(([topic, vids]) => (
            <div key={topic} className="mb-8">
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-faint mb-3 capitalize">{topic.replace(/_/g, ' ')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vids.map((v) => (
                  <button key={v._id} onClick={() => openVideo(v._id)}
                    className={`group text-left bg-surface border rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:border-accent ${selectedVideo?._id === v._id ? 'border-accent' : 'border-line'}`}>
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-accent/12 text-accent border border-accent/25"><PlayCircle size={20} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-bold text-text truncate">{v.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-[12px] text-muted">
                          {v.duration ? <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(v.duration)}</span> : null}
                          <span className="flex items-center gap-1"><Heart size={12} /> {v.likes?.length || 0}</span>
                          {v.completedBy?.includes(user?._id) && <Badge tone="success"><CheckCircle2 size={11} /> Done</Badge>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
