import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * 💬 Discussion Forum — Threaded discussions with upvotes, replies, search
 */
const Forum = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const authHeaders = { headers: { Authorization: `Bearer ${user?.token}` } };
    const API = 'http://localhost:5001/api/discussions';

    // Views: list | thread | new
    const [view, setView] = useState('list');
    const [threads, setThreads] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeThread, setActiveThread] = useState(null);
    const [loading, setLoading] = useState(false);

    // Filters
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('latest');
    const [searchTerm, setSearchTerm] = useState('');

    // New thread form
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('general');
    const [newTags, setNewTags] = useState('');

    // Reply
    const [replyContent, setReplyContent] = useState('');

    // ═══ Load Threads ═══
    useEffect(() => { loadThreads(); }, [category, sortBy, currentPage]);

    const loadThreads = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                category, sort: sortBy, page: currentPage, limit: 15
            });
            if (searchTerm) params.append('search', searchTerm);
            const res = await axios.get(`${API}/all?${params}`, authHeaders);
            setThreads(res.data.threads || []);
            setTotalPages(res.data.pages || 1);
        } catch (err) {
            console.error('Failed to load threads:', err);
            setThreads([]);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadThreads();
    };

    // ═══ Open Thread ═══
    const openThread = async (id) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/thread/${id}`, authHeaders);
            setActiveThread(res.data);
            setView('thread');
        } catch (err) {
            alert('Failed to load thread');
        }
        setLoading(false);
    };

    // ═══ Create Thread ═══
    const handleCreate = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        setLoading(true);
        try {
            const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
            await axios.post(API, {
                title: newTitle, content: newContent, category: newCategory,
                tags, lessonId: 'general'
            }, authHeaders);
            setNewTitle(''); setNewContent(''); setNewTags('');
            setView('list');
            loadThreads();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create thread');
        }
        setLoading(false);
    };

    // ═══ Reply ═══
    const handleReply = async () => {
        if (!replyContent.trim() || !activeThread) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API}/${activeThread._id}/reply`, {
                content: replyContent
            }, authHeaders);
            setActiveThread(res.data);
            setReplyContent('');
        } catch (err) {
            alert('Failed to post reply');
        }
        setLoading(false);
    };

    // ═══ Like Thread ═══
    const handleLikeThread = async (id) => {
        try {
            await axios.put(`${API}/${id}/like`, {}, authHeaders);
            if (activeThread?._id === id) openThread(id);
            else loadThreads();
        } catch (err) {
            console.error('Like failed:', err);
        }
    };

    // ═══ Like Reply ═══
    const handleLikeReply = async (replyIdx) => {
        if (!activeThread) return;
        try {
            await axios.put(`${API}/${activeThread._id}/reply/${replyIdx}/like`, {}, authHeaders);
            openThread(activeThread._id);
        } catch (err) {
            console.error('Reply like failed:', err);
        }
    };

    // ═══ Resolve ═══
    const handleResolve = async () => {
        if (!activeThread) return;
        try {
            await axios.put(`${API}/${activeThread._id}/resolve`, {}, authHeaders);
            openThread(activeThread._id);
        } catch (err) {
            console.error('Resolve failed:', err);
        }
    };

    // ═══ Pin ═══
    const handlePin = async () => {
        if (!activeThread) return;
        try {
            await axios.put(`${API}/${activeThread._id}/pin`, {}, authHeaders);
            openThread(activeThread._id);
        } catch (err) {
            console.error('Pin failed:', err);
        }
    };

    // Helpers
    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const catColors = {
        general: '#667eea', help: '#f6ad55', showcase: '#48bb78',
        bug: '#fc8181', discussion: '#9f7aea'
    };

    const catIcons = {
        general: '💬', help: '❓', showcase: '🌟', bug: '🐛', discussion: '🗣️'
    };

    // ═══════════════════════════════════════
    // RENDER: THREAD LIST
    // ═══════════════════════════════════════
    const renderList = () => (
        <div style={S.container}>
            <div style={S.header}>
                <button onClick={() => navigate('/')} style={S.backBtn}>← Dashboard</button>
                <h1 style={S.pageTitle}>💬 Discussion Forum</h1>
                <button onClick={() => setView('new')} style={S.newBtn}>+ New Thread</button>
            </div>

            {/* Filters */}
            <div style={S.filterBar}>
                <div style={S.catTabs}>
                    {['all', 'general', 'help', 'showcase', 'bug', 'discussion'].map(c => (
                        <button key={c} onClick={() => { setCategory(c); setCurrentPage(1); }}
                            style={{
                                ...S.catTab,
                                background: category === c ? (catColors[c] || '#667eea') + '22' : 'transparent',
                                color: category === c ? (catColors[c] || '#667eea') : '#888',
                                borderColor: category === c ? (catColors[c] || '#667eea') : 'transparent'
                            }}>
                            {c === 'all' ? '📋 All' : `${catIcons[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSearch} style={S.searchForm}>
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search threads..." style={S.searchInput} />
                    <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                        style={S.sortSelect}>
                        <option value="latest">Latest</option>
                        <option value="popular">Most Liked</option>
                        <option value="unanswered">Unanswered</option>
                    </select>
                </form>
            </div>

            {/* Thread Cards */}
            <div style={S.threadList}>
                {loading && <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Loading...</p>}
                {!loading && threads.length === 0 && (
                    <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                        No threads found. Start the conversation! 🚀
                    </p>
                )}
                {threads.map(t => (
                    <div key={t._id} onClick={() => openThread(t._id)} style={S.threadCard}>
                        <div style={S.threadLeft}>
                            <div style={S.threadVotes}>
                                <button onClick={(e) => { e.stopPropagation(); handleLikeThread(t._id); }}
                                    style={S.voteBtn}>▲</button>
                                <span style={{ color: '#e4e4e7', fontSize: '14px', fontWeight: 'bold' }}>
                                    {t.likes?.length || 0}
                                </span>
                            </div>
                        </div>
                        <div style={S.threadContent}>
                            <div style={S.threadTitleRow}>
                                {t.isPinned && <span style={S.pinBadge}>📌</span>}
                                {t.isResolved && <span style={S.resolvedBadge}>✅</span>}
                                <h3 style={S.threadTitle}>{t.title}</h3>
                            </div>
                            <p style={S.threadSnippet}>{t.content?.slice(0, 120)}...</p>
                            <div style={S.threadMeta}>
                                <span style={{ ...S.catBadge, background: (catColors[t.category] || '#667eea') + '22', color: catColors[t.category] || '#667eea' }}>
                                    {catIcons[t.category]} {t.category}
                                </span>
                                {t.tags?.map(tag => (
                                    <span key={tag} style={S.tagBadge}>#{tag}</span>
                                ))}
                                <span style={S.metaText}>👤 {t.userId?.name || 'Unknown'}</span>
                                <span style={S.metaText}>💬 {t.replies?.length || 0}</span>
                                <span style={S.metaText}>👁 {t.views || 0}</span>
                                <span style={S.metaText}>{timeAgo(t.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={S.pagination}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setCurrentPage(p)}
                            style={{ ...S.pageBtn, background: currentPage === p ? '#667eea' : 'rgba(255,255,255,0.05)', color: currentPage === p ? '#fff' : '#888' }}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // ═══════════════════════════════════════
    // RENDER: THREAD VIEW
    // ═══════════════════════════════════════
    const renderThread = () => {
        if (!activeThread) return null;
        const t = activeThread;
        const isAuthor = t.userId?._id === user?._id;
        const isAdmin = ['instructor', 'admin'].includes(user?.role);

        return (
            <div style={S.container}>
                <div style={S.header}>
                    <button onClick={() => { setView('list'); loadThreads(); }} style={S.backBtn}>← Back</button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(isAuthor || isAdmin) && (
                            <button onClick={handleResolve} style={{
                                ...S.actionBtn,
                                background: t.isResolved ? 'rgba(72,187,120,0.15)' : 'rgba(255,255,255,0.05)',
                                color: t.isResolved ? '#48bb78' : '#888'
                            }}>
                                {t.isResolved ? '✅ Resolved' : '☐ Mark Resolved'}
                            </button>
                        )}
                        {isAdmin && (
                            <button onClick={handlePin} style={{
                                ...S.actionBtn,
                                background: t.isPinned ? 'rgba(246,173,85,0.15)' : 'rgba(255,255,255,0.05)',
                                color: t.isPinned ? '#f6ad55' : '#888'
                            }}>
                                {t.isPinned ? '📌 Pinned' : '📌 Pin'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Original Post */}
                <div style={S.opCard}>
                    <div style={S.opHeader}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '22px', color: '#e4e4e7' }}>{t.title}</h2>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                                <span style={{ ...S.catBadge, background: (catColors[t.category] || '#667eea') + '22', color: catColors[t.category] }}>
                                    {catIcons[t.category]} {t.category}
                                </span>
                                {t.tags?.map(tag => <span key={tag} style={S.tagBadge}>#{tag}</span>)}
                                <span style={S.metaText}>👤 {t.userId?.name}</span>
                                <span style={S.metaText}>{timeAgo(t.createdAt)}</span>
                                <span style={S.metaText}>👁 {t.views}</span>
                            </div>
                        </div>
                        <button onClick={() => handleLikeThread(t._id)} style={S.likeBtnLarge}>
                            ▲ {t.likes?.length || 0}
                        </button>
                    </div>
                    <div style={S.opBody}>{t.content}</div>
                </div>

                {/* Replies */}
                <h3 style={{ color: '#e4e4e7', fontSize: '14px', margin: '20px 0 12px 0' }}>
                    💬 {t.replies?.length || 0} Replies
                </h3>

                {t.replies?.map((r, i) => (
                    <div key={i} style={{
                        ...S.replyCard,
                        borderLeftColor: t.acceptedReplyIdx === i ? '#48bb78' : 'rgba(255,255,255,0.08)'
                    }}>
                        {t.acceptedReplyIdx === i && (
                            <div style={{ color: '#48bb78', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                                ✅ Accepted Answer
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ color: '#e4e4e7', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{r.content}</div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                                    <span style={{ color: '#888', fontSize: '11px' }}>👤 {r.userId?.name || 'User'}</span>
                                    <span style={{ color: '#888', fontSize: '11px' }}>{timeAgo(r.createdAt)}</span>
                                </div>
                            </div>
                            <button onClick={() => handleLikeReply(i)} style={S.replyLikeBtn}>
                                ▲ {r.likes?.length || 0}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Reply Input */}
                <div style={S.replyInputCard}>
                    <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)}
                        placeholder="Write your reply... (Markdown and code blocks supported)"
                        style={S.replyTextarea} />
                    <button onClick={handleReply} disabled={loading || !replyContent.trim()}
                        style={{ ...S.replySubmitBtn, opacity: replyContent.trim() ? 1 : 0.5 }}>
                        {loading ? '⏳ Posting...' : '💬 Post Reply'}
                    </button>
                </div>
            </div>
        );
    };

    // ═══════════════════════════════════════
    // RENDER: NEW THREAD
    // ═══════════════════════════════════════
    const renderNew = () => (
        <div style={S.container}>
            <div style={S.header}>
                <button onClick={() => setView('list')} style={S.backBtn}>← Back</button>
                <h1 style={S.pageTitle}>✏️ New Thread</h1>
                <div />
            </div>

            <div style={S.formCard}>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="Thread title..." style={S.formInput} maxLength={200} />

                <div style={S.formRow}>
                    <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={S.formSelect}>
                        <option value="general">💬 General</option>
                        <option value="help">❓ Help</option>
                        <option value="showcase">🌟 Showcase</option>
                        <option value="bug">🐛 Bug</option>
                        <option value="discussion">🗣️ Discussion</option>
                    </select>
                    <input value={newTags} onChange={e => setNewTags(e.target.value)}
                        placeholder="Tags (comma-separated)" style={S.formInput} />
                </div>

                <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
                    placeholder="Write your post... Use ``` for code blocks"
                    style={S.formTextarea} rows={10} />

                <button onClick={handleCreate} disabled={loading || !newTitle.trim() || !newContent.trim()}
                    style={{ ...S.submitBtn, opacity: (newTitle.trim() && newContent.trim()) ? 1 : 0.5 }}>
                    {loading ? '⏳ Creating...' : '🚀 Post Thread'}
                </button>
            </div>
        </div>
    );

    // ═══ Main Render ═══
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #1a1a2e)', fontFamily: 'Inter, sans-serif' }}>
            {view === 'list' && renderList()}
            {view === 'thread' && renderThread()}
            {view === 'new' && renderNew()}
        </div>
    );
};

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const S = {
    container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    pageTitle: { margin: 0, fontSize: '22px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#888', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    newBtn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },

    // Filters
    filterBar: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
    catTabs: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    catTab: { padding: '5px 12px', borderRadius: '16px', border: '1px solid', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', background: 'none' },
    searchForm: { display: 'flex', gap: '8px' },
    searchInput: { flex: 1, padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e4e4e7', fontSize: '13px', outline: 'none' },
    sortSelect: { padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e4e4e7', fontSize: '12px', outline: 'none' },

    // Thread list
    threadList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    threadCard: { display: 'flex', gap: '14px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s' },
    threadLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' },
    threadVotes: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
    voteBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px', padding: '2px' },
    threadContent: { flex: 1, minWidth: 0 },
    threadTitleRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
    threadTitle: { margin: 0, fontSize: '15px', color: '#e4e4e7', fontWeight: 'bold' },
    threadSnippet: { margin: '6px 0', color: '#888', fontSize: '12px', lineHeight: '1.4' },
    threadMeta: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
    pinBadge: { fontSize: '12px' },
    resolvedBadge: { fontSize: '12px' },
    catBadge: { padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' },
    tagBadge: { color: '#667eea', fontSize: '10px', fontWeight: 'bold' },
    metaText: { color: '#666', fontSize: '10px' },

    // Pagination
    pagination: { display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '20px' },
    pageBtn: { width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },

    // Thread view
    opCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '12px' },
    opHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    opBody: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', marginTop: '16px', whiteSpace: 'pre-wrap' },
    likeBtnLarge: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', minWidth: '60px' },

    replyCard: { background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid', borderRadius: '4px', padding: '14px', marginBottom: '8px' },
    replyLikeBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#888', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap' },

    replyInputCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginTop: '16px' },
    replyTextarea: { width: '100%', minHeight: '80px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#e4e4e7', fontSize: '13px', resize: 'vertical', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' },
    replySubmitBtn: { marginTop: '10px', padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },

    // New thread
    formCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' },
    formInput: { width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e4e4e7', fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' },
    formSelect: { padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e4e4e7', fontSize: '13px', outline: 'none' },
    formTextarea: { width: '100%', minHeight: '200px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px', color: '#e4e4e7', fontFamily: "'JetBrains Mono', Consolas, monospace", fontSize: '13px', resize: 'vertical', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' },
    submitBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' },

    actionBtn: { padding: '6px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }
};

export default Forum;
