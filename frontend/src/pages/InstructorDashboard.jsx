import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE, { API } from '../utils/api';
import IntegrityReport from '../components/Integrity/IntegrityReport';

/**
 * InstructorDashboard - Analytics dashboard for instructors
 * Shows classroom stats, student progress, and performance metrics
 */

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Dashboard data
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [classroomAnalytics, setClassroomAnalytics] = useState(null);
    const [students, setStudents] = useState([]);
    const [sortBy, setSortBy] = useState('totalScore');
    const [sortOrder, setSortOrder] = useState('desc');
    const [integrityRows, setIntegrityRows] = useState([]);
    const [integritySubId, setIntegritySubId] = useState(null);
    const [gradebook, setGradebook] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        API.get('/api/integrity/recent?limit=25')
            .then((r) => setIntegrityRows(Array.isArray(r.data) ? r.data : []))
            .catch(() => { /* not an instructor / none yet */ });
    }, []);

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

    // Check if user is instructor
    useEffect(() => {
        if (!user || user.role !== 'instructor') {
            navigate('/');
            return;
        }
        fetchDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/analytics/dashboard`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setDashboardData(data);

                // Auto-select first classroom
                if (data.classrooms?.length > 0) {
                    selectClassroom(data.classrooms[0]);
                }
            } else {
                setError('Failed to load dashboard');
            }
        } catch (error) {
            console.error('Dashboard error:', error);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const selectClassroom = async (classroom) => {
        setSelectedClassroom(classroom);
        setGradebook(null);

        try {
            // Fetch detailed analytics for this classroom
            const [analyticsRes, studentsRes, gradebookRes] = await Promise.all([
                fetch(`${API_BASE}/api/analytics/classroom/${classroom._id}`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }),
                fetch(`${API_BASE}/api/analytics/classroom/${classroom._id}/students?sortBy=${sortBy}&order=${sortOrder}`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }),
                fetch(`${API_BASE}/api/campus/classrooms/${classroom._id}/gradebook`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                })
            ]);

            if (analyticsRes.ok) {
                const analytics = await analyticsRes.json();
                setClassroomAnalytics(analytics);
            }

            if (studentsRes.ok) {
                const data = await studentsRes.json();
                setStudents(data.students || []);
            }

            if (gradebookRes.ok) {
                setGradebook(await gradebookRes.json());
            }
        } catch (error) {
            console.error('Error fetching classroom data:', error);
        }
    };

    // Download the gradebook CSV (auth header needed, so fetch → blob → anchor click).
    const exportGradebook = async () => {
        if (!selectedClassroom) return;
        setExporting(true);
        try {
            const res = await fetch(`${API_BASE}/api/campus/classrooms/${selectedClassroom._id}/gradebook.csv`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (!res.ok) throw new Error('export failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gradebook-${(selectedClassroom.name || 'classroom').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Gradebook export failed:', e);
        } finally {
            setExporting(false);
        }
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }

        // Re-fetch with new sort
        if (selectedClassroom) {
            selectClassroom(selectedClassroom);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading analytics...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <button onClick={() => navigate('/')} style={styles.backBtn}>
                    ← Dashboard
                </button>
                <h2 style={styles.title}>📊 Instructor Analytics</h2>
                <div style={styles.userBadge}>
                    {user?.name}
                    <span style={styles.roleBadge}>Instructor</span>
                </div>
            </header>

            {error && <div style={styles.error}>{error}</div>}

            {/* Summary Cards */}
            {dashboardData && (
                <div style={styles.summaryGrid}>
                    <div style={styles.summaryCard}>
                        <div style={styles.cardIcon}>🏫</div>
                        <div style={styles.cardValue}>{dashboardData.summary.totalClassrooms}</div>
                        <div style={styles.cardLabel}>Classrooms</div>
                    </div>
                    <div style={styles.summaryCard}>
                        <div style={styles.cardIcon}>👥</div>
                        <div style={styles.cardValue}>{dashboardData.summary.totalStudents}</div>
                        <div style={styles.cardLabel}>Total Students</div>
                    </div>
                    <div style={styles.summaryCard}>
                        <div style={styles.cardIcon}>🏆</div>
                        <div style={styles.cardValue}>{dashboardData.summary.avgScoreAcrossAll}</div>
                        <div style={styles.cardLabel}>Avg Score</div>
                    </div>
                    <div style={styles.summaryCard}>
                        <div style={styles.cardIcon}>📚</div>
                        <div style={styles.cardValue}>{dashboardData.summary.avgLessonsAcrossAll}</div>
                        <div style={styles.cardLabel}>Avg Lessons</div>
                    </div>
                </div>
            )}

            {/* Academic Integrity signals */}
            {integrityRows.length > 0 && (
                <div style={{ background: 'var(--cz-surface)', border: '1px solid var(--cz-line)', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: 'var(--cz-shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--cz-text)' }}>🔍 Academic Integrity</span>
                        <span style={{ fontSize: 12, color: 'var(--cz-muted)' }}>recent submissions · behavioural signals, not verdicts</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {integrityRows.map((r) => {
                            const c = r.flag === 'high' ? 'var(--cz-hard)' : r.flag === 'medium' ? 'var(--cz-warning)' : 'var(--cz-success)';
                            return (
                                <div key={r.submissionId} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--cz-elevated)', border: '1px solid var(--cz-line)', borderRadius: 10, padding: '10px 14px' }}>
                                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cz-text)', minWidth: 120 }}>{r.user?.name || 'Student'}</span>
                                    <span style={{ fontSize: 12, color: 'var(--cz-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.problem?.title || 'Problem'}</span>
                                    {r.pastePct !== null && <span style={{ fontSize: 12, color: c, fontWeight: 700 }}>{r.pastePct}% pasted</span>}
                                    <button onClick={() => setIntegritySubId(r.submissionId)} style={{ fontSize: 12, fontWeight: 700, color: 'var(--cz-accent)', background: 'transparent', border: '1px solid var(--cz-line)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>View</button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Classroom Selector */}
                <div style={styles.sidebar}>
                    <h3 style={styles.sidebarTitle}>Your Classrooms</h3>
                    {dashboardData?.classrooms?.length === 0 ? (
                        <p style={styles.noData}>No classrooms yet</p>
                    ) : (
                        <div style={styles.classroomList}>
                            {dashboardData?.classrooms?.map(classroom => (
                                <div
                                    key={classroom._id}
                                    style={{
                                        ...styles.classroomItem,
                                        ...(selectedClassroom?._id === classroom._id ? styles.selectedClassroom : {})
                                    }}
                                    onClick={() => selectClassroom(classroom)}
                                >
                                    <div style={styles.classroomName}>
                                        {classroom.name}
                                        {classroom.isLive && <span style={styles.liveDot}>●</span>}
                                    </div>
                                    <div style={styles.classroomMeta}>
                                        {classroom.studentCount} students • Avg: {classroom.avgScore}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Analytics Panel */}
                <div style={styles.analyticsPanel}>
                    {selectedClassroom ? (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedClassroom._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {/* Classroom Header */}
                                <div style={styles.classroomHeader}>
                                    <div>
                                        <h3 style={styles.classroomTitle}>{selectedClassroom.name}</h3>
                                        <span style={styles.classroomCode}>Code: {selectedClassroom.code}</span>
                                    </div>
                                    {classroomAnalytics && (
                                        <div style={styles.quickStats}>
                                            <div style={styles.quickStat}>
                                                <span style={styles.quickStatValue}>{classroomAnalytics.summary.engagementRate}%</span>
                                                <span style={styles.quickStatLabel}>Engagement</span>
                                            </div>
                                            <div style={styles.quickStat}>
                                                <span style={styles.quickStatValue}>{classroomAnalytics.summary.activeStudents}</span>
                                                <span style={styles.quickStatLabel}>Active</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Student Table */}
                                <div style={styles.tableContainer}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Student</th>
                                                <th
                                                    style={{ ...styles.th, ...styles.sortable }}
                                                    onClick={() => handleSort('lessonsCompleted')}
                                                >
                                                    Lessons {sortBy === 'lessonsCompleted' && (sortOrder === 'desc' ? '↓' : '↑')}
                                                </th>
                                                <th
                                                    style={{ ...styles.th, ...styles.sortable }}
                                                    onClick={() => handleSort('totalScore')}
                                                >
                                                    Score {sortBy === 'totalScore' && (sortOrder === 'desc' ? '↓' : '↑')}
                                                </th>
                                                <th style={styles.th}>Achievements</th>
                                                <th style={styles.th}>Last Active</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={styles.noStudents}>
                                                        No students enrolled yet
                                                    </td>
                                                </tr>
                                            ) : (
                                                students.map((student, idx) => (
                                                    <tr key={student._id} style={idx % 2 === 0 ? styles.evenRow : {}}>
                                                        <td style={styles.td}>
                                                            <div style={styles.studentName}>{student.name}</div>
                                                            <div style={styles.studentEmail}>{student.email}</div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={styles.lessonBadge}>{student.lessonsCompleted}</span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={styles.scoreBadge}>{student.totalScore}</span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            {student.achievements?.length || 0} 🏅
                                                        </td>
                                                        <td style={styles.td}>
                                                            {formatDate(student.lastActive)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Gradebook — assignment grades + integrity flags, CSV export */}
                                {gradebook && (
                                    <div style={{ marginTop: 24 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                                            <h4 style={styles.sectionTitle}>📊 Gradebook</h4>
                                            <button
                                                onClick={exportGradebook}
                                                disabled={exporting || gradebook.assignments.length === 0}
                                                style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'var(--cz-accent)', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: gradebook.assignments.length === 0 ? 'not-allowed' : 'pointer', opacity: gradebook.assignments.length === 0 ? 0.5 : 1 }}
                                            >
                                                {exporting ? 'Exporting…' : '⬇ Export CSV'}
                                            </button>
                                        </div>
                                        {gradebook.assignments.length === 0 ? (
                                            <div style={styles.noStudents}>No assignments yet — create one to start grading.</div>
                                        ) : (
                                            <div style={styles.tableContainer}>
                                                <table style={styles.table}>
                                                    <thead>
                                                        <tr>
                                                            <th style={styles.th}>Student</th>
                                                            {gradebook.assignments.map((a) => (
                                                                <th key={a.id} style={styles.th} title={`Max ${a.maxPoints}`}>{a.title}</th>
                                                            ))}
                                                            <th style={styles.th}>Overall</th>
                                                            <th style={styles.th}>Integrity</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {gradebook.rows.length === 0 ? (
                                                            <tr><td colSpan={gradebook.assignments.length + 3} style={styles.noStudents}>No students enrolled yet</td></tr>
                                                        ) : gradebook.rows.map((row, idx) => (
                                                            <tr key={row.student.id} style={idx % 2 === 0 ? styles.evenRow : {}}>
                                                                <td style={styles.td}>
                                                                    <div style={styles.studentName}>{row.student.name}</div>
                                                                    <div style={styles.studentEmail}>{row.student.email}</div>
                                                                </td>
                                                                {row.cells.map((c, i) => (
                                                                    <td key={i} style={styles.td}>
                                                                        {!c ? <span style={{ color: 'var(--cz-faint)' }}>—</span> : (
                                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                                                                <b>{c.grade === null ? '·' : c.grade}</b>
                                                                                {c.late && <span title="Submitted after due date" style={{ fontSize: 10, color: 'var(--cz-warning, #e08a2b)' }}>late</span>}
                                                                                {c.flagged && <span title={`High paste ratio (${Math.round((c.pasteRatio || 0) * 100)}% pasted)`} style={{ fontSize: 12 }}>⚠️</span>}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                ))}
                                                                <td style={styles.td}><span style={styles.scoreBadge}>{row.overallPct === null ? '—' : `${row.overallPct}%`}</span></td>
                                                                <td style={styles.td}>
                                                                    {row.flags > 0
                                                                        ? <span title={`${row.flags} flagged submission(s)`} style={{ fontSize: 12, fontWeight: 700, color: 'var(--cz-danger, #d64545)' }}>⚠️ {row.flags}</span>
                                                                        : <span style={{ color: 'var(--cz-success, #3aa06d)', fontSize: 12 }}>✓ clean</span>}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Top Performers */}
                                {classroomAnalytics?.topPerformers?.length > 0 && (
                                    <div style={styles.topSection}>
                                        <h4 style={styles.sectionTitle}>🏆 Top Performers</h4>
                                        <div style={styles.topList}>
                                            {classroomAnalytics.topPerformers.slice(0, 3).map((student, idx) => (
                                                <div key={student._id} style={styles.topItem}>
                                                    <span style={styles.topRank}>#{idx + 1}</span>
                                                    <span style={styles.topName}>{student.name}</span>
                                                    <span style={styles.topScore}>{student.totalScore} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div style={styles.selectPrompt}>
                            <span style={{ fontSize: '48px' }}>📈</span>
                            <p>Select a classroom to view analytics</p>
                        </div>
                    )}
                </div>
            </div>

            {integritySubId && <IntegrityReport submissionId={integritySubId} onClose={() => setIntegritySubId(null)} />}
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '20px'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid var(--border-color)'
    },
    backBtn: {
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    title: { margin: 0, fontSize: '24px' },
    userBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(13, 148, 136, 0.2)',
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
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        color: 'var(--text-muted)'
    },
    error: {
        background: 'rgba(255, 100, 100, 0.2)',
        border: '1px solid rgba(255, 100, 100, 0.5)',
        color: '#ff6b6b',
        padding: '10px 15px',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '25px'
    },
    summaryCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center'
    },
    cardIcon: { fontSize: '28px', marginBottom: '10px' },
    cardValue: { fontSize: '32px', fontWeight: 'bold', color: 'var(--accent-teal)' },
    cardLabel: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' },
    mainContent: {
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '20px'
    },
    sidebar: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '15px'
    },
    sidebarTitle: {
        margin: '0 0 15px 0',
        fontSize: '14px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    noData: { color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' },
    classroomList: { display: 'flex', flexDirection: 'column', gap: '8px' },
    classroomItem: {
        padding: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: 'rgba(255, 255, 255, 0.02)'
    },
    selectedClassroom: {
        background: 'rgba(13, 148, 136, 0.2)',
        border: '1px solid rgba(13, 148, 136, 0.4)'
    },
    classroomName: {
        fontWeight: '600',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    liveDot: { color: '#e53935', fontSize: '10px' },
    classroomMeta: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' },
    analyticsPanel: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '20px'
    },
    classroomHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    classroomTitle: { margin: '0 0 5px 0', fontSize: '20px' },
    classroomCode: { color: 'var(--text-muted)', fontSize: '13px' },
    quickStats: { display: 'flex', gap: '20px' },
    quickStat: { textAlign: 'center' },
    quickStatValue: { display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#4caf50' },
    quickStatLabel: { fontSize: '11px', color: 'var(--text-muted)' },
    tableContainer: {
        overflowX: 'auto',
        marginBottom: '20px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px'
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'var(--text-muted)',
        fontWeight: '600',
        fontSize: '11px',
        textTransform: 'uppercase'
    },
    sortable: { cursor: 'pointer' },
    td: {
        padding: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    evenRow: { background: 'rgba(255, 255, 255, 0.02)' },
    noStudents: {
        textAlign: 'center',
        color: 'var(--text-muted)',
        padding: '30px'
    },
    studentName: { fontWeight: '500' },
    studentEmail: { fontSize: '11px', color: 'var(--text-muted)' },
    lessonBadge: {
        background: 'rgba(13, 148, 136, 0.2)',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px'
    },
    scoreBadge: {
        background: 'rgba(76, 175, 80, 0.2)',
        color: '#4caf50',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    topSection: { marginTop: '20px' },
    sectionTitle: {
        margin: '0 0 12px 0',
        fontSize: '14px'
    },
    topList: { display: 'flex', gap: '10px' },
    topItem: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        background: 'rgba(255, 215, 0, 0.1)',
        borderRadius: '8px'
    },
    topRank: { fontWeight: 'bold', color: '#ffd700' },
    topName: { flex: 1 },
    topScore: { color: '#4caf50', fontWeight: 'bold' },
    selectPrompt: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        color: 'var(--text-muted)'
    }
};

export default InstructorDashboard;
