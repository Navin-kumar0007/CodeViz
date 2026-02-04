import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5001/api/recommendations';

const Recommendations = ({ onNavigate }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                return JSON.parse(userInfo).token;
            } catch {
                return null;
            }
        }
        return null;
    };

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const token = getToken();

            if (!token) {
                setError('Please login to see recommendations');
                setLoading(false);
                return;
            }

            const res = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to fetch');

            const result = await res.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#f56565';
            case 'medium': return '#ed8936';
            case 'low': return '#48bb78';
            default: return '#667eea';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return '🔥';
            case 'medium': return '⭐';
            case 'low': return '💡';
            default: return '📚';
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <span>Analyzing your progress...</span>
                </div>
                <style>{spinnerCSS}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>❌ {error}</div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.container}
        >
            {/* Header */}
            <div style={styles.header}>
                <h3 style={styles.title}>🎯 Recommended For You</h3>
                <button onClick={fetchRecommendations} style={styles.refreshBtn}>🔄</button>
            </div>

            {/* Stats */}
            {data.stats && (
                <div style={styles.statsRow}>
                    <div style={styles.stat}>
                        <span style={styles.statValue}>{data.stats.totalLessons}</span>
                        <span style={styles.statLabel}>Lessons</span>
                    </div>
                    <div style={styles.stat}>
                        <span style={styles.statValue}>{data.stats.totalScore}</span>
                        <span style={styles.statLabel}>Points</span>
                    </div>
                </div>
            )}

            {/* Weak Areas Alert */}
            {data.weakAreas && data.weakAreas.length > 0 && (
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.weakAlert}
                >
                    <span style={styles.weakTitle}>📉 Areas to Improve</span>
                    <div style={styles.weakList}>
                        {data.weakAreas.map((weak, idx) => (
                            <span key={idx} style={styles.weakBadge}>
                                {weak.topic} ({weak.avgScore}%)
                            </span>
                        ))}
                    </div>
                </Motion.div>
            )}

            {/* Recommendations List */}
            <div style={styles.recsList}>
                <AnimatePresence>
                    {data.recommendations && data.recommendations.map((rec, idx) => (
                        <Motion.div
                            key={rec.topic}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            style={{
                                ...styles.recCard,
                                borderLeft: `4px solid ${getPriorityColor(rec.priority)}`
                            }}
                            onClick={() => onNavigate && onNavigate(rec.topic)}
                        >
                            <div style={styles.recIcon}>{getPriorityIcon(rec.priority)}</div>
                            <div style={styles.recContent}>
                                <h4 style={styles.recTopic}>{rec.topic.charAt(0).toUpperCase() + rec.topic.slice(1)}</h4>
                                <p style={styles.recReason}>{rec.reason}</p>
                            </div>
                            <div style={styles.recArrow}>→</div>
                        </Motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Next Steps */}
            {data.nextSteps && data.nextSteps.length > 0 && (
                <div style={styles.nextSteps}>
                    <h4 style={styles.nextTitle}>📋 Next Steps</h4>
                    <ul style={styles.stepsList}>
                        {data.nextSteps.map((step, idx) => (
                            <li key={idx} style={styles.step}>{step}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Strong Areas */}
            {data.strongAreas && data.strongAreas.length > 0 && (
                <div style={styles.strongSection}>
                    <span style={styles.strongTitle}>💪 Strong Areas</span>
                    <div style={styles.strongList}>
                        {data.strongAreas.map((strong, idx) => (
                            <span key={idx} style={styles.strongBadge}>
                                {strong.topic} ({strong.avgScore}%)
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <style>{spinnerCSS}</style>
        </Motion.div>
    );
};

const spinnerCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const styles = {
    container: {
        background: 'rgba(30, 30, 50, 0.9)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(102, 126, 234, 0.3)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    title: {
        margin: 0,
        color: '#fff',
        fontSize: '18px'
    },
    refreshBtn: {
        background: 'transparent',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer'
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        padding: '40px 20px',
        color: '#888'
    },
    spinner: {
        width: '30px',
        height: '30px',
        border: '3px solid rgba(102, 126, 234, 0.3)',
        borderTop: '3px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    error: {
        color: '#f56565',
        textAlign: 'center',
        padding: '20px'
    },
    statsRow: {
        display: 'flex',
        gap: '20px',
        marginBottom: '15px'
    },
    stat: {
        background: 'rgba(102, 126, 234, 0.1)',
        padding: '10px 20px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    statValue: {
        color: '#667eea',
        fontSize: '24px',
        fontWeight: 'bold'
    },
    statLabel: {
        color: '#888',
        fontSize: '12px'
    },
    weakAlert: {
        background: 'rgba(245, 101, 101, 0.1)',
        border: '1px solid rgba(245, 101, 101, 0.3)',
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '15px'
    },
    weakTitle: {
        color: '#f56565',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    weakList: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: '8px'
    },
    weakBadge: {
        background: 'rgba(245, 101, 101, 0.2)',
        color: '#f56565',
        padding: '4px 10px',
        borderRadius: '15px',
        fontSize: '12px'
    },
    recsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    recCard: {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        padding: '12px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    recIcon: {
        fontSize: '24px'
    },
    recContent: {
        flex: 1
    },
    recTopic: {
        margin: 0,
        color: '#fff',
        fontSize: '15px'
    },
    recReason: {
        margin: 0,
        color: '#888',
        fontSize: '12px'
    },
    recArrow: {
        color: '#667eea',
        fontSize: '18px'
    },
    nextSteps: {
        marginTop: '20px',
        padding: '15px',
        background: 'rgba(72, 187, 120, 0.1)',
        borderRadius: '10px'
    },
    nextTitle: {
        margin: '0 0 10px 0',
        color: '#48bb78',
        fontSize: '14px'
    },
    stepsList: {
        margin: 0,
        paddingLeft: '20px'
    },
    step: {
        color: '#ddd',
        fontSize: '13px',
        marginBottom: '5px'
    },
    strongSection: {
        marginTop: '15px'
    },
    strongTitle: {
        color: '#48bb78',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    strongList: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: '8px'
    },
    strongBadge: {
        background: 'rgba(72, 187, 120, 0.2)',
        color: '#48bb78',
        padding: '4px 10px',
        borderRadius: '15px',
        fontSize: '12px'
    }
};

export default Recommendations;
