import React from 'react';
import { motion as Motion } from 'framer-motion';

/**
 * LearningPath - Card component displaying a learning path
 * Shows progress, lesson count, and lock status
 */

const FONT = "'Inter', system-ui, -apple-system, sans-serif";

const LearningPath = ({ path, progress, isLocked, onClick }) => {
    return (
        <Motion.div
            onClick={onClick}
            style={{
                ...styles.card,
                opacity: isLocked ? 0.65 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                borderColor: progress === 100 ? 'var(--cz-success)' : 'var(--cz-line)',
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
                {path.lessons.length} lesson{path.lessons.length === 1 ? '' : 's'}
            </div>

            {/* Progress bar */}
            <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                    <Motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            ...styles.progressFill,
                            background: progress === 100
                                ? 'linear-gradient(90deg, var(--cz-success), #22c55e)'
                                : 'linear-gradient(90deg, var(--cz-accent), #7c93ff)',
                        }}
                    />
                </div>
                <span style={styles.progressText}>{progress}%</span>
            </div>
        </Motion.div>
    );
};

const styles = {
    card: {
        background: 'var(--cz-surface)',
        border: '1px solid var(--cz-line)',
        borderRadius: '16px',
        padding: '22px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: 'var(--cz-shadow-sm)',
        fontFamily: FONT,
        height: '100%',
    },
    lockOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'color-mix(in srgb, var(--cz-surface) 82%, transparent)',
        backdropFilter: 'blur(2px)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    lockIcon: {
        fontSize: '30px',
        marginBottom: '8px',
    },
    lockText: {
        color: 'var(--cz-muted)',
        fontSize: '12px',
        fontWeight: 600,
    },
    completeBadge: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'color-mix(in srgb, var(--cz-success) 16%, transparent)',
        border: '1px solid color-mix(in srgb, var(--cz-success) 35%, transparent)',
        color: 'var(--cz-success)',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: 800,
    },
    iconWrapper: {
        width: '62px',
        height: '62px',
        borderRadius: '18px',
        background: 'color-mix(in srgb, var(--cz-accent) 12%, transparent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 15px',
        border: '1px solid color-mix(in srgb, var(--cz-accent) 25%, transparent)',
    },
    icon: {
        fontSize: '30px',
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '17px',
        fontWeight: 800,
        letterSpacing: '-0.01em',
        color: 'var(--cz-text)',
    },
    description: {
        margin: '0 0 14px 0',
        fontSize: '13px',
        color: 'var(--cz-muted)',
        lineHeight: '1.5',
    },
    lessonCount: {
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--cz-faint)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '14px',
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    progressBar: {
        flex: 1,
        height: '8px',
        background: 'var(--cz-elevated)',
        border: '1px solid var(--cz-line)',
        borderRadius: '5px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: '5px',
    },
    progressText: {
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--cz-muted)',
        minWidth: '35px',
        fontVariantNumeric: 'tabular-nums',
    },
};

export default LearningPath;
