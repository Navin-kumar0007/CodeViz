import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

const API = 'http://localhost:5001';

const CodeReview = () => {
    const [code, setCode] = useState(`def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

result = bubble_sort([64, 34, 25, 12, 22, 11, 90])
print(result)`);
    const [language, setLanguage] = useState('python');
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [activeAnnotation, setActiveAnnotation] = useState(null);

    const getToken = () => {
        const info = localStorage.getItem('userInfo');
        return info ? JSON.parse(info).token : '';
    };
    const headers = { Authorization: `Bearer ${getToken()}` };

    // Fetch review history
    useEffect(() => {
        axios.get(`${API}/api/ai/review-history?limit=10`, { headers })
            .then(res => setHistory(res.data.history || []))
            .catch(() => { });
    }, [review]);

    const submitReview = async () => {
        setLoading(true);
        setReview(null);
        try {
            const { data } = await axios.post(`${API}/api/ai/rubric-review`, { code, language }, { headers });
            setReview(data.review);
        } catch (err) {
            console.error('Review error:', err);
        }
        setLoading(false);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--accent-green)';
        if (score >= 60) return 'var(--accent-yellow)';
        if (score >= 40) return 'var(--accent-orange)';
        return 'var(--accent-red)';
    };

    const getScoreGrade = (score) => {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    };

    const categories = review?.categories
        ? Object.entries(review.categories).map(([key, val]) => ({
            name: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
            key,
            ...val
        }))
        : [];

    const annotationsByType = (review?.annotations || []).reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}><span>🤖</span> AI Code Reviewer</h1>
                    <p style={styles.subtitle}>Get scored code reviews with line-by-line annotations on a 0-100 rubric</p>
                </div>
                <div style={styles.langSelect}>
                    {['python', 'javascript', 'java', 'cpp'].map(l => (
                        <button key={l} onClick={() => setLanguage(l)} style={{
                            ...styles.langBtn,
                            ...(language === l ? styles.langActive : {})
                        }}>{l}</button>
                    ))}
                </div>
            </div>

            {/* Score History Sparkline */}
            {history.length > 0 && (
                <div style={styles.historyBar}>
                    <span style={styles.historyLabel}>📈 Score History</span>
                    <div style={styles.sparkline}>
                        {history.slice().reverse().map((h, i) => (
                            <div key={i} style={{
                                ...styles.sparkBar,
                                height: `${Math.max(4, h.overallScore * 0.4)}px`,
                                background: getScoreColor(h.overallScore),
                            }} title={`${h.overallScore}/100`} />
                        ))}
                    </div>
                    <span style={styles.historyAvg}>
                        Avg: {Math.round(history.reduce((a, h) => a + h.overallScore, 0) / history.length)}
                    </span>
                </div>
            )}

            {/* Main Layout */}
            <div style={styles.mainGrid}>
                {/* Editor */}
                <div style={styles.editorPanel}>
                    <div style={styles.panelHeader}>
                        <span>📝 Your Code</span>
                        <button onClick={submitReview} disabled={loading} style={{
                            ...styles.reviewBtn,
                            opacity: loading ? 0.6 : 1,
                        }}>
                            {loading ? '⏳ Analyzing...' : '🤖 Review Code'}
                        </button>
                    </div>
                    <div style={styles.editorWrap}>
                        <Editor
                            height="100%"
                            language={language === 'cpp' ? 'cpp' : language}
                            value={code}
                            onChange={v => setCode(v || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                padding: { top: 12 },
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                            }}
                        />
                    </div>
                </div>

                {/* Review Panel */}
                <div style={styles.reviewPanel}>
                    {loading ? (
                        <div style={styles.loadingState}>
                            <div style={styles.spinner} />
                            <p>AI is analyzing your code...</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Checking readability, efficiency, best practices, error handling, structure
                            </p>
                        </div>
                    ) : review && review.overallScore !== undefined ? (
                        <div style={styles.reviewContent}>
                            {/* Overall Score */}
                            <div style={styles.scoreHero}>
                                <div style={{
                                    ...styles.scoreCircle,
                                    borderColor: getScoreColor(review.overallScore),
                                    boxShadow: `0 0 30px ${getScoreColor(review.overallScore)}33`
                                }}>
                                    <span style={{
                                        ...styles.scoreNumber,
                                        color: getScoreColor(review.overallScore)
                                    }}>{review.overallScore}</span>
                                    <span style={styles.scoreMax}>/100</span>
                                </div>
                                <span style={{
                                    ...styles.scoreGrade,
                                    color: getScoreColor(review.overallScore)
                                }}>{getScoreGrade(review.overallScore)}</span>
                            </div>

                            {/* Category Bars */}
                            <div style={styles.categoriesSection}>
                                <h4 style={styles.sectionTitle}>📊 Category Breakdown</h4>
                                {categories.map(cat => (
                                    <div key={cat.key} style={styles.categoryRow}>
                                        <div style={styles.categoryHeader}>
                                            <span style={styles.categoryName}>{cat.name}</span>
                                            <span style={{ ...styles.categoryScore, color: getScoreColor(cat.score) }}>
                                                {cat.score}
                                            </span>
                                        </div>
                                        <div style={styles.progressBar}>
                                            <div style={{
                                                ...styles.progressFill,
                                                width: `${cat.score}%`,
                                                background: `linear-gradient(90deg, ${getScoreColor(cat.score)}, ${getScoreColor(cat.score)}88)`
                                            }} />
                                        </div>
                                        <p style={styles.categoryFeedback}>{cat.feedback}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Annotations */}
                            {(review.annotations || []).length > 0 && (
                                <div style={styles.annotationsSection}>
                                    <h4 style={styles.sectionTitle}>
                                        📌 Line Annotations
                                        <span style={styles.annotBadges}>
                                            {Object.entries(annotationsByType).map(([type, count]) => (
                                                <span key={type} style={{
                                                    ...styles.annotBadge,
                                                    background: type === 'good' ? 'rgba(152,195,121,0.15)' :
                                                        type === 'critical' ? 'rgba(224,108,117,0.15)' :
                                                            type === 'warning' ? 'rgba(229,192,123,0.15)' :
                                                                'rgba(97,218,251,0.15)',
                                                    color: type === 'good' ? 'var(--accent-green)' :
                                                        type === 'critical' ? 'var(--accent-red)' :
                                                            type === 'warning' ? 'var(--accent-yellow)' :
                                                                'var(--accent-blue)',
                                                }}>
                                                    {count} {type}
                                                </span>
                                            ))}
                                        </span>
                                    </h4>
                                    {review.annotations.map((a, i) => (
                                        <div key={i} style={{
                                            ...styles.annotation,
                                            borderLeftColor: a.type === 'good' ? 'var(--accent-green)' :
                                                a.type === 'critical' ? 'var(--accent-red)' :
                                                    a.type === 'warning' ? 'var(--accent-yellow)' :
                                                        'var(--accent-blue)',
                                        }}>
                                            <div style={styles.annotHeader}>
                                                <span style={styles.annotLine}>Line {a.line}</span>
                                                <span style={{
                                                    ...styles.annotType,
                                                    color: a.type === 'good' ? 'var(--accent-green)' :
                                                        a.type === 'critical' ? 'var(--accent-red)' :
                                                            a.type === 'warning' ? 'var(--accent-yellow)' :
                                                                'var(--accent-blue)',
                                                }}>
                                                    {a.type === 'good' ? '✅' : a.type === 'critical' ? '🚨' :
                                                        a.type === 'warning' ? '⚠️' : '💡'} {a.type}
                                                </span>
                                                {a.severity && (
                                                    <span style={styles.annotSeverity}>{a.severity}</span>
                                                )}
                                            </div>
                                            <p style={styles.annotMessage}>{a.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Summary */}
                            {review.summary && (
                                <div style={styles.summaryBox}>
                                    <h4 style={styles.sectionTitle}>📋 Summary</h4>
                                    <p style={styles.summaryText}>{review.summary}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={styles.emptyReview}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                            <h3 style={{ color: 'var(--text-bright)', margin: '0 0 8px' }}>Ready to Review</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '280px', margin: '0 auto' }}>
                                Write or paste your code, then click "Review Code" to get a detailed rubric-based score with line annotations.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const styles = {
    page: { padding: '32px', maxWidth: '1400px', margin: '0 auto' },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '20px', flexWrap: 'wrap', gap: '16px',
    },
    title: {
        fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-bright)',
        display: 'flex', alignItems: 'center', gap: '12px',
    },
    subtitle: { color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' },
    langSelect: {
        display: 'flex', gap: '4px', background: 'var(--bg-surface)', borderRadius: '8px', padding: '3px',
    },
    langBtn: {
        padding: '6px 14px', border: 'none', borderRadius: '6px', background: 'transparent',
        color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font-code)', transition: 'var(--transition-fast)',
    },
    langActive: { background: 'var(--bg-elevated)', color: 'var(--accent-blue)' },
    historyBar: {
        display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px',
        background: 'var(--bg-surface)', borderRadius: '10px', border: '1px solid var(--border-color)',
        marginBottom: '20px',
    },
    historyLabel: { fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' },
    sparkline: { display: 'flex', alignItems: 'flex-end', gap: '3px', flex: 1, height: '40px' },
    sparkBar: { width: '8px', borderRadius: '2px 2px 0 0', transition: 'height 0.3s ease' },
    historyAvg: {
        fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-code)',
        color: 'var(--accent-blue)', whiteSpace: 'nowrap',
    },
    mainGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '600px',
    },
    editorPanel: {
        background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
    },
    panelHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', borderBottom: '1px solid var(--border-color)',
        fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
    },
    reviewBtn: {
        padding: '6px 16px', border: 'none', borderRadius: '8px',
        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
        color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
    },
    editorWrap: { flex: 1, minHeight: 0 },
    reviewPanel: {
        background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-color)',
        overflow: 'auto',
    },
    loadingState: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: '60px 20px', color: 'var(--text-secondary)',
    },
    spinner: {
        width: '40px', height: '40px', border: '3px solid var(--border-color)',
        borderTopColor: 'var(--accent-blue)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', marginBottom: '16px',
    },
    reviewContent: { padding: '20px' },
    scoreHero: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        padding: '24px', marginBottom: '24px',
    },
    scoreCircle: {
        width: '120px', height: '120px', borderRadius: '50%',
        border: '4px solid', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
    },
    scoreNumber: { fontSize: '42px', fontWeight: 800, fontFamily: 'var(--font-code)', lineHeight: 1 },
    scoreMax: { fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' },
    scoreGrade: { fontSize: '24px', fontWeight: 800 },
    categoriesSection: { marginBottom: '24px' },
    sectionTitle: {
        fontSize: '14px', fontWeight: 700, color: 'var(--text-bright)',
        marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px',
    },
    categoryRow: { marginBottom: '16px' },
    categoryHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
    categoryName: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 },
    categoryScore: { fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-code)' },
    progressBar: {
        height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: '3px', transition: 'width 0.6s ease' },
    categoryFeedback: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 },
    annotationsSection: { marginBottom: '24px' },
    annotBadges: { display: 'flex', gap: '6px', marginLeft: 'auto' },
    annotBadge: { padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 },
    annotation: {
        padding: '10px 14px', marginBottom: '8px', background: 'var(--bg-primary)',
        borderRadius: '8px', borderLeft: '3px solid',
    },
    annotHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' },
    annotLine: {
        fontFamily: 'var(--font-code)', fontSize: '12px', fontWeight: 700,
        color: 'var(--accent-blue)',
    },
    annotType: { fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' },
    annotSeverity: {
        padding: '1px 6px', borderRadius: '4px', fontSize: '10px',
        background: 'var(--bg-elevated)', color: 'var(--text-muted)', marginLeft: 'auto',
    },
    annotMessage: { margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 },
    summaryBox: {
        padding: '16px', background: 'var(--bg-primary)', borderRadius: '10px',
        border: '1px solid var(--border-color)',
    },
    summaryText: { margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 },
    emptyReview: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', padding: '60px 20px', textAlign: 'center',
    },
};

export default CodeReview;
