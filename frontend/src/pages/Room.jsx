import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import API_BASE from '../utils/api';
const Room = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('lobby'); // 'lobby' | 'live'

    // Lobby state
    const [roomName, setRoomName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [activeRooms, setActiveRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [selectedLang, setSelectedLang] = useState('python');

    // Live room state
    const [roomData, setRoomData] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [participants, setParticipants] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [lastEditor, setLastEditor] = useState('');
    const [showChat, setShowChat] = useState(true);

    // Battle state
    const [roomMode, setRoomMode] = useState('collaborate');
    const [battleState, setBattleState] = useState(null); // 'waiting' | 'countdown' | 'active' | 'finished'
    const [battleProblem, setBattleProblem] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [battleTimer, setBattleTimer] = useState(0);
    const [battleTimeLimit, setBattleTimeLimit] = useState(600);
    const [opponentProgress, setOpponentProgress] = useState({});
    const [battleResult, setBattleResult] = useState(null);
    const [battleDifficulty, setBattleDifficulty] = useState('medium');
    const [isHost, setIsHost] = useState(false);
    const [battleSubmitted, setBattleSubmitted] = useState(false);
    const [battleTestResults, setBattleTestResults] = useState(null); // { passedCount, totalCount, results: [] }

    const socketRef = useRef(null);
    const chatEndRef = useRef(null);
    const codeUpdateTimer = useRef(null);
    const battleTimerRef = useRef(null);

    const getUserInfo = () => {
        try {
            const info = localStorage.getItem('userInfo');
            return info ? JSON.parse(info) : null;
        } catch { return null; }
    };
    const user = getUserInfo();

    // Fetch active rooms on mount
    useEffect(() => {
        fetchActiveRooms();
        return () => disconnectSocket();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const fetchActiveRooms = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/rooms/active`, {
                headers: { 'Authorization': `Bearer ${user?.token}` }
            });
            if (res.ok) setActiveRooms(await res.json());
        } catch (err) {
            console.error('Fetch rooms error:', err);
        }
    };

    // ── REST: Create Room ──
    const handleCreateRoom = async () => {
        if (!roomName.trim()) { setError('Enter a room name'); return; }
        setError(''); setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ name: roomName.trim(), language: selectedLang, isPublic, mode: roomMode })
            });
            const data = await res.json();
            if (res.ok) {
                connectToRoom(data.roomCode);
            } else {
                setError(data.message || 'Failed to create room');
            }
        } catch { setError('Network error'); }
        finally { setLoading(false); }
    };

    // ── REST: Join Room ──
    const handleJoinRoom = async (codeInput) => {
        const roomCode = (codeInput || joinCode).trim().toUpperCase();
        if (!roomCode) { setError('Enter a room code'); return; }
        setError(''); setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/rooms/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ code: roomCode })
            });
            const data = await res.json();
            if (res.ok) {
                connectToRoom(roomCode);
            } else {
                setError(data.message || 'Failed to join room');
            }
        } catch { setError('Network error'); }
        finally { setLoading(false); }
    };

    // ── Socket: Connect ──
    const connectToRoom = (roomCode) => {
        if (socketRef.current) socketRef.current.disconnect();

        const socket = io(`${API_BASE}/room`, {
            auth: { token: user?.token }
        });

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join-room', roomCode);
        });

        socket.on('room-state', (state) => {
            setRoomData(state);
            setCode(state.code || '');
            setLanguage(state.language || 'python');
            setParticipants(state.participants || []);
            setChatMessages(state.chat || []);
            setRoomMode(state.mode || 'collaborate');
            setIsHost(state.host?._id === user?._id || state.host === user?._id);
            if (state.battle) {
                setBattleState(state.battle.status);
                setBattleProblem(state.battle.problem);
            }
            setView('live');
        });

        socket.on('code-sync', (data) => {
            setCode(data.code);
            setLastEditor(data.userName);
            setTimeout(() => setLastEditor(''), 2000);
        });

        socket.on('language-sync', (data) => {
            setLanguage(data.language);
        });

        socket.on('participants-update', (data) => {
            setParticipants(data.participants || []);
        });

        socket.on('chat-message', (msg) => {
            setChatMessages(prev => [...prev, msg]);
        });

        socket.on('user-joined', (data) => {
            setChatMessages(prev => [...prev, {
                userName: '🤖 System',
                message: `${data.userName} joined the room`,
                timestamp: new Date(),
                isSystem: true
            }]);
        });

        socket.on('user-left', (data) => {
            setChatMessages(prev => [...prev, {
                userName: '🤖 System',
                message: `${data.userName} left the room`,
                timestamp: new Date(),
                isSystem: true
            }]);
        });

        socket.on('error', (err) => setError(err.message));
        socket.on('disconnect', () => setIsConnected(false));

        // ── Battle Socket Listeners ──
        socket.on('battle-countdown', (data) => {
            setBattleState('countdown');
            setBattleProblem(data.problem);
            setCountdown(data.seconds);
            const countInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { clearInterval(countInterval); return 0; }
                    return prev - 1;
                });
            }, 1000);
        });

        socket.on('battle-active', (data) => {
            setBattleState('active');
            setCode(data.starterCode || '');
            setBattleTimeLimit(data.timeLimit);
            setBattleTimer(data.timeLimit);
            setBattleSubmitted(false);
            setBattleResult(null);

            // Start timer countdown
            if (battleTimerRef.current) clearInterval(battleTimerRef.current);
            battleTimerRef.current = setInterval(() => {
                setBattleTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(battleTimerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        });

        socket.on('battle-submission', (data) => {
            // If this is our own submission, store test case results
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            if (data.userId === userInfo?._id && data.testCaseResults) {
                setBattleTestResults({ passedCount: data.passedCount, totalCount: data.totalCount, results: data.testCaseResults });
            }
            setChatMessages(prev => [...prev, {
                userName: '🤖 Battle',
                message: data.testCaseResults
                    ? `${data.userName}: ${data.passedCount}/${data.totalCount} test cases passed ${data.correct ? '✅' : '❌'}`
                    : `${data.userName} submitted — ${data.correct ? '✅ Correct!' : '❌ Incorrect'}`,
                timestamp: new Date(),
                isSystem: true
            }]);
        });

        socket.on('battle-finished', (data) => {
            setBattleState('finished');
            setBattleResult(data);
            if (battleTimerRef.current) clearInterval(battleTimerRef.current);
        });

        socket.on('battle-opponent-progress', (data) => {
            setOpponentProgress(prev => ({ ...prev, [data.userId]: data }));
        });

        socketRef.current = socket;
    };

    const disconnectSocket = () => {
        if (socketRef.current) {
            socketRef.current.emit('leave-room');
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    const leaveRoom = () => {
        disconnectSocket();
        setView('lobby');
        setRoomData(null);
        setCode('');
        setChatMessages([]);
        setParticipants([]);
        fetchActiveRooms();
    };

    // ── Code editing with throttled sync ──
    const handleCodeChange = (e) => {
        const newCode = e.target.value;
        setCode(newCode);

        if (codeUpdateTimer.current) clearTimeout(codeUpdateTimer.current);
        codeUpdateTimer.current = setTimeout(() => {
            if (socketRef.current) {
                socketRef.current.emit('code-update', { code: newCode });
            }
        }, 150); // 150ms throttle
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        if (socketRef.current) {
            socketRef.current.emit('language-change', { language: lang });
        }
    };

    const sendChatMessage = () => {
        if (!chatInput.trim() || !socketRef.current) return;
        socketRef.current.emit('chat-message', { message: chatInput.trim() });
        setChatInput('');
    };

    const copyRoomCode = () => {
        if (roomData?.roomCode) {
            navigator.clipboard.writeText(roomData.roomCode);
        }
    };

    const LANGUAGES = [
        { value: 'python', label: '🐍 Python' },
        { value: 'javascript', label: '⚡ JavaScript' },
        { value: 'java', label: '☕ Java' },
        { value: 'cpp', label: '⚙️ C++' },
        { value: 'typescript', label: '📘 TypeScript' },
        { value: 'go', label: '🔵 Go' },
        { value: 'c', label: '🔷 C' }
    ];

    const COLORS = ['#667eea', '#f093fb', '#4fd1c5', '#f6ad55', '#fc8181', '#9f7aea', '#68d391', '#63b3ed', '#fbb6ce', '#b794f4'];

    // ────────────────────────────────────────
    // LOBBY VIEW
    // ────────────────────────────────────────
    if (view === 'lobby') {
        return (
            <div style={S.container}>
                <header style={S.header}>
                    <button onClick={() => navigate('/')} style={S.backBtn}>← Dashboard</button>
                    <h2 style={S.pageTitle}>🔗 Collaboration Room</h2>
                    <div style={{ width: 100 }} />
                </header>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={S.errorBanner}>
                        {error}
                        <button onClick={() => setError('')} style={S.dismissBtn}>×</button>
                    </motion.div>
                )}

                <div style={S.lobbyGrid}>
                    {/* Create Room Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={S.lobbyCard}>
                        <h3 style={S.cardTitle}>✨ Create a Room</h3>
                        <p style={S.cardDesc}>Start a coding session and invite friends</p>

                        <input
                            value={roomName}
                            onChange={e => setRoomName(e.target.value)}
                            placeholder="Room Name"
                            style={S.input}
                            maxLength={40}
                        />

                        <div style={S.langRow}>
                            {LANGUAGES.map(l => (
                                <button
                                    key={l.value}
                                    onClick={() => setSelectedLang(l.value)}
                                    style={{ ...S.langBtn, ...(selectedLang === l.value ? S.langBtnActive : {}) }}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>

                        {/* Mode Toggle */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <button
                                onClick={() => setRoomMode('collaborate')}
                                style={{ ...S.langBtn, flex: 1, ...(roomMode === 'collaborate' ? { background: '#667eea22', borderColor: '#667eea', color: '#667eea' } : {}) }}
                            >
                                🤝 Collaborate
                            </button>
                            <button
                                onClick={() => setRoomMode('battle')}
                                style={{ ...S.langBtn, flex: 1, ...(roomMode === 'battle' ? { background: '#f5656522', borderColor: '#f56565', color: '#f56565' } : {}) }}
                            >
                                ⚔️ Battle
                            </button>
                        </div>

                        <label style={S.toggleLabel}>
                            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={S.checkbox} />
                            {isPublic ? '🔓 Public room' : '🔒 Private room'}
                        </label>

                        <button onClick={handleCreateRoom} disabled={loading} style={S.primaryBtn}>
                            {loading ? 'Creating...' : '🚀 Create Room'}
                        </button>
                    </motion.div>

                    {/* Join Room Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={S.lobbyCard}>
                        <h3 style={S.cardTitle}>🔗 Join a Room</h3>
                        <p style={S.cardDesc}>Enter a 6-character code to join</p>

                        <div style={S.joinRow}>
                            <input
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="ABCD12"
                                style={{ ...S.input, letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
                                maxLength={6}
                                onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                            />
                            <button onClick={() => handleJoinRoom()} disabled={loading} style={S.primaryBtn}>
                                Join →
                            </button>
                        </div>

                        {/* Active Rooms */}
                        {activeRooms.length > 0 && (
                            <div style={S.activeSection}>
                                <h4 style={S.sectionLabel}>🟢 Active Rooms</h4>
                                {activeRooms.map(room => (
                                    <div key={room._id} style={S.roomRow}>
                                        <div>
                                            <div style={S.roomName}>{room.name}</div>
                                            <div style={S.roomMeta}>
                                                {room.mode === 'battle' ? '⚔️ Battle · ' : ''}
                                                by {room.host?.name} · {room.participants?.length || 0}/{room.maxParticipants} · {LANGUAGES.find(l => l.value === room.language)?.label || room.language}
                                            </div>
                                        </div>
                                        <button onClick={() => handleJoinRoom(room.roomCode)} style={S.joinBtn}>Join</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    }

    // ────────────────────────────────────────
    // LIVE ROOM VIEW
    // ────────────────────────────────────────
    return (
        <div style={S.container}>
            {/* Room Header */}
            <header style={S.roomHeader}>
                <div style={S.roomHeaderLeft}>
                    <h3 style={S.roomTitle}>{roomData?.name || 'Room'}</h3>
                    <button onClick={copyRoomCode} style={S.codeBadge} title="Click to copy">
                        📋 {roomData?.roomCode}
                    </button>
                    {roomMode === 'battle' && (
                        <span style={{ padding: '3px 10px', background: 'rgba(245,101,101,0.2)', borderRadius: '6px', fontSize: '11px', color: '#f56565', fontWeight: 'bold' }}>
                            ⚔️ Battle Mode
                        </span>
                    )}
                    <span style={{ ...S.statusDot, background: isConnected ? '#4fd1c5' : '#fc8181' }} />
                    <span style={S.statusText}>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div style={S.roomHeaderRight}>
                    {/* Participant Avatars */}
                    <div style={S.avatarRow}>
                        {participants.map((p, i) => (
                            <div
                                key={p._id}
                                style={{ ...S.avatar, background: COLORS[i % COLORS.length], zIndex: participants.length - i }}
                                title={p.name}
                            >
                                {p.name?.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        <span style={S.participantCount}>{participants.length} online</span>
                    </div>
                    <button onClick={leaveRoom} style={S.leaveBtn}>Leave</button>
                </div>
            </header>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={S.errorBanner}>
                    {error}
                    <button onClick={() => setError('')} style={S.dismissBtn}>×</button>
                </motion.div>
            )}

            {/* Battle UI */}
            {roomMode === 'battle' && (
                <>
                    {/* Countdown Overlay */}
                    {battleState === 'countdown' && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                            <div style={{ fontSize: '80px', fontWeight: 'bold', color: '#f56565', textShadow: '0 0 40px rgba(245,101,101,0.5)' }}>{countdown}</div>
                            {battleProblem && (
                                <div style={{ textAlign: 'center', maxWidth: '500px', marginTop: '20px' }}>
                                    <h2 style={{ color: '#fff', marginBottom: '8px' }}>⚔️ {battleProblem.title}</h2>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                                        background: battleProblem.difficulty === 'easy' ? 'rgba(72,187,120,0.2)' : battleProblem.difficulty === 'hard' ? 'rgba(245,101,101,0.2)' : 'rgba(237,137,54,0.2)',
                                        color: battleProblem.difficulty === 'easy' ? '#48bb78' : battleProblem.difficulty === 'hard' ? '#f56565' : '#ed8936'
                                    }}>{battleProblem.difficulty?.toUpperCase()}</span>
                                    <p style={{ color: '#aaa', marginTop: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '14px' }}>{battleProblem.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Battle Timer Bar */}
                    {battleState === 'active' && (
                        <div style={{ padding: '6px 20px', background: 'rgba(245,101,101,0.1)', borderBottom: '1px solid rgba(245,101,101,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${(battleTimer / battleTimeLimit) * 100}%`, height: '100%', background: battleTimer > 60 ? '#48bb78' : battleTimer > 30 ? '#ed8936' : '#f56565', transition: 'width 1s linear', borderRadius: '2px' }} />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: battleTimer > 60 ? '#48bb78' : '#f56565', fontFamily: 'monospace', minWidth: '60px' }}>
                                {Math.floor(battleTimer / 60)}:{String(battleTimer % 60).padStart(2, '0')}
                            </span>
                            {battleProblem && <span style={{ fontSize: '12px', color: '#aaa' }}>⚔️ {battleProblem.title}</span>}
                            {Object.values(opponentProgress).map((op, i) => (
                                <span key={i} style={{ fontSize: '11px', color: '#888', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                    {op.userName}: {op.lineCount} lines
                                </span>
                            ))}
                            {!battleSubmitted && (
                                <button
                                    onClick={async () => {
                                        setBattleSubmitted(true);
                                        const testCases = battleProblem?.testCases || [];
                                        if (testCases.length > 0) {
                                            // Run code against each test case
                                            const testOutputs = [];
                                            for (const tc of testCases) {
                                                try {
                                                    const r = await fetch(`${API_BASE}/run`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
                                                        body: JSON.stringify({ code, language, input: tc.input })
                                                    });
                                                    const result = await r.json();
                                                    testOutputs.push((result.output || '').trim());
                                                } catch {
                                                    testOutputs.push('');
                                                }
                                            }
                                            socketRef.current?.emit('battle-submit', { code, testOutputs });
                                        } else {
                                            // Legacy single-output
                                            try {
                                                const r = await fetch(`${API_BASE}/run`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
                                                    body: JSON.stringify({ code, language })
                                                });
                                                const result = await r.json();
                                                const output = result.output || '';
                                                socketRef.current?.emit('battle-submit', { code, output: output.trim() });
                                            } catch {
                                                socketRef.current?.emit('battle-submit', { code, output: '' });
                                            }
                                        }
                                    }}
                                    style={{ padding: '6px 16px', background: 'linear-gradient(135deg, #48bb78, #38a169)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    🚀 Submit ({battleProblem?.testCases?.length || 1} tests)
                                </button>
                            )}
                            {battleSubmitted && !battleTestResults && <span style={{ color: '#48bb78', fontSize: '12px', fontWeight: 'bold' }}>⏳ Running tests...</span>}
                            {battleTestResults && (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    {battleTestResults.results.map((r, i) => (
                                        <span key={i} title={r.passed ? `TC${i + 1}: Passed` : `TC${i + 1}: Expected "${r.expected}" got "${r.actual}"`}
                                            style={{ fontSize: '16px', cursor: 'help' }}>{r.passed ? '✅' : '❌'}</span>
                                    ))}
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: battleTestResults.passedCount === battleTestResults.totalCount ? '#48bb78' : '#f56565', marginLeft: '6px' }}>
                                        {battleTestResults.passedCount}/{battleTestResults.totalCount}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Battle Waiting (host start controls) */}
                    {(!battleState || battleState === 'waiting') && (
                        <div style={{ padding: '12px 20px', background: 'rgba(245,101,101,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: '#f56565', fontWeight: 'bold', fontSize: '13px' }}>⚔️ Battle Mode</span>
                            <span style={{ color: '#888', fontSize: '12px' }}>{participants.length} player(s) ready</span>
                            {isHost && (
                                <>
                                    <select value={battleDifficulty} onChange={e => setBattleDifficulty(e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', background: '#333', color: '#fff', border: '1px solid #555', fontSize: '12px' }}>
                                        <option value="easy">🟢 Easy</option>
                                        <option value="medium">🟡 Medium</option>
                                        <option value="hard">🔴 Hard</option>
                                    </select>
                                    <button
                                        onClick={() => socketRef.current?.emit('battle-start', { difficulty: battleDifficulty })}
                                        style={{ marginLeft: 'auto', padding: '8px 20px', background: 'linear-gradient(135deg, #f56565, #e53e3e)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 10px rgba(245,101,101,0.3)' }}
                                    >
                                        ⚔️ Start Battle!
                                    </button>
                                </>
                            )}
                            {!isHost && <span style={{ color: '#888', fontSize: '12px', marginLeft: 'auto' }}>Waiting for host to start...</span>}
                        </div>
                    )}

                    {/* Battle Results Overlay */}
                    {battleState === 'finished' && battleResult && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                            {battleResult.winner ? (
                                <>
                                    <div style={{ fontSize: '60px', marginBottom: '10px' }}>🏆</div>
                                    <h2 style={{ color: '#48bb78', fontSize: '28px', margin: '0 0 8px' }}>{battleResult.winner.userName} Wins!</h2>
                                    <p style={{ color: '#888', fontSize: '14px' }}>+{battleResult.xpAwarded} XP awarded</p>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '60px', marginBottom: '10px' }}>⌛</div>
                                    <h2 style={{ color: '#ed8936', fontSize: '28px', margin: '0 0 8px' }}>Time's Up!</h2>
                                    <p style={{ color: '#888', fontSize: '14px' }}>No correct solution submitted</p>
                                </>
                            )}
                            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                                {battleResult.submissions?.map((s, i) => (
                                    <div key={i} style={{ padding: '12px 20px', background: s.correct ? 'rgba(72,187,120,0.15)' : 'rgba(245,101,101,0.15)', borderRadius: '10px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{s.userName}</div>
                                        <div style={{ fontSize: '20px' }}>{s.correct ? '✅' : '❌'}</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => { setBattleState('waiting'); setBattleResult(null); setBattleProblem(null); setBattleSubmitted(false); }}
                                style={{ marginTop: '24px', padding: '10px 30px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                🔁 Play Again
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Main Content */}
            <div style={S.liveLayout}>
                {/* Code Editor */}
                <div style={S.editorPanel}>
                    <div style={S.editorToolbar}>
                        <div style={S.langRow}>
                            {LANGUAGES.map(l => (
                                <button
                                    key={l.value}
                                    onClick={() => handleLanguageChange(l.value)}
                                    style={{ ...S.langBtnSmall, ...(language === l.value ? S.langBtnActive : {}) }}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                        <AnimatePresence>
                            {lastEditor && (
                                <motion.span
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    style={S.editingIndicator}
                                >
                                    ✏️ {lastEditor} is editing...
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    <textarea
                        value={code}
                        onChange={handleCodeChange}
                        style={S.codeEditor}
                        spellCheck={false}
                        placeholder="Start coding together..."
                    />
                </div>

                {/* Sidebar */}
                <div style={S.sidebar}>
                    {/* Tabs */}
                    <div style={S.sidebarTabs}>
                        <button
                            onClick={() => setShowChat(false)}
                            style={{ ...S.sidebarTab, ...(showChat ? {} : S.sidebarTabActive) }}
                        >
                            👥 Peers ({participants.length})
                        </button>
                        <button
                            onClick={() => setShowChat(true)}
                            style={{ ...S.sidebarTab, ...(showChat ? S.sidebarTabActive : {}) }}
                        >
                            💬 Chat
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {!showChat ? (
                            /* Participants List */
                            <motion.div key="peers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.sidebarContent}>
                                {participants.map((p, i) => (
                                    <div key={p._id} style={S.participantRow}>
                                        <div style={{ ...S.participantAvatar, background: COLORS[i % COLORS.length] }}>
                                            {p.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={S.participantName}>
                                                {p.name}
                                                {roomData?.host?._id === p._id && <span style={S.hostBadge}>HOST</span>}
                                            </div>
                                            <div style={S.participantStatus}>🟢 Online</div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            /* Chat Panel */
                            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={S.chatPanel}>
                                <div style={S.chatMessages}>
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} style={{ ...S.chatMsg, ...(msg.isSystem ? S.systemMsg : {}) }}>
                                            {!msg.isSystem && <span style={S.chatUser}>{msg.userName}</span>}
                                            <span style={msg.isSystem ? S.systemText : S.chatText}>{msg.message}</span>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                <div style={S.chatInputRow}>
                                    <input
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                                        placeholder="Type a message..."
                                        style={S.chatInput}
                                        maxLength={500}
                                    />
                                    <button onClick={sendChatMessage} style={S.sendBtn}>↑</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// ── Styles ──
const S = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)'
    },
    backBtn: {
        background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
        color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
    },
    pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700 },
    errorBanner: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.4)',
        color: '#ff6b6b', padding: '10px 16px', borderRadius: '10px', margin: '12px 24px 0',
        fontSize: '13px'
    },
    dismissBtn: { background: 'none', border: 'none', color: 'inherit', fontSize: '18px', cursor: 'pointer' },

    // Lobby
    lobbyGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px',
        padding: '30px 24px', maxWidth: '1000px', margin: '0 auto', width: '100%'
    },
    lobbyCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px', padding: '28px'
    },
    cardTitle: { margin: '0 0 6px', fontSize: '20px', fontWeight: 700 },
    cardDesc: { color: '#888', fontSize: '13px', margin: '0 0 20px' },
    input: {
        width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '12px 14px', color: '#fff', fontSize: '14px',
        marginBottom: '14px', boxSizing: 'border-box', outline: 'none'
    },
    langRow: { display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' },
    langBtn: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#aaa', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
        fontSize: '13px', transition: 'all 0.2s'
    },
    langBtnSmall: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#aaa', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
        fontSize: '12px', transition: 'all 0.2s'
    },
    langBtnActive: {
        background: 'rgba(102,126,234,0.25)', borderColor: 'rgba(102,126,234,0.5)', color: '#a5b4fc'
    },
    toggleLabel: {
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#aaa',
        marginBottom: '16px', cursor: 'pointer'
    },
    checkbox: { width: '16px', height: '16px' },
    primaryBtn: {
        width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 'bold',
        cursor: 'pointer', boxShadow: '0 4px 20px rgba(102,126,234,0.3)'
    },
    joinRow: { display: 'flex', flexDirection: 'column', gap: '12px' },
    activeSection: { marginTop: '24px' },
    sectionLabel: {
        fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase',
        letterSpacing: '1px', margin: '0 0 10px'
    },
    roomRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 14px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '8px'
    },
    roomName: { fontWeight: 600, fontSize: '14px', marginBottom: '3px' },
    roomMeta: { fontSize: '11px', color: '#888' },
    joinBtn: {
        background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.4)',
        color: '#667eea', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
    },

    // Live Room Header
    roomHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.2)'
    },
    roomHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    roomHeaderRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    roomTitle: { margin: 0, fontSize: '18px', fontWeight: 700 },
    codeBadge: {
        background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.3)',
        color: '#a5b4fc', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
        fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px'
    },
    statusDot: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' },
    statusText: { fontSize: '12px', color: '#888' },
    avatarRow: { display: 'flex', alignItems: 'center', gap: '0px' },
    avatar: {
        width: '30px', height: '30px', borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold',
        color: '#fff', border: '2px solid #0a0a1a', marginLeft: '-8px'
    },
    participantCount: { fontSize: '12px', color: '#888', marginLeft: '8px' },
    leaveBtn: {
        background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.3)',
        color: '#ff6b6b', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer',
        fontSize: '13px', fontWeight: '600'
    },

    // Main Layout
    liveLayout: { display: 'flex', flex: 1, overflow: 'hidden' },
    editorPanel: { flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)' },
    editorToolbar: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.15)'
    },
    editingIndicator: { fontSize: '12px', color: '#f6ad55', fontStyle: 'italic' },
    codeEditor: {
        flex: 1, width: '100%', background: 'transparent', border: 'none', color: '#e2e8f0',
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: '14px', lineHeight: '1.7', padding: '16px', resize: 'none', outline: 'none',
        boxSizing: 'border-box'
    },

    // Sidebar
    sidebar: { width: '320px', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' },
    sidebarTabs: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    sidebarTab: {
        flex: 1, background: 'transparent', border: 'none', color: '#888',
        padding: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
        borderBottom: '2px solid transparent', transition: 'all 0.2s'
    },
    sidebarTabActive: { color: '#a5b4fc', borderBottomColor: '#667eea' },
    sidebarContent: { flex: 1, padding: '12px', overflowY: 'auto' },

    // Participants
    participantRow: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px', borderRadius: '10px', marginBottom: '6px',
        background: 'rgba(255,255,255,0.03)'
    },
    participantAvatar: {
        width: '34px', height: '34px', borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#fff'
    },
    participantName: { fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' },
    participantStatus: { fontSize: '11px', color: '#4fd1c5' },
    hostBadge: {
        fontSize: '9px', background: 'rgba(246,173,85,0.2)', color: '#f6ad55',
        padding: '1px 6px', borderRadius: '4px', fontWeight: 700
    },

    // Chat
    chatPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    chatMessages: { flex: 1, padding: '10px', overflowY: 'auto' },
    chatMsg: { marginBottom: '8px' },
    systemMsg: { textAlign: 'center', opacity: 0.5 },
    chatUser: {
        fontSize: '11px', fontWeight: 700, color: '#a5b4fc', display: 'block', marginBottom: '2px'
    },
    chatText: { fontSize: '13px', color: '#ccc', lineHeight: 1.4 },
    systemText: { fontSize: '11px', color: '#888', fontStyle: 'italic' },
    chatInputRow: {
        display: 'flex', gap: '8px', padding: '10px',
        borderTop: '1px solid rgba(255,255,255,0.08)'
    },
    chatInput: {
        flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none'
    },
    sendBtn: {
        width: '36px', height: '36px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none', borderRadius: '8px', color: '#fff', fontSize: '16px', cursor: 'pointer',
        fontWeight: 'bold'
    }
};

export default Room;
