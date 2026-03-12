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
        background: 'rgba(255, 81, 47, 0.15)', // Glassy neon background
        border: '1px solid rgba(255, 81, 47, 0.3)', // Neon edge
        padding: '8px 16px',
        borderRadius: '20px',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(255, 81, 47, 0.2)', // Intense outer glow
        backdropFilter: 'blur(10px)',
    },
    icon: {
        fontSize: '24px',
        marginRight: '10px',
        textShadow: '0 0 10px rgba(255, 81, 47, 0.5)',
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'column'
    },
    count: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: 'var(--text-bright)',
        lineHeight: '1.2',
        textShadow: '0 0 5px rgba(255, 81, 47, 0.4)',
    },
    longest: {
        fontSize: '10px',
        color: 'var(--text-secondary)',
        opacity: 0.9
    }
};

export default StreakCounter;
