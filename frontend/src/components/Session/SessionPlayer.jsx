import React, { useState, useRef, useEffect, useCallback } from 'react';

const SessionPlayer = ({ session, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [currentCode, setCurrentCode] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');
    const [eventIndex, setEventIndex] = useState(0);
    const timerRef = useRef(null);
    const lastTickRef = useRef(null);

    const events = session?.events || [];
    const duration = session?.duration || 0;

    // Reset on new session
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentTime(0);
        setIsPlaying(false);
        setCurrentCode('');
        setCurrentOutput('');
        setEventIndex(0);
        if (events.length > 0 && events[0].type === 'code-change') {
            setCurrentCode(events[0].data?.code || '');
        }
    }, [session]);

    // Playback engine
    const tick = useCallback(() => {
        const now = Date.now();
        const delta = (now - lastTickRef.current) * speed;
        lastTickRef.current = now;

        setCurrentTime(prev => {
            const next = prev + delta;
            if (next >= duration) {
                setIsPlaying(false);
                return duration;
            }
            return next;
        });
    }, [speed, duration]);

    useEffect(() => {
        if (isPlaying) {
            lastTickRef.current = Date.now();
            timerRef.current = setInterval(tick, 50);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, tick]);

    // Process events as currentTime advances
    useEffect(() => {
        let idx = eventIndex;
        while (idx < events.length && events[idx].timestamp <= currentTime) {
            const evt = events[idx];
            if (evt.type === 'code-change' && evt.data?.code !== undefined) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCurrentCode(evt.data.code);
            } else if (evt.type === 'execution') {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCurrentOutput(evt.data?.output || evt.data?.error || '');
            }
            idx++;
        }
        if (idx !== eventIndex) setEventIndex(idx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTime, events, eventIndex]);

    const seek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = pct * duration;
        setCurrentTime(newTime);

        // Re-process all events up to this point
        let code = '';
        let output = '';
        let idx = 0;
        for (let i = 0; i < events.length; i++) {
            if (events[i].timestamp > newTime) break;
            if (events[i].type === 'code-change' && events[i].data?.code !== undefined) {
                code = events[i].data.code;
            } else if (events[i].type === 'execution') {
                output = events[i].data?.output || events[i].data?.error || '';
            }
            idx = i + 1;
        }
        setCurrentCode(code);
        setCurrentOutput(output);
        setEventIndex(idx);
    };

    const formatTime = (ms) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h3 style={styles.title}>🎬 {session?.title || 'Session Replay'}</h3>
                        <span style={styles.meta}>
                            {session?.language} • {formatTime(duration)} • {events.length} events
                        </span>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {/* Code Display */}
                    <div style={styles.codePanel}>
                        <div style={styles.panelHeader}>
                            <span>📝 Code</span>
                            <span style={styles.langBadge}>{session?.language}</span>
                        </div>
                        <pre style={styles.codeBlock}>
                            <code>{currentCode || '// Waiting for code...'}</code>
                        </pre>
                    </div>

                    {/* Output Display */}
                    <div style={styles.outputPanel}>
                        <div style={styles.panelHeader}>
                            <span>💻 Output</span>
                        </div>
                        <pre style={styles.outputBlock}>
                            {currentOutput || '// No output yet...'}
                        </pre>
                    </div>
                </div>

                {/* Controls */}
                <div style={styles.controls}>
                    <div style={styles.playbackRow}>
                        <button onClick={() => {
                            setCurrentTime(0);
                            setEventIndex(0);
                            setCurrentCode(events[0]?.data?.code || '');
                            setCurrentOutput('');
                        }} style={styles.ctrlBtn}>⏮</button>

                        <button onClick={() => setIsPlaying(!isPlaying)} style={{
                            ...styles.ctrlBtn,
                            ...styles.playBtn,
                            background: isPlaying
                                ? 'linear-gradient(135deg, var(--accent-yellow), var(--accent-orange))'
                                : 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))'
                        }}>
                            {isPlaying ? '⏸' : '▶'}
                        </button>

                        <div style={styles.speedGroup}>
                            {[0.5, 1, 2, 4].map(s => (
                                <button key={s} onClick={() => setSpeed(s)} style={{
                                    ...styles.speedBtn,
                                    ...(speed === s ? styles.speedActive : {})
                                }}>
                                    {s}x
                                </button>
                            ))}
                        </div>

                        <span style={styles.timeDisplay}>
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Seek Bar */}
                    <div style={styles.seekBar} onClick={seek}>
                        <div style={{ ...styles.seekProgress, width: `${progress}%` }}>
                            <div style={styles.seekHandle} />
                        </div>
                        {/* Event markers */}
                        {events.filter(e => e.type === 'execution').map((e, i) => (
                            <div key={i} style={{
                                ...styles.eventMarker,
                                left: `${(e.timestamp / duration) * 100}%`,
                                background: 'var(--accent-green)'
                            }} title="Execution" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        width: '90vw',
        maxWidth: '1200px',
        maxHeight: '90vh',
        background: 'var(--bg-primary)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
    },
    title: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--text-bright)',
    },
    meta: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-code)',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '6px',
    },
    content: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        background: 'var(--border-color)',
        flex: 1,
        overflow: 'hidden',
        minHeight: '300px',
    },
    codePanel: {
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
    },
    outputPanel: {
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
    },
    panelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
    },
    langBadge: {
        padding: '2px 8px',
        borderRadius: '4px',
        background: 'var(--bg-elevated)',
        color: 'var(--accent-blue)',
        fontSize: '11px',
        fontFamily: 'var(--font-code)',
    },
    codeBlock: {
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        margin: 0,
        fontFamily: 'var(--font-code)',
        fontSize: '13px',
        lineHeight: '1.6',
        color: 'var(--text-primary)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    outputBlock: {
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        margin: 0,
        fontFamily: 'var(--font-code)',
        fontSize: '13px',
        lineHeight: '1.6',
        color: 'var(--accent-green)',
        whiteSpace: 'pre-wrap',
    },
    controls: {
        padding: '16px 24px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
    },
    playbackRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
    },
    ctrlBtn: {
        width: '36px',
        height: '36px',
        border: 'none',
        borderRadius: '8px',
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playBtn: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        color: '#fff',
        fontSize: '18px',
    },
    speedGroup: {
        display: 'flex',
        gap: '4px',
        marginLeft: 'auto',
    },
    speedBtn: {
        padding: '4px 10px',
        border: 'none',
        borderRadius: '6px',
        background: 'var(--bg-surface)',
        color: 'var(--text-muted)',
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-code)',
    },
    speedActive: {
        background: 'var(--accent-blue)',
        color: '#1E1E2E',
    },
    timeDisplay: {
        fontFamily: 'var(--font-code)',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        fontWeight: 600,
    },
    seekBar: {
        position: 'relative',
        height: '8px',
        background: 'var(--bg-surface)',
        borderRadius: '4px',
        cursor: 'pointer',
        overflow: 'visible',
    },
    seekProgress: {
        height: '100%',
        background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
        borderRadius: '4px',
        position: 'relative',
        transition: 'width 50ms linear',
    },
    seekHandle: {
        position: 'absolute',
        right: '-6px',
        top: '-4px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: 'var(--accent-blue)',
        border: '2px solid var(--bg-secondary)',
        boxShadow: '0 0 6px rgba(97,218,251,0.5)',
    },
    eventMarker: {
        position: 'absolute',
        top: '-2px',
        width: '4px',
        height: '12px',
        borderRadius: '2px',
        opacity: 0.6,
    },
};

export default SessionPlayer;
