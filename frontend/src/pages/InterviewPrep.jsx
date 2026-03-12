import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../utils/api';

/**
 * 🎯 Interview Prep — Timed Mock Interviews
 * Lobby → Live Session → Results → History
 */
const InterviewPrep = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const authHeaders = { headers: { Authorization: `Bearer ${user?.token}` } };

    // Views: lobby | session | results | history
    const [view, setView] = useState('lobby');
    const [loading, setLoading] = useState(false);

    // Session state
    const [session, setSession] = useState(null);
    const [problems, setProblems] = useState([]);
    const [currentProblem, setCurrentProblem] = useState(0);
    const [codes, setCodes] = useState({});
    const [submissions, setSubmissions] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [problemStartTime, setProblemStartTime] = useState(Date.now());
    const timerRef = useRef(null);

    // Results state
    const [finalResults, setFinalResults] = useState(null);

    // History & stats
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);

    // Lobby settings
    const [selectedMode, setSelectedMode] = useState('mixed');
    const [problemCount, setProblemCount] = useState(4);

    // ═══ Timer ═══
    useEffect(() => {
        if (view !== 'session' || !session) return;
        const endTime = new Date(session.startedAt).getTime() + session.timeLimit * 60000;

        timerRef.current = setInterval(() => {
            const remaining = Math.max(0, endTime - Date.now());
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current);
                handleEndSession();
            }
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [view, session]);

    // ═══ Format time ═══
    const formatTime = (ms) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // ═══ Start Interview ═══
    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/api/interview/start`, {
                mode: selectedMode,
                problemCount
            }, authHeaders);

            setSession(res.data.session);
            setProblems(res.data.problems);
            setCurrentProblem(0);
            setProblemStartTime(Date.now());

            // Initialize codes with starter code
            const initialCodes = {};
            res.data.problems.forEach(p => {
                initialCodes[p.id] = p.starterCode || '';
            });
            setCodes(initialCodes);
            setSubmissions({});
            setView('session');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to start interview');
        }
        setLoading(false);
    };

    // ═══ Submit Solution ═══
    const handleSubmit = async (problemId) => {
        if (!codes[problemId]?.trim()) return;
        setLoading(true);
        try {
            const timeTaken = Math.round((Date.now() - problemStartTime) / 1000);
            const res = await axios.post(
                `${API_BASE}/api/interview/submit/${session._id}`,
                { problemId, code: codes[problemId], language: 'python', timeTaken },
                authHeaders
            );
            setSubmissions(prev => ({ ...prev, [problemId]: res.data }));
        } catch (err) {
            alert(err.response?.data?.error || 'Submit failed');
        }
        setLoading(false);
    };

    // ═══ End Session ═══
    const handleEndSession = async () => {
        clearInterval(timerRef.current);
        setLoading(true);
        try {
            const res = await axios.post(
                `${API_BASE}/api/interview/end/${session._id}`,
                {},
                authHeaders
            );
            setFinalResults(res.data);
            setView('results');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to end session');
        }
        setLoading(false);
    };

    // ═══ Load History ═══
    const loadHistory = async () => {
        setLoading(true);
        try {
            const [histRes, statsRes] = await Promise.all([
                axios.get(`${API_BASE}/api/interview/history`, authHeaders),
                axios.get(`${API_BASE}/api/interview/stats`, authHeaders)
            ]);
            setHistory(histRes.data);
            setStats(statsRes.data);
            setView('history');
        } catch (err) {
            console.error('Failed to load history:', err);
        }
        setLoading(false);
    };

    // Navigate problems
    const goToProblem = (idx) => {
        setCurrentProblem(idx);
        setProblemStartTime(Date.now());
    };

    // ═══════════════════════════════════════
    // RENDER: LOBBY
    // ═══════════════════════════════════════
    const renderLobby = () => (
        <div style={S.lobbyContainer}>
            <div style={S.lobbyHeader}>
                <button onClick={() => navigate('/')} style={S.backBtn}>← Dashboard</button>
                <h1 style={S.pageTitle}>🎯 Interview Prep</h1>
                <button onClick={loadHistory} style={S.historyBtn}>📊 History</button>
            </div>

            <div style={S.lobbyCard}>
                <h2 style={S.cardTitle}>Start Mock Interview</h2>
                <p style={S.cardDesc}>Simulate a real coding interview with timed DSA problems.
                    Track your performance and identify weak areas.</p>

                <div style={S.modeGrid}>
                    {[
                        { id: 'easy', label: '🟢 Easy', desc: '30 min • Fundamentals', time: 30 },
                        { id: 'medium', label: '🟡 Medium', desc: '45 min • Core DSA', time: 45 },
                        { id: 'hard', label: '🔴 Hard', desc: '60 min • Advanced', time: 60 },
                        { id: 'mixed', label: '🎲 Mixed', desc: '45 min • All levels', time: 45 }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setSelectedMode(mode.id)}
                            style={{
                                ...S.modeCard,
                                borderColor: selectedMode === mode.id ? '#667eea' : 'rgba(255,255,255,0.1)',
                                background: selectedMode === mode.id ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255,255,255,0.03)'
                            }}
                        >
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{mode.label.split(' ')[0]}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{mode.label.split(' ')[1]}</div>
                            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{mode.desc}</div>
                        </button>
                    ))}
                </div>

                <div style={S.countRow}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Number of problems:</span>
                    <div style={S.countBtns}>
                        {[2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                onClick={() => setProblemCount(n)}
                                style={{
                                    ...S.countBtn,
                                    background: problemCount === n ? '#667eea' : 'rgba(255,255,255,0.08)',
                                    color: problemCount === n ? '#fff' : '#888'
                                }}
                            >{n}</button>
                        ))}
                    </div>
                </div>

                <button onClick={handleStart} disabled={loading} style={S.startBtn}>
                    {loading ? '⏳ Preparing...' : '🚀 Start Interview'}
                </button>
            </div>

            {/* Category Overview */}
            <div style={S.categoriesGrid}>
                {[
                    { name: 'Arrays', icon: '📦', color: '#667eea' },
                    { name: 'Strings', icon: '🔤', color: '#48bb78' },
                    { name: 'Linked Lists', icon: '🔗', color: '#f6ad55' },
                    { name: 'Trees', icon: '🌳', color: '#fc8181' },
                    { name: 'Graphs', icon: '🕸️', color: '#9f7aea' },
                    { name: 'Dynamic Prog.', icon: '🧮', color: '#4fd1c5' }
                ].map(cat => (
                    <div key={cat.name} style={{ ...S.catCard, borderLeftColor: cat.color }}>
                        <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                        <span style={{ fontSize: '12px', color: '#e4e4e7', fontWeight: 'bold' }}>{cat.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // ═══════════════════════════════════════
    // RENDER: LIVE SESSION
    // ═══════════════════════════════════════
    const renderSession = () => {
        const prob = problems[currentProblem];
        if (!prob) return null;
        const sub = submissions[prob.id];
        const isUrgent = timeLeft < 300000; // < 5 min

        return (
            <div style={S.sessionContainer}>
                {/* Top Bar */}
                <div style={S.sessionTopBar}>
                    <div style={S.topLeft}>
                        <span style={S.modeTag}>{session.mode.toUpperCase()}</span>
                        <span style={{ color: '#888', fontSize: '12px' }}>
                            Problem {currentProblem + 1} / {problems.length}
                        </span>
                    </div>
                    <div style={{
                        ...S.timer,
                        color: isUrgent ? '#fc8181' : '#4fd1c5',
                        animation: isUrgent ? 'pulse 1s infinite' : 'none'
                    }}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                    <button onClick={handleEndSession} style={S.endBtn}>
                        🏁 End Interview
                    </button>
                </div>

                {/* Problem Tabs */}
                <div style={S.problemTabs}>
                    {problems.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => goToProblem(i)}
                            style={{
                                ...S.problemTab,
                                background: i === currentProblem ? '#667eea' :
                                    submissions[p.id]?.passed ? 'rgba(72, 187, 120, 0.2)' :
                                        submissions[p.id] ? 'rgba(252, 129, 129, 0.2)' :
                                            'rgba(255,255,255,0.05)',
                                color: i === currentProblem ? '#fff' :
                                    submissions[p.id]?.passed ? '#48bb78' :
                                        submissions[p.id] ? '#fc8181' : '#888'
                            }}
                        >
                            {submissions[p.id]?.passed ? '✅' : submissions[p.id] ? '❌' : `Q${i + 1}`}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div style={S.sessionMain}>
                    {/* Left: Problem Description */}
                    <div style={S.problemPane}>
                        <div style={S.problemHeader}>
                            <h2 style={S.problemTitle}>{prob.title}</h2>
                            <div style={S.problemMeta}>
                                <span style={{
                                    ...S.diffBadge,
                                    background: prob.difficulty === 'easy' ? 'rgba(72,187,120,0.15)' :
                                        prob.difficulty === 'medium' ? 'rgba(246,173,85,0.15)' : 'rgba(252,129,129,0.15)',
                                    color: prob.difficulty === 'easy' ? '#48bb78' :
                                        prob.difficulty === 'medium' ? '#f6ad55' : '#fc8181'
                                }}>
                                    {prob.difficulty.toUpperCase()}
                                </span>
                                <span style={S.catBadge}>{prob.category.replace('_', ' ')}</span>
                                <span style={{ color: '#888', fontSize: '11px' }}>⏱ ~{prob.timeEstimate}m</span>
                            </div>
                        </div>
                        <p style={S.problemDesc}>{prob.description}</p>

                        {prob.companies?.length > 0 && (
                            <div style={S.companiesRow}>
                                {prob.companies.map(c => (
                                    <span key={c} style={S.companyTag}>{c}</span>
                                ))}
                            </div>
                        )}

                        {/* Hints */}
                        <details style={S.hintsSection}>
                            <summary style={S.hintsSummary}>💡 Hints ({prob.hints?.length || 0})</summary>
                            {prob.hints?.map((h, i) => (
                                <div key={i} style={S.hintItem}>
                                    <span style={{ color: '#f6ad55', fontWeight: 'bold' }}>#{i + 1}</span> {h}
                                </div>
                            ))}
                        </details>

                        {/* Submission Result */}
                        {sub && (
                            <div style={{
                                ...S.subResult,
                                borderColor: sub.passed ? '#48bb78' : '#fc8181',
                                background: sub.passed ? 'rgba(72,187,120,0.08)' : 'rgba(252,129,129,0.08)'
                            }}>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: sub.passed ? '#48bb78' : '#fc8181' }}>
                                    {sub.passed ? '✅ All Test Cases Passed!' : `❌ ${sub.testCaseResults?.filter(t => t.passed).length}/${sub.testCaseResults?.length} Passed`}
                                </div>
                                <div style={S.testGrid}>
                                    {sub.testCaseResults?.map((tc, i) => (
                                        <div key={i} style={{
                                            ...S.testCase,
                                            borderColor: tc.passed ? '#48bb78' : '#fc8181'
                                        }}>
                                            <span>{tc.passed ? '✅' : '❌'} Case {tc.case}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Code Editor */}
                    <div style={S.editorPane}>
                        <div style={S.editorHeader}>
                            <span style={{ color: '#9cdcfe', fontSize: '12px', fontWeight: 'bold' }}>📝 Your Solution</span>
                            <span style={{ color: '#888', fontSize: '11px' }}>Python</span>
                        </div>
                        <textarea
                            value={codes[prob.id] || ''}
                            onChange={(e) => setCodes(prev => ({ ...prev, [prob.id]: e.target.value }))}
                            style={S.codeEditor}
                            spellCheck={false}
                            placeholder="# Write your solution here..."
                        />
                        <div style={S.editorFooter}>
                            <button
                                onClick={() => handleSubmit(prob.id)}
                                disabled={loading || !codes[prob.id]?.trim()}
                                style={{
                                    ...S.submitBtn,
                                    opacity: codes[prob.id]?.trim() ? 1 : 0.5
                                }}
                            >
                                {loading ? '⏳ Checking...' : '▶ Submit & Test'}
                            </button>
                            {currentProblem < problems.length - 1 && (
                                <button onClick={() => goToProblem(currentProblem + 1)} style={S.nextBtn}>
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ═══════════════════════════════════════
    // RENDER: RESULTS
    // ═══════════════════════════════════════
    const renderResults = () => {
        if (!finalResults) return null;
        const ratingColors = {
            needs_practice: '#fc8181',
            getting_there: '#f6ad55',
            solid: '#4fd1c5',
            excellent: '#667eea',
            interview_ready: '#48bb78'
        };
        const ratingLabels = {
            needs_practice: '📚 Needs Practice',
            getting_there: '🚶 Getting There',
            solid: '💪 Solid',
            excellent: '⭐ Excellent',
            interview_ready: '🏆 Interview Ready!'
        };

        return (
            <div style={S.resultsContainer}>
                <h1 style={S.resultsTitle}>🎯 Interview Results</h1>

                {/* Score Card */}
                <div style={S.scoreCard}>
                    <div style={S.scoreCircle}>
                        <span style={{ fontSize: '48px', fontWeight: 'bold', color: ratingColors[finalResults.rating] }}>
                            {finalResults.totalScore}
                        </span>
                        <span style={{ fontSize: '14px', color: '#888' }}>/ 100</span>
                    </div>
                    <div style={{ color: ratingColors[finalResults.rating], fontSize: '20px', fontWeight: 'bold', marginTop: '12px' }}>
                        {ratingLabels[finalResults.rating]}
                    </div>
                    <div style={S.statsRow}>
                        <div style={S.statItem}>
                            <span style={S.statValue}>{finalResults.solved}/{finalResults.total}</span>
                            <span style={S.statLabel}>Solved</span>
                        </div>
                        <div style={S.statItem}>
                            <span style={S.statValue}>{finalResults.timeUsed}m</span>
                            <span style={S.statLabel}>Time Used</span>
                        </div>
                        <div style={S.statItem}>
                            <span style={S.statValue}>{finalResults.timeLimit}m</span>
                            <span style={S.statLabel}>Time Limit</span>
                        </div>
                    </div>
                </div>

                {/* Problem Breakdown */}
                <div style={S.breakdownCard}>
                    <h3 style={{ color: '#e4e4e7', fontSize: '16px', margin: '0 0 16px 0' }}>Problem Breakdown</h3>
                    {finalResults.results?.map((r, i) => (
                        <div key={i} style={S.resultRow}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>{r.passed ? '✅' : '❌'}</span>
                                <div>
                                    <div style={{ color: '#e4e4e7', fontSize: '14px', fontWeight: 'bold' }}>{r.title}</div>
                                    <div style={{ color: '#888', fontSize: '11px' }}>
                                        {r.category?.replace('_', ' ')} • {r.difficulty}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: r.passed ? '#48bb78' : '#fc8181', fontWeight: 'bold' }}>{r.score}%</div>
                                <div style={{ color: '#888', fontSize: '11px' }}>{r.timeTaken}s</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div style={S.resultActions}>
                    <button onClick={() => { setView('lobby'); setFinalResults(null); }} style={S.startBtn}>
                        🔄 Try Again
                    </button>
                    <button onClick={loadHistory} style={S.historyBtn}>📊 View History</button>
                </div>
            </div>
        );
    };

    // ═══════════════════════════════════════
    // RENDER: HISTORY
    // ═══════════════════════════════════════
    const renderHistory = () => (
        <div style={S.historyContainer}>
            <div style={S.lobbyHeader}>
                <button onClick={() => setView('lobby')} style={S.backBtn}>← Back</button>
                <h1 style={S.pageTitle}>📊 Interview History</h1>
                <div />
            </div>

            {/* Stats Overview */}
            {stats && stats.totalSessions > 0 && (
                <div style={S.statsGrid}>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>{stats.totalSessions}</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Sessions</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4fd1c5' }}>{stats.avgScore}%</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Avg Score</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#48bb78' }}>{stats.bestScore}%</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Best Score</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f6ad55' }}>
                            {stats.totalSolved}/{stats.totalProblems}
                        </div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Solved</div>
                    </div>
                    <div style={S.statCard}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: stats.improvement >= 0 ? '#48bb78' : '#fc8181' }}>
                            {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
                        </div>
                        <div style={{ color: '#888', fontSize: '11px' }}>Improvement</div>
                    </div>
                </div>
            )}

            {/* Category Breakdown */}
            {stats?.categoryStats && Object.keys(stats.categoryStats).length > 0 && (
                <div style={S.breakdownCard}>
                    <h3 style={{ color: '#e4e4e7', fontSize: '14px', margin: '0 0 12px 0' }}>Category Performance</h3>
                    {Object.entries(stats.categoryStats).map(([cat, data]) => (
                        <div key={cat} style={S.catStatRow}>
                            <span style={{ color: '#e4e4e7', fontSize: '13px', textTransform: 'capitalize', flex: 1 }}>
                                {cat.replace('_', ' ')}
                            </span>
                            <span style={{ color: '#888', fontSize: '12px' }}>{data.solved}/{data.attempted}</span>
                            <div style={S.progressBar}>
                                <div style={{
                                    ...S.progressFill,
                                    width: `${data.avgScore}%`,
                                    background: data.avgScore >= 70 ? '#48bb78' :
                                        data.avgScore >= 40 ? '#f6ad55' : '#fc8181'
                                }} />
                            </div>
                            <span style={{ color: '#888', fontSize: '12px', width: '40px', textAlign: 'right' }}>{data.avgScore}%</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Session List */}
            <div style={S.breakdownCard}>
                <h3 style={{ color: '#e4e4e7', fontSize: '14px', margin: '0 0 12px 0' }}>Past Sessions</h3>
                {history.length === 0 ? (
                    <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                        No sessions yet. Start your first interview!
                    </p>
                ) : history.map((h, i) => (
                    <div key={i} style={S.historyRow}>
                        <div>
                            <div style={{ color: '#e4e4e7', fontSize: '13px', fontWeight: 'bold' }}>
                                {h.mode.toUpperCase()} • {h.solvedCount}/{h.problemCount} solved
                            </div>
                            <div style={{ color: '#888', fontSize: '11px' }}>
                                {new Date(h.date).toLocaleDateString()} • {h.timeUsed || '?'}m / {h.timeLimit}m
                            </div>
                        </div>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: h.totalScore >= 70 ? '#48bb78' : h.totalScore >= 40 ? '#f6ad55' : '#fc8181'
                        }}>
                            {h.totalScore}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // ═══ Main Render ═══
    return (
        <div style={S.container}>
            {view === 'lobby' && renderLobby()}
            {view === 'session' && renderSession()}
            {view === 'results' && renderResults()}
            {view === 'history' && renderHistory()}
        </div>
    );
};

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const S = {
    container: { minHeight: '100vh', background: 'var(--bg-primary, #1a1a2e)', color: '#fff', fontFamily: 'Inter, sans-serif' },

    // Lobby
    lobbyContainer: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
    lobbyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    pageTitle: { margin: 0, fontSize: '24px', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#888', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    historyBtn: { background: 'rgba(102, 126, 234, 0.15)', border: '1px solid rgba(102, 126, 234, 0.3)', color: '#667eea', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    lobbyCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', marginBottom: '20px' },
    cardTitle: { margin: '0 0 8px 0', fontSize: '20px', color: '#e4e4e7' },
    cardDesc: { margin: '0 0 24px 0', color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' },

    modeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
    modeCard: { padding: '20px 12px', borderRadius: '12px', border: '2px solid', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' },

    countRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
    countBtns: { display: 'flex', gap: '8px' },
    countBtn: { width: '40px', height: '40px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },

    startBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px' },

    categoriesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
    catCard: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', borderLeft: '3px solid' },

    // Session
    sessionContainer: { height: '100vh', display: 'flex', flexDirection: 'column' },
    sessionTopBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    topLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    modeTag: { background: 'rgba(102, 126, 234, 0.2)', color: '#667eea', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' },
    timer: { fontFamily: 'monospace', fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' },
    endBtn: { background: 'rgba(252, 129, 129, 0.15)', border: '1px solid rgba(252, 129, 129, 0.3)', color: '#fc8181', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },

    problemTabs: { display: 'flex', gap: '6px', padding: '8px 20px', background: 'rgba(0,0,0,0.2)' },
    problemTab: { padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', minWidth: '44px' },

    sessionMain: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' },

    // Problem Pane
    problemPane: { padding: '20px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.08)' },
    problemHeader: { marginBottom: '16px' },
    problemTitle: { margin: '0 0 8px 0', fontSize: '20px', color: '#fff' },
    problemMeta: { display: 'flex', gap: '8px', alignItems: 'center' },
    diffBadge: { padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' },
    catBadge: { padding: '3px 10px', background: 'rgba(102, 126, 234, 0.15)', color: '#667eea', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', textTransform: 'capitalize' },
    problemDesc: { color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', margin: '0 0 16px 0' },
    companiesRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' },
    companyTag: { padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '10px', color: '#888' },

    hintsSection: { marginBottom: '16px' },
    hintsSummary: { cursor: 'pointer', color: '#f6ad55', fontSize: '13px', fontWeight: 'bold', padding: '8px 0' },
    hintItem: { padding: '8px 12px', background: 'rgba(246, 173, 85, 0.08)', borderRadius: '6px', marginTop: '6px', fontSize: '12px', color: '#e4e4e7', lineHeight: '1.5' },

    subResult: { borderRadius: '12px', padding: '16px', border: '1px solid', marginTop: '16px' },
    testGrid: { display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' },
    testCase: { padding: '4px 10px', borderRadius: '6px', border: '1px solid', fontSize: '11px', color: '#e4e4e7' },

    // Editor Pane
    editorPane: { display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' },
    editorHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    codeEditor: { flex: 1, background: 'transparent', color: '#e4e4e7', border: 'none', padding: '14px', fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: '13px', lineHeight: '1.6', resize: 'none', outline: 'none' },
    editorFooter: { display: 'flex', gap: '8px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.08)' },
    submitBtn: { flex: 1, padding: '10px', background: 'linear-gradient(135deg, #2ea043, #26843b)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
    nextBtn: { padding: '10px 20px', background: 'rgba(102, 126, 234, 0.15)', color: '#667eea', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },

    // Results
    resultsContainer: { padding: '32px', maxWidth: '700px', margin: '0 auto' },
    resultsTitle: { textAlign: 'center', fontSize: '28px', margin: '0 0 24px 0', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    scoreCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '20px' },
    scoreCircle: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' },
    statsRow: { display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '20px' },
    statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    statValue: { fontSize: '18px', fontWeight: 'bold', color: '#e4e4e7' },
    statLabel: { fontSize: '11px', color: '#888', marginTop: '2px' },

    breakdownCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
    resultRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    resultActions: { display: 'flex', gap: '12px', marginTop: '20px' },

    // History
    historyContainer: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' },
    statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' },
    catStatRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    progressBar: { width: '100px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
    historyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }
};

export default InterviewPrep;
