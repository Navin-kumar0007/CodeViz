import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import debounce from 'lodash/debounce';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import Whiteboard from '../components/Whiteboard';

/**
 * Classroom - Join or create live classroom sessions with instructors
 */

const Classroom = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('join'); // 'join', 'create', 'live'
    const [classroomCode, setClassroomCode] = useState('');
    const [classrooms, setClassrooms] = useState([]);
    const [myClassrooms, setMyClassrooms] = useState({ teaching: [], enrolled: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Live session state
    const [currentClassroom, setCurrentClassroom] = useState(null);
    const [liveCode, setLiveCode] = useState('');
    const [liveLanguage, setLiveLanguage] = useState('python');
    const [isLive, setIsLive] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Multi-role Collaboration state
    const [participants, setParticipants] = useState([]);
    const [activeEditor, setActiveEditor] = useState(null);

    // Whiteboard state
    const [activeView, setActiveView] = useState('code'); // 'code' | 'whiteboard'

    // Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [newChatMessage, setNewChatMessage] = useState('');
    const chatEndRef = useRef(null);

    // New classroom form
    const [newClassroomName, setNewClassroomName] = useState('');
    const [newClassroomDesc, setNewClassroomDesc] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const socketRef = useRef(null);

    // Poll & Hand Raise state
    const [activePoll, setActivePoll] = useState(null);
    const [pollResults, setPollResults] = useState(null);
    const [myPollAnswer, setMyPollAnswer] = useState(null);
    const [handRaiseQueue, setHandRaiseQueue] = useState([]);
    const [showPollForm, setShowPollForm] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '', '', '']);
    const [handRaised, setHandRaised] = useState(false);

    // Get user info
    const getUserInfo = () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch {
            return null;
        }
    };

    const user = getUserInfo();

    // Fetch classrooms on mount
    useEffect(() => {
        fetchPublicClassrooms();
        if (user?.token) {
            fetchMyClassrooms();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll chat to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const fetchPublicClassrooms = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/classrooms');
            if (res.ok) {
                const data = await res.json();
                setClassrooms(data);
            }
        } catch (error) {
            console.error('Error fetching classrooms:', error);
        }
    };

    const fetchMyClassrooms = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/classrooms/my', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMyClassrooms(data);
            }
        } catch (error) {
            console.error('Error fetching my classrooms:', error);
        }
    };

    // Connect to socket for live session
    const connectToClassroom = (classroom) => {
        if (!user?.token) {
            setError('Please log in to join live sessions');
            return;
        }

        // Connect to socket
        const socket = io('http://localhost:5001/classroom', {
            auth: { token: user.token }
        });

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join-classroom', classroom._id);
        });

        socket.on('classroom-state', (state) => {
            setIsLive(state.isLive);
            setLiveCode(state.code || '');
            setLiveLanguage(state.language || 'python');
            setActiveEditor(state.activeEditor || null);
        });

        socket.on('roster-update', (users) => {
            setParticipants(users);
        });

        socket.on('edit-access-requested', (data) => {
            setParticipants(prev => prev.map(p => p.userId === data.userId ? { ...p, handRaised: true } : p));
        });

        socket.on('edit-access-granted', (data) => {
            setActiveEditor(data.activeEditor);
            setParticipants(prev => prev.map(p => p.userId === data.activeEditor ? { ...p, handRaised: false } : p));
        });

        socket.on('edit-access-revoked', () => {
            setActiveEditor(null);
        });

        socket.on('receive-chat-message', (msg) => {
            setChatMessages(prev => [...prev, msg]);
        });

        socket.on('code-sync', (data) => {
            setLiveCode(data.code);
            setLiveLanguage(data.language);
        });

        socket.on('session-started', () => {
            setIsLive(true);
        });

        socket.on('session-ended', () => {
            setIsLive(false);
        });

        socket.on('error', (err) => {
            setError(err.message);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Poll listeners
        socket.on('poll-pushed', (poll) => {
            setActivePoll(poll);
            setPollResults(null);
            setMyPollAnswer(null);
        });
        socket.on('poll-results', (results) => {
            setPollResults(results);
        });
        socket.on('poll-closed', () => {
            setActivePoll(null);
            setPollResults(null);
            setMyPollAnswer(null);
        });
        // Hand raise listener
        socket.on('hand-raise-queue', (queue) => {
            setHandRaiseQueue(queue);
        });

        socketRef.current = socket;
        setCurrentClassroom(classroom);
        setActiveTab('live');
    };

    // Disconnect from socket
    const disconnectFromClassroom = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setCurrentClassroom(null);
        setIsConnected(false);
        setIsLive(false);
        setActiveEditor(null);
        setParticipants([]);
        setChatMessages([]);
        setActiveTab('join');
    };

    const sendChatMessage = useCallback((e) => {
        e.preventDefault();
        if (!newChatMessage.trim() || !socketRef.current) return;
        socketRef.current.emit('send-chat-message', newChatMessage);
        setNewChatMessage('');
    }, [newChatMessage]);

    // Debounce the code broadcast to prevent spamming the Node.js server 
    // on every single keystroke during fast typing. (Delay: 300ms)
    const debouncedCodeBroadcast = useMemo(
        () => debounce((codeToSync, lang) => {
            if (socketRef.current) {
                socketRef.current.emit('code-update', { code: codeToSync, language: lang });
            }
        }, 300),
        []
    );

    // Broadcast code updates (Instructor or Active Editor)
    const updateCode = useCallback((code) => {
        setLiveCode(code);
        const isEditor = currentClassroom?.instructor?._id === user?._id || activeEditor === user?._id;
        if (isEditor) {
            debouncedCodeBroadcast(code, liveLanguage);
        }
    }, [currentClassroom, user, activeEditor, liveLanguage, debouncedCodeBroadcast]);

    // Instructor: Start live session
    const startSession = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('start-session');
        }
    }, []);

    // Instructor: End live session
    const endSession = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit('end-session');
        }
    }, []);

    const joinClassroom = async (autoCode = null) => {
        const joinCode = typeof autoCode === 'string' ? autoCode : classroomCode;
        if (!joinCode.trim()) {
            setError('Please enter a classroom code');
            return;
        }
        if (!user?.token) {
            setError('Please log in to join a classroom');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/classrooms/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ code: joinCode })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Successfully joined classroom!');
                setClassroomCode('');
                fetchMyClassrooms();
            } else {
                setError(data.message || 'Failed to join classroom');
            }
        } catch {
            setError('Failed to join classroom');
        } finally {
            setLoading(false);
        }
    };

    // Auto-join effect for share links
    useEffect(() => {
        if (location.state?.autoJoinCode && user?.token) {
            const code = location.state.autoJoinCode;
            setClassroomCode(code);
            joinClassroom(code);
            // Clear location state to prevent endless looping
            window.history.replaceState({}, document.title);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, user?.token]);

    const createClassroom = async () => {
        if (!newClassroomName.trim()) {
            setError('Please enter a classroom name');
            return;
        }
        if (!user?.token) {
            setError('Please log in to create a classroom');
            return;
        }
        if (user?.role !== 'instructor' && user?.role !== 'admin') {
            setError('Only instructors and admins can create classrooms');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/classrooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    name: newClassroomName,
                    description: newClassroomDesc,
                    settings: { isPublic }
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(`Classroom created! Code: ${data.code}`);
                setNewClassroomName('');
                setNewClassroomDesc('');
                fetchMyClassrooms();
            } else {
                setError(data.message || 'Failed to create classroom');
            }
        } catch {
            setError('Failed to create classroom');
        } finally {
            setLoading(false);
        }
    };

    const deleteClassroom = async (classroomId) => {
        if (!window.confirm('Are you sure you want to delete this classroom?')) return;

        try {
            const res = await fetch(`http://localhost:5001/api/classrooms/${classroomId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (res.ok) {
                setSuccess('Classroom deleted successfully');
                fetchMyClassrooms();
                fetchPublicClassrooms();
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to delete classroom');
            }
        } catch {
            setError('Failed to delete classroom');
        }
    };

    // Check if user is instructor of current classroom
    const isInstructor = currentClassroom?.instructor?._id === user?._id ||
        currentClassroom?.instructor === user?._id;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/')} style={styles.backBtn}>
                    ← Dashboard
                </button>
                <h2 style={styles.title}>🏫 Classroom</h2>
                <div style={styles.userBadge}>
                    {user?.name || 'Guest'}
                    {user?.role === 'instructor' && <span style={styles.roleBadge}>Instructor</span>}
                </div>
            </header>

            {/* Status Messages */}
            {error && (
                <div style={styles.error}>
                    {error}
                    <button onClick={() => setError('')} style={styles.dismissBtn}>×</button>
                </div>
            )}
            {success && (
                <div style={styles.success}>
                    {success}
                    <button onClick={() => setSuccess('')} style={styles.dismissBtn}>×</button>
                </div>
            )}

            {/* Live Session View */}
            {activeTab === 'live' && currentClassroom && (
                <div style={styles.liveContainer}>
                    <div style={styles.liveHeader}>
                        <div>
                            <h3 style={styles.liveTitleText}>{currentClassroom.name}</h3>
                            <div style={styles.liveStatus}>
                                {isLive ? (
                                    <span style={styles.liveIndicator}>🔴 LIVE</span>
                                ) : (
                                    <span style={styles.offlineIndicator}>⚪ Not Live</span>
                                )}
                                {isConnected ? ' • Connected' : ' • Disconnected'}
                            </div>
                        </div>
                        <div style={styles.liveActions}>
                            {isInstructor && (
                                <>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`http://localhost:5173/classroom/join/${currentClassroom.code}`);
                                            setSuccess('Share link copied to clipboard!');
                                            setTimeout(() => setSuccess(''), 3000);
                                        }}
                                        style={styles.copyBtn}
                                    >
                                        🔗 Copy Link
                                    </button>
                                    {!isLive ? (
                                        <button onClick={startSession} style={styles.startBtn}>
                                            ▶ Start Session
                                        </button>
                                    ) : (
                                        <button onClick={endSession} style={styles.stopBtn}>
                                            ⬛ End Session
                                        </button>
                                    )}
                                    <button onClick={() => setShowPollForm(prev => !prev)} style={{ ...styles.copyBtn, background: showPollForm ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                                        📊 Poll
                                    </button>
                                </>
                            )}
                            <button onClick={() => {
                                if (handRaised) {
                                    socketRef.current?.emit('lower-hand');
                                    setHandRaised(false);
                                } else {
                                    socketRef.current?.emit('raise-hand');
                                    setHandRaised(true);
                                }
                            }} style={{ ...styles.leaveBtn, background: handRaised ? 'rgba(245,158,11,0.3)' : 'transparent', borderColor: handRaised ? '#f59e0b' : 'rgba(255,255,255,0.2)', color: handRaised ? '#f59e0b' : '#888' }}>
                                {handRaised ? '✋ Lower' : '✋ Raise'}
                            </button>
                            <button onClick={disconnectFromClassroom} style={styles.leaveBtn}>
                                Leave
                            </button>
                        </div>
                    </div>

                    {/* Poll Creation Form (Instructor) */}
                    {showPollForm && isInstructor && (
                        <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                            <input placeholder="Poll question..." value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '8px', fontSize: '13px' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                                {pollOptions.map((opt, i) => (
                                    <input key={i} placeholder={`Option ${i + 1}`} value={opt} onChange={e => { const o = [...pollOptions]; o[i] = e.target.value; setPollOptions(o); }} style={{ padding: '6px', borderRadius: '6px', background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontSize: '12px' }} />
                                ))}
                            </div>
                            <button onClick={() => {
                                const validOptions = pollOptions.filter(o => o.trim());
                                if (pollQuestion.trim() && validOptions.length >= 2) {
                                    socketRef.current?.emit('push-poll', { question: pollQuestion.trim(), options: validOptions });
                                    setShowPollForm(false); setPollQuestion(''); setPollOptions(['', '', '', '']);
                                }
                            }} style={{ padding: '6px 16px', background: '#667eea', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Push Poll</button>
                        </div>
                    )}

                    {/* Active Poll Overlay */}
                    {activePoll && (
                        <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ color: '#818cf8', fontSize: '14px' }}>📊 {activePoll.question}</strong>
                                {isInstructor && <button onClick={() => socketRef.current?.emit('close-poll')} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Close</button>}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {activePoll.options.map((opt, i) => (
                                    <button key={i}
                                        onClick={() => { if (myPollAnswer === null) { setMyPollAnswer(i); socketRef.current?.emit('submit-poll-answer', { pollId: activePoll.id, optionIndex: i }); } }}
                                        style={{ padding: '6px 12px', borderRadius: '6px', border: myPollAnswer === i ? '2px solid #667eea' : '1px solid rgba(255,255,255,0.2)', background: myPollAnswer === i ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '12px', cursor: myPollAnswer !== null ? 'default' : 'pointer' }}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {pollResults && (
                                <div style={{ marginTop: '10px' }}>
                                    {pollResults.options.map((opt, i) => {
                                        const pct = pollResults.totalVotes > 0 ? Math.round((pollResults.voteCounts[i] / pollResults.totalVotes) * 100) : 0;
                                        return (
                                            <div key={i} style={{ marginBottom: '4px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ccc', marginBottom: '2px' }}>
                                                    <span>{opt}</span><span>{pollResults.voteCounts[i]} ({pct}%)</span>
                                                </div>
                                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', background: '#667eea', borderRadius: '3px', transition: 'width 0.3s' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>{pollResults.totalVotes} vote(s)</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hand Raise Queue */}
                    {isInstructor && handRaiseQueue.length > 0 && (
                        <div style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.2)', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>✋ Hands:</span>
                            {handRaiseQueue.map((h, i) => (
                                <span key={i} style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(245,158,11,0.2)', borderRadius: '4px', color: '#f59e0b', cursor: 'pointer' }}
                                    onClick={() => socketRef.current?.emit('lower-hand', { userId: h.userId })} title="Click to dismiss">
                                    {h.name} ✕
                                </span>
                            ))}
                        </div>
                    )}

                    <div style={styles.workspaceContainer}>
                        {/* Editor Space */}
                        <div style={styles.codeContainer}>
                            <div style={styles.codeHeader}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setActiveView('code')}
                                        style={activeView === 'code' ? styles.activeViewBtn : styles.inactiveViewBtn}
                                    >
                                        💻 Code
                                    </button>
                                    <button
                                        onClick={() => setActiveView('whiteboard')}
                                        style={activeView === 'whiteboard' ? styles.activeViewBtn : styles.inactiveViewBtn}
                                    >
                                        🎨 Whiteboard
                                    </button>
                                </div>
                                <span style={styles.languageBadge}>
                                    {activeView === 'code' ? liveLanguage : 'Canvas'}
                                </span>
                            </div>
                            <div style={{ display: activeView === 'code' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
                                {isInstructor || activeEditor === user?._id ? (
                                    <textarea
                                        value={liveCode}
                                        onChange={(e) => updateCode(e.target.value)}
                                        style={styles.codeEditor}
                                        placeholder="Start typing code to broadcast..."
                                        spellCheck={false}
                                    />
                                ) : (
                                    <pre style={styles.codeViewer}>
                                        {liveCode || '// Waiting for instructor to share code...'}
                                    </pre>
                                )}
                            </div>

                            <div style={{ display: activeView === 'whiteboard' ? 'flex' : 'none', flex: 1, flexDirection: 'column', padding: '15px' }}>
                                <Whiteboard
                                    socket={socketRef.current}
                                    classroomId={currentClassroom?._id}
                                    isEditor={isInstructor || activeEditor === user?._id}
                                />
                            </div>
                        </div>

                        {/* Roster Panel */}
                        <div style={styles.rosterContainer}>
                            <h4 style={styles.rosterTitle}>👥 Participants ({participants.length})</h4>
                            <div style={styles.rosterList}>
                                {participants.map(p => (
                                    <div key={p.userId} style={styles.participantCard}>
                                        <div style={styles.participantInfo}>
                                            <span style={styles.participantName}>
                                                {p.name} {p.userId === user?._id ? '(You)' : ''}
                                            </span>
                                            {p.isInstructor && <span style={styles.roleBadge}>Host</span>}
                                            {activeEditor === p.userId && <span style={styles.chalkBadge}>🖋️ Editor</span>}
                                            {p.handRaised && activeEditor !== p.userId && <span style={styles.handBadge}>✋</span>}
                                        </div>

                                        <div style={styles.participantActions}>
                                            {/* Instructor Actions */}
                                            {isInstructor && !p.isInstructor && (
                                                activeEditor !== p.userId ? (
                                                    <button
                                                        onClick={() => socketRef.current.emit('grant-edit-access', p.userId)}
                                                        style={styles.grantBtn}
                                                    >
                                                        {p.handRaised ? 'Approve' : 'Pass Chalk'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => socketRef.current.emit('revoke-edit-access')}
                                                        style={styles.revokeBtn}
                                                    >
                                                        Revoke
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Student Request Hand */}
                            {!isInstructor && activeEditor !== user?._id && (
                                <button
                                    onClick={() => socketRef.current.emit('request-edit-access')}
                                    style={styles.raiseHandBtn}
                                >
                                    ✋ Raise Hand
                                </button>
                            )}
                            {!isInstructor && activeEditor === user?._id && (
                                <button
                                    onClick={() => socketRef.current.emit('revoke-edit-access')}
                                    style={styles.yieldBtn}
                                >
                                    Yield Control
                                </button>
                            )}

                            {/* Chat Section */}
                            <div style={styles.chatSection}>
                                <h4 style={styles.rosterTitle}>💬 Classroom Chat</h4>
                                <div style={styles.chatMessages}>
                                    {chatMessages.length === 0 ? (
                                        <div style={{ color: '#888', textAlign: 'center', marginTop: '20px' }}>
                                            No messages yet. Start the conversation!
                                        </div>
                                    ) : (
                                        chatMessages.map(msg => (
                                            <div key={msg.id} style={{
                                                ...styles.chatMessageBubble,
                                                ...(msg.isSystem ? { background: 'rgba(255, 255, 255, 0.02)', borderLeft: '3px solid #888' } : {})
                                            }}>
                                                {msg.isSystem ? (
                                                    <div style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>
                                                        ℹ️ {msg.text}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span style={{ fontWeight: 'bold', color: msg.isInstructor ? '#2ecc71' : '#667eea', fontSize: '12px' }}>
                                                            {msg.name} {msg.isInstructor && '(Host)'}:
                                                        </span>
                                                        <div style={{ fontSize: '13px', marginTop: '3px' }}>{msg.text}</div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                <form onSubmit={sendChatMessage} style={styles.chatForm}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newChatMessage}
                                        onChange={(e) => setNewChatMessage(e.target.value)}
                                        style={styles.chatInput}
                                    />
                                    <button type="submit" style={styles.chatSendBtn}>Send</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs (hidden during live session) */}
            {activeTab !== 'live' && (
                <>
                    <div style={styles.tabs}>
                        <button
                            onClick={() => setActiveTab('join')}
                            style={{ ...styles.tab, ...(activeTab === 'join' ? styles.activeTab : {}) }}
                        >
                            Join Classroom
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            style={{ ...styles.tab, ...(activeTab === 'create' ? styles.activeTab : {}) }}
                        >
                            Create Classroom
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            style={{ ...styles.tab, ...(activeTab === 'my' ? styles.activeTab : {}) }}
                        >
                            My Classrooms
                        </button>
                    </div>

                    <div style={styles.content}>
                        <AnimatePresence mode="wait">
                            {activeTab === 'join' && (
                                <motion.div
                                    key="join"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    style={styles.panel}
                                >
                                    <h3 style={styles.panelTitle}>Join a Classroom</h3>
                                    <p style={styles.panelDescription}>
                                        Enter the classroom code provided by your instructor
                                    </p>

                                    <div style={styles.inputGroup}>
                                        <input
                                            type="text"
                                            value={classroomCode}
                                            onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code (e.g., ABC123)"
                                            style={styles.input}
                                            maxLength={6}
                                        />
                                        <button
                                            onClick={joinClassroom}
                                            style={styles.joinBtn}
                                            disabled={loading}
                                        >
                                            {loading ? '...' : 'Join →'}
                                        </button>
                                    </div>

                                    {/* Public Classrooms */}
                                    {classrooms.length > 0 && (
                                        <div style={styles.section}>
                                            <h4 style={styles.sectionTitle}>Public Classrooms</h4>
                                            <div style={styles.classroomList}>
                                                {classrooms.map((classroom) => (
                                                    <div key={classroom._id} style={styles.classroomCard}>
                                                        <div style={styles.classroomInfo}>
                                                            <div style={styles.classroomName}>
                                                                {classroom.name}
                                                                {classroom.isLive && (
                                                                    <span style={styles.liveBadge}>LIVE</span>
                                                                )}
                                                            </div>
                                                            <div style={styles.classroomMeta}>
                                                                by {classroom.instructor?.name} • {classroom.students?.length || 0} students
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => connectToClassroom(classroom)}
                                                            style={styles.viewBtn}
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'create' && (
                                <motion.div
                                    key="create"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    style={styles.panel}
                                >
                                    <h3 style={styles.panelTitle}>Create a Classroom</h3>
                                    <p style={styles.panelDescription}>
                                        Set up a virtual classroom for your students
                                    </p>

                                    {user?.role === 'instructor' || user?.role === 'admin' ? (
                                        <div style={styles.createForm}>
                                            <input
                                                type="text"
                                                value={newClassroomName}
                                                onChange={(e) => setNewClassroomName(e.target.value)}
                                                placeholder="Classroom Name"
                                                style={styles.formInput}
                                            />
                                            <textarea
                                                value={newClassroomDesc}
                                                onChange={(e) => setNewClassroomDesc(e.target.value)}
                                                placeholder="Description (optional)"
                                                style={styles.formTextarea}
                                            />
                                            <label style={styles.toggleLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={isPublic}
                                                    onChange={(e) => setIsPublic(e.target.checked)}
                                                    style={styles.checkbox}
                                                />
                                                <span style={styles.toggleIcon}>{isPublic ? '🔓' : '🔒'}</span>
                                                {isPublic ? 'Public (visible in directory)' : 'Private (code only)'}
                                            </label>
                                            <button
                                                onClick={createClassroom}
                                                style={styles.createBtn}
                                                disabled={loading}
                                            >
                                                {loading ? 'Creating...' : '+ Create Classroom'}
                                            </button>
                                        </div>
                                    ) : (
                                        <p style={styles.note}>
                                            <strong>Note:</strong> Classroom creation is available for instructors only.
                                            Contact admin to get instructor access.
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'my' && (
                                <motion.div
                                    key="my"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    style={styles.panel}
                                >
                                    <h3 style={styles.panelTitle}>My Classrooms</h3>

                                    {myClassrooms.teaching.length > 0 && (
                                        <div style={styles.section}>
                                            <h4 style={styles.sectionTitle}>Teaching</h4>
                                            <div style={styles.classroomList}>
                                                {myClassrooms.teaching.map((classroom) => (
                                                    <div key={classroom._id} style={styles.classroomCard}>
                                                        <div style={styles.classroomInfo}>
                                                            <div style={styles.classroomName}>
                                                                {classroom.name}
                                                                {classroom.isLive && (
                                                                    <span style={styles.liveBadge}>LIVE</span>
                                                                )}
                                                            </div>
                                                            <div style={styles.classroomMeta}>
                                                                Code: <strong>{classroom.code}</strong> • {classroom.students?.length || 0} students
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => connectToClassroom(classroom)}
                                                            style={styles.startSessionBtn}
                                                        >
                                                            Open
                                                        </button>
                                                        <button
                                                            onClick={() => deleteClassroom(classroom._id)}
                                                            style={{ ...styles.revokeBtn, marginLeft: '10px' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {myClassrooms.enrolled.length > 0 && (
                                        <div style={styles.section}>
                                            <h4 style={styles.sectionTitle}>Enrolled</h4>
                                            <div style={styles.classroomList}>
                                                {myClassrooms.enrolled.map((classroom) => (
                                                    <div key={classroom._id} style={styles.classroomCard}>
                                                        <div style={styles.classroomInfo}>
                                                            <div style={styles.classroomName}>
                                                                {classroom.name}
                                                                {classroom.isLive && (
                                                                    <span style={styles.liveBadge}>LIVE</span>
                                                                )}
                                                            </div>
                                                            <div style={styles.classroomMeta}>
                                                                by {classroom.instructor?.name}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => connectToClassroom(classroom)}
                                                            style={styles.viewBtn}
                                                        >
                                                            Join
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {myClassrooms.teaching.length === 0 && myClassrooms.enrolled.length === 0 && (
                                        <div style={styles.empty}>
                                            <span style={{ fontSize: '32px' }}>📭</span>
                                            <p>No classrooms yet</p>
                                            <p style={{ fontSize: '12px', color: '#666' }}>
                                                Join a classroom or create one to get started
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        boxSizing: 'border-box',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0
    },
    backBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    title: { margin: 0, fontSize: '24px' },
    userBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(102, 126, 234, 0.2)',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px'
    },
    roleBadge: {
        background: '#4caf50',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold'
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        maxWidth: '700px',
        margin: '0 auto 20px'
    },
    tab: {
        flex: 1,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#888',
        padding: '12px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
    },
    activeTab: {
        background: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 0.5)',
        color: '#fff'
    },
    error: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 100, 100, 0.2)',
        border: '1px solid rgba(255, 100, 100, 0.5)',
        color: '#ff6b6b',
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '20px',
        maxWidth: '700px',
        margin: '0 auto 20px'
    },
    success: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(76, 175, 80, 0.2)',
        border: '1px solid rgba(76, 175, 80, 0.5)',
        color: '#4caf50',
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '20px',
        maxWidth: '700px',
        margin: '0 auto 20px'
    },
    dismissBtn: {
        background: 'none',
        border: 'none',
        color: 'inherit',
        fontSize: '18px',
        cursor: 'pointer'
    },
    content: { maxWidth: '700px', margin: '0 auto' },
    panel: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '25px'
    },
    panelTitle: { margin: '0 0 8px 0', fontSize: '20px' },
    panelDescription: { color: '#888', fontSize: '14px', marginBottom: '25px' },
    inputGroup: { display: 'flex', gap: '10px', marginBottom: '30px' },
    input: {
        flex: 1,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '14px 16px',
        color: '#fff',
        fontSize: '16px',
        letterSpacing: '2px',
        textAlign: 'center'
    },
    joinBtn: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none',
        color: '#fff',
        padding: '14px 24px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    section: { marginTop: '20px' },
    sectionTitle: {
        margin: '0 0 15px 0',
        fontSize: '14px',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    classroomList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    classroomCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '10px'
    },
    classroomInfo: { flex: 1 },
    classroomName: {
        fontWeight: '600',
        marginBottom: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    classroomMeta: { color: '#888', fontSize: '12px' },
    liveBadge: {
        background: '#e53935',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold',
        animation: 'pulse 1s infinite'
    },
    viewBtn: {
        background: 'rgba(102, 126, 234, 0.2)',
        border: '1px solid rgba(102, 126, 234, 0.4)',
        color: '#667eea',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px'
    },
    copyBtn: {
        background: 'rgba(255, 152, 0, 0.2)',
        border: '1px solid rgba(255, 152, 0, 0.4)',
        color: '#ff9800',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    startSessionBtn: {
        background: 'rgba(76, 175, 80, 0.2)',
        border: '1px solid rgba(76, 175, 80, 0.4)',
        color: '#4caf50',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px'
    },
    createForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
    formInput: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '14px 16px',
        color: '#fff',
        fontSize: '14px'
    },
    formTextarea: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '14px 16px',
        color: '#fff',
        fontSize: '14px',
        minHeight: '80px',
        resize: 'vertical'
    },
    createBtn: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none',
        color: '#fff',
        padding: '14px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: 'bold'
    },
    toggleLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#ccc'
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer'
    },
    toggleIcon: {
        fontSize: '18px'
    },
    note: {
        color: '#888',
        fontSize: '12px',
        textAlign: 'center',
        padding: '15px',
        background: 'rgba(255, 215, 0, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 215, 0, 0.2)'
    },
    empty: { textAlign: 'center', padding: '30px', color: '#888' },
    // Live session styles
    liveContainer: {
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto'
    },
    liveHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px'
    },
    liveTitleText: { margin: '0 0 5px 0', fontSize: '18px' },
    liveStatus: { fontSize: '13px', color: '#888' },
    liveIndicator: { color: '#e53935', fontWeight: 'bold' },
    offlineIndicator: { color: '#888' },
    liveActions: { display: 'flex', gap: '10px' },
    startBtn: {
        background: 'linear-gradient(135deg, #43a047, #66bb6a)',
        border: 'none',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    stopBtn: {
        background: 'linear-gradient(135deg, #e53935, #ef5350)',
        border: 'none',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    leaveBtn: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    activeViewBtn: {
        background: 'rgba(102, 126, 234, 0.4)',
        border: '1px solid #667eea',
        color: '#fff',
        padding: '5px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 'bold'
    },
    inactiveViewBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#ccc',
        padding: '5px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px'
    },
    codeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        background: 'rgba(255, 255, 255, 0.05)',
        fontSize: '13px',
        color: '#888'
    },
    languageBadge: {
        background: 'rgba(102, 126, 234, 0.3)',
        padding: '3px 10px',
        borderRadius: '10px',
        fontSize: '11px'
    },
    codeEditor: {
        width: '100%',
        flex: 1,
        background: 'transparent',
        border: 'none',
        color: '#e0e0e0',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '14px',
        padding: '15px',
        resize: 'none',
        outline: 'none',
        overflow: 'auto'
    },
    codeViewer: {
        margin: 0,
        padding: '15px',
        flex: 1,
        color: '#e0e0e0',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '14px',
        whiteSpace: 'pre-wrap',
        overflow: 'auto'
    },
    workspaceContainer: {
        display: 'flex',
        gap: '20px',
        alignItems: 'stretch',
        height: 'calc(100vh - 220px)',
        minHeight: '500px'
    },
    codeContainer: {
        flex: 3,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    },
    rosterContainer: {
        flex: 1,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    rosterTitle: {
        margin: '0 0 10px 0',
        fontSize: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '10px'
    },
    rosterList: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    participantCard: {
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '10px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    participantInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },
    participantName: {
        fontSize: '14px',
        fontWeight: '500'
    },
    chalkBadge: {
        background: '#e67e22',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold'
    },
    handBadge: {
        background: '#f1c40f',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '12px'
    },
    participantActions: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    grantBtn: {
        background: '#2ecc71',
        color: '#fff',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    revokeBtn: {
        background: '#e74c3c',
        color: '#fff',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    raiseHandBtn: {
        background: 'transparent',
        border: '1px solid #f1c40f',
        color: '#f1c40f',
        padding: '10px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        marginTop: '10px'
    },
    yieldBtn: {
        background: '#e74c3c',
        border: 'none',
        color: '#fff',
        padding: '10px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        marginTop: '10px'
    },
    chatSection: {
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '15px',
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 35%',
        minHeight: '180px'
    },
    chatMessages: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '10px',
        paddingRight: '5px'
    },
    chatMessageBubble: {
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '8px 10px',
        borderRadius: '8px',
        wordBreak: 'break-word'
    },
    chatForm: {
        display: 'flex',
        gap: '8px'
    },
    chatInput: {
        flex: 1,
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        padding: '8px 10px',
        borderRadius: '6px',
        fontSize: '13px',
        outline: 'none'
    },
    chatSendBtn: {
        background: '#667eea',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '13px'
    }
};

export default Classroom;
