import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE from '../utils/api';

/**
 * 🎓 Career Pathway Page
 * Displays the visual skill tree and verifiable certificates
 */
const CareerPathway = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const authHeaders = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/certificates/my`, authHeaders);
            setCertificates(res.data);
        } catch (err) {
            console.error('Failed to fetch certificates:', err);
        } finally {
            setLoading(false);
        }
    };

    const SKILLS = [
        { id: 'python', label: 'Python Mastery', level: 85, color: '#3776ab' },
        { id: 'dsa', label: 'Data Structures', level: 70, color: '#f7df1e' },
        { id: 'algo', label: 'Algorithms', level: 60, color: '#007acc' },
        { id: 'visual', label: 'Visual Debugging', level: 95, color: '#0df2f2' }
    ];

    return (
        <div style={S.container}>
            <header style={S.header}>
                <h1 style={S.title}>My Career Pathway 🚀</h1>
                <p style={S.subtitle}>Track your algorithmic mastery and verifiable credentials</p>
            </header>

            <div style={S.grid}>
                {/* 🌳 Visual Skill Tree */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Visual Skill Tree</h3>
                    <div style={S.skillTree}>
                        {SKILLS.map((skill, i) => (
                            <motion.div 
                                key={skill.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                style={S.skillNode}
                            >
                                <div style={{...S.skillCircle, borderColor: skill.color}}>
                                    <div style={{...S.skillFill, height: `${skill.level}%`, background: skill.color}} />
                                    <span style={S.skillPercent}>{skill.level}%</span>
                                </div>
                                <span style={S.skillLabel}>{skill.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 📜 Certificates List */}
                <div style={S.card}>
                    <h3 style={S.cardTitle}>Verifiable Credentials</h3>
                    {loading ? (
                        <p style={S.loading}>Loading credentials...</p>
                    ) : certificates.length === 0 ? (
                        <div style={S.emptyState}>
                            <p>No certificates earned yet.</p>
                            <button style={S.exploreBtn}>Explore Courses</button>
                        </div>
                    ) : (
                        <div style={S.certList}>
                            {certificates.map(cert => (
                                <motion.div 
                                    key={cert._id}
                                    whileHover={{ scale: 1.02 }}
                                    style={S.certItem}
                                >
                                    <div style={S.certIcon}>🎓</div>
                                    <div style={S.certInfo}>
                                        <div style={S.certName}>{cert.courseName}</div>
                                        <div style={S.certId}>ID: {cert.credentialId}</div>
                                        <div style={S.certDate}>Issued: {new Date(cert.issueDate).toLocaleDateString()}</div>
                                    </div>
                                    <button 
                                        onClick={() => window.open(`${window.location.origin}/verify/${cert.credentialId}`)}
                                        style={S.verifyBtn}
                                    >
                                        Verify 🔗
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const S = {
    container: { padding: '40px', background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' },
    header: { marginBottom: '40px' },
    title: { fontSize: '32px', margin: 0, background: 'linear-gradient(to right, #0df2f2, #a45afe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' },
    subtitle: { color: '#8890b5', marginTop: '10px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    card: { background: 'var(--bg-white)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '20px', padding: '30px', boxShadow: 'var(--shadow-md)' },
    cardTitle: { fontSize: '20px', marginBottom: '25px', color: '#0df2f2', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' },
    skillTree: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px' },
    skillNode: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
    skillCircle: { width: '80px', height: '80px', borderRadius: '50%', border: '3px solid', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-muted)' },
    skillFill: { position: 'absolute', bottom: 0, width: '100%', transition: 'height 1s ease-out' },
    skillPercent: { position: 'relative', zIndex: 1, fontWeight: 'bold', fontSize: '16px' },
    skillLabel: { fontSize: '12px', color: '#8890b5', textAlign: 'center' },
    certList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    certItem: { display: 'flex', alignItems: 'center', padding: '15px', background: 'var(--bg-muted)', borderRadius: '12px', border: '1px solid var(--border-color)' },
    certIcon: { fontSize: '30px', marginRight: '20px' },
    certInfo: { flex: 1 },
    certName: { fontWeight: 'bold', fontSize: '16px', color: 'var(--text-primary)' },
    certId: { fontSize: '11px', color: '#a45afe', marginTop: '4px', fontFamily: 'monospace' },
    certDate: { fontSize: '11px', color: '#4a5070', marginTop: '2px' },
    verifyBtn: { background: 'rgba(13, 242, 242, 0.1)', color: '#0df2f2', border: '1px solid rgba(13, 242, 242, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    loading: { textAlign: 'center', color: '#4a5070', padding: '40px' },
    emptyState: { textAlign: 'center', padding: '40px', color: '#4a5070' },
    exploreBtn: { marginTop: '20px', background: '#a45afe', color: 'var(--text-primary)', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default CareerPathway;
