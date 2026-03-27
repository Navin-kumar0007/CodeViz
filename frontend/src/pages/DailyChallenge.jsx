import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

/**
 * 🏆 DAILY CHALLENGE PAGE
 * Full-page challenge view with timer, hints, code editor, and XP rewards
 */
const DailyChallenge = () => {
    const navigate = useNavigate();

    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [challengeMode, setChallengeMode] = useState('daily'); // 'daily' or 'ai-coach'
    const editorRef = useRef(null);

    // Fetch today's challenge (runs when mode changes)
    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const stored = JSON.parse(localStorage.getItem('userInfo'));
                if (!stored?._id) {
                    setError('Please log in to participate in the Daily Challenge');
                    setLoading(false);
                    return;
                }
                const endpoint = challengeMode === 'ai-coach'
                    ? `/api/challenges/personalized`
                    : `/api/challenges/today`;

                const res = await API.get(endpoint);

                setChallenge(res.data);
                setCode(res.data.starterCode);
                setOutput('');
                setResult(null);
                setHintsUsed(0);
                setShowHint(false);
                setError(null);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load challenge');
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [challengeMode]);

    // Countdown timer to midnight UTC
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const midnight = new Date(Date.UTC(
                now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1
            ));
            const diff = midnight - now;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    // Run code
    const handleRun = async () => {
        setIsRunning(true);
        setOutput('');
        try {
            const res = await API.post(`/run`, {
                language: challenge.language || 'python',
                code
            });
            if (res.data.error) {
                setOutput(`❌ Error: ${res.data.error}`);
            } else {
                // The backend now provides a cleaned 'output', but we add a safety check
                let finalOutput = res.data.output;

                // Fallback for older backend versions or missing output field
                if (!finalOutput && res.data.trace && Array.isArray(res.data.trace)) {
                    finalOutput = res.data.trace
                        .filter(step => step && step.stdout)
                        .map(step => step.stdout)
                        .join('');
                }

                setOutput(finalOutput || 'No output');
            }
        } catch {
            setOutput('❌ Server error. Is the backend running?');
        } finally {
            setIsRunning(false);
        }
    };

    // Submit solution
    const handleSubmit = async () => {
        if (!output) {
            alert('Run your code first to generate output!');
            return;
        }
        setIsRunning(true);
        try {
            const res = await API.post(`/api/challenges/submit`, {
                challengeId: challenge._id,
                output
            });
            setResult(res.data);
        } catch {
            setResult({ success: false, message: 'Submission failed. Try again.' });
        } finally {
            setIsRunning(false);
        }
    };

    // Show next hint
    const revealHint = () => {
        if (hintsUsed < (challenge?.hints?.length || 0)) {
            setHintsUsed(prev => prev + 1);
            setShowHint(true);
        }
    };

    const difficultyColors = {
        easy: { bg: 'rgba(72, 187, 120, 0.15)', text: 'var(--accent-green)', border: 'rgba(72, 187, 120, 0.3)' },
        medium: { bg: 'rgba(246, 173, 85, 0.15)', text: 'var(--accent-yellow)', border: 'rgba(246, 173, 85, 0.3)' },
        hard: { bg: 'rgba(252, 129, 129, 0.15)', text: 'var(--accent-red)', border: 'rgba(252, 129, 129, 0.3)' }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={styles.spinner}></div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Loading today&apos;s challenge...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={{
                        background: 'rgba(252, 129, 129, 0.1)',
                        padding: '32px',
                        borderRadius: '20px',
                        border: '1px solid rgba(252, 129, 129, 0.2)',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
                        <h2 style={{ color: 'var(--text-primary)', margin: '0 0 12px 0' }}>Access Restricted</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                            {error}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => navigate('/login')} style={styles.runBtn}>
                                Login Now
                            </button>
                            <button onClick={() => navigate('/')} style={styles.backBtn}>
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const dc = difficultyColors[challenge?.difficulty] || difficultyColors.easy;

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/')} style={styles.backBtn}>← Back</button>
                    <h1 style={styles.title}>🏆 Daily Challenge</h1>
                </div>

                <div style={{ display: 'flex', background: 'var(--bg-muted)', borderRadius: '8px', padding: '4px' }}>
                    <button
                        onClick={() => setChallengeMode('daily')}
                        style={{ ...styles.toggleBtn, ...(challengeMode === 'daily' ? styles.toggleActive : {}) }}
                    >
                        📅 Daily
                    </button>
                    <button
                        onClick={() => setChallengeMode('ai-coach')}
                        style={{ ...styles.toggleBtn, ...(challengeMode === 'ai-coach' ? styles.toggleActive : {}) }}
                    >
                        🤖 AI Coach
                    </button>
                </div>

                <div style={styles.timerBox}>
                    <span style={styles.timerLabel}>Next challenge in</span>
                    <span style={styles.timer}>{timeLeft}</span>
                </div>
            </header>

            {/* Challenge Info */}
            <div style={styles.challengeCard}>
                <div style={styles.challengeHeader}>
                    <div>
                        <h2 style={styles.challengeTitle}>{challenge.title}</h2>
                        <div style={styles.metaRow}>
                            <span style={{
                                ...styles.diffBadge,
                                background: dc.bg,
                                color: dc.text,
                                border: `1px solid ${dc.border}`
                            }}>
                                {challenge.difficulty.toUpperCase()}
                            </span>
                            <span style={styles.categoryBadge}>{challenge.category}</span>
                            <span style={styles.xpBadge}>⭐ {challenge.xpReward} XP</span>
                        </div>
                    </div>
                    {challenge.alreadyCompleted && (
                        <div style={styles.completedBadge}>✅ Completed Today</div>
                    )}
                </div>
                <p style={styles.description}>{challenge.description}</p>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Left: Code Editor */}
                <div style={styles.editorPane}>
                    <div style={styles.editorHeader}>
                        <span style={{ color: '#9cdcfe', fontWeight: 'bold', fontSize: '12px' }}>📝 Solution</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{challenge.language}</span>
                    </div>
                    <textarea
                        ref={editorRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        style={styles.codeEditor}
                        spellCheck={false}
                    />
                    <div style={styles.editorActions}>
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            style={styles.runBtn}
                        >
                            {isRunning ? '⏳ Running...' : '▶ Run Code'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isRunning || !output}
                            style={{
                                ...styles.submitBtn,
                                opacity: output ? 1 : 0.5
                            }}
                        >
                            🚀 Submit Solution
                        </button>
                    </div>
                </div>

                {/* Right: Output & Hints */}
                <div style={styles.rightPane}>
                    {/* Output */}
                    <div style={styles.outputBox}>
                        <div style={styles.outputHeader}>💻 Output</div>
                        <pre style={styles.outputContent}>
                            {output || 'Run your code to see output here...'}
                        </pre>
                    </div>

                    {/* Result */}
                    {result && (
                        <div style={{
                            ...styles.resultBox,
                            background: result.success
                                ? 'rgba(72, 187, 120, 0.1)'
                                : 'rgba(252, 129, 129, 0.1)',
                            borderColor: result.success ? 'var(--accent-green)' : 'var(--accent-red)'
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                                {result.success ? '🎉' : '❌'}
                            </div>
                            <div style={{
                                color: result.success ? 'var(--accent-green)' : 'var(--accent-red)',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                marginBottom: '4px'
                            }}>
                                {result.message}
                            </div>
                            {result.xpAwarded > 0 && (
                                <div style={{ color: 'var(--accent-yellow)', fontSize: '13px' }}>
                                    +{result.xpAwarded} XP earned!
                                    {result.streakMultiplier > 1 && (
                                        <span style={{ color: 'var(--accent-red)', marginLeft: '8px' }}>
                                            🔥 {result.streakMultiplier.toFixed(1)}x streak bonus!
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hints */}
                    <div style={styles.hintsBox}>
                        <div style={styles.hintsHeader}>
                            <span>💡 Hints ({hintsUsed}/{challenge.hints?.length || 0})</span>
                            <button
                                onClick={revealHint}
                                disabled={hintsUsed >= (challenge.hints?.length || 0)}
                                style={{
                                    ...styles.hintBtn,
                                    opacity: hintsUsed >= (challenge.hints?.length || 0) ? 0.4 : 1
                                }}
                            >
                                Reveal Hint
                            </button>
                        </div>
                        {showHint && challenge.hints?.slice(0, hintsUsed).map((hint, i) => (
                            <div key={i} style={styles.hintItem}>
                                <span style={{ color: 'var(--accent-yellow)', fontWeight: 'bold' }}>#{i + 1}</span> {hint}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        padding: '20px 24px'
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid var(--accent-teal)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '12px'
    },
    backBtn: {
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontFamily: 'var(--font-code, monospace)'
    },
    title: {
        margin: 0,
        fontSize: '22px',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    timerBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    timerLabel: {
        fontSize: '10px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    timer: {
        fontSize: '20px',
        fontWeight: 'bold',
        fontFamily: 'var(--font-code, monospace)',
        color: 'var(--accent-yellow)',
        letterSpacing: '2px'
    },
    toggleBtn: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted)',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.2s'
    },
    toggleActive: {
        background: 'var(--accent-teal)',
        color: 'var(--text-primary)',
    },
    challengeCard: {
        background: 'var(--bg-muted)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
    },
    challengeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
    },
    challengeTitle: {
        margin: '0 0 8px 0',
        fontSize: '20px',
        color: 'var(--text-primary)'
    },
    metaRow: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
    },
    diffBadge: {
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '0.5px'
    },
    categoryBadge: {
        padding: '3px 10px',
        background: 'rgba(13, 148, 136, 0.15)',
        color: 'var(--accent-teal)',
        border: '1px solid rgba(13, 148, 136, 0.3)',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 'bold',
        textTransform: 'capitalize'
    },
    xpBadge: {
        padding: '3px 10px',
        background: 'rgba(246, 173, 85, 0.15)',
        color: 'var(--accent-yellow)',
        border: '1px solid rgba(246, 173, 85, 0.3)',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: 'bold'
    },
    completedBadge: {
        padding: '6px 14px',
        background: 'rgba(72, 187, 120, 0.15)',
        color: 'var(--accent-green)',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    description: {
        margin: 0,
        color: '#94a3b8',
        fontSize: '14px',
        lineHeight: '1.6'
    },
    mainContent: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        minHeight: '450px'
    },
    editorPane: {
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-muted)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
    },
    editorHeader: {
        padding: '8px 14px',
        background: 'var(--bg-muted)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    codeEditor: {
        flex: 1,
        background: 'transparent',
        color: 'var(--text-primary)',
        border: 'none',
        padding: '14px',
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        fontSize: '13px',
        lineHeight: '1.6',
        resize: 'none',
        outline: 'none',
        minHeight: '300px'
    },
    editorActions: {
        padding: '10px 14px',
        background: 'var(--bg-muted)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        gap: '10px'
    },
    runBtn: {
        flex: 1,
        padding: '10px',
        background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-teal-hover))',
        color: 'var(--text-primary)',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '12px'
    },
    submitBtn: {
        flex: 1,
        padding: '10px',
        background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))',
        color: 'var(--text-primary)',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '12px'
    },
    rightPane: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    outputBox: {
        background: 'var(--bg-muted)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        flex: 1
    },
    outputHeader: {
        padding: '8px 14px',
        background: 'var(--bg-muted)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#9cdcfe'
    },
    outputContent: {
        padding: '14px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#4ec9b0',
        margin: 0,
        whiteSpace: 'pre-wrap',
        minHeight: '100px'
    },
    resultBox: {
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid',
        textAlign: 'center'
    },
    hintsBox: {
        background: 'rgba(246, 173, 85, 0.05)',
        borderRadius: '12px',
        padding: '14px',
        border: '1px solid rgba(246, 173, 85, 0.15)'
    },
    hintsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        fontSize: '12px',
        color: 'var(--accent-yellow)',
        fontWeight: 'bold'
    },
    hintBtn: {
        background: 'rgba(246, 173, 85, 0.2)',
        color: 'var(--accent-yellow)',
        border: '1px solid rgba(246, 173, 85, 0.3)',
        padding: '4px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    hintItem: {
        padding: '8px 12px',
        background: 'rgba(246, 173, 85, 0.08)',
        borderRadius: '6px',
        marginTop: '6px',
        fontSize: '12px',
        color: 'var(--text-primary)',
        lineHeight: '1.5'
    }
};

export default DailyChallenge;
