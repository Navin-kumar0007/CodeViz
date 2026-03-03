import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5001/api/ai';

/**
 * InlineErrorHint - Shows AI explanation directly below error messages
 * Props:
 *   - error: The error message string
 *   - code: The code that caused the error
 *   - language: Programming language (python, javascript, etc.)
 */
const InlineErrorHint = ({ error, code, language = 'python' }) => {
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);

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

    useEffect(() => {
        // Reset when error changes
        if (error && error !== explanation?.forError) {
            setDismissed(false);
            fetchExplanation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

    const fetchExplanation = async () => {
        if (!error || loading) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/explain-error`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ code, error, language })
            });

            const data = await res.json();
            if (data.explanation) {
                setExplanation({
                    text: data.explanation,
                    forError: error
                });
            }
        } catch (err) {
            console.error('Failed to fetch AI explanation:', err);
        } finally {
            setLoading(false);
        }
    };

    // Don't render if no error, dismissed, or no explanation
    if (!error || dismissed) return null;

    return (
        <AnimatePresence>
            <Motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={styles.container}
            >
                {/* Header */}
                <div style={styles.header}>
                    <span style={styles.icon}>💡</span>
                    <span style={styles.title}>AI Tutor Hint</span>
                    <button
                        onClick={() => setDismissed(true)}
                        style={styles.dismissBtn}
                        title="Dismiss"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {loading ? (
                        <div style={styles.loading}>
                            <span style={styles.spinner}></span>
                            <span>Analyzing error...</span>
                        </div>
                    ) : explanation ? (
                        <Motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={styles.explanation}
                        >
                            {explanation.text}
                        </Motion.p>
                    ) : (
                        <button onClick={fetchExplanation} style={styles.retryBtn}>
                            🔄 Get AI Help
                        </button>
                    )}
                </div>

                {/* Inline CSS for spinner */}
                <style>{`
                    @keyframes inlineHintSpin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </Motion.div>
        </AnimatePresence>
    );
};

const styles = {
    container: {
        marginTop: '10px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1))',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderBottom: '1px solid rgba(102, 126, 234, 0.2)'
    },
    icon: {
        fontSize: '16px',
        marginRight: '8px'
    },
    title: {
        flex: 1,
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#667eea'
    },
    dismissBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '18px',
        cursor: 'pointer',
        padding: '0 5px'
    },
    content: {
        padding: '12px'
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#888',
        fontSize: '13px'
    },
    spinner: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid rgba(102, 126, 234, 0.3)',
        borderTop: '2px solid #667eea',
        borderRadius: '50%',
        animation: 'inlineHintSpin 1s linear infinite'
    },
    explanation: {
        margin: 0,
        color: '#e0e0e0',
        fontSize: '13px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap'
    },
    retryBtn: {
        background: 'rgba(102, 126, 234, 0.2)',
        border: '1px solid rgba(102, 126, 234, 0.4)',
        color: '#667eea',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px'
    }
};

export default InlineErrorHint;
