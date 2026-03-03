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
        gap: '10px',
        minWidth: '200px'
    },
    levelBadge: {
        background: 'linear-gradient(135deg, var(--accent-blue, #61DAFB), var(--accent-purple, #C678DD))',
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '11px',
        fontFamily: 'var(--font-code, monospace)',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(97,218,251,0.3)',
        letterSpacing: '0.5px'
    },
    barContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    barBackground: {
        height: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    barFill: {
        height: '100%',
        background: 'linear-gradient(90deg, var(--accent-blue, #61DAFB), var(--accent-purple, #C678DD))',
        borderRadius: '4px',
        transition: 'width 0.5s ease-out'
    },
    xpText: {
        fontSize: '10px',
        color: '#aaa',
        textAlign: 'right'
    }
};

export default XPBar;
