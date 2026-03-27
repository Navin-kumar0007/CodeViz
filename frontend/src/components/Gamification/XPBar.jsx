import React from 'react';

const XPBar = ({ xp, level }) => {
    const currentLevelXP = ((experience) => {
        // Basic level formula: each level is 100 XP
        return experience % 100;
    })(xp || 0);

    const xpNeeded = 100;
    const progress = (currentLevelXP / xpNeeded) * 100;

    return (
        <div style={styles.container}>
            <div style={styles.levelBadge}>
                Level {level || 1}
            </div>
            <div style={styles.barContainer}>
                <div style={styles.barBackground}>
                    <div style={{ ...styles.barFill, width: `${progress}%` }}></div>
                </div>
                <div style={styles.xpText}>{currentLevelXP} / {xpNeeded} XP</div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '200px'
    },
    levelBadge: {
        color: 'var(--text-primary)',
        padding: '0 8px 0 0',
        borderRight: '1px solid var(--border-color)',
        fontWeight: 600,
        fontSize: '12px',
        fontFamily: 'var(--font-code, monospace)',
        whiteSpace: 'nowrap',
    },
    barContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    barBackground: {
        height: '4px',
        background: 'var(--border-color)',
        borderRadius: '0',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        background: 'var(--accent-cyan)',
        borderRadius: '0',
        transition: 'width 0.5s ease-out',
        boxShadow: '0 0 10px rgba(0, 245, 255, 0.4)',
    },
    xpText: {
        fontSize: '10px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-code)',
        textAlign: 'right',
    }
};

export default XPBar;
