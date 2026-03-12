import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import API_BASE from '../../utils/api';

const API_URL = `${API_BASE}/api/ai`;

/**
 * ComplexityAnalyzer — Shows Big-O analysis with growth curve chart
 */
const ComplexityAnalyzer = ({ code, language = 'python', isVisible, onClose }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const canvasRef = useRef(null);

    const getToken = () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            return userInfo?.token;
        } catch { return null; }
    };

    useEffect(() => {
        if (isVisible && code && !analysis && !loading) {
            analyzeCode();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    const analyzeCode = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/complexity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ code, language })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Analysis failed');

            if (data.analysis && data.analysis.timeComplexity) {
                setAnalysis(data.analysis);
            } else if (data.analysis?.raw) {
                // Try to parse raw response
                try {
                    const parsed = JSON.parse(data.analysis.raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
                    setAnalysis(parsed);
                } catch {
                    setError('Could not parse complexity analysis');
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Draw growth curve chart on canvas
    useEffect(() => {
        if (!analysis?.growthData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = 420;
        const h = 200;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        // Clear
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, w, h);

        const padding = { left: 50, right: 20, top: 20, bottom: 35 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        const { labels, yourCode, reference } = analysis.growthData;
        if (!labels || !reference) return;

        // Find max value for scaling (cap at reasonable number)
        const allValues = [
            ...(yourCode || []),
            ...Object.values(reference).flat()
        ].filter(v => v != null);
        const maxVal = Math.min(Math.max(...allValues), 1000000);

        const scaleX = (i) => padding.left + (i / (labels.length - 1)) * chartW;
        const scaleY = (v) => padding.top + chartH - (Math.min(v, maxVal) / maxVal) * chartH;

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (i / 4) * chartH;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();
        }

        // Reference lines
        const colors = {
            'O(1)': '#666',
            'O(log n)': '#48bb78',
            'O(n)': '#4299e1',
            'O(n log n)': '#ed8936',
            'O(n²)': '#f56565'
        };

        Object.entries(reference).forEach(([label, data]) => {
            if (!data || data.length === 0) return;
            ctx.strokeStyle = colors[label] || '#555';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            data.forEach((v, i) => {
                const x = scaleX(i);
                const y = scaleY(v);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;

            // Label at end
            const lastY = scaleY(data[data.length - 1]);
            ctx.fillStyle = colors[label] || '#555';
            ctx.font = '9px system-ui';
            ctx.fillText(label, w - padding.right + 3, Math.min(lastY + 3, h - 10));
        });

        // Your code line (highlighted)
        if (yourCode && yourCode.length > 0) {
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            yourCode.forEach((v, i) => {
                const x = scaleX(i);
                const y = scaleY(v);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw dots
            yourCode.forEach((v, i) => {
                const x = scaleX(i);
                const y = scaleY(v);
                ctx.fillStyle = '#a855f7';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // X-axis labels
        ctx.fillStyle = '#888';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        labels.forEach((label, i) => {
            const x = scaleX(i);
            ctx.fillText(label >= 1000 ? `${label / 1000}K` : label, x, h - 8);
        });

        // Y-axis label
        ctx.save();
        ctx.translate(12, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#666';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Operations', 0, 0);
        ctx.restore();

        // X-axis label
        ctx.fillStyle = '#666';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Input Size (n)', w / 2, h - 0);

    }, [analysis]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={styles.container}
            >
                {/* Header */}
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>📊</span>
                        <span style={styles.title}>Algorithm Complexity</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={analyzeCode} style={styles.refreshBtn} disabled={loading}>
                            🔄 Re-analyze
                        </button>
                        {onClose && <button onClick={onClose} style={styles.closeBtn}>×</button>}
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner} />
                        <span style={{ color: '#888', fontSize: '13px' }}>Analyzing complexity...</span>
                    </div>
                ) : error ? (
                    <div style={styles.errorContainer}>
                        ❌ {error}
                        <button onClick={analyzeCode} style={styles.retryBtn}>Retry</button>
                    </div>
                ) : analysis ? (
                    <>
                        {/* Badges */}
                        <div style={styles.badgeRow}>
                            <div style={styles.badge}>
                                <span style={styles.badgeLabel}>⏱ Time</span>
                                <span style={styles.badgeValue}>{analysis.timeComplexity}</span>
                            </div>
                            <div style={styles.badge}>
                                <span style={styles.badgeLabel}>💾 Space</span>
                                <span style={styles.badgeValue}>{analysis.spaceComplexity}</span>
                            </div>
                            {analysis.bestCase && (
                                <div style={{ ...styles.badge, ...styles.badgeSmall }}>
                                    <span style={styles.badgeLabelSmall}>Best</span>
                                    <span style={styles.badgeValueSmall}>{analysis.bestCase}</span>
                                </div>
                            )}
                            {analysis.worstCase && (
                                <div style={{ ...styles.badge, ...styles.badgeSmall }}>
                                    <span style={styles.badgeLabelSmall}>Worst</span>
                                    <span style={styles.badgeValueSmall}>{analysis.worstCase}</span>
                                </div>
                            )}
                        </div>

                        {/* Explanation */}
                        {analysis.explanation && (
                            <div style={styles.explanation}>
                                💡 {analysis.explanation}
                                {analysis.dominantOperation && (
                                    <span style={styles.dominantOp}>
                                        Dominant: <strong>{analysis.dominantOperation}</strong>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Growth Curve Chart */}
                        <div style={styles.chartContainer}>
                            <div style={styles.chartHeader}>
                                <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 'bold' }}>Growth Curve</span>
                                <div style={styles.legend}>
                                    <span style={{ ...styles.legendItem, color: '#a855f7' }}>● Your Code</span>
                                    <span style={{ ...styles.legendItem, color: '#4299e1' }}>--- O(n)</span>
                                    <span style={{ ...styles.legendItem, color: '#f56565' }}>--- O(n²)</span>
                                </div>
                            </div>
                            <canvas ref={canvasRef} style={styles.canvas} />
                        </div>
                    </>
                ) : null}
            </Motion.div>
        </AnimatePresence>
    );
};

const styles = {
    container: {
        background: 'rgba(15, 15, 30, 0.98)',
        borderRadius: '12px',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        overflow: 'hidden',
        marginTop: '12px',
        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.1)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: 'rgba(168, 85, 247, 0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '20px',
        cursor: 'pointer'
    },
    refreshBtn: {
        padding: '4px 10px',
        background: 'rgba(168, 85, 247, 0.15)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '6px',
        color: '#a855f7',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '30px'
    },
    spinner: {
        width: '30px',
        height: '30px',
        border: '3px solid rgba(168, 85, 247, 0.2)',
        borderTop: '3px solid #a855f7',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    errorContainer: {
        padding: '20px',
        textAlign: 'center',
        color: '#f56565',
        fontSize: '13px'
    },
    retryBtn: {
        marginLeft: '10px',
        padding: '4px 12px',
        background: 'rgba(245, 101, 101, 0.15)',
        border: '1px solid rgba(245, 101, 101, 0.3)',
        borderRadius: '6px',
        color: '#f56565',
        fontSize: '12px',
        cursor: 'pointer'
    },
    badgeRow: {
        display: 'flex',
        gap: '8px',
        padding: '12px 16px',
        flexWrap: 'wrap'
    },
    badge: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 16px',
        background: 'rgba(168, 85, 247, 0.1)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: '10px',
        minWidth: '80px'
    },
    badgeSmall: {
        padding: '6px 12px',
        minWidth: '60px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)'
    },
    badgeLabel: {
        fontSize: '10px',
        color: '#888',
        marginBottom: '4px',
        fontWeight: 'bold'
    },
    badgeValue: {
        fontSize: '16px',
        color: '#a855f7',
        fontWeight: 'bold',
        fontFamily: "'Fira Code', monospace"
    },
    badgeLabelSmall: {
        fontSize: '9px',
        color: '#666',
        marginBottom: '2px'
    },
    badgeValueSmall: {
        fontSize: '12px',
        color: '#aaa',
        fontWeight: 'bold',
        fontFamily: "'Fira Code', monospace"
    },
    explanation: {
        padding: '10px 16px',
        fontSize: '13px',
        color: '#ccc',
        lineHeight: 1.5,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
    },
    dominantOp: {
        display: 'block',
        marginTop: '6px',
        fontSize: '11px',
        color: '#888'
    },
    chartContainer: {
        padding: '12px 16px'
    },
    chartHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    legend: {
        display: 'flex',
        gap: '12px'
    },
    legendItem: {
        fontSize: '10px',
        fontWeight: 'bold'
    },
    canvas: {
        borderRadius: '8px',
        width: '100%',
        maxWidth: '420px'
    }
};

export default ComplexityAnalyzer;
