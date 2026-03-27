import React from 'react';
import { motion as Motion } from 'framer-motion';

const StreakCounter = ({ streak }) => {
    const { current, longest } = streak || { current: 0, longest: 0 };

    return (
        <div style={styles.container}>
            <Motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                style={styles.icon}
            >
                🔥
            </Motion.div>
            <div style={styles.textContainer}>
                <div style={styles.count}>{current} Day Streak</div>
                <div style={styles.longest}>Best: {longest}</div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
        padding: '0 8px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-code)',
    },
    icon: {
        fontSize: '18px',
        marginRight: '10px',
        textShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'column'
    },
    count: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: 'var(--text-primary)',
        lineHeight: '1.2',
        letterSpacing: '0.5px',
    },
    longest: {
        fontSize: '10px',
        color: 'var(--text-secondary)',
    }
};

export default StreakCounter;
