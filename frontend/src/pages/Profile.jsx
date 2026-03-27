import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { motion } from 'framer-motion';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('userInfo');
        if (u) {
            setUser(JSON.parse(u));
        }
    }, []);

    const enable2FA = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/users/2fa/generate');
            setQrCode(data.qrCode);
            setSecret(data.secret);
            setLoading(false);
        } catch (err) {
            setMsg('Failed to generate 2FA token.');
            setLoading(false);
        }
    };

    const verifyAndActivate2FA = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/users/2fa/verify', { token: verifyCode });
            setMsg(data.message);
            setQrCode(null);
            
            // Update local storage to reflect 2FA is active
            const updatedUser = { ...user, isTwoFactorEnabled: true };
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setLoading(false);
        } catch (err) {
            setMsg('Verification failed. Invalid token.');
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/users/logout');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout error', err);
        }
    };

    if (!user) return <div style={s.layout}><div style={s.loader}>INITIALIZING...</div></div>;

    return (
        <div style={s.layout}>
            <div style={s.header}>
                <h1 style={s.h1}>Profile Settings</h1>
                <p style={s.subText}>Account & security configuration</p>
            </div>

            <div style={s.grid}>
                {/* ID Plate */}
                <motion.div style={s.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div style={s.cardHeader}>
                        <h2 style={s.h2}>Account Details</h2>
                        <span style={s.statusBadge}>ACTIVE</span>
                    </div>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Name</label>
                        <div style={s.value}>{user.name}</div>
                    </div>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Email</label>
                        <div style={s.value}>{user.email}</div>
                    </div>
                    <div style={s.fieldGroup}>
                        <label style={s.label}>Role</label>
                        <div style={{...s.value, color: 'var(--accent-violet)'}}>{(user.role || 'operator').toUpperCase()}</div>
                    </div>
                </motion.div>

                {/* Security Node */}
                <motion.div style={s.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <div style={s.cardHeader}>
                        <h2 style={s.h2}>Security</h2>
                    </div>
                    
                    <div style={s.authBlock}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h3 style={s.h3}>Multi-Factor Authentication (MFA)</h3>
                                <p style={s.muted}>Requires an authenticator app for secure access.</p>
                            </div>
                            {user.isTwoFactorEnabled ? (
                                <span style={s.statusBadgeGreen}>ENABLED</span>
                            ) : (
                                <span style={s.statusBadgeRed}>OFFLINE</span>
                            )}
                        </div>

                        {!user.isTwoFactorEnabled && !qrCode && (
                            <button onClick={enable2FA} style={s.btnCyan}>{loading ? 'Generating...' : 'Enable 2FA'}</button>
                        )}

                        {qrCode && (
                            <div style={s.qrBox}>
                                <img src={qrCode} alt="2FA QR Code" style={s.qrImg} />
                                <p style={s.muted}>Secret: <strong style={{ color: 'var(--text-primary)' }}>{secret}</strong></p>
                                <input 
                                    style={s.input} 
                                    placeholder="Enter 6-digit verification code" 
                                    value={verifyCode} 
                                    onChange={(e) => setVerifyCode(e.target.value)} 
                                />
                                <button onClick={verifyAndActivate2FA} style={s.btnCyan}>{loading ? 'Verifying...' : 'Verify & Activate'}</button>
                            </div>
                        )}

                        {msg && <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>{msg}</div>}
                    </div>

                    <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-ghost)', paddingTop: '24px' }}>
                        <button onClick={logout} style={s.btnRed}>Sign Out</button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

/* ───────── Digital Observatory Profile Styles ───────── */
const s = {
    layout: {
        padding: '32px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
    },
    loader: {
        fontFamily: 'var(--font-code)',
        fontSize: '14px',
        color: '#00E5EE',
        textAlign: 'center',
        marginTop: '100px',
        letterSpacing: '2px',
    },
    header: {
        marginBottom: '40px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        paddingBottom: '24px',
    },
    h1: {
        fontSize: '28px',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        margin: 0,
        letterSpacing: '-0.02em',
    },
    subText: {
        fontSize: '13px',
        color: '#5A5A6A',
        margin: '6px 0 0 0',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
    },
    card: {
        background: 'rgba(17, 17, 22, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '32px',
        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        paddingBottom: '16px',
    },
    h2: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#E8E8ED',
        letterSpacing: '0.5px',
        margin: 0,
    },
    h3: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#E8E8ED',
        margin: '0 0 4px 0',
    },
    muted: {
        fontSize: '12px',
        color: '#5A5A6A',
        margin: 0,
    },
    statusBadge: {
        background: 'rgba(0, 229, 238, 0.1)',
        color: '#00E5EE',
        border: '1px solid rgba(0,229,238,0.2)',
        padding: '4px 14px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '1px',
        borderRadius: '100px',
    },
    statusBadgeGreen: {
        background: 'rgba(16, 185, 129, 0.1)',
        color: '#10B981',
        border: '1px solid rgba(16,185,129,0.2)',
        padding: '4px 14px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '1px',
        borderRadius: '100px',
    },
    statusBadgeRed: {
        background: 'rgba(244, 63, 94, 0.1)',
        color: '#F43F5E',
        border: '1px solid rgba(244,63,94,0.2)',
        padding: '4px 14px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '1px',
        borderRadius: '100px',
    },
    fieldGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '11px',
        color: '#5A5A6A',
        marginBottom: '8px',
        letterSpacing: '0.5px',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: '15px',
        fontWeight: 500,
        color: '#E8E8ED',
        background: 'rgba(8, 8, 12, 0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        borderRadius: '12px',
        fontFamily: 'var(--font-code)',
    },
    authBlock: {
        background: 'rgba(26, 26, 34, 0.5)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '14px',
        padding: '24px',
        marginTop: '24px',
    },
    btnCyan: {
        background: 'linear-gradient(135deg, #00E5EE, #00b8c0)',
        color: '#050508',
        border: 'none',
        padding: '12px 24px',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        cursor: 'pointer',
        width: '100%',
        marginTop: '16px',
        transition: 'all 0.2s',
        borderRadius: '12px',
    },
    btnRed: {
        background: 'transparent',
        color: '#F43F5E',
        border: '1px solid rgba(244,63,94,0.3)',
        padding: '12px 24px',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        cursor: 'pointer',
        width: '100%',
        transition: 'all 0.2s',
        borderRadius: '12px',
    },
    qrBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        marginTop: '24px',
        padding: '24px',
        background: 'rgba(8, 8, 12, 0.6)',
        border: '1px dashed rgba(255,255,255,0.08)',
        borderRadius: '14px',
    },
    qrImg: {
        width: '150px',
        height: '150px',
        border: '4px solid white',
        borderRadius: '12px',
    },
    input: {
        background: 'rgba(5, 5, 8, 0.8)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#E8E8ED',
        padding: '12px',
        width: '100%',
        fontFamily: 'var(--font-code)',
        fontSize: '14px',
        textAlign: 'center',
        outline: 'none',
        marginTop: '8px',
        borderRadius: '10px',
    },
};

export default Profile;
