import React, { useState, useRef, useCallback } from 'react';

const SessionRecorder = ({ code, language, onCodeChange, isVisible = true }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const eventsRef = useRef([]);
    const startTimeRef = useRef(null);
    const timerRef = useRef(null);
    const keystrokesRef = useRef(0);
    const executionsRef = useRef(0);

    const formatTime = (ms) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const addEvent = useCallback((type, data) => {
        if (!isRecording || isPaused) return;
        const timestamp = Date.now() - startTimeRef.current;
        eventsRef.current.push({ timestamp, type, data });
    }, [isRecording, isPaused]);

    const startRecording = () => {
        eventsRef.current = [];
        startTimeRef.current = Date.now();
        keystrokesRef.current = 0;
        executionsRef.current = 0;
        setIsRecording(true);
        setIsPaused(false);
        setElapsed(0);

        // Add initial code snapshot
        eventsRef.current.push({
            timestamp: 0,
            type: 'code-change',
            data: { code: code || '', language }
        });

        timerRef.current = setInterval(() => {
            setElapsed(Date.now() - startTimeRef.current);
        }, 100);
    };

    const pauseRecording = () => {
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
        addEvent('marker', { label: 'Paused' });
    };

    const resumeRecording = () => {
        setIsPaused(false);
        timerRef.current = setInterval(() => {
            setElapsed(Date.now() - startTimeRef.current);
        }, 100);
        addEvent('marker', { label: 'Resumed' });
    };

    const stopRecording = () => {
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);

        // Add final snapshot
        addEvent('code-change', { code: code || '', language });

        return {
            events: eventsRef.current,
            duration: elapsed,
            metadata: {
                totalKeystrokes: keystrokesRef.current,
                totalExecutions: executionsRef.current,
                finalCode: code || '',
                eventCount: eventsRef.current.length
            }
        };
    };

    // Called by parent when code changes
    const recordCodeChange = useCallback((newCode) => {
        keystrokesRef.current++;
        addEvent('code-change', { code: newCode, language });
    }, [addEvent, language]);

    // Called by parent after execution
    const recordExecution = useCallback((output, error) => {
        executionsRef.current++;
        addEvent('execution', { output, error });
    }, [addEvent]);

    // Expose methods to parent
    React.useImperativeHandle && React.useEffect(() => {
        if (onCodeChange) {
            // Parent can call recorder methods
            window.__sessionRecorder = {
                recordCodeChange,
                recordExecution,
                addEvent,
            };
        }
        return () => { delete window.__sessionRecorder; };
    }, [recordCodeChange, recordExecution, addEvent, onCodeChange]);

    if (!isVisible) return null;

    return (
        <div style={styles.container}>
            <div style={styles.indicator}>
                {isRecording && (
                    <span style={{
                        ...styles.dot,
                        animation: isPaused ? 'none' : 'recPulse 1s ease-in-out infinite'
                    }} />
                )}
                <span style={styles.label}>
                    {isRecording ? (isPaused ? '⏸ Paused' : '🔴 Recording') : '🎥 Ready'}
                </span>
                <span style={styles.timer}>{formatTime(elapsed)}</span>
            </div>

            <div style={styles.controls}>
                {!isRecording ? (
                    <button onClick={startRecording} style={{ ...styles.btn, ...styles.btnStart }}>
                        ⏺ Start
                    </button>
                ) : (
                    <>
                        {isPaused ? (
                            <button onClick={resumeRecording} style={{ ...styles.btn, ...styles.btnResume }}>
                                ▶ Resume
                            </button>
                        ) : (
                            <button onClick={pauseRecording} style={{ ...styles.btn, ...styles.btnPause }}>
                                ⏸ Pause
                            </button>
                        )}
                        <button onClick={() => {
                            const data = stopRecording();
                            if (onCodeChange) onCodeChange(data);
                        }} style={{ ...styles.btn, ...styles.btnStop }}>
                            ⏹ Stop & Save
                        </button>
                    </>
                )}
            </div>

            {isRecording && (
                <div style={styles.stats}>
                    <span>⌨ {keystrokesRef.current}</span>
                    <span>🚀 {executionsRef.current}</span>
                    <span>📝 {eventsRef.current.length} events</span>
                </div>
            )}

            <style>{`
                @keyframes recPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        background: 'var(--bg-surface)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        fontSize: '13px',
    },
    indicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#E06C75',
        display: 'inline-block',
    },
    label: {
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-code)',
        fontSize: '12px',
    },
    timer: {
        fontFamily: 'var(--font-code)',
        color: 'var(--accent-blue)',
        fontWeight: 700,
        fontSize: '14px',
        minWidth: '50px',
    },
    controls: {
        display: 'flex',
        gap: '6px',
    },
    btn: {
        border: 'none',
        borderRadius: '6px',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        transition: 'var(--transition-fast)',
    },
    btnStart: {
        background: 'linear-gradient(135deg, #E06C75, #C678DD)',
        color: '#fff',
    },
    btnPause: {
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
    },
    btnResume: {
        background: 'var(--accent-green)',
        color: '#1E1E2E',
    },
    btnStop: {
        background: 'var(--accent-red)',
        color: '#fff',
    },
    stats: {
        display: 'flex',
        gap: '12px',
        color: 'var(--text-muted)',
        fontSize: '11px',
        fontFamily: 'var(--font-code)',
        marginLeft: 'auto',
    },
};

export default SessionRecorder;
