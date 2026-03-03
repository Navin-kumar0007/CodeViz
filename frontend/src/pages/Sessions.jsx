import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SessionPlayer from '../components/Session/SessionPlayer';
import SessionRecorder from '../components/Session/SessionRecorder';

const API = 'http://localhost:5001';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [shareDialog, setShareDialog] = useState(null);
    const [filter, setFilter] = useState('all');
    const [copySuccess, setCopySuccess] = useState('');

    const getToken = () => {
        const info = localStorage.getItem('userInfo');
        return info ? JSON.parse(info).token : '';
    };

    const headers = { Authorization: `Bearer ${getToken()}` };

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/api/sessions`, { headers });
            setSessions(data.sessions || []);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchSessions(); }, []);

    const openSession = async (id) => {
        try {
            const { data } = await axios.get(`${API}/api/sessions/${id}`, { headers });
            setSelectedSession(data);
            setShowPlayer(true);
        } catch (err) {
            console.error('Failed to load session:', err);
        }
    };

    const deleteSession = async (id) => {
        try {
            await axios.delete(`${API}/api/sessions/${id}`, { headers });
            setSessions(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const togglePublic = async (id) => {
        try {
            const { data } = await axios.patch(`${API}/api/sessions/${id}/toggle-public`, {}, { headers });
            setSessions(prev => prev.map(s => s._id === id ? { ...s, isPublic: data.isPublic, shareToken: data.shareToken } : s));
        } catch (err) {
            console.error('Failed to toggle:', err);
        }
    };

    const copyShareLink = (token) => {
        const link = `${window.location.origin}/session/shared/${token}`;
        navigator.clipboard.writeText(link);
        setCopySuccess(token);
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const formatDuration = (ms) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const filtered = filter === 'all' ? sessions :
        filter === 'public' ? sessions.filter(s => s.isPublic) :
            sessions.filter(s => !s.isPublic);

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        <span style={styles.titleIcon}>🎥</span> Sessions
                    </h1>
                    <p style={styles.subtitle}>Record, replay, and share your coding sessions</p>
                </div>
                <div style={styles.headerActions}>
                    <div style={styles.filterGroup}>
                        {['all', 'public', 'private'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                ...styles.filterBtn,
                                ...(filter === f ? styles.filterActive : {})
                            }}>
                                {f === 'all' ? '📋 All' : f === 'public' ? '🌐 Public' : '🔒 Private'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{sessions.length}</span>
                    <span style={styles.statLabel}>Total Sessions</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>{sessions.filter(s => s.isPublic).length}</span>
                    <span style={styles.statLabel}>Shared</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>
                        {formatDuration(sessions.reduce((acc, s) => acc + (s.duration || 0), 0))}
                    </span>
                    <span style={styles.statLabel}>Total Time</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statValue}>
                        {sessions.reduce((acc, s) => acc + (s.metadata?.eventCount || 0), 0)}
                    </span>
                    <span style={styles.statLabel}>Total Events</span>
                </div>
            </div>

            {/* Session Grid */}
            {loading ? (
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner} />
                    <p style={styles.loadingText}>Loading sessions...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🎬</div>
                    <h3 style={styles.emptyTitle}>No sessions yet</h3>
                    <p style={styles.emptyText}>
                        Go to the Practice page and click the record button to create your first session!
                    </p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {filtered.map(session => (
                        <div key={session._id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div style={styles.cardLang}>{session.language}</div>
                                <span style={{
                                    ...styles.cardBadge,
                                    background: session.isPublic
                                        ? 'rgba(152,195,121,0.15)' : 'rgba(198,120,221,0.15)',
                                    color: session.isPublic
                                        ? 'var(--accent-green)' : 'var(--accent-purple)'
                                }}>
                                    {session.isPublic ? '🌐 Public' : '🔒 Private'}
                                </span>
                            </div>

                            <h3 style={styles.cardTitle}>{session.title}</h3>
                            {session.description && (
                                <p style={styles.cardDesc}>{session.description}</p>
                            )}

                            <div style={styles.cardMeta}>
                                <span>⏱ {formatDuration(session.duration)}</span>
                                <span>📝 {session.metadata?.eventCount || 0} events</span>
                                <span>🚀 {session.metadata?.totalExecutions || 0} runs</span>
                            </div>

                            <div style={styles.cardDate}>{formatDate(session.createdAt)}</div>

                            <div style={styles.cardActions}>
                                <button onClick={() => openSession(session._id)} style={{ ...styles.actionBtn, ...styles.playActionBtn }}>
                                    ▶ Play
                                </button>
                                <button onClick={() => togglePublic(session._id)} style={styles.actionBtn}>
                                    {session.isPublic ? '🔒' : '🌐'}
                                </button>
                                {session.isPublic && (
                                    <button onClick={() => copyShareLink(session.shareToken)} style={{
                                        ...styles.actionBtn,
                                        ...(copySuccess === session.shareToken ? { color: 'var(--accent-green)' } : {})
                                    }}>
                                        {copySuccess === session.shareToken ? '✓ Copied' : '🔗 Share'}
                                    </button>
                                )}
                                <button onClick={() => deleteSession(session._id)} style={{ ...styles.actionBtn, ...styles.deleteActionBtn }}>
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Player Modal */}
            {showPlayer && selectedSession && (
                <SessionPlayer
                    session={selectedSession}
                    onClose={() => { setShowPlayer(false); setSelectedSession(null); }}
                />
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const styles = {
    page: {
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 800,
        margin: 0,
        color: 'var(--text-bright)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    titleIcon: { fontSize: '32px' },
    subtitle: {
        color: 'var(--text-muted)',
        fontSize: '14px',
        marginTop: '4px',
    },
    headerActions: {
        display: 'flex',
        gap: '12px',
    },
    filterGroup: {
        display: 'flex',
        gap: '4px',
        background: 'var(--bg-surface)',
        borderRadius: '8px',
        padding: '3px',
    },
    filterBtn: {
        padding: '6px 14px',
        border: 'none',
        borderRadius: '6px',
        background: 'transparent',
        color: 'var(--text-muted)',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
    },
    filterActive: {
        background: 'var(--bg-elevated)',
        color: 'var(--text-bright)',
    },
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '28px',
    },
    statCard: {
        background: 'var(--bg-surface)',
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    statValue: {
        fontSize: '24px',
        fontWeight: 800,
        fontFamily: 'var(--font-code)',
        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    statLabel: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontWeight: 500,
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-color)',
        borderTopColor: 'var(--accent-blue)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
        marginTop: '16px',
        color: 'var(--text-muted)',
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
    },
    emptyIcon: { fontSize: '64px', marginBottom: '16px' },
    emptyTitle: {
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--text-bright)',
        marginBottom: '8px',
    },
    emptyText: {
        color: 'var(--text-muted)',
        fontSize: '14px',
        maxWidth: '400px',
        margin: '0 auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px',
    },
    card: {
        background: 'var(--bg-surface)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        padding: '20px',
        transition: 'var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLang: {
        padding: '3px 10px',
        borderRadius: '6px',
        background: 'var(--bg-elevated)',
        color: 'var(--accent-blue)',
        fontFamily: 'var(--font-code)',
        fontSize: '11px',
        fontWeight: 600,
    },
    cardBadge: {
        padding: '3px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
    },
    cardTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 700,
        color: 'var(--text-bright)',
    },
    cardDesc: {
        margin: 0,
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: 1.4,
    },
    cardMeta: {
        display: 'flex',
        gap: '16px',
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-code)',
    },
    cardDate: {
        fontSize: '11px',
        color: 'var(--text-muted)',
    },
    cardActions: {
        display: 'flex',
        gap: '8px',
        marginTop: '4px',
    },
    actionBtn: {
        padding: '5px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        background: 'var(--bg-elevated)',
        color: 'var(--text-secondary)',
        fontSize: '12px',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
    },
    playActionBtn: {
        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
        color: '#fff',
        border: 'none',
        fontWeight: 600,
    },
    deleteActionBtn: {
        marginLeft: 'auto',
    },
};

export default Sessions;
