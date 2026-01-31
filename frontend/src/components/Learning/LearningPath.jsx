import React from 'react';
import { motion } from 'framer-motion';

/**
 * LearningPath - Card component displaying a learning path
 * Shows progress, lesson count, and lock status
 */

const LearningPath = ({ path, progress, isLocked, onClick }) => {
    return (
        <motion.div
            whileHover={!isLocked ? { scale: 1.03, y: -5 } : {}}
            whileTap={!isLocked ? { scale: 0.98 } : {}}
            onClick={onClick}
            style={{
                ...styles.card,
                opacity: isLocked ? 0.6 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                borderColor: progress === 100 ? '#48bb78' : 'rgba(255,255,255,0.1)'
            }}
        >
            {/* Lock overlay */}
            {isLocked && (
                <div style={styles.lockOverlay}>
                    <span style={styles.lockIcon}>🔒</span>
                    <span style={styles.lockText}>Complete prerequisites first</span>
                </div>
            )}

            {/* Completion badge */}
            {progress === 100 && (
                <div style={styles.completeBadge}>✓ Complete</div>
            )}

            {/* Icon */}
            <div style={styles.iconWrapper}>
                <span style={styles.icon}>{path.icon}</span>
            </div>

            {/* Title & Description */}
            <h3 style={styles.title}>{path.title}</h3>
            <p style={styles.description}>{path.description}</p>

            {/* Lesson count */}
            <div style={styles.lessonCount}>
                {path.lessons.length} lessons
            </div>

            {/* Progress bar */}
            <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        style={{
                            ...styles.progressFill,
                            background: progress === 100
                                ? 'linear-gradient(90deg, #48bb78, #38a169)'
                                : 'linear-gradient(90deg, #667eea, #764ba2)'
                        }}
                    />
                </div>
                <span style={styles.progressText}>{progress}%</span>
            </div>
        </motion.div>
    );
};

const styles = {
    card: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '25px',
        textAlign: 'center',
        position: 'relative',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
    },
    lockIcon: {
        fontSize: '32px',
        marginBottom: '10px'
    },
    lockText: {
        color: '#888',
        fontSize: '12px'
    },
    completeBadge: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'linear-gradient(135deg, #48bb78, #38a169)',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: 'bold'
    },
    iconWrapper: {
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 15px',
        border: '2px solid rgba(102, 126, 234, 0.3)'
    },
    icon: {
        fontSize: '32px'
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#fff'
    },
    description: {
        margin: '0 0 15px 0',
        fontSize: '13px',
        color: '#888',
        lineHeight: '1.4'
    },
    lessonCount: {
        fontSize: '11px',
        color: '#666',
        marginBottom: '15px'
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    progressBar: {
        flex: 1,
        height: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        borderRadius: '4px'
    },
    progressText: {
        fontSize: '12px',
        color: '#888',
        minWidth: '35px'
    }
};

export default LearningPath;
