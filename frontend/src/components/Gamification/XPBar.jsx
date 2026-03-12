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
        background: 'linear-gradient(135deg, rgba(97,218,251,0.2), rgba(198,120,221,0.2))',
        border: '1px solid rgba(198,120,221,0.5)',
        color: 'var(--text-bright)',
        padding: '4px 10px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '11px',
        fontFamily: 'var(--font-code, monospace)',
        whiteSpace: 'nowrap',
        boxShadow: '0 0 15px rgba(198,120,221,0.4)',
        letterSpacing: '0.5px'
    },
    barContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    barBackground: {
        height: '8px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)'
    },
    barFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
        borderRadius: '4px',
        transition: 'width 0.5s ease-out',
        boxShadow: '0 0 10px #00f2fe'
    },
    xpText: {
        fontSize: '10px',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-code)',
        textAlign: 'right',
        letterSpacing: '1px',
    }
};

export default XPBar;
