import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Leaderboard - Shows top learners ranked by score
 */

const Leaderboard = ({ onClose, currentUserId }) => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
        if (currentUserId) {
            fetchUserRank();
        }
    }, [currentUserId]);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/leaderboard');
            const data = await res.json();
            setLeaders(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRank = async () => {
        try {
            const res = await fetch(`http://localhost:5001/api/leaderboard/rank/${currentUserId}`);
            const data = await res.json();
            setUserRank(data);
        } catch (error) {
            console.error('Error fetching user rank:', error);
        }
    };

    const getRankStyle = (rank) => {
        if (rank === 1) return { background: 'linear-gradient(135deg, #ffd700, #ffaa00)', color: '#000' };
        if (rank === 2) return { background: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', color: '#000' };
        if (rank === 3) return { background: 'linear-gradient(135deg, #cd7f32, #a0522d)', color: '#fff' };
        return { background: 'rgba(255,255,255,0.1)', color: '#fff' };
    };

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={styles.panel}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>🏆 Leaderboard</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* User's rank if logged in */}
                {userRank && userRank.rank && (
                    <div style={styles.userRank}>
                        <span>Your Rank: <strong>#{userRank.rank}</strong></span>
                        <span>{userRank.lessonsCompleted} lessons • {userRank.totalScore} pts</span>
                    </div>
                )}

                {/* Leaderboard list */}
                <div style={styles.list}>
                    {loading ? (
                        <div style={styles.loading}>Loading...</div>
                    ) : leaders.length === 0 ? (
                        <div style={styles.empty}>
                            <span style={{ fontSize: '40px' }}>📊</span>
                            <p>No learners yet!</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>
                                Complete lessons to appear on the leaderboard
                            </p>
                        </div>
                    ) : (
                        leaders.map((leader, index) => (
                            <motion.div
                                key={leader.userId || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    ...styles.leaderItem,
                                    ...(leader.userId === currentUserId ? styles.currentUser : {})
                                }}
                            >
                                <div style={{ ...styles.rankBadge, ...getRankStyle(leader.rank) }}>
                                    {getRankEmoji(leader.rank)}
                                </div>
                                <div style={styles.leaderInfo}>
                                    <div style={styles.leaderName}>{leader.name}</div>
                                    <div style={styles.leaderStats}>
                                        {leader.lessonsCompleted} lessons • {leader.achievementCount} 🏅
                                    </div>
                                </div>
                                <div style={styles.score}>
                                    {leader.totalScore} pts
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    },
    panel: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        color: '#fff'
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#888',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '5px',
        lineHeight: 1
    },
    userRank: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '15px 20px',
        background: 'rgba(102, 126, 234, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontSize: '14px'
    },
    list: {
        padding: '15px',
        overflowY: 'auto',
        flex: 1
    },
    loading: {
        textAlign: 'center',
        color: '#888',
        padding: '40px'
    },
    empty: {
        textAlign: 'center',
        padding: '40px',
        color: '#888'
    },
    leaderItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        borderRadius: '10px',
        marginBottom: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    currentUser: {
        border: '1px solid rgba(102, 126, 234, 0.5)',
        background: 'rgba(102, 126, 234, 0.1)'
    },
    rankBadge: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        marginRight: '12px'
    },
    leaderInfo: {
        flex: 1
    },
    leaderName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: '15px'
    },
    leaderStats: {
        color: '#888',
        fontSize: '12px',
        marginTop: '2px'
    },
    score: {
        color: '#667eea',
        fontWeight: 'bold',
        fontSize: '16px'
    }
};

export default Leaderboard;
