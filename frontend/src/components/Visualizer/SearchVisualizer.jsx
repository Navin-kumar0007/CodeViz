import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

/**
 * 🔍 SEARCH VISUALIZER
 * Enhanced array visualization for search algorithms
 * Features: Binary search range, mid pointer, found highlight
 */
const SearchVisualizer = ({
    name,
    arr,
    target = null,
    low = null,
    high = null,
    mid = null,
    foundIndex = null,
    visitedIndices = []
}) => {
    const colors = {
        default: 'rgba(102, 126, 234, 0.4)',
        inRange: 'linear-gradient(135deg, #667eea, #764ba2)',
        outOfRange: 'rgba(50, 50, 60, 0.5)',
        current: 'linear-gradient(135deg, #f6ad55, #ed8936)',
        found: 'linear-gradient(135deg, #68d391, #48bb78)',
        visited: 'linear-gradient(135deg, #4a5568, #2d3748)'
    };

    const getElementStyle = (idx) => {
        // Check if found
        if (foundIndex === idx) {
            return {
                background: colors.found,
                border: '3px solid #68d391',
                transform: 'scale(1.2)'
            };
        }

        // Check if mid pointer
        if (mid === idx) {
            return {
                background: colors.current,
                border: '3px solid #f6ad55',
                transform: 'scale(1.1)'
            };
        }

        // Check if in search range
        if (low !== null && high !== null && idx >= low && idx <= high) {
            return {
                background: colors.inRange,
                border: '2px solid rgba(102, 126, 234, 0.6)'
            };
        }

        // Check if already visited/eliminated
        if (visitedIndices.includes(idx)) {
            return {
                background: colors.visited,
                border: '2px solid rgba(74, 85, 104, 0.6)',
                opacity: 0.5
            };
        }

        // Out of range (eliminated)
        if (low !== null && high !== null && (idx < low || idx > high)) {
            return {
                background: colors.outOfRange,
                border: '2px solid rgba(50, 50, 60, 0.3)',
                opacity: 0.4
            };
        }

        return {
            background: colors.default,
            border: '2px solid rgba(102, 126, 234, 0.3)'
        };
    };

    return (
        <Motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={styles.wrapper}
        >
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '28px' }}>🔍</span>
                    <div>
                        <div style={styles.name}>{name}</div>
                        <div style={styles.subtitle}>Binary Search</div>
                    </div>
                </div>

                {target !== null && (
                    <div style={styles.targetBadge}>
                        🎯 Target: <strong>{target}</strong>
                    </div>
                )}
            </div>

            {/* Search Info */}
            <div style={styles.infoBar}>
                {low !== null && <span style={styles.infoItem}>low: {low}</span>}
                {mid !== null && <span style={{ ...styles.infoItem, background: '#f6ad55', color: '#1a1a2e' }}>mid: {mid}</span>}
                {high !== null && <span style={styles.infoItem}>high: {high}</span>}
            </div>

            {/* Array Elements */}
            <div style={styles.arrayContainer}>
                {arr.map((val, idx) => {
                    const elementStyle = getElementStyle(idx);
                    const isPointer = idx === low || idx === mid || idx === high;

                    return (
                        <Motion.div
                            key={idx}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={styles.elementWrapper}
                        >
                            {/* Pointer labels */}
                            {isPointer && (
                                <div style={styles.pointerContainer}>
                                    {idx === low && <span style={{ ...styles.pointer, background: '#4299e1' }}>low</span>}
                                    {idx === mid && <span style={{ ...styles.pointer, background: '#f6ad55' }}>mid</span>}
                                    {idx === high && <span style={{ ...styles.pointer, background: '#4299e1' }}>high</span>}
                                    <div style={styles.pointerArrow}>▼</div>
                                </div>
                            )}

                            {/* Value Box */}
                            <Motion.div
                                animate={{
                                    scale: elementStyle.transform ? 1.1 : 1,
                                    ...elementStyle
                                }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                style={{
                                    ...styles.valueBox,
                                    ...elementStyle
                                }}
                            >
                                {String(val)}
                            </Motion.div>

                            {/* Index Label */}
                            <div style={styles.indexLabel}>[{idx}]</div>

                            {/* Found indicator */}
                            {foundIndex === idx && (
                                <Motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={styles.foundBadge}
                                >
                                    ✓ Found!
                                </Motion.div>
                            )}
                        </Motion.div>
                    );
                })}
            </div>

            {/* Status */}
            {mid !== null && foundIndex === null && (
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.statusBar}
                >
                    Checking arr[{mid}] = {arr[mid]}
                    {target !== null && (
                        arr[mid] === target
                            ? ' ✓ Found!'
                            : arr[mid] < target
                                ? ' → Search right half'
                                : ' ← Search left half'
                    )}
                </Motion.div>
            )}
        </Motion.div>
    );
};

const styles = {
    wrapper: {
        background: 'rgba(20, 20, 35, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(66, 153, 225, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    name: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#fff'
    },
    subtitle: {
        fontSize: '11px',
        color: '#888'
    },
    targetBadge: {
        background: 'rgba(104, 211, 145, 0.2)',
        color: '#68d391',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px'
    },
    infoBar: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '15px'
    },
    infoItem: {
        background: 'rgba(66, 153, 225, 0.3)',
        color: '#fff',
        padding: '5px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontFamily: 'monospace'
    },
    arrayContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        padding: '15px 10px',
        minHeight: '100px'
    },
    elementWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
        position: 'relative'
    },
    pointerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '30px'
    },
    pointer: {
        padding: '2px 8px',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: 'bold',
        color: '#1a1a2e'
    },
    pointerArrow: {
        color: '#4299e1',
        fontSize: '10px'
    },
    valueBox: {
        width: '45px',
        height: '45px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.3s ease'
    },
    indexLabel: {
        fontSize: '9px',
        color: '#666',
        fontFamily: 'monospace'
    },
    foundBadge: {
        position: 'absolute',
        bottom: '-25px',
        background: '#68d391',
        color: '#1a1a2e',
        padding: '3px 8px',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold'
    },
    statusBar: {
        marginTop: '15px',
        padding: '12px 16px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#4fc3f7'
    }
};

export default SearchVisualizer;
