import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../utils/api';

/**
 * 🎬 Video Lessons — Embedded video lessons organized by DSA topics
 */
const VideoLessons = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const authHeaders = { headers: { Authorization: `Bearer ${user?.token}` } };
    const API = `${API_BASE}/api/videos`;

    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterCat, setFilterCat] = useState('all');

    // Add video form (instructor only)
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
        } catch (_err) {
            console.error('Failed to load videos:', _err);
        }
        setLoading(false);
    };

    const openVideo = async (id) => {
        try {
            const res = await axios.get(`${API}/${id}`, authHeaders);
            setSelectedVideo(res.data);
        } catch (err) {
            alert('Failed to load video');
        }
    };

    const handleComplete = async (id) => {
        try {
            await axios.put(`${API}/${id}/complete`, {}, authHeaders);
            setSelectedVideo(prev => prev ? { ...prev, completedBy: [...(prev.completedBy || []), user._id] } : null);
            loadVideos();
        } catch (err) {
            console.error(err);
        }
    };

    const handleLike = async (id) => {
        try {
            await axios.put(`${API}/${id}/like`, {}, authHeaders);
            openVideo(id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddVideo = async () => {
        if (!form.title || !form.videoUrl || !form.topic) return;
        try {
            await axios.post(API, form, authHeaders);
            setShowForm(false);
            setForm({ title: '', description: '', videoUrl: '', topic: '', category: 'other', duration: 0 });
            loadVideos();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add video');
        }
    };

    const getYouTubeId = (url) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]+)/);
        return match ? match[1] : null;
    };

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const categories = [
        { id: 'all', label: '📋 All' },
        { id: 'arrays', label: '📦 Arrays' },
        { id: 'strings', label: '🔤 Strings' },
        { id: 'linked_lists', label: '🔗 Lists' },
        { id: 'trees', label: '🌳 Trees' },
        { id: 'graphs', label: '🕸️ Graphs' },
        { id: 'dynamic_programming', label: '🧮 DP' },
        { id: 'sorting', label: '📊 Sort' },
        { id: 'recursion', label: '🔄 Recurse' },
        { id: 'intro', label: '📖 Intro' },
        { id: 'other', label: '📁 Other' }
    ];

    // Group videos by topic
    const grouped = videos.reduce((acc, v) => {
        const key = v.topic || 'Other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(v);
        return acc;
    }, {});

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #1a1a2e)', fontFamily: 'Inter, sans-serif' }}>
            <div style={S.container}>
                {/* Header */}
                <div style={S.header}>
                    <button onClick={() => navigate('/')} style={S.backBtn}>← Dashboard</button>
                    <h1 style={S.pageTitle}>🎬 Video Lessons</h1>
                    {isInstructor && (
                        <button onClick={() => setShowForm(!showForm)} style={S.addBtn}>
                            {showForm ? '✕ Cancel' : '+ Add Video'}
                        </button>
                    )}
                    {!isInstructor && <div />}
                </div>

                {/* Add Video Form */}
                {showForm && (
                    <div style={S.formCard}>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Video title..." style={S.input} />
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                            <input value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} placeholder="YouTube URL..." style={S.input} />
                            <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Topic slug..." style={S.input} />
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={S.select}>
                                {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </div>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description..." style={S.textarea} rows={3} />
                        <button onClick={handleAddVideo} style={S.submitBtn}>🚀 Add Video</button>
                    </div>
                )}

                {/* Category Filters */}
                <div style={S.catTabs}>
                    {categories.map(c => (
                        <button key={c.id} onClick={() => setFilterCat(c.id)}
                            style={{ ...S.catTab, background: filterCat === c.id ? 'rgba(102,126,234,0.15)' : 'transparent', color: filterCat === c.id ? '#667eea' : '#888', borderColor: filterCat === c.id ? '#667eea' : 'transparent' }}>
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* Video Player */}
                {selectedVideo && (
                    <div style={S.playerCard}>
                        <div style={S.playerHeader}>
                            <button onClick={() => setSelectedVideo(null)} style={S.backBtn}>✕ Close</button>
                            <h2 style={{ margin: 0, fontSize: '18px', color: '#e4e4e7', flex: 1, textAlign: 'center' }}>{selectedVideo.title}</h2>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleLike(selectedVideo._id)} style={S.likeBtn}>
                                    ❤️ {selectedVideo.likes?.length || 0}
                                </button>
                                <button onClick={() => handleComplete(selectedVideo._id)} style={{
                                    ...S.completeBtn,
                                    background: selectedVideo.completedBy?.includes(user?._id) ? 'rgba(72,187,120,0.2)' : 'rgba(255,255,255,0.05)'
                                }}>
                                    {selectedVideo.completedBy?.includes(user?._id) ? '✅ Completed' : '☐ Mark Done'}
                                </button>
                            </div>
                        </div>
                        {getYouTubeId(selectedVideo.videoUrl) ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.videoUrl)}`}
                                style={S.iframe}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen title={selectedVideo.title}
                            />
                        ) : (
                            <video src={selectedVideo.videoUrl} controls style={S.iframe} />
                        )}
                        {selectedVideo.description && (
                            <p style={{ color: '#94a3b8', fontSize: '13px', padding: '12px 16px', margin: 0, lineHeight: '1.6' }}>{selectedVideo.description}</p>
                        )}
                    </div>
                )}

                {/* Video Grid */}
                {loading ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading videos...</p>
                ) : videos.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                        No videos yet. {isInstructor ? 'Add some using the + button above!' : 'Check back later!'}
                    </p>
                ) : (
                    Object.entries(grouped).map(([topic, vids]) => (
                        <div key={topic} style={S.topicGroup}>
                            <h3 style={S.topicTitle}>{topic.replace(/_/g, ' ')}</h3>
                            <div style={S.videoGrid}>
                                {vids.map(v => (
                                    <div key={v._id} onClick={() => openVideo(v._id)} style={{
                                        ...S.videoCard,
                                        borderColor: selectedVideo?._id === v._id ? '#667eea' : 'rgba(255,255,255,0.06)'
                                    }}>
                                        <div style={S.thumbnail}>
                                            {getYouTubeId(v.videoUrl) ? (
                                                <img src={`https://img.youtube.com/vi/${getYouTubeId(v.videoUrl)}/mqdefault.jpg`}
                                                    alt={v.title} style={S.thumbImg} />
                                            ) : (
                                                <div style={S.thumbPlaceholder}>🎬</div>
                                            )}
                                            {v.duration > 0 && <span style={S.durationBadge}>{formatDuration(v.duration)}</span>}
                                            {v.completedBy?.includes(user?._id) && <span style={S.completedBadge}>✅</span>}
                                        </div>
                                        <div style={S.videoInfo}>
                                            <h4 style={S.videoTitle}>{v.title}</h4>
                                            <div style={S.videoMeta}>
                                                <span>👁 {v.views || 0}</span>
                                                <span>❤️ {v.likes?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const S = {
    container: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    pageTitle: { margin: 0, fontSize: '22px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#888', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    addBtn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },

    formCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
    input: { width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e4e4e7', fontSize: '13px', outline: 'none', marginBottom: '8px', boxSizing: 'border-box' },
    select: { padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e4e4e7', fontSize: '12px', outline: 'none' },
    textarea: { width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e4e4e7', fontSize: '13px', outline: 'none', resize: 'vertical', marginBottom: '8px', boxSizing: 'border-box' },
    submitBtn: { padding: '8px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },

    catTabs: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' },
    catTab: { padding: '4px 10px', borderRadius: '14px', border: '1px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', background: 'none' },

    playerCard: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' },
    playerHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)' },
    iframe: { width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' },
    likeBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fc8181', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },
    completeBtn: { border: '1px solid rgba(255,255,255,0.1)', color: '#48bb78', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },

    topicGroup: { marginBottom: '24px' },
    topicTitle: { color: '#667eea', fontSize: '14px', margin: '0 0 12px 0', textTransform: 'capitalize', borderBottom: '1px solid rgba(102,126,234,0.2)', paddingBottom: '6px' },
    videoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' },
    videoCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' },
    thumbnail: { position: 'relative', aspectRatio: '16/9', background: '#000', overflow: 'hidden' },
    thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
    thumbPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: 'rgba(102,126,234,0.1)' },
    durationBadge: { position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' },
    completedBadge: { position: 'absolute', top: '6px', right: '6px', fontSize: '16px' },
    videoInfo: { padding: '10px' },
    videoTitle: { margin: 0, fontSize: '13px', color: '#e4e4e7', fontWeight: 'bold', lineHeight: '1.3' },
    videoMeta: { display: 'flex', gap: '10px', marginTop: '6px', color: '#888', fontSize: '11px' }
};

export default VideoLessons;
