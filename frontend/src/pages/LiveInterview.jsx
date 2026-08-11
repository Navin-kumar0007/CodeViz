import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API as axios } from '../utils/api';
import API_BASE from '../utils/api';
import CodeEditor from '../components/Editor/CodeEditor';
import Canvas from '../components/Visualizer/Canvas';

// Speak the interviewer's line aloud (Web Speech API). Feature-detected — a graceful
// no-op on browsers without speechSynthesis, so it never breaks the interview.
const speak = (text, enabled) => {
    if (!enabled || typeof window === 'undefined' || !window.speechSynthesis || !text) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.02; u.pitch = 1; u.lang = 'en-US';
        window.speechSynthesis.speak(u);
    } catch { /* TTS unsupported */ }
};

const LiveInterview = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [voiceOn, setVoiceOn] = useState(() => {
        try { return localStorage.getItem('interviewVoice') !== 'off'; } catch { return true; }
    });
    const [code, setCode] = useState('');
    const problems = [];
    const currentProblem = 0;
    const [traceData, setTraceData] = useState([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [heatmapData, setHeatmapData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const recordingRef = useRef([]); // 🔴 PROOF-OF-WORK RECORDER
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${user?.token}` } }), [user?.token]);

    const TOTAL = 45 * 60; // 45-minute round
    const [remaining, setRemaining] = useState(TOTAL);
    const [msgs, setMsgs] = useState([]);
    const [asking, setAsking] = useState(false);
    const mmss = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
    const lowTime = remaining <= 300;

    const fetchSession = useCallback(async () => {
        try {
            // In a real app, this would be a public or invite-token-protected route
            await axios.get(`${API_BASE}/api/interview/stats`, authHeaders); // Mocking session fetch
            // For now, we'll assume the session is active
        } catch {
            // Silently ignore or handle
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchSession();
    }, [sessionId, fetchSession]);

    const recordStruggle = async (type) => {
        try {
            await axios.post(`${API_BASE}/api/interview/record-struggle/${sessionId}`, {
                problemId: problems[currentProblem]?.id || 'p1',
                type
            }, authHeaders);
        } catch {
            // Failed to record struggle
        }
    };

    const recordEvent = (type, data) => {
        recordingRef.current.push({
            timestamp: Date.now(),
            type,
            data
        });
    };

    const submitSession = async () => {
        try {
            // POST the full "Algorithm Protocol" replay payload to the backend
            await axios.post(`${API_BASE}/api/interview/session/${sessionId}/replay`, {
                eventLog: recordingRef.current
            }, authHeaders);
            alert("Proof-of-Work Session Submitted Successfully!");
            navigate('/interview-dashboard');
        } catch {
            alert("Failed to submit session.");
        }
    };

    // AI interviewer turn — greeting / hint / probing question.
    const askInterviewer = useCallback(async (kind) => {
        setAsking(true);
        try {
            const { data } = await axios.post(`${API_BASE}/api/interview/${sessionId}/interviewer`,
                { code, language: 'python', kind, problemTitle: 'Binary Search Implementation' }, authHeaders);
            setMsgs((m) => [...m, { role: 'interviewer', text: data.message }]);
            speak(data.message, voiceOn);
        } catch { /* ignore */ }
        setAsking(false);
    }, [sessionId, code, authHeaders, voiceOn]);

    // Stop any speech when leaving the interview.
    useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } }, []);

    // Greeting once on mount.
    useEffect(() => {
        askInterviewer('greet');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Real countdown — auto-submits when it hits zero.
    useEffect(() => {
        const id = setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) { clearInterval(id); submitSession(); return 0; }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const runCode = async () => {
        setIsLoading(true);
        recordStruggle('execution');
        recordEvent('run_execution', { code });
        try {
            const res = await axios.post(`${API_BASE}/run`, {
                language: 'python',
                code
            }, authHeaders);
            setTraceData(res.data.trace || []);
            setHeatmapData(res.data.heatmap || {});
            setStepIndex(0);
        } catch {
            alert("Execution failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={S.container}>
            <header style={S.header}>
                <div style={{ ...S.timer, color: lowTime ? '#ef4444' : 'var(--cz-accent)' }}>⏱ {mmss} REMAINING <span style={{fontSize:'10px', color:'#ef4444', marginLeft:'10px'}}>🔴 REC</span></div>
                <div style={S.title}>CODE_VIZ <span style={{color:'var(--text-muted)'}}>{'//'} LIVE_ASSESSMENT</span></div>
                <button onClick={submitSession} className="btn-primary" style={S.submitBtn}>[ SUBMIT_SESSION ]</button>
            </header>

            <div style={S.main}>
                <div style={S.problemPane}>
                    <h2 style={S.probTitle}>Binary Search Implementation</h2>
                    <p style={S.probDesc}>Implement a function that performs a binary search on a sorted array. Return the index of the target or -1 if not found.</p>

                    {/* 🎙️ AI Interviewer */}
                    <div style={S.interviewer}>
                        <div style={{ ...S.interviewerHead, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>🎙️ Interviewer</span>
                            <button
                                onClick={() => setVoiceOn((v) => {
                                    const next = !v;
                                    try { localStorage.setItem('interviewVoice', next ? 'on' : 'off'); } catch { /* noop */ }
                                    if (!next) { try { window.speechSynthesis?.cancel(); } catch { /* noop */ } }
                                    return next;
                                })}
                                title={voiceOn ? 'Mute interviewer voice' : 'Unmute interviewer voice'}
                                aria-label={voiceOn ? 'Mute interviewer voice' : 'Unmute interviewer voice'}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: voiceOn ? 1 : 0.45 }}
                            >
                                {voiceOn ? '🔊' : '🔇'}
                            </button>
                        </div>
                        <div style={S.chat}>
                            {msgs.length === 0 && <div style={S.chatMuted}>Your interviewer will speak here…</div>}
                            {msgs.map((m, i) => (
                                <div key={i} style={S.bubble}>{m.text}</div>
                            ))}
                            {asking && <div style={S.chatMuted}>…thinking</div>}
                        </div>
                        <div style={S.interviewerBtns}>
                            <button onClick={() => askInterviewer('hint')} disabled={asking} style={S.iBtn}>💡 Ask for a hint</button>
                            <button onClick={() => askInterviewer('probe')} disabled={asking} style={S.iBtn}>🗣 Explain my approach</button>
                        </div>
                    </div>
                </div>

                <div style={S.editorPane}>
                    <CodeEditor 
                        code={code} 
                        setCode={(newCode) => {
                            setCode(newCode);
                            recordEvent('code_change', { codeLength: newCode.length });
                        }} 
                        language="python" 
                        heatmapData={heatmapData}
                        activeLine={traceData[stepIndex]?.line || 0}
                    />
                    <div style={S.editorFooter}>
                        <button onClick={runCode} disabled={isLoading} className="btn-secondary" style={S.runBtn}>
                            {isLoading ? 'RUNNING...' : '▶ RUN & RECORD'}
                        </button>
                    </div>
                </div>

                <div style={S.visualizerPane}>
                    <Canvas 
                        traceData={traceData} 
                        stepIndex={stepIndex} 
                        setStepIndex={(idx) => {
                            if (idx < stepIndex) recordStruggle('backtrack');
                            setStepIndex(idx);
                            recordEvent('timeline_scrub', { targetStep: idx });
                        }} 
                    />
                </div>
            </div>
        </div>
    );
};

const S = {
    container: { height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)', color: 'var(--text-primary)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' },
    timer: { color: 'var(--accent-red)', fontWeight: 'bold', fontFamily: 'var(--font-code)', fontSize: '13px' },
    title: { fontSize: '16px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '1px' },
    submitBtn: { padding: '8px 16px', fontSize: '11px', fontFamily: 'var(--font-code)' },
    main: { flex: 1, display: 'flex', overflow: 'hidden' },
    problemPane: { width: '25%', padding: '24px', borderRight: '1px solid var(--border-color)', overflowY: 'auto', background: 'var(--bg-surface)' },
    probTitle: { fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 600 },
    probDesc: { color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '13px' },
    editorPane: { width: '40%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)', background: '#0a0a0a' },
    editorFooter: { padding: '12px 24px', background: 'var(--bg-app)', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)' },
    runBtn: { padding: '8px 20px', fontSize: '11px', fontFamily: 'var(--font-code)' },
    visualizerPane: { width: '35%', overflow: 'hidden', background: 'var(--bg-surface)' },
    interviewer: { marginTop: 24, borderTop: '1px solid var(--cz-line)', paddingTop: 16 },
    interviewerHead: { fontSize: 13, fontWeight: 800, color: 'var(--cz-accent)', marginBottom: 10 },
    chat: { display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', marginBottom: 12 },
    chatMuted: { fontSize: 12, color: 'var(--cz-faint)', fontStyle: 'italic' },
    bubble: { fontSize: 13, lineHeight: 1.5, color: 'var(--cz-text)', background: 'var(--cz-elevated)', border: '1px solid var(--cz-line)', borderRadius: 10, padding: '9px 12px' },
    interviewerBtns: { display: 'flex', flexDirection: 'column', gap: 8 },
    iBtn: { padding: '8px 12px', fontSize: 12, fontWeight: 700, textAlign: 'left', cursor: 'pointer', borderRadius: 9, border: '1px solid var(--cz-line)', background: 'transparent', color: 'var(--cz-text)', fontFamily: 'inherit' }
};

export default LiveInterview;
