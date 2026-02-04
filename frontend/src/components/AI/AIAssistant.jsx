import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5001/api/ai';

const AIAssistant = ({ code, language = 'python', error = null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [activeTab, setActiveTab] = useState('hint');

    const getToken = () => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsed = JSON.parse(userInfo);
                return parsed.token;
            } catch {
                return null;
            }
        }
        return null;
    };

    const makeRequest = async (endpoint, body) => {
        setLoading(true);
        setResponse(null);

        try {
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'AI request failed');
            }

            setResponse(data);
        } catch (err) {
            setResponse({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleHint = () => {
        setActiveTab('hint');
        makeRequest('hint', { code, language });
    };

    const handleExplainError = () => {
        setActiveTab('error');
        makeRequest('explain-error', { code, error: error || 'No error detected', language });
    };

    const handleOptimize = () => {
        setActiveTab('optimize');
        makeRequest('optimize', { code, language });
    };

    const handleReview = () => {
        setActiveTab('review');
        makeRequest('review', { code, language });
    };

    const renderResponse = () => {
        if (loading) {
            return (
                <div style={styles.loading}>
                    <div style={styles.spinner}></div>
                    <span>Thinking...</span>
                </div>
            );
        }

        if (!response) {
            return (
                <div style={styles.placeholder}>
                    Click a button above to get AI assistance
                </div>
            );
        }

        if (response.error) {
            return (
                <div style={styles.error}>
                    ❌ {response.error}
                </div>
            );
        }

        const text = response.hint || response.explanation || response.suggestions || response.review;

        return (
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.responseText}
            >
                {text}
            </Motion.div>
        );
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <Motion.button
                onClick={() => setIsOpen(!isOpen)}
                style={styles.toggleButton}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                🤖
            </Motion.button>

            {/* AI Panel */}
            <AnimatePresence>
                {isOpen && (
                    <Motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        transition={{ type: 'spring', damping: 25 }}
                        style={styles.panel}
                    >
                        {/* Header */}
                        <div style={styles.header}>
                            <div style={styles.title}>
                                <span style={{ fontSize: '24px' }}>🤖</span>
                                <span>AI Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>×</button>
                        </div>

                        {/* Action Buttons */}
                        <div style={styles.buttonRow}>
                            <button
                                onClick={handleHint}
                                style={{ ...styles.actionBtn, background: activeTab === 'hint' ? '#667eea' : '#2d3748' }}
                                disabled={loading}
                            >
                                💡 Hint
                            </button>
                            <button
                                onClick={handleExplainError}
                                style={{ ...styles.actionBtn, background: activeTab === 'error' ? '#f56565' : '#2d3748' }}
                                disabled={loading}
                            >
                                ❓ Explain Error
                            </button>
                            <button
                                onClick={handleOptimize}
                                style={{ ...styles.actionBtn, background: activeTab === 'optimize' ? '#48bb78' : '#2d3748' }}
                                disabled={loading}
                            >
                                ⚡ Optimize
                            </button>
                            <button
                                onClick={handleReview}
                                style={{ ...styles.actionBtn, background: activeTab === 'review' ? '#ed8936' : '#2d3748' }}
                                disabled={loading}
                            >
                                📝 Review
                            </button>
                        </div>

                        {/* Response Area */}
                        <div style={styles.responseArea}>
                            {renderResponse()}
                        </div>

                        {/* Footer */}
                        <div style={styles.footer}>
                            <span>Powered by Gemini AI</span>
                            <span style={styles.rateLimit}>10 req/min</span>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* Inline CSS for spinner animation */}
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </>
    );
};

const styles = {
    toggleButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none',
        fontSize: '28px',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
        zIndex: 1000
    },
    panel: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '380px',
        maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(20, 20, 35, 0.98)',
        borderRadius: '16px',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999,
        overflow: 'hidden'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(102, 126, 234, 0.1)'
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '16px'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '24px',
        cursor: 'pointer'
    },
    buttonRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        padding: '15px'
    },
    actionBtn: {
        padding: '12px 10px',
        borderRadius: '10px',
        border: 'none',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    responseArea: {
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        minHeight: '200px',
        maxHeight: '400px'
    },
    placeholder: {
        color: '#666',
        textAlign: 'center',
        padding: '40px 20px',
        fontStyle: 'italic'
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        padding: '40px',
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
    responseText: {
        color: '#e0e0e0',
        fontSize: '14px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '15px',
        borderRadius: '10px'
    },
    error: {
        color: '#f56565',
        padding: '15px',
        background: 'rgba(245, 101, 101, 0.1)',
        borderRadius: '10px',
        textAlign: 'center'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '11px',
        color: '#666'
    },
    rateLimit: {
        background: 'rgba(102, 126, 234, 0.2)',
        padding: '2px 8px',
        borderRadius: '10px',
        color: '#667eea'
    }
};

export default AIAssistant;
