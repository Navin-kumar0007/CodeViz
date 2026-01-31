import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

/**
 * Classroom - Join or create live classroom sessions with instructors
 */

const Classroom = () => {
    const navigate = useNavigate();
    const { id } = useParams();  // Classroom ID from URL if viewing specific classroom

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

    // New classroom form
    const [newClassroomName, setNewClassroomName] = useState('');
    const [newClassroomDesc, setNewClassroomDesc] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const socketRef = useRef(null);

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
    }, []);

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
        setActiveTab('join');
    };

    // Instructor: Update code (broadcasts to students)
    const updateCode = (code) => {
        setLiveCode(code);
        if (socketRef.current && currentClassroom?.instructor?._id === user?._id) {
            socketRef.current.emit('code-update', { code, language: liveLanguage });
        }
    };

    // Instructor: Start live session
    const startSession = () => {
        if (socketRef.current) {
            socketRef.current.emit('start-session');
        }
    };

    // Instructor: End live session
    const endSession = () => {
        if (socketRef.current) {
            socketRef.current.emit('end-session');
        }
    };

    const joinClassroom = async () => {
        if (!classroomCode.trim()) {
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
                body: JSON.stringify({ code: classroomCode })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('Successfully joined classroom!');
                setClassroomCode('');
                fetchMyClassrooms();
            } else {
                setError(data.message || 'Failed to join classroom');
            }
        } catch (error) {
            setError('Failed to join classroom');
        } finally {
            setLoading(false);
        }
    };

    const createClassroom = async () => {
        if (!newClassroomName.trim()) {
            setError('Please enter a classroom name');
            return;
        }
        if (!user?.token) {
            setError('Please log in to create a classroom');
            return;
        }
        if (user?.role !== 'instructor') {
            setError('Only instructors can create classrooms');
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
        } catch (error) {
            setError('Failed to create classroom');
        } finally {
            setLoading(false);
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
                                    {!isLive ? (
                                        <button onClick={startSession} style={styles.startBtn}>
                                            ▶ Start Session
                                        </button>
                                    ) : (
                                        <button onClick={endSession} style={styles.stopBtn}>
                                            ⬛ End Session
                                        </button>
                                    )}
                                </>
                            )}
                            <button onClick={disconnectFromClassroom} style={styles.leaveBtn}>
                                Leave
                            </button>
                        </div>
                    </div>

                    <div style={styles.codeContainer}>
                        <div style={styles.codeHeader}>
                            <span>📝 {isInstructor ? 'Your Code (Broadcasting)' : 'Instructor\'s Code'}</span>
                            <span style={styles.languageBadge}>{liveLanguage}</span>
                        </div>
                        {isInstructor ? (
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

                                    {user?.role === 'instructor' ? (
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        padding: '20px'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
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
        maxWidth: '900px',
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
    codeContainer: {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden'
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
        minHeight: '400px',
        background: 'transparent',
        border: 'none',
        color: '#e0e0e0',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '14px',
        padding: '15px',
        resize: 'vertical',
        outline: 'none'
    },
    codeViewer: {
        margin: 0,
        padding: '15px',
        minHeight: '400px',
        color: '#e0e0e0',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '14px',
        whiteSpace: 'pre-wrap',
        overflow: 'auto'
    }
};

export default Classroom;
