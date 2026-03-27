import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const { data } = await axios.put(`/api/users/resetpassword/${token}`, { password });
            setMsg(data.message);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error resetting password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={s.layout}>
            <div style={s.stars}></div>
            <motion.div 
                style={s.formBox}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={s.header}>
                    <h1 style={s.h1}>RESTORE ACCESS</h1>
                    <p style={s.subText}>Configure new secure key</p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} style={s.form}>
                        <div style={s.fieldGroup}>
                            <label style={s.label}>NEW SECURITY KEY</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={s.input}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div style={s.fieldGroup}>
                            <label style={s.label}>CONFIRM SECURITY KEY</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={s.input}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" style={s.btnCyan} disabled={loading}>
                            {loading ? 'UPLOADING...' : 'CONFIRM REGISTRATION'}
                        </button>
                        
                        {error && <div style={s.errorBox}>{error}</div>}
                    </form>
                ) : (
                    <div style={s.successBox}>
                        <p>{msg}</p>
                        <p style={{ marginTop: '8px', fontSize: '10px' }}>Rerouting to Node Login...</p>
                    </div>
                )}

                <div style={s.footer}>
                    <Link to="/login" style={s.link}>ABORT PROTOCOL</Link>
                </div>
            </motion.div>
        </div>
    );
};

const s = {
    layout: {
        minHeight: '100vh',
        background: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        position: 'relative',
        overflow: 'hidden'
    },
    stars: {
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(circle at center, var(--border-ghost) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
        zIndex: 0
    },
    formBox: {
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-ghost)',
        padding: '48px',
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 0 40px rgba(0,0,0,0.5)'
    },
    header: {
        marginBottom: '32px',
        borderBottom: '1px solid var(--border-ghost)',
        paddingBottom: '24px'
    },
    h1: {
        fontSize: '24px',
        fontFamily: 'var(--font-display)',
        color: 'var(--text-primary)',
        fontWeight: 800,
        margin: 0,
        letterSpacing: '1px',
        textTransform: 'uppercase'
    },
    subText: {
        fontSize: '12px',
        fontFamily: 'var(--font-code)',
        color: 'var(--text-secondary)',
        margin: '8px 0 0 0'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '11px',
        fontFamily: 'var(--font-code)',
        color: 'var(--text-secondary)',
        letterSpacing: '1px'
    },
    input: {
        background: 'var(--bg-terminal)',
        border: '1px solid var(--border-ghost)',
        color: 'var(--text-primary)',
        padding: '12px 16px',
        fontFamily: 'var(--font-code)',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    btnCyan: {
        background: 'var(--accent-cyan)',
        color: 'var(--text-inverse)',
        border: 'none',
        padding: '14px',
        fontSize: '12px',
        fontFamily: 'var(--font-code)',
        fontWeight: 700,
        letterSpacing: '2px',
        cursor: 'pointer',
        marginTop: '8px',
        transition: 'opacity 0.2s',
        textTransform: 'uppercase'
    },
    errorBox: {
        background: 'rgba(255, 0, 85, 0.1)',
        color: '#ff0055',
        border: '1px solid #ff0055',
        padding: '12px',
        fontSize: '12px',
        fontFamily: 'var(--font-code)',
        textAlign: 'center'
    },
    successBox: {
        background: 'rgba(0, 255, 136, 0.1)',
        color: '#00ff88',
        border: '1px solid #00ff88',
        padding: '16px',
        fontSize: '14px',
        fontFamily: 'var(--font-code)',
        textAlign: 'center'
    },
    footer: {
        marginTop: '32px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-ghost)',
        paddingTop: '24px'
    },
    link: {
        color: 'var(--text-muted)',
        fontSize: '11px',
        fontFamily: 'var(--font-code)',
        textDecoration: 'none',
        letterSpacing: '1px',
        transition: 'color 0.2s'
    }
};

export default ResetPassword;
