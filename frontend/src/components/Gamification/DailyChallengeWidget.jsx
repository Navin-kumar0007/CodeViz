import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../../utils/api';

/**
 * 🏆 DAILY CHALLENGE WIDGET
 * Compact dashboard card showing today's challenge with timer
 */
const DailyChallengeWidget = () => {
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('userInfo'));
                if (!user?.token) { setLoading(false); return; }
                const res = await axios.get(`${API_BASE}/api/challenges/today`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setChallenge(res.data);
            } catch (err) {
                console.error('Failed to load daily challenge', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, []);

    // Timer
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const midnight = new Date(Date.UTC(
                now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1
            ));
            const diff = midnight - now;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const diffColors = {
        easy: '#48bb78',
        medium: '#f6ad55',
        hard: '#fc8181'
    };

    if (loading) return null;
    if (!challenge) return null;

    return (
        <div
            style={styles.card}
            onClick={() => navigate('/daily-challenge')}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(102,126,234,0.15)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color, rgba(255,255,255,0.1))';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={styles.header}>
                <div style={styles.titleRow}>
                    <span style={{ fontSize: '20px' }}>🏆</span>
                    <div>
                        <div style={styles.label}>DAILY CHALLENGE</div>
                        <div style={styles.title}>{challenge.title}</div>
                    </div>
                </div>
                <div style={styles.timerCol}>
                    <div style={styles.timerLabel}>⏱ Resets in</div>
                    <div style={styles.timer}>{timeLeft}</div>
                </div>
            </div>

            <div style={styles.footer}>
                <div style={styles.metaRow}>
                    <span style={{
                        ...styles.badge,
                        color: diffColors[challenge.difficulty],
                        borderColor: diffColors[challenge.difficulty]
                    }}>
                        {challenge.difficulty}
                    </span>
                    <span style={styles.catBadge}>{challenge.category}</span>
                    <span style={styles.xpBadge}>⭐ {challenge.xpReward} XP</span>
                </div>
                <div style={styles.cta}>
                    {challenge.alreadyCompleted ? '✅ Completed' : 'Start Challenge →'}
                </div>
            </div>
        </div>
    );
};

const styles = {
    card: {
        background: 'linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.06))',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        borderRadius: '12px',
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '16px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '10px'
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    label: {
        fontSize: '9px',
        color: '#667eea',
        fontWeight: 700,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '2px'
    },
    title: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: 'var(--text-bright, #fff)'
    },
    timerCol: {
        textAlign: 'right'
    },
    timerLabel: {
        fontSize: '9px',
        color: '#888',
        marginBottom: '2px'
    },
    timer: {
        fontSize: '16px',
        fontWeight: 'bold',
        fontFamily: 'var(--font-code, monospace)',
        color: '#f6ad55',
        letterSpacing: '1px'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    metaRow: {
        display: 'flex',
        gap: '6px',
        alignItems: 'center'
    },
    badge: {
        padding: '2px 8px',
        border: '1px solid',
        borderRadius: '10px',
        fontSize: '9px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    catBadge: {
        padding: '2px 8px',
        background: 'rgba(102,126,234,0.15)',
        color: '#667eea',
        borderRadius: '10px',
        fontSize: '9px',
        fontWeight: 'bold',
        textTransform: 'capitalize'
    },
    xpBadge: {
        padding: '2px 8px',
        background: 'rgba(246,173,85,0.1)',
        color: '#f6ad55',
        borderRadius: '10px',
        fontSize: '9px',
        fontWeight: 'bold'
    },
    cta: {
        fontFamily: 'var(--font-code, monospace)',
        fontSize: '12px',
        color: '#667eea',
        fontWeight: 'bold'
    }
};

export default DailyChallengeWidget;
