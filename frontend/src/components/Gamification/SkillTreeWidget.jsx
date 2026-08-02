import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API as axios } from '../../utils/api';
import API_BASE from '../../utils/api';

const API = API_BASE;

const SkillTreeWidget = () => {
    const [skillData, setSkillData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSkillTree = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) return;

                const { data } = await axios.get(`${API}/api/progress/skill-tree`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });

                setSkillData(data);
            } catch (error) {
                console.error('Failed to fetch Skill Tree data:', error);
            }
            setLoading(false);
        };
        fetchSkillTree();
    }, []);

    if (loading) return <div style={styles.loading}>Decoding Skill Matrix...</div>;

    if (!skillData || !skillData.domains || Object.keys(skillData.domains).length === 0) {
        return (
            <div style={styles.container}>
                <h3 style={styles.title}>🌳 Mastery Tree</h3>
                <p style={styles.empty}>Solve problems to grow your skill branches!</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>🌳 Mastery Tree</h3>
                <p style={styles.subtitle}>{skillData.totalPoints} total knowledge points</p>
            </div>

            <div style={styles.treeWrapper}>
                {Object.entries(skillData.domains).map(([key, domain]) => (
                    <div key={key} style={styles.nodeWrapper}>
                        <div style={styles.nodeHeader}>
                            <span style={styles.nodeTitle}>{domain.title}</span>
                            <span style={styles.nodePercent}>{domain.mastery}%</span>
                        </div>
                        <div style={styles.progressBarBg}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${domain.mastery}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{
                                    ...styles.progressBarFill,
                                    background: getDomainColor(key)
                                }}
                            />
                        </div>
                        <div style={styles.nodeFooter}>
                            <span>{domain.solvedCount} solved</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const getDomainColor = () => {
    return 'var(--accent-cyan)'; // Ion Cyan neon glow
};

const styles = {
    container: {
        width: '100%',
        boxSizing: 'border-box'
    },
    header: {
        marginBottom: '16px'
    },
    title: {
        margin: 0,
        fontSize: '15px',
        fontWeight: 600,
        color: 'var(--text-primary)'
    },
    subtitle: {
        margin: '2px 0 0 0',
        fontSize: '12px',
        color: 'var(--text-secondary)'
    },
    treeWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    nodeWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    nodeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    },
    nodeTitle: {
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-primary)'
    },
    nodePercent: {
        fontSize: '11px',
        color: 'var(--text-secondary)'
    },
    progressBarBg: {
        height: '4px',
        background: 'var(--border-color)',
        borderRadius: '0',
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        borderRadius: '0'
    },
    nodeFooter: {
        display: 'none' // Hide for density
    },
    loading: {
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)'
    },
    empty: {
        color: 'var(--text-muted)',
        padding: '20px',
        textAlign: 'center'
    }
};

export default SkillTreeWidget;
