import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AchievementBadge from './AchievementBadge';
import { ACHIEVEMENTS } from '../../data/achievements';

/**
 * AchievementsPanel - Shows all achievements with their unlock status
 * Groups by category and shows progress
 */

const AchievementsPanel = ({ unlockedAchievements = [], onClose }) => {
    const categories = [
        { id: 'milestone', title: '🎯 Milestones', description: 'Learning journey milestones' },
        { id: 'course', title: '🏅 Course Mastery', description: 'Complete learning paths' },
        { id: 'quiz', title: '💯 Quiz Champion', description: 'Excel in quizzes' }
    ];

    const unlockedCount = unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;

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
                    <h2 style={styles.title}>🏆 Achievements</h2>
                    <div style={styles.progress}>
                        {unlockedCount} / {totalCount} unlocked
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Progress bar */}
                <div style={styles.progressBar}>
                    <motion.div
                        style={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Categories */}
                <div style={styles.content}>
                    {categories.map(category => {
                        const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category.id);
                        const unlockedInCategory = categoryAchievements.filter(a =>
                            unlockedAchievements.includes(a.id)
                        ).length;

                        return (
                            <div key={category.id} style={styles.category}>
                                <div style={styles.categoryHeader}>
                                    <h3 style={styles.categoryTitle}>{category.title}</h3>
                                    <span style={styles.categoryProgress}>
                                        {unlockedInCategory}/{categoryAchievements.length}
                                    </span>
                                </div>
                                <p style={styles.categoryDesc}>{category.description}</p>
                                <div style={styles.grid}>
                                    {categoryAchievements.map(achievement => (
                                        <AchievementBadge
                                            key={achievement.id}
                                            achievement={achievement}
                                            isUnlocked={unlockedAchievements.includes(achievement.id)}
                                            size="medium"
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
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
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        color: '#fff',
        flex: 1
    },
    progress: {
        color: '#888',
        fontSize: '14px',
        marginRight: '15px'
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
    progressBar: {
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea, #764ba2)',
        borderRadius: '2px'
    },
    content: {
        padding: '20px',
        overflowY: 'auto',
        flex: 1
    },
    category: {
        marginBottom: '25px'
    },
    categoryHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '5px'
    },
    categoryTitle: {
        margin: 0,
        fontSize: '16px',
        color: '#fff',
        flex: 1
    },
    categoryProgress: {
        fontSize: '12px',
        color: '#888'
    },
    categoryDesc: {
        margin: '0 0 15px 0',
        fontSize: '12px',
        color: '#666'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: '12px'
    }
};

export default AchievementsPanel;
