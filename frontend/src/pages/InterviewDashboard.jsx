import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewDashboard = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const authHeaders = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/interview/history`, authHeaders);
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setLoading(false);
        }
    };

    const createInvite = async () => {
        const email = prompt("Enter candidate email:");
        if (!email) return;
        try {
            const res = await axios.post(`${API_BASE}/api/interview/recruiter/create`, {
                candidateEmail: email,
                mode: 'mixed'
            }, authHeaders);
            alert(`Invite created! Link: ${window.location.origin}/live-interview/${res.data.session._id}`);
            fetchSessions();
        } catch (err) {
            alert("Failed to create invite");
        }
    };

    return (
        <div style={S.container}>
            <header style={S.header}>
                <div>
                    <h1 style={S.title}>CodeViz Recruit 🛡️</h1>
                    <p style={S.subtitle}>Proof-of-Work Technical Assessment Dashboard</p>
                </div>
                <button onClick={createInvite} style={S.inviteBtn}>+ Create Interview Invite</button>
            </header>

            <div style={S.statsGrid}>
                <div style={S.statCard}>
                    <div style={S.statValue}>{sessions.length}</div>
                    <div style={S.statLabel}>Total Assessments</div>
                </div>
                <div style={S.statCard}>
                    <div style={{...S.statValue, color: 'var(--accent-green)'}}>{sessions.filter(s => s.totalScore > 70).length}</div>
                    <div style={S.statLabel}>High Intuition Candidates</div>
                </div>
            </div>

            <div style={S.tableCard}>
                <table style={S.table}>
                    <thead>
                        <tr style={S.tableHeader}>
                            <th style={S.th}>Candidate</th>
                            <th style={S.th}>Status</th>
                            <th style={S.th}>Score</th>
                            <th style={S.th}>Intuition</th>
                            <th style={S.th}>Date</th>
                            <th style={S.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={S.loading}>Loading assessments...</td></tr>
                        ) : sessions.map(session => (
                            <tr key={session.id} style={S.tr}>
                                <td style={S.td}>
                                    <div style={S.candidateName}>{session.candidateEmail || 'Anonymous'}</div>
                                    <div style={S.sessionId}>ID: {session.id.slice(-6)}</div>
                                </td>
                                <td style={S.td}>
                                    <span style={{
                                        ...S.statusBadge,
                                        background: session.status === 'completed' ? 'rgba(72,187,120,0.2)' : 'rgba(246,173,85,0.2)',
                                        color: session.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-yellow)'
                                    }}>
                                        {session.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={S.td}>
                                    <div style={S.scoreValue}>{session.totalScore}%</div>
                                </td>
                                <td style={S.td}>
                                    <div style={{
                                        ...S.intuitionScore,
                                        color: session.totalScore > 80 ? 'var(--accent-green)' : session.totalScore > 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'
                                    }}>
                                        {session.totalScore > 0 ? 'High' : 'N/A'}
                                    </div>
                                </td>
                                <td style={S.td}>{new Date(session.date).toLocaleDateString()}</td>
                                <td style={S.td}>
                                    <button onClick={() => navigate(`/live-interview/${session.id}`)} style={S.viewBtn}>View Replay ⏪</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const S = {
    container: { padding: '40px', background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    title: { fontSize: '28px', margin: 0, background: 'linear-gradient(to right, #0df2f2, #a45afe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' },
    subtitle: { color: '#8890b5', margin: '5px 0 0 0' },
    inviteBtn: { background: 'linear-gradient(135deg, #0df2f2, #00ffaa)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 20px rgba(13, 242, 242, 0.3)' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { background: 'rgba(13, 242, 242, 0.05)', border: '1px solid rgba(13, 242, 242, 0.1)', padding: '20px', borderRadius: '12px', textAlign: 'center' },
    statValue: { fontSize: '32px', fontWeight: 'bold', color: '#0df2f2' },
    statLabel: { fontSize: '12px', color: '#8890b5', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' },
    tableCard: { background: 'rgba(10, 10, 15, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { background: 'rgba(255, 255, 255, 0.02)', textAlign: 'left' },
    th: { padding: '15px 20px', color: '#4a5070', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
    td: { padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' },
    candidateName: { fontWeight: 'bold', fontSize: '14px' },
    sessionId: { fontSize: '10px', color: '#4a5070', marginTop: '4px' },
    statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },
    scoreValue: { fontWeight: 'bold', fontSize: '16px' },
    intuitionScore: { fontWeight: 'bold', fontSize: '14px' },
    viewBtn: { background: 'rgba(164, 90, 254, 0.1)', color: '#a45afe', border: '1px solid rgba(164, 90, 254, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s' },
    loading: { textAlign: 'center', padding: '40px', color: '#4a5070' }
};

export default InterviewDashboard;
