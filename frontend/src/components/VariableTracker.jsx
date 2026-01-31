import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * VariableTracker - Shows how variables change over time
 * Displays a timeline of variable values across execution steps
 */

const VariableTracker = ({ traceData, stepIndex, maxHistory = 10 }) => {
    // Extract variable history from trace data
    const getVariableHistory = () => {
        const history = {};
        const startIdx = Math.max(0, stepIndex - maxHistory + 1);

        for (let i = startIdx; i <= stepIndex; i++) {
            const step = traceData[i];
            if (!step) continue;

            let vars = step.variables || step.locals || step.globals;
            if (typeof vars === 'string') {
                try { vars = JSON.parse(vars); } catch (e) { continue; }
            }
            if (!vars) continue;

            Object.entries(vars).forEach(([name, value]) => {
                // Only track primitives (numbers, strings, booleans)
                if (typeof value !== 'object' || value === null) {
                    if (!history[name]) {
                        history[name] = [];
                    }

                    const lastValue = history[name][history[name].length - 1];
                    const stringValue = String(value);

                    // Only add if value changed or first occurrence
                    if (history[name].length === 0 || lastValue?.value !== stringValue) {
                        history[name].push({
                            step: i,
                            value: stringValue,
                            changed: history[name].length > 0
                        });
                    }
                }
            });
        }

        return history;
    };

    const history = getVariableHistory();
    const variableNames = Object.keys(history).filter(name => history[name].length > 1);

    if (variableNames.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={styles.container}
        >
            <div style={styles.header}>
                <span style={styles.icon}>📈</span>
                <span style={styles.title}>Variable Changes</span>
                <span style={styles.subtitle}>Last {maxHistory} steps</span>
            </div>

            <div style={styles.trackerGrid}>
                {variableNames.slice(0, 5).map(name => (
                    <div key={name} style={styles.variableRow}>
                        <div style={styles.varName}>{name}</div>
                        <div style={styles.timeline}>
                            <AnimatePresence mode="popLayout">
                                {history[name].slice(-6).map((entry, idx) => (
                                    <motion.div
                                        key={`${entry.step}-${entry.value}`}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            ...styles.valueBox,
                                            background: entry.changed
                                                ? 'linear-gradient(135deg, #f6ad55, #ed8936)'
                                                : 'linear-gradient(135deg, #48bb78, #38a169)',
                                            boxShadow: entry.step === stepIndex
                                                ? '0 0 10px rgba(102, 126, 234, 0.6)'
                                                : 'none',
                                            border: entry.step === stepIndex
                                                ? '2px solid #667eea'
                                                : '2px solid transparent'
                                        }}
                                    >
                                        {entry.value.length > 6 ? entry.value.slice(0, 5) + '…' : entry.value}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>

            {variableNames.length > 5 && (
                <div style={styles.moreIndicator}>
                    +{variableNames.length - 5} more variables
                </div>
            )}
        </motion.div>
    );
};

const styles = {
    container: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '15px'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    icon: {
        fontSize: '18px'
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '13px'
    },
    subtitle: {
        color: '#666',
        fontSize: '10px',
        marginLeft: 'auto'
    },
    trackerGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    variableRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    varName: {
        color: '#9cdcfe',
        fontSize: '12px',
        fontWeight: 'bold',
        minWidth: '60px',
        fontFamily: 'monospace'
    },
    timeline: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flex: 1,
        overflowX: 'auto'
    },
    valueBox: {
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        minWidth: '30px',
        textAlign: 'center'
    },
    moreIndicator: {
        textAlign: 'center',
        color: '#666',
        fontSize: '10px',
        marginTop: '8px'
    }
};

export default VariableTracker;
