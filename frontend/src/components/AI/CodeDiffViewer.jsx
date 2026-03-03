import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

/**
 * CodeDiffViewer — Side-by-side code diff visualization
 * Shows original vs optimized code with highlighted changes and reasons
 */
const CodeDiffViewer = ({ diff, originalCode, onApply, onClose }) => {
    const [selectedChange, setSelectedChange] = useState(null);
    const [showReasons, setShowReasons] = useState(true);

    if (!diff || !diff.optimizedCode) return null;

    const originalLines = originalCode.split('\n');
    const optimizedLines = diff.optimizedCode.split('\n');

    // Build change maps for highlighting
    const changesByLine = {};
    if (diff.changes) {
        diff.changes.forEach((change, i) => {
            changesByLine[change.line] = { ...change, index: i };
        });
    }

    const getLineStyle = (lineNum, side) => {
        const change = changesByLine[lineNum];
        if (!change) return {};

        if (change.type === 'modified') {
            return {
                background: side === 'left'
                    ? 'rgba(245, 101, 101, 0.15)'
                    : 'rgba(72, 187, 120, 0.15)',
                borderLeft: side === 'left'
                    ? '3px solid #f56565'
                    : '3px solid #48bb78'
            };
        }
        if (change.type === 'removed' && side === 'left') {
            return { background: 'rgba(245, 101, 101, 0.2)', borderLeft: '3px solid #f56565', textDecoration: 'line-through', opacity: 0.7 };
        }
        if (change.type === 'added' && side === 'right') {
            return { background: 'rgba(72, 187, 120, 0.2)', borderLeft: '3px solid #48bb78' };
        }
        return {};
    };

    return (
        <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.container}
        >
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={{ fontSize: '18px' }}>🔍</span>
                    <span style={styles.headerTitle}>Code Optimization Diff</span>
                </div>
                <div style={styles.headerRight}>
                    {diff.complexityBefore && diff.complexityAfter && (
                        <div style={styles.complexityBadge}>
                            <span style={styles.complexityBefore}>{diff.complexityBefore}</span>
                            <span style={{ color: '#888' }}>→</span>
                            <span style={styles.complexityAfter}>{diff.complexityAfter}</span>
                        </div>
                    )}
                    {diff.pattern && (
                        <span style={styles.patternBadge}>📐 {diff.pattern}</span>
                    )}
                    {onClose && (
                        <button onClick={onClose} style={styles.closeBtn}>×</button>
                    )}
                </div>
            </div>

            {/* Summary */}
            {diff.summary && (
                <div style={styles.summary}>
                    💡 {diff.summary}
                </div>
            )}

            {/* Diff View */}
            <div style={styles.diffContainer}>
                {/* Left: Original */}
                <div style={styles.diffPanel}>
                    <div style={styles.panelHeader}>
                        <span style={styles.panelLabel}>📄 Original</span>
                        <span style={styles.lineCount}>{originalLines.length} lines</span>
                    </div>
                    <div style={styles.codeBlock}>
                        {originalLines.map((line, i) => {
                            const lineNum = i + 1;
                            const change = changesByLine[lineNum];
                            return (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.codeLine,
                                        ...getLineStyle(lineNum, 'left'),
                                        ...(selectedChange === change?.index ? styles.selectedLine : {})
                                    }}
                                    onClick={() => change && setSelectedChange(change.index === selectedChange ? null : change.index)}
                                >
                                    <span style={styles.lineNumber}>{lineNum}</span>
                                    <span style={styles.lineContent}>{line || ' '}</span>
                                    {change && (
                                        <span style={styles.changeIndicator}>
                                            {change.type === 'modified' ? '✏️' : change.type === 'removed' ? '❌' : ''}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Divider */}
                <div style={styles.divider}>
                    <div style={styles.dividerLine} />
                    <span style={styles.dividerIcon}>→</span>
                    <div style={styles.dividerLine} />
                </div>

                {/* Right: Optimized */}
                <div style={styles.diffPanel}>
                    <div style={styles.panelHeader}>
                        <span style={{ ...styles.panelLabel, color: '#48bb78' }}>✨ Optimized</span>
                        <span style={styles.lineCount}>{optimizedLines.length} lines</span>
                    </div>
                    <div style={styles.codeBlock}>
                        {optimizedLines.map((line, i) => {
                            const lineNum = i + 1;
                            const change = changesByLine[lineNum];
                            return (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.codeLine,
                                        ...getLineStyle(lineNum, 'right'),
                                        ...(selectedChange === change?.index ? styles.selectedLine : {})
                                    }}
                                    onClick={() => change && setSelectedChange(change.index === selectedChange ? null : change.index)}
                                >
                                    <span style={styles.lineNumber}>{lineNum}</span>
                                    <span style={styles.lineContent}>{line || ' '}</span>
                                    {change && change.type !== 'removed' && (
                                        <span style={styles.changeIndicator}>
                                            {change.type === 'modified' ? '✏️' : change.type === 'added' ? '✅' : ''}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Change reasons */}
            {showReasons && diff.changes && diff.changes.length > 0 && (
                <div style={styles.reasonsContainer}>
                    <div style={styles.reasonsHeader}>
                        <span>📝 Why these changes?</span>
                        <button onClick={() => setShowReasons(false)} style={styles.toggleReasonsBtn}>Hide</button>
                    </div>
                    {diff.changes.map((change, i) => (
                        <Motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                ...styles.reasonItem,
                                ...(selectedChange === i ? { borderColor: '#667eea', background: 'rgba(102, 126, 234, 0.1)' } : {})
                            }}
                            onClick={() => setSelectedChange(i === selectedChange ? null : i)}
                        >
                            <div style={styles.reasonHeader}>
                                <span style={{
                                    ...styles.changeTypeBadge,
                                    background: change.type === 'modified' ? 'rgba(237, 137, 54, 0.2)' :
                                        change.type === 'added' ? 'rgba(72, 187, 120, 0.2)' :
                                            'rgba(245, 101, 101, 0.2)',
                                    color: change.type === 'modified' ? '#ed8936' :
                                        change.type === 'added' ? '#48bb78' : '#f56565'
                                }}>
                                    {change.type === 'modified' ? '✏️' : change.type === 'added' ? '➕' : '➖'} Line {change.line}
                                </span>
                            </div>
                            <p style={styles.reasonText}>{change.reason}</p>
                        </Motion.div>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div style={styles.actions}>
                {!showReasons && diff.changes?.length > 0 && (
                    <button onClick={() => setShowReasons(true)} style={styles.showReasonsBtn}>
                        📝 Show Reasons ({diff.changes.length})
                    </button>
                )}
                {onApply && (
                    <button onClick={() => onApply(diff.optimizedCode)} style={styles.applyBtn}>
                        ✅ Apply Optimization
                    </button>
                )}
            </div>
        </Motion.div>
    );
};

const styles = {
    container: {
        background: 'rgba(15, 15, 30, 0.98)',
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        overflow: 'hidden'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'rgba(102, 126, 234, 0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    headerTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    complexityBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    complexityBefore: {
        color: '#f56565',
        textDecoration: 'line-through'
    },
    complexityAfter: {
        color: '#48bb78'
    },
    patternBadge: {
        padding: '4px 10px',
        background: 'rgba(102, 126, 234, 0.15)',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#a5b4fc',
        fontWeight: 'bold'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '20px',
        cursor: 'pointer'
    },
    summary: {
        padding: '10px 16px',
        fontSize: '13px',
        color: '#ccc',
        background: 'rgba(102, 126, 234, 0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
    },
    diffContainer: {
        display: 'flex',
        maxHeight: '300px',
        overflow: 'hidden'
    },
    diffPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
    },
    panelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        background: 'rgba(0,0,0,0.2)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    panelLabel: {
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#f56565'
    },
    lineCount: {
        fontSize: '10px',
        color: '#666'
    },
    codeBlock: {
        flex: 1,
        overflowY: 'auto',
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
        fontSize: '12px'
    },
    codeLine: {
        display: 'flex',
        alignItems: 'center',
        padding: '1px 8px',
        cursor: 'pointer',
        borderLeft: '3px solid transparent',
        transition: 'background 0.15s'
    },
    lineNumber: {
        width: '28px',
        textAlign: 'right',
        color: '#555',
        fontSize: '10px',
        marginRight: '10px',
        flexShrink: 0,
        userSelect: 'none'
    },
    lineContent: {
        flex: 1,
        color: '#d4d4d4',
        whiteSpace: 'pre',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    changeIndicator: {
        fontSize: '10px',
        marginLeft: '4px',
        flexShrink: 0
    },
    selectedLine: {
        background: 'rgba(102, 126, 234, 0.15) !important',
        borderLeftColor: '#667eea !important'
    },
    divider: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        background: 'rgba(0,0,0,0.3)',
        flexShrink: 0
    },
    dividerLine: {
        width: '1px',
        flex: 1,
        background: 'rgba(255,255,255,0.1)'
    },
    dividerIcon: {
        color: '#667eea',
        fontSize: '14px',
        padding: '4px 0'
    },
    reasonsContainer: {
        borderTop: '1px solid rgba(255,255,255,0.06)',
        maxHeight: '180px',
        overflowY: 'auto'
    },
    reasonsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.2)',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#ccc'
    },
    toggleReasonsBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '11px',
        cursor: 'pointer'
    },
    reasonItem: {
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        borderLeft: '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    reasonHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px'
    },
    changeTypeBadge: {
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold'
    },
    reasonText: {
        margin: 0,
        fontSize: '12px',
        color: '#aaa',
        lineHeight: 1.4
    },
    actions: {
        display: 'flex',
        gap: '8px',
        padding: '10px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        justifyContent: 'flex-end'
    },
    showReasonsBtn: {
        padding: '6px 14px',
        background: 'rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '8px',
        color: '#a5b4fc',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    applyBtn: {
        padding: '8px 18px',
        background: 'linear-gradient(135deg, #48bb78, #38a169)',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(72, 187, 120, 0.3)'
    }
};

export default CodeDiffViewer;
