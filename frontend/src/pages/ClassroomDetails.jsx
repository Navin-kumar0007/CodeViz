import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import API_BASE from '../utils/api';

const API = API_BASE;

const ClassroomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useMemo(() => JSON.parse(localStorage.getItem('userInfo')), []);

    const [classroom, setClassroom] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Assignment creation modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [starterCode, setStarterCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [dueDate, setDueDate] = useState('');
    const [maxPoints, setMaxPoints] = useState(100);
    const [expectedOutput, setExpectedOutput] = useState('');

    // Assignment solve modal
    const [showSolveModal, setShowSolveModal] = useState(false);
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [solveCode, setSolveCode] = useState('');
    const [solveResult, setSolveResult] = useState(null);
    const [isAutograding, setIsAutograding] = useState(false);

    const headers = useMemo(() => {
        return { Authorization: `Bearer ${user?.token}` };
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [classRes, assignRes] = await Promise.all([
                axios.get(`${API}/api/campus/classrooms/${id}`, { headers }),
                axios.get(`${API}/api/campus/classrooms/${id}/assignments`, { headers })
            ]);
            setClassroom(classRes.data);
            setAssignments(assignRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load classroom details');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user, navigate]);

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/campus/classrooms/${id}/assignments`, {
                title, description, starterCode, expectedOutput, language, dueDate, maxPoints, isPublished: true
            }, { headers });
            setShowCreateModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create assignment');
        }
    };

    if (loading) return <div style={styles.center}>Loading classroom...</div>;
    if (error) return <div style={styles.center}>{error}</div>;
    if (!classroom) return <div style={styles.center}>Classroom not found</div>;

    const isInstructor = user?.role === 'instructor' && classroom.instructor._id === user._id;

    const openSolveModal = (assignment) => {
        setActiveAssignment(assignment);
        setSolveCode(assignment.starterCode || '');
        setSolveResult(null);
        setShowSolveModal(true);
    };

    const handleSolveSubmit = async () => {
        setIsAutograding(true);
        try {
            const { data } = await axios.post(`${API}/api/autograder/${activeAssignment._id}`, {
                code: solveCode
            }, { headers });

            setSolveResult(data);
            if (data.success) {
                fetchData(); // Refresh assignments list to see grade
            }
        } catch (err) {
            setSolveResult({
                success: false,
                feedback: err.response?.data?.message || err.response?.data?.error || 'Failed to submit'
            });
        }
        setIsAutograding(false);
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div>
                    <button style={styles.backBtn} onClick={() => navigate('/campus')}>← Back to Campus</button>
                    <h1 style={styles.title}>{classroom.name}</h1>
                    <p style={styles.subtitle}>{classroom.description}</p>
                </div>
                {isInstructor && (
                    <div style={styles.instructorPanel}>
                        <span style={styles.codeBadge}>Enrollment Code: {classroom.code}</span>
                        <button style={styles.primaryBtn} onClick={() => setShowCreateModal(true)}>
                            + New Assignment
                        </button>
                    </div>
                )}
            </header>

            <div style={styles.content}>
                {/* Roster / Members Panel */}
                <div style={styles.rosterPanel}>
                    <h2>👥 Members ({classroom.students?.length || 0})</h2>
                    <div style={styles.memberList}>
                        <div style={styles.memberItem}>
                            <strong>{classroom.instructor.name}</strong>
                            <span style={styles.roleTag}>Instructor</span>
                        </div>
                        {classroom.students?.map(s => (
                            <div key={s._id} style={styles.memberItem}>
                                <span>{s.name}</span>
                                <span style={styles.xpText}>{s.xp || 0} XP</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Assignments Panel */}
                <div style={styles.assignmentPanel}>
                    <h2>📝 Assignments</h2>
                    {assignments.length === 0 ? (
                        <div style={styles.emptyState}>No assignments posted yet.</div>
                    ) : (
                        assignments.map(a => (
                            <div key={a._id} style={styles.assignmentCard}>
                                <div style={styles.assignmentHeader}>
                                    <h3>{a.title}</h3>
                                    <span style={styles.pointsBadge}>{a.maxPoints} pts</span>
                                </div>
                                <p style={styles.assignmentDesc}>{a.description}</p>
                                <div style={styles.assignmentMeta}>
                                    <span style={styles.langTag}>{a.language}</span>
                                    {a.dueDate && (
                                        <span style={styles.dueTag}>
                                            Due: {new Date(a.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <button
                                    style={a.submissions?.some(s => s.student === user._id) ? styles.secondaryBtnFull : styles.solveBtn}
                                    onClick={() => openSolveModal(a)}
                                >
                                    {a.submissions?.some(s => s.student === user._id) ? 'Re-Submit Assignment' : 'Solve Assignment'}
                                </button>
                                {a.submissions?.some(s => s.student === user._id) && (
                                    <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(72,187,120,0.1)', color: '#48bb78', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                        Score: {a.submissions.find(s => s.student === user._id).grade} / {a.maxPoints}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Assignment Modal */}
            {showCreateModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h2>Create Assignment</h2>
                        <form onSubmit={handleCreateAssignment} style={styles.form}>
                            <input style={styles.input} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
                            <textarea style={styles.textarea} placeholder="Description/Instructions" value={description} onChange={e => setDescription(e.target.value)} required />

                            <div style={styles.row}>
                                <select style={styles.input} value={language} onChange={e => setLanguage(e.target.value)}>
                                    <option value="python">Python</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="go">Go</option>
                                    <option value="c">C</option>
                                </select>
                                <input style={styles.input} type="number" placeholder="Max Points" value={maxPoints} onChange={e => setMaxPoints(e.target.value)} required />
                            </div>

                            <input style={styles.input} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />

                            <textarea
                                style={{ ...styles.textarea, fontFamily: 'monospace' }}
                                placeholder="Starter Code (optional)"
                                value={starterCode}
                                onChange={e => setStarterCode(e.target.value)}
                            />

                            <textarea
                                style={{ ...styles.textarea, fontFamily: 'monospace' }}
                                placeholder="Expected Output (Exact match for Autograder)"
                                value={expectedOutput}
                                onChange={e => setExpectedOutput(e.target.value)}
                            />

                            <div style={styles.modalActions}>
                                <button type="button" style={styles.secondaryBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" style={styles.primaryBtn}>Publish</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Solve Assignment Modal */}
            {showSolveModal && activeAssignment && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.modal, maxWidth: '800px', width: '90vw', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2 style={{ margin: 0 }}>Solve: {activeAssignment.title}</h2>
                            <button onClick={() => setShowSolveModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <p style={{ color: '#cbd5e0', marginBottom: '15px' }}>{activeAssignment.description}</p>

                        <div style={{ flex: 1, border: '1px solid #4a5568', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' }}>
                            <Editor
                                height="100%"
                                language={activeAssignment.language}
                                theme="vs-dark"
                                value={solveCode}
                                onChange={setSolveCode}
                                options={{ minimap: { enabled: false } }}
                            />
                        </div>

                        {solveResult && (
                            <div style={{
                                padding: '15px',
                                background: solveResult.isCorrect ? 'rgba(72,187,120,0.1)' : 'rgba(252,129,129,0.1)',
                                border: `1px solid ${solveResult.isCorrect ? '#48bb78' : '#fc8181'}`,
                                borderRadius: '8px',
                                marginBottom: '15px'
                            }}>
                                <h3 style={{ margin: '0 0 10px 0', color: solveResult.isCorrect ? '#48bb78' : '#fc8181' }}>
                                    {solveResult.isCorrect ? '✅ Autograder Passed!' : '❌ Autograder Failed'}
                                    <span style={{ float: 'right' }}>{solveResult.grade} / {activeAssignment.maxPoints} pts</span>
                                </h3>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '13px', color: '#e2e8f0' }}>
                                    {solveResult.feedback}
                                </pre>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button onClick={() => setShowSolveModal(false)} style={styles.secondaryBtn}>Close</button>
                            <button onClick={handleSolveSubmit} disabled={isAutograding} style={styles.primaryBtn}>
                                {isAutograding ? '⏳ Autograding...' : '🚀 Submit Code'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' },
    page: { padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px' },
    backBtn: { background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '10px' },
    title: { fontSize: '32px', margin: '0 0 10px 0', color: '#fff' },
    subtitle: { color: '#a0aec0', margin: 0 },
    instructorPanel: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' },
    codeBadge: { background: 'rgba(72, 187, 120, 0.2)', color: '#48bb78', padding: '8px 16px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' },
    primaryBtn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    content: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' },
    rosterPanel: { background: '#1a202c', padding: '20px', borderRadius: '12px', border: '1px solid #2d3748', height: 'fit-content' },
    memberList: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
    memberItem: { display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#2d3748', borderRadius: '8px' },
    roleTag: { background: '#764ba2', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' },
    xpText: { color: '#f6ad55', fontWeight: 'bold' },
    assignmentPanel: { display: 'flex', flexDirection: 'column', gap: '20px' },
    emptyState: { padding: '40px', textAlign: 'center', background: '#1a202c', borderRadius: '12px', color: '#718096', border: '1px dashed #4a5568' },
    assignmentCard: { background: '#2d3748', padding: '20px', borderRadius: '12px', border: '1px solid #4a5568' },
    assignmentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    pointsBadge: { background: 'rgba(246, 173, 85, 0.2)', color: '#f6ad55', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
    assignmentDesc: { color: '#e2e8f0', marginTop: '10px', marginBottom: '15px' },
    assignmentMeta: { display: 'flex', gap: '10px', marginBottom: '15px' },
    langTag: { background: '#4a5568', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' },
    dueTag: { background: 'rgba(252, 129, 129, 0.2)', color: '#fc8181', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' },
    solveBtn: { width: '100%', background: '#48bb78', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    secondaryBtnFull: { width: '100%', background: 'transparent', color: '#fff', border: '1px solid #48bb78', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#1a202c', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid #4a5568' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
    row: { display: 'flex', gap: '15px' },
    input: { flex: 1, padding: '12px', borderRadius: '8px', background: '#2d3748', border: '1px solid #4a5568', color: '#fff', fontSize: '16px' },
    textarea: { padding: '12px', borderRadius: '8px', background: '#2d3748', border: '1px solid #4a5568', color: '#fff', fontSize: '16px', minHeight: '100px' },
    secondaryBtn: { background: 'transparent', color: '#fff', border: '1px solid #555', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }
};

export default ClassroomDetails;
