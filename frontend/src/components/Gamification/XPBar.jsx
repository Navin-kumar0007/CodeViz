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
        background: '#667eea',
        color: '#fff',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '12px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
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
        background: 'linear-gradient(90deg, #667eea, #764ba2)',
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
