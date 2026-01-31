import React from 'react';
import { motion } from 'framer-motion';

/**
 * AchievementBadge - Shows a single achievement badge
 * Can be shown as locked (grayed out) or unlocked (colorful)
 */

const AchievementBadge = ({ achievement, isUnlocked = false, size = 'medium', showTitle = true }) => {
    const sizes = {
        small: { icon: '24px', padding: '8px', title: '11px' },
        medium: { icon: '32px', padding: '12px', title: '12px' },
        large: { icon: '48px', padding: '16px', title: '14px' }
    };

    const sizeConfig = sizes[size] || sizes.medium;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={isUnlocked ? { scale: 1.1 } : {}}
            style={{
                ...styles.container,
                padding: sizeConfig.padding,
                opacity: isUnlocked ? 1 : 0.4,
                filter: isUnlocked ? 'none' : 'grayscale(100%)'
            }}
            title={achievement.description}
        >
            <div style={{ ...styles.iconWrapper, fontSize: sizeConfig.icon }}>
                {achievement.icon}
            </div>
            {showTitle && (
                <div style={{ ...styles.title, fontSize: sizeConfig.title }}>
                    {achievement.title}
                </div>
            )}
            {!isUnlocked && (
                <div style={styles.lockedOverlay}>
                    🔒
                </div>
            )}
        </motion.div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        position: 'relative',
        cursor: 'default',
        transition: 'all 0.2s ease'
    },
    iconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        color: '#fff',
        fontWeight: '500',
        textAlign: 'center',
        maxWidth: '80px',
        lineHeight: '1.2'
    },
    lockedOverlay: {
        position: 'absolute',
        bottom: '-5px',
        right: '-5px',
        fontSize: '14px'
    }
};

export default AchievementBadge;
