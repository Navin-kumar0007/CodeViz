import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import API from '../../utils/api';

const Recommendations = ({ onNavigate }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const userInfo = localStorage.getItem('userInfo');

            if (!userInfo) {
                setError('Please login to see recommendations');
                setLoading(false);
                return;
            }

            const res = await API.get('/api/recommendations');
            setData(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    if (loading) return (
        <div style={styles.loadingContainer}>
            <Motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={styles.spinner}
            />
        </div>
    );

    if (error) return (
        <div style={styles.errorContainer}>
            <span style={styles.errorIcon}>❌</span>
            <span style={styles.errorText}>{error}</span>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span style={styles.title}>Recommended Nodes</span>
                <span style={styles.subtitle}>Based on your neural pattern</span>
            </div>

            <div style={styles.grid}>
                <AnimatePresence>
                    {data?.recommendations?.map((item, idx) => (
                        <Motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            onClick={() => onNavigate(item.path)}
                            style={styles.card}
                        >
                            <div style={styles.cardGlow} />
                            <div style={styles.nodeType}>{item.type}</div>
                            <div style={styles.nodeTitle}>{item.title}</div>
                            <div style={styles.nodeDesc}>{item.description}</div>
                            <div style={styles.reasonBadge}>
                                {item.reason}
                            </div>
                        </Motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        width: '100%',
    },
    header: {
        marginBottom: '20px',
    },
    title: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'var(--cz-text)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    subtitle: {
        fontSize: '11px',
        color: 'var(--cz-muted)',
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
    },
    card: {
        background: 'var(--cz-elevated)',
        border: '1px solid var(--cz-line)',
        padding: '15px',
        borderRadius: '6px',
        width: 'calc(50% - 8px)',
        minWidth: '200px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
    },
    nodeType: {
        fontSize: '10px',
        color: 'var(--cz-accent)',
        fontWeight: 'bold',
        marginBottom: '5px',
        textTransform: 'uppercase',
    },
    nodeTitle: {
        fontSize: '13px',
        fontWeight: 'bold',
        color: 'var(--cz-text)',
        marginBottom: '5px',
    },
    nodeDesc: {
        fontSize: '11px',
        color: 'var(--cz-muted)',
        marginBottom: '10px',
        lineHeight: '1.4',
    },
    reasonBadge: {
        display: 'inline-block',
        fontSize: '9px',
        background: 'rgba(0, 245, 255, 0.1)',
        padding: '2px 8px',
        borderRadius: '10px',
        color: 'var(--cz-accent)',
    },
    loadingContainer: {
        height: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        width: '30px',
        height: '30px',
        border: '2px solid var(--cz-line)',
        borderTopColor: 'var(--cz-accent)',
        borderRadius: '50%',
    },
    errorContainer: {
        padding: '30px',
        textAlign: 'center',
        background: 'var(--cz-elevated)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 0, 0, 0.2)',
        margin: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
    },
    errorIcon: {
        fontSize: '24px',
    },
    errorText: {
        color: 'var(--cz-muted)',
        fontSize: '13px',
    }
};

export default Recommendations;
