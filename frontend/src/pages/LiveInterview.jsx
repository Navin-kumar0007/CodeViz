import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API as axios } from '../utils/api';
import API_BASE from '../utils/api';
import CodeEditor from '../components/Editor/CodeEditor';
import Canvas from '../components/Visualizer/Canvas';

const LiveInterview = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
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
                <div style={S.timer}>⏱ 45:00 REMAINING <span style={{fontSize:'10px', color:'var(--accent-red)', marginLeft:'10px'}}>🔴 REC</span></div>
                <div style={S.title}>CODE_VIZ <span style={{color:'var(--text-muted)'}}>{'//'} LIVE_ASSESSMENT</span></div>
                <button onClick={submitSession} className="btn-primary" style={S.submitBtn}>[ SUBMIT_SESSION ]</button>
            </header>

            <div style={S.main}>
                <div style={S.problemPane}>
                    <h2 style={S.probTitle}>Binary Search Implementation</h2>
                    <p style={S.probDesc}>Implement a function that performs a binary search on a sorted array. Return the index of the target or -1 if not found.</p>
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
    visualizerPane: { width: '35%', overflow: 'hidden', background: 'var(--bg-surface)' }
};

export default LiveInterview;
