import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import CodeDiffViewer from './CodeDiffViewer';

const API_URL = 'http://localhost:5001/api/ai';

const AIAssistant = ({ code, language = 'python', error = null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [activeTab, setActiveTab] = useState('hint');
    const [autoTriggered, setAutoTriggered] = useState(false);
    const [skillLevel, setSkillLevel] = useState('beginner');
    const [eli5Mode, setEli5Mode] = useState(() => {
        try { return localStorage.getItem('codeviz_eli5') === 'true'; } catch { return false; }
    });
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [copied, setCopied] = useState(false);
    const [diffData, setDiffData] = useState(null);
    const typingRef = useRef(null);
    const responseAreaRef = useRef(null);

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

    // 🎬 Typing animation effect
    const startTypingAnimation = useCallback((text) => {
        if (typingRef.current) clearInterval(typingRef.current);
        setDisplayedText('');
        setIsTyping(true);

        let i = 0;
        typingRef.current = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typingRef.current);
                typingRef.current = null;
                setIsTyping(false);
            }
        }, 12);
    }, []);

    // Cleanup typing interval on unmount
    useEffect(() => {
        return () => {
            if (typingRef.current) clearInterval(typingRef.current);
        };
    }, []);

    const makeRequest = async (endpoint, body) => {
        setLoading(true);
        setResponse(null);
        setDisplayedText('');
        setCopied(false);
        setDiffData(null);

        try {
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ ...body, skillLevel, teachingStyle: eli5Mode ? 'eli5' : 'standard' })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'AI request failed');
            }

            setResponse(data);

            // Start typing animation for the response text
            const text = data.hint || data.explanation || data.suggestions || data.review;
            if (text) {
                startTypingAnimation(text);
            }
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
        // Use optimize-diff for structured diff output
        setLoading(true);
        setResponse(null);
        setDisplayedText('');
        setCopied(false);
        setDiffData(null);

        const doOptimize = async () => {
            try {
                const token = getToken();
                const res = await fetch(`${API_URL}/optimize-diff`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ code, language, skillLevel, teachingStyle: eli5Mode ? 'eli5' : 'standard' })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'AI request failed');

                if (data.diff && data.diff.optimizedCode) {
                    setDiffData(data.diff);
                    setResponse(data);
                } else {
                    // Fallback to text response
                    setResponse({ suggestions: data.diff?.raw || 'Could not parse optimization.' });
                    startTypingAnimation(data.diff?.raw || 'Could not parse optimization.');
                }
            } catch (err) {
                setResponse({ error: err.message });
            } finally {
                setLoading(false);
            }
        };
        doOptimize();
    };

    const handleReview = () => {
        setActiveTab('review');
        makeRequest('review', { code, language });
    };

    // 📋 Copy to clipboard
    const handleCopy = async () => {
        const text = response?.hint || response?.explanation || response?.suggestions || response?.review;
        if (text) {
            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    };

    // 🚨 AUTO-TRIGGER: Open panel and explain error when error prop changes
    useEffect(() => {
        if (error && error !== 'No error detected' && !autoTriggered) {
            setIsOpen(true);
            setActiveTab('error');
            setAutoTriggered(true);
            makeRequest('explain-error', { code, error, language });
        }
        if (!error) {
            setAutoTriggered(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

    // 📝 Simple markdown-like rendering
    const renderFormattedText = (text) => {
        if (!text) return null;

        const lines = text.split('\n');
        return lines.map((line, i) => {
            // Bold text: **text**
            let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Inline code: `code`
            formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:rgba(102,126,234,0.2);padding:2px 6px;border-radius:4px;font-size:12px;color:#a5b4fc">$1</code>');
            // Bullet points
            if (formatted.startsWith('- ') || formatted.startsWith('* ')) {
                formatted = '• ' + formatted.slice(2);
            }

            return (
                <span key={i}>
                    <span dangerouslySetInnerHTML={{ __html: formatted }} />
                    {i < lines.length - 1 && <br />}
                </span>
            );
        });
    };

    const renderResponse = () => {
        if (loading) {
            return (
                <div style={styles.loading}>
                    <div style={styles.thinkingDots}>
                        <span style={{ ...styles.dot, animationDelay: '0s' }}>●</span>
                        <span style={{ ...styles.dot, animationDelay: '0.2s' }}>●</span>
                        <span style={{ ...styles.dot, animationDelay: '0.4s' }}>●</span>
                    </div>
                    <span>Thinking...</span>
                </div>
            );
        }

        if (!response) {
            return (
                <div style={styles.placeholder}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧠</div>
                    Select an action above to get AI assistance
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

        // If we have diff data, show the CodeDiffViewer
        if (diffData && activeTab === 'optimize') {
            return (
                <CodeDiffViewer
                    diff={diffData}
                    originalCode={code}
                    onApply={(optimizedCode) => {
                        // If parent provided a way to update code, use it
                        // For now, copy to clipboard
                        navigator.clipboard.writeText(optimizedCode);
                        alert('Optimized code copied to clipboard!');
                    }}
                    onClose={() => setDiffData(null)}
                />
            );
        }

        return (
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.responseContainer}
            >
                {/* Response Text */}
                <div style={styles.responseText} ref={responseAreaRef}>
                    {renderFormattedText(displayedText)}
                    {isTyping && <span style={styles.cursor}>▊</span>}
                </div>

                {/* Copy Button */}
                {!isTyping && displayedText && (
                    <Motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleCopy}
                        style={styles.copyBtn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {copied ? '✅ Copied!' : '📋 Copy'}
                    </Motion.button>
                )}
            </Motion.div>
        );
    };

    const skillLevels = [
        { value: 'beginner', label: '🌱 Beginner', color: '#48bb78' },
        { value: 'intermediate', label: '🔥 Intermediate', color: '#ed8936' },
        { value: 'advanced', label: '⚡ Advanced', color: '#f56565' }
    ];

    return (
        <>
            {/* Floating Toggle Button */}
            <Motion.button
                onClick={() => setIsOpen(!isOpen)}
                style={styles.toggleButton}
                whileHover={{ scale: 1.1, boxShadow: '0 6px 30px rgba(102, 126, 234, 0.7)' }}
                whileTap={{ scale: 0.95 }}
                animate={error ? { scale: [1, 1.2, 1], transition: { repeat: 2, duration: 0.3 } } : {}}
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

                        {/* Skill Level Selector */}
                        <div style={styles.skillRow}>
                            {skillLevels.map(level => (
                                <button
                                    key={level.value}
                                    onClick={() => setSkillLevel(level.value)}
                                    style={{
                                        ...styles.skillBtn,
                                        background: skillLevel === level.value
                                            ? `${level.color}22`
                                            : 'transparent',
                                        borderColor: skillLevel === level.value
                                            ? level.color
                                            : 'rgba(255,255,255,0.1)',
                                        color: skillLevel === level.value
                                            ? level.color
                                            : '#888'
                                    }}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>

                        {/* 🧒 ELI5 Mode Toggle */}
                        <div style={styles.eli5Row}>
                            <button
                                onClick={() => {
                                    const next = !eli5Mode;
                                    setEli5Mode(next);
                                    try { localStorage.setItem('codeviz_eli5', String(next)); } catch (err) { console.warn('Failed to save to localStorage', err); }
                                }}
                                style={{
                                    ...styles.eli5Btn,
                                    background: eli5Mode
                                        ? 'linear-gradient(135deg, #f6ad55, #ed8936)'
                                        : 'rgba(255,255,255,0.05)',
                                    color: eli5Mode ? '#fff' : '#888',
                                    boxShadow: eli5Mode ? '0 2px 12px rgba(237, 137, 54, 0.4)' : 'none'
                                }}
                            >
                                {eli5Mode ? '🧒' : '🎓'} {eli5Mode ? 'ELI5 Mode ON' : 'Standard Mode'}
                            </button>
                            <span style={{ fontSize: '11px', color: '#666' }}>
                                {eli5Mode ? 'Using fun analogies & emojis!' : 'Click to switch to baby mode'}
                            </span>
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

            {/* Inline CSS for animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
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
        width: '400px',
        maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(20, 20, 35, 0.98)',
        borderRadius: '16px',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)'
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
    skillRow: {
        display: 'flex',
        gap: '6px',
        padding: '10px 15px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    skillBtn: {
        flex: 1,
        padding: '6px 8px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: 'transparent'
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
    thinkingDots: {
        display: 'flex',
        gap: '8px',
        fontSize: '20px'
    },
    dot: {
        animation: 'pulse 1.4s ease-in-out infinite',
        color: '#667eea'
    },
    responseContainer: {
        position: 'relative'
    },
    responseText: {
        color: '#e0e0e0',
        fontSize: '14px',
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '15px',
        borderRadius: '10px',
        wordBreak: 'break-word'
    },
    cursor: {
        color: '#667eea',
        animation: 'blink 0.8s step-end infinite',
        marginLeft: '2px'
    },
    copyBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '8px',
        padding: '6px 14px',
        background: 'rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '8px',
        color: '#a5b4fc',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginLeft: 'auto'
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
    },
    eli5Row: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 15px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    eli5Btn: {
        padding: '6px 14px',
        borderRadius: '20px',
        border: 'none',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap'
    }
};

export default AIAssistant;
