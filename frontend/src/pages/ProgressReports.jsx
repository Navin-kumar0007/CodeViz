import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * 📊 Progress Reports — Weekly summary, analytics, activity heatmap, recommendations
 */
const ProgressReports = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const authHeaders = { headers: { Authorization: `Bearer ${user?.token}` } };
    const API = 'http://localhost:5001/api/reports';

    const [view, setView] = useState('weekly');
    const [weekly, setWeekly] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadWeekly();
    }, []);

    const loadWeekly = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/weekly`, authHeaders);
            setWeekly(res.data);
        } catch (err) {
            console.error('Failed to load report:', err);
        }
        setLoading(false);
    };

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/analytics`, authHeaders);
            setAnalytics(res.data);
            setView('analytics');
        } catch (err) {
            console.error('Failed to load analytics:', err);
        }
        setLoading(false);
    };

    // Heatmap level colors
    const heatColors = ['rgba(255,255,255,0.03)', 'rgba(72,187,120,0.3)', 'rgba(72,187,120,0.6)', 'rgba(72,187,120,0.9)'];

    const ratingColors = {
        needs_practice: '#fc8181', getting_there: '#f6ad55', solid: '#4fd1c5', excellent: '#667eea', interview_ready: '#48bb78'
    };
    const ratingLabels = {
        needs_practice: '📚 Needs Practice', getting_there: '🚶 Getting There', solid: '💪 Solid', excellent: '⭐ Excellent', interview_ready: '🏆 Interview Ready'
    };

    // ═══ WEEKLY VIEW ═══
    const renderWeekly = () => {
        if (loading) return <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading report...</p>;
        if (!weekly) return <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>No data available yet. Complete some interview sessions first!</p>;

        const w = weekly;
        return (
            <>
                {/* Summary Cards */}
                <div style={S.statsGrid}>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{w.thisWeek.sessions}</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Sessions</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#48bb78' }}>{w.thisWeek.problemsSolved}/{w.thisWeek.problemsAttempted}</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Solved</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4fd1c5' }}>{w.thisWeek.avgScore}%</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Avg Score</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f6ad55' }}>🔥 {w.user.streak}</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Day Streak</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9f7aea' }}>{w.thisWeek.videosCompleted}</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Videos</div>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>📅 Activity (Last 30 Days)</h3>
                    <div style={S.heatmap}>
                        {w.heatmap?.map((d, i) => (
                            <div key={i} title={`${d.date}: ${d.count} sessions`} style={{
                                width: '18px', height: '18px', borderRadius: '3px',
                                background: heatColors[d.level] || heatColors[0]
                            }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#888' }}>Less</span>
                        {heatColors.map((c, i) => <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: c }} />)}
                        <span style={{ fontSize: '10px', color: '#888' }}>More</span>
                    </div>
                </div>

                {/* Score Trend */}
                {w.scoreTrend?.length > 0 && (
                    <div style={S.card}>
                        <h3 style={S.cardTitle}>📈 Score Trend</h3>
                        <div style={S.trendChart}>
                            {w.scoreTrend.map((s, i) => (
                                <div key={i} style={S.trendBar}>
                                    <div style={{
                                        height: `${Math.max(s.score, 5)}%`,
                                        background: s.score >= 70 ? '#48bb78' : s.score >= 40 ? '#f6ad55' : '#fc8181',
                                        borderRadius: '4px 4px 0 0', minHeight: '4px', transition: 'height 0.3s'
                                    }} />
                                    <span style={{ fontSize: '9px', color: '#888', marginTop: '4px' }}>{s.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Category Performance */}
                {Object.keys(w.categoryStats).length > 0 && (
                    <div style={S.card}>
                        <h3 style={S.cardTitle}>📊 Category Performance</h3>
                        {Object.entries(w.categoryStats).map(([cat, data]) => {
                            const pct = data.attempted > 0 ? Math.round((data.solved / data.attempted) * 100) : 0;
                            return (
                                <div key={cat} style={S.catRow}>
                                    <span style={{ color: '#e4e4e7', fontSize: '13px', textTransform: 'capitalize', flex: 1 }}>
                                        {cat.replace('_', ' ')}
                                    </span>
                                    <span style={{ color: '#888', fontSize: '12px' }}>{data.solved}/{data.attempted}</span>
                                    <div style={S.progressBar}>
                                        <div style={{ ...S.progressFill, width: `${pct}%`, background: pct >= 70 ? '#48bb78' : pct >= 40 ? '#f6ad55' : '#fc8181' }} />
                                    </div>
                                    <span style={{ color: '#888', fontSize: '12px', width: '40px', textAlign: 'right' }}>{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Weak Areas */}
                {w.weakAreas?.length > 0 && (
                    <div style={{ ...S.card, borderColor: 'rgba(252,129,129,0.3)' }}>
                        <h3 style={{ ...S.cardTitle, color: '#fc8181' }}>⚠️ Areas to Improve</h3>
                        {w.weakAreas.map((a, i) => (
                            <div key={i} style={S.weakRow}>
                                <span style={{ color: '#e4e4e7', fontSize: '13px', textTransform: 'capitalize' }}>{a.category}</span>
                                <span style={{ color: '#fc8181', fontSize: '12px' }}>{a.solveRate}% solve rate ({a.attempted} tried)</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recommendations */}
                {w.recommendations?.length > 0 && (
                    <div style={S.card}>
                        <h3 style={S.cardTitle}>💡 Recommendations</h3>
                        {w.recommendations.map((r, i) => (
                            <div key={i} style={S.recItem}>
                                <span style={{ fontSize: '16px' }}>
                                    {r.type === 'practice' ? '🏋️' : r.type === 'improve' ? '📈' : r.type === 'learn' ? '📖' : '🌟'}
                                </span>
                                <span style={{ color: '#e4e4e7', fontSize: '13px' }}>{r.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    };

    // ═══ ANALYTICS VIEW ═══
    const renderAnalytics = () => {
        if (loading) return <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading analytics...</p>;
        if (!analytics) return null;
        const a = analytics;

        return (
            <>
                {/* Overview */}
                <div style={S.statsGrid}>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{a.overview.totalSessions}</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Total Sessions</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#48bb78' }}>{a.overview.totalSolved}/{a.overview.totalProblems}</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Problems Solved</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4fd1c5' }}>{a.overview.avgScore}%</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Avg Score</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f6ad55' }}>{a.overview.bestScore}%</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Best Score</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9f7aea' }}>{a.overview.totalMinutes}m</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Total Time</div>
                    </div>
                </div>

                {/* Current Rating */}
                <div style={{ ...S.card, textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: ratingColors[a.currentRating] || '#888', marginBottom: '4px' }}>
                        {ratingLabels[a.currentRating] || a.currentRating}
                    </div>
                    <span style={{ color: '#888', fontSize: '11px' }}>Current Rating</span>
                </div>

                {/* Difficulty Breakdown */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Difficulty Breakdown</h3>
                    {['easy', 'medium', 'hard'].map(diff => {
                        const d = a.difficultyStats[diff];
                        const pct = d.attempted > 0 ? Math.round((d.solved / d.attempted) * 100) : 0;
                        const color = diff === 'easy' ? '#48bb78' : diff === 'medium' ? '#f6ad55' : '#fc8181';
                        return (
                            <div key={diff} style={S.catRow}>
                                <span style={{ color, fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', flex: 1 }}>{diff}</span>
                                <span style={{ color: '#888', fontSize: '12px' }}>{d.solved}/{d.attempted}</span>
                                <div style={S.progressBar}>
                                    <div style={{ ...S.progressFill, width: `${pct}%`, background: color }} />
                                </div>
                                <span style={{ color: '#888', fontSize: '12px', width: '40px', textAlign: 'right' }}>{pct}%</span>
                            </div>
                        );
                    })}
                </div>

                {/* Rating Distribution */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Rating History</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Object.entries(a.ratingDistribution).map(([rating, count]) => (
                            <div key={rating} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${ratingColors[rating] || '#888'}33` }}>
                                <div style={{ color: ratingColors[rating] || '#888', fontWeight: 'bold', fontSize: '16px' }}>{count}</div>
                                <div style={{ color: '#888', fontSize: '10px', textTransform: 'capitalize' }}>{rating.replace('_', ' ')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #1a1a2e)', fontFamily: 'Inter, sans-serif' }}>
            <div style={S.container}>
                <div style={S.header}>
                    <button onClick={() => navigate('/')} style={S.backBtn}>← Dashboard</button>
                    <h1 style={S.pageTitle}>📊 Progress Reports</h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setView('weekly'); loadWeekly(); }}
                            style={{ ...S.tabBtn, background: view === 'weekly' ? '#667eea' : 'rgba(255,255,255,0.05)', color: view === 'weekly' ? '#fff' : '#888' }}>
                            📅 Weekly
                        </button>
                        <button onClick={loadAnalytics}
                            style={{ ...S.tabBtn, background: view === 'analytics' ? '#667eea' : 'rgba(255,255,255,0.05)', color: view === 'analytics' ? '#fff' : '#888' }}>
                            📈 Analytics
                        </button>
                    </div>
                </div>

                {view === 'weekly' && renderWeekly()}
                {view === 'analytics' && renderAnalytics()}
            </div>
        </div>
    );
};

const S = {
    container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    pageTitle: { margin: 0, fontSize: '22px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#888', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    tabBtn: { padding: '6px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' },
    statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' },

    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    cardTitle: { margin: '0 0 14px 0', fontSize: '14px', color: '#e4e4e7' },

    heatmap: { display: 'flex', flexWrap: 'wrap', gap: '3px' },

    trendChart: { display: 'flex', gap: '6px', alignItems: 'flex-end', height: '100px' },
    trendBar: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' },

    catRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    progressBar: { width: '100px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },

    weakRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    recItem: { display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0' }
};

export default ProgressReports;
