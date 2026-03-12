import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const getDomainColor = (domain) => {
    const colors = {
        'Arrays': '#4facfe',
        'Logic': '#f6ad55',
        'DS': '#a855f7',
        'Algorithms': '#f56565',
        'Efficiency': '#48bb78',
        'Systems': '#ed8936'
    };
    return colors[domain] || '#718096';
};

const styles = {
    container: {
        background: 'linear-gradient(145deg, #1a202c, #2d3748)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #4a5568',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '400px'
    },
    header: {
        marginBottom: '20px'
    },
    title: {
        margin: 0,
        fontSize: '22px',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, #48bb78, #4fd1c5)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        margin: '5px 0 0 0',
        fontSize: '13px',
        color: '#a0aec0'
    },
    treeWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    nodeWrapper: {
        background: 'rgba(0,0,0,0.2)',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)'
    },
    nodeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        alignItems: 'center'
    },
    nodeTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#e2e8f0'
    },
    nodePercent: {
        fontSize: '12px',
        color: '#718096'
    },
    progressBarBg: {
        height: '6px',
        background: '#2d3748',
        borderRadius: '3px',
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        borderRadius: '3px'
    },
    nodeFooter: {
        marginTop: '6px',
        fontSize: '11px',
        color: '#4a5568',
        textAlign: 'right'
    },
    loading: {
        padding: '40px',
        textAlign: 'center',
        color: '#a0aec0',
        background: '#2d3748',
        borderRadius: '16px'
    },
    empty: {
        color: '#a0aec0',
        padding: '40px',
        textAlign: 'center'
    }
};

export default SkillTreeWidget;
