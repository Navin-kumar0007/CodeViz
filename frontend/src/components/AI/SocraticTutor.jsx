import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API as axios } from '../../utils/api';
import API_BASE from '../../utils/api';

/**
 * 🤖 Socratic Tutor Component
 * Provides interactive, question-based hints to guide students.
 */
const SocraticTutor = ({ code, language, error, executionState, isVisible, onDismiss, onAiHighlight }) => {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [requestCount, setRequestCount] = useState(0); 
    const lastFetchedState = useRef({ code: '', error: '' }); // 🔥 Prevent redundant fetches

    const fetchTutorQuestion = useCallback(async (forcedCount = null) => {
        if (!code && !error) return; 
        
        setLoading(true);
        try {
            const stored = JSON.parse(localStorage.getItem('userInfo'));
            const skillLevel = localStorage.getItem('skillLevel') || 'beginner';
            const teachingStyle = localStorage.getItem('teachingStyle') || 'standard';

            const res = await axios.post(`${API_BASE}/api/ai/tutor`, {
                code, 
                language, 
                error, 
                executionState,
                skillLevel,
                teachingStyle,
                isRetry: (forcedCount || requestCount) > 0,
                requestCount: (forcedCount !== null ? forcedCount : requestCount)
            }, {
                headers: { Authorization: `Bearer ${stored?.token}` }
            });
            
            if (res.data && res.data.question) {
                setQuestion(res.data.question);
                if (res.data.lineNumber && onAiHighlight) {
                    onAiHighlight(res.data.lineNumber);
                }
            } else {
                throw new Error("No question returned");
            }
        } catch (err) {
            console.error("Tutor Fetch Error:", err);
            setQuestion("Looking at your current code and the state of your variables, what do you think is the next logical step to resolve this?");
        } finally {
            setLoading(false);
        }
    }, [code, language, error, executionState, requestCount, onAiHighlight]);

    useEffect(() => {
        // Only fetch if visible AND (no question OR code/error changed significantly)
        const stateChanged = lastFetchedState.current.code !== code || lastFetchedState.current.error !== error;

        if (isVisible && (!question || stateChanged)) {
            fetchTutorQuestion();
            lastFetchedState.current = { code, error };
        }
    }, [isVisible, code, error, question, fetchTutorQuestion]);

    const handleNewQuestion = () => {
        const nextCount = requestCount + 1;
        setRequestCount(nextCount);
        fetchTutorQuestion(nextCount); // 🔥 Pass immediately to avoid state lag
    };

    const speakQuestion = () => {
        if (!question) return;
        
        // Stop any current speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(question);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    style={S.bubble}
                >
                    <div style={S.header}>
                        <span style={S.botIcon}>🤖</span>
                        <span style={S.title}>Socratic Tutor</span>
                        <button onClick={onDismiss} style={S.closeBtn}>✕</button>
                    </div>

                    <div style={S.content}>
                        {loading ? (
                            <div style={S.loading}>Thinking... 💭</div>
                        ) : (
                            <>
                                <p style={S.question}>&quot;{question}&quot;</p>
                                <div style={S.footer}>
                                    <button 
                                        onClick={speakQuestion} 
                                        style={{...S.actionBtn, background: isSpeaking ? '#ff3366' : '#a45afe'}}
                                    >
                                        {isSpeaking ? '🛑 Stop' : '🔊 Read Aloud'}
                                    </button>
                                    <button onClick={handleNewQuestion} style={S.actionBtn}>🔄 New Question</button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const S = {
    bubble: {
        position: 'absolute',
        bottom: '80px',
        right: '20px',
        width: '300px',
        background: 'var(--bg-white)',
        border: '1px solid #a45afe',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(164, 90, 254, 0.3)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        overflow: 'hidden'
    },
    header: {
        background: 'rgba(164, 90, 254, 0.1)',
        padding: '10px 15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid rgba(164, 90, 254, 0.2)'
    },
    botIcon: { fontSize: '18px' },
    title: { fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#a45afe' },
    closeBtn: { marginLeft: 'auto', background: 'transparent', border: 'none', color: '#8890b5', cursor: 'pointer', fontSize: '14px' },
    content: { padding: '20px' },
    loading: { color: '#8890b5', fontSize: '14px', fontStyle: 'italic', textAlign: 'center' },
    question: { color: 'var(--text-primary)', fontSize: '15px', lineHeight: '1.6', margin: '0 0 20px 0', fontStyle: 'italic', fontWeight: '500' },
    footer: { display: 'flex', gap: '10px' },
    actionBtn: { flex: 1, background: '#a45afe', color: 'var(--text-primary)', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }
};

export default SocraticTutor;
