import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

/**
 * 🔥 SORTING VISUALIZER
 * Enhanced array visualization for sorting algorithms
 * Features: Swap animations, comparison highlights, index pointers
 */
const SortingVisualizer = ({
    name,
    arr,
    currentIndices = {},    // { i: 0, j: 1, left: 0, right: 4, mid: 2 }
    comparingIndices = [],  // [2, 3] - indices being compared
    swappingIndices = [],   // [2, 3] - indices being swapped
    sortedIndices = [],     // [0, 1] - already sorted portion
    highlightIndex = null,  // single highlighted index (for search)
    foundIndex = null       // found element (for search success)
}) => {
    // Color scheme
    const colors = {
        default: 'linear-gradient(135deg, #667eea, #764ba2)',
        comparing: 'linear-gradient(135deg, #f6ad55, #ed8936)',
        swapping: 'linear-gradient(135deg, #fc8181, #f56565)',
        sorted: 'linear-gradient(135deg, #48bb78, #38a169)',
        highlight: 'linear-gradient(135deg, #4fc3f7, #29b6f6)',
        found: 'linear-gradient(135deg, #68d391, #48bb78)'
    };

    // Get background for each element
    const getElementBackground = (idx) => {
        if (foundIndex === idx) return colors.found;
        if (swappingIndices.includes(idx)) return colors.swapping;
        if (comparingIndices.includes(idx)) return colors.comparing;
        if (sortedIndices.includes(idx)) return colors.sorted;
        if (highlightIndex === idx) return colors.highlight;
        return colors.default;
    };

    // Check if element is active (comparing or swapping)
    const isActive = (idx) => {
        return comparingIndices.includes(idx) || swappingIndices.includes(idx);
    };

    // Get index pointer label (i, j, left, right, mid, etc.)
    const getIndexPointers = (idx) => {
        const pointers = [];
        Object.entries(currentIndices).forEach(([label, index]) => {
            if (index === idx) pointers.push(label);
        });
        return pointers;
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
                    <span style={{ fontSize: '20px' }}>🔢</span>
                    <div>
                        <div style={styles.name}>{name}</div>
                        <div style={styles.subtitle}>Len: {arr.length}</div>
                    </div>
                </div>

                {/* Legend */}
                <div style={styles.legend}>
                    <span style={{ ...styles.legendItem, background: colors.comparing }}>Comparing</span>
                    <span style={{ ...styles.legendItem, background: colors.swapping }}>Swapping</span>
                    <span style={{ ...styles.legendItem, background: colors.sorted }}>Sorted</span>
                </div>
            </div>

            {/* Array Elements */}
            <div style={styles.arrayContainer}>
                <AnimatePresence mode="popLayout">
                    {arr.map((val, idx) => {
                        const pointers = getIndexPointers(idx);
                        const active = isActive(idx);

                        return (
                            <Motion.div
                                key={`${idx}-${val}`}
                                layout
                                initial={{ scale: 0, y: -20 }}
                                animate={{
                                    scale: active ? 1.15 : 1,
                                    y: swappingIndices.includes(idx) ? -15 : 0,
                                    rotate: swappingIndices.includes(idx) ? [0, -5, 5, 0] : 0
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 25,
                                    layout: { duration: 0.4 }
                                }}
                                style={styles.elementWrapper}
                            >
                                {/* Index Pointers (above) */}
                                {pointers.length > 0 && (
                                    <Motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={styles.pointerContainer}
                                    >
                                        {pointers.map(p => (
                                            <span key={p} style={styles.pointer}>{p}</span>
                                        ))}
                                        <div style={styles.pointerArrow}>▼</div>
                                    </Motion.div>
                                )}

                                {/* Value Box */}
                                <Motion.div
                                    animate={{
                                        boxShadow: active
                                            ? '0 8px 30px rgba(246, 173, 85, 0.5)'
                                            : '0 4px 15px rgba(0, 0, 0, 0.3)'
                                    }}
                                    style={{
                                        ...styles.valueBox,
                                        background: getElementBackground(idx),
                                        border: active ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)'
                                    }}
                                >
                                    {String(val)}
                                </Motion.div>

                                {/* Index Label (below) */}
                                <div style={styles.indexLabel}>[{idx}]</div>
                            </Motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Status Message */}
            {(comparingIndices.length > 0 || swappingIndices.length > 0) && (
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.statusBar}
                >
                    {swappingIndices.length > 0 && (
                        <span style={{ color: '#fc8181' }}>
                            🔄 Swapping arr[{swappingIndices[0]}]={arr[swappingIndices[0]]} ↔ arr[{swappingIndices[1]}]={arr[swappingIndices[1]]}
                        </span>
                    )}
                    {comparingIndices.length > 0 && swappingIndices.length === 0 && (
                        <span style={{ color: '#f6ad55' }}>
                            ⚖️ Comparing arr[{comparingIndices[0]}]={arr[comparingIndices[0]]} with arr[{comparingIndices[1]}]={arr[comparingIndices[1]]}
                        </span>
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
        padding: '12px',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        paddingBottom: '8px',
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
    legend: {
        display: 'flex',
        gap: '8px'
    },
    legendItem: {
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        color: '#fff',
        fontWeight: 'bold'
    },
    arrayContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        padding: '8px 4px',
        minHeight: '80px'
    },
    elementWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px'
    },
    pointerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '30px'
    },
    pointer: {
        background: 'linear-gradient(135deg, #fbd38d, #f6ad55)',
        color: '#1a1a2e',
        padding: '2px 8px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 'bold',
        marginBottom: '2px'
    },
    pointerArrow: {
        color: '#f6ad55',
        fontSize: '10px'
    },
    valueBox: {
        width: '38px',
        height: '38px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    indexLabel: {
        fontSize: '10px',
        color: '#666',
        fontFamily: 'monospace'
    },
    statusBar: {
        marginTop: '15px',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '6px',
        textAlign: 'center',
        fontSize: '11px',
        fontFamily: 'monospace'
    }
};

export default SortingVisualizer;
