import React from 'react';
import { motion } from 'framer-motion';

const StreakCounter = ({ streak }) => {
    const { current, longest } = streak || { current: 0, longest: 0 };

    return (
        <div style={styles.container}>
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                style={styles.icon}
            >
                🔥
            </motion.div>
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
        background: 'linear-gradient(135deg, #FF512F, #DD2476)',
        padding: '8px 16px',
        borderRadius: '20px',
        color: '#fff',
        boxShadow: '0 4px 10px rgba(221, 36, 118, 0.3)'
    },
    icon: {
        fontSize: '24px',
        marginRight: '10px'
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'column'
    },
    count: {
        fontWeight: 'bold',
        fontSize: '14px',
        lineHeight: '1.2'
    },
    longest: {
        fontSize: '10px',
        opacity: 0.9
    }
};

export default StreakCounter;
