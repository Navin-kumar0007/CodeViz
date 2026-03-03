import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5001';

const CampusDashboard = () => {
    const navigate = useNavigate();
    const user = useMemo(() => JSON.parse(localStorage.getItem('userInfo')), []);

    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const headers = useMemo(() => {
        return { Authorization: `Bearer ${user?.token}` };
    }, [user]);

    const fetchClassrooms = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/api/campus/classrooms`, { headers });
            setClassrooms(data);
        } catch (err) {
            console.error('Failed to fetch classrooms:', err);
            setError('Failed to load classrooms');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchClassrooms();
    }, [user, navigate, headers]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/campus/classrooms`, { name, description }, { headers });
            setShowCreateModal(false);
            setName('');
            setDescription('');
            fetchClassrooms();
        } catch (err) {
            alert(err.response?.data?.error || err.response?.data?.message || 'Creation failed');
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/campus/classrooms/join`, { code: joinCode }, { headers });
            setShowJoinModal(false);
            setJoinCode('');
            fetchClassrooms();
        } catch (err) {
            alert(err.response?.data?.error || err.response?.data?.message || 'Failed to join');
        }
    };

    if (loading) return <div style={styles.center}>Loading classrooms...</div>;
    if (error) return <div style={styles.center}>{error}</div>;

    const isInstructor = user?.role === 'instructor';

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>🏫 Campus Edition</h1>
                    <p style={styles.subtitle}>
                        {isInstructor ? 'Manage your classrooms and assignments' : 'View your enrolled classrooms'}
                    </p>
                </div>
                <div style={styles.actions}>
                    {isInstructor ? (
                        <button style={styles.primaryBtn} onClick={() => setShowCreateModal(true)}>
                            + Create Classroom
                        </button>
                    ) : (
                        <button style={styles.primaryBtn} onClick={() => setShowJoinModal(true)}>
                            🔗 Join Classroom
                        </button>
                    )}
                </div>
            </header>

            <div style={styles.grid}>
                {classrooms.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>You don't have any classrooms yet.</p>
                    </div>
                ) : (
                    classrooms.map(c => (
                        <div key={c._id} style={styles.card} onClick={() => navigate(`/campus/${c._id}`)}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.cardTitle}>{c.name}</h3>
                                {isInstructor && <span style={styles.codeBadge}>Code: {c.code}</span>}
                            </div>
                            <p style={styles.cardDesc}>{c.description || 'No description provided.'}</p>
                            <div style={styles.cardMeta}>
                                {!isInstructor && (
                                    <span style={styles.instructorTag}>
                                        Instructor: {c.instructor?.name || 'Unknown'}
                                    </span>
                                )}
                                <span style={styles.studentCount}>
                                    👥 {c.students?.length || 0} students
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h2>Create New Classroom</h2>
                        <form onSubmit={handleCreate} style={styles.form}>
                            <input
                                style={styles.input}
                                placeholder="Classroom Name (e.g., CS 101)"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                            <textarea
                                style={styles.textarea}
                                placeholder="Description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                            <div style={styles.modalActions}>
                                <button type="button" style={styles.secondaryBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" style={styles.primaryBtn}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Modal */}
            {showJoinModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h2>Join Classroom</h2>
                        <form onSubmit={handleJoin} style={styles.form}>
                            <input
                                style={styles.input}
                                placeholder="Enter 6-character connect code"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                maxLength={6}
                                required
                            />
                            <div style={styles.modalActions}>
                                <button type="button" style={styles.secondaryBtn} onClick={() => setShowJoinModal(false)}>Cancel</button>
                                <button type="submit" style={styles.primaryBtn}>Join</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' },
    page: { padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#fff' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
    title: { fontSize: '32px', margin: '0 0 10px 0', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { color: '#aaa', margin: 0 },
    primaryBtn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    secondaryBtn: { background: 'transparent', color: '#fff', border: '1px solid #555', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { background: '#2d3748', borderRadius: '12px', padding: '20px', cursor: 'pointer', border: '1px solid #4a5568', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-5px)' } },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    cardTitle: { margin: 0, fontSize: '20px' },
    codeBadge: { background: 'rgba(72, 187, 120, 0.2)', color: '#48bb78', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
    cardDesc: { color: '#a0aec0', fontSize: '14px', marginBottom: '15px' },
    cardMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e0' },
    emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#2d3748', borderRadius: '12px', color: '#a0aec0' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#1a202c', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #4a5568' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
    input: { padding: '12px', borderRadius: '8px', background: '#2d3748', border: '1px solid #4a5568', color: '#fff', fontSize: '16px' },
    textarea: { padding: '12px', borderRadius: '8px', background: '#2d3748', border: '1px solid #4a5568', color: '#fff', fontSize: '16px', minHeight: '100px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }
};

export default CampusDashboard;
