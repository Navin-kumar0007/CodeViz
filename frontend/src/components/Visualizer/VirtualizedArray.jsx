import React from 'react';
import { List } from 'react-window';
import { motion } from 'framer-motion';

/**
 * VirtualizedArray - Efficiently renders large arrays using react-window v2
 * Only renders visible items, dramatically improving performance for 1000+ elements
 */

// Row component extracted for react-window v2 API
const Row = ({ index, style, rowProps }) => {
    const { items, getVariableColor, state } = rowProps;
    const value = items[index];
    const gradient = getVariableColor(state);

    return (
        <div style={style}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }} // Cap delay for large arrays
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px'
                }}
            >
                {/* Index label */}
                <div style={{
                    fontSize: '11px',
                    color: '#888',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                }}>
                    [{index}]
                </div>

                {/* Value box */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    style={{
                        minWidth: '50px',
                        height: '50px',
                        padding: '0 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        background: `linear-gradient(135deg, ${gradient}, ${gradient}dd)`,
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        cursor: 'pointer'
                    }}
                >
                    {String(value)}
                </motion.div>
            </motion.div>
        </div>
    );
};

const VirtualizedArray = ({ name, items, state, getVariableColor }) => {
    // Calculate dimensions
    const itemHeight = 70; // Height of each array item
    const maxVisibleItems = 10;
    const listHeight = Math.min(items.length, maxVisibleItems) * itemHeight;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '15px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        fontSize: '28px',
                        filter: 'drop-shadow(0 2px 10px rgba(0, 122, 204, 0.4))'
                    }}>
                        📊
                    </span>
                    <div>
                        <div style={{
                            color: '#9cdcfe',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>
                            {name}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#888'
                        }}>
                            {items.length} elements (virtualized)
                        </div>
                    </div>
                </div>
                <div style={{
                    fontSize: '11px',
                    background: 'rgba(0, 122, 204, 0.3)',
                    color: '#4fc3f7',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontWeight: 'bold'
                }}>
                    Array
                </div>
            </div>

            {/* Virtual List - react-window v2 API */}
            <List
                height={listHeight}
                rowCount={items.length}
                rowHeight={itemHeight}
                rowComponent={Row}
                rowProps={{ items, getVariableColor, state }}
                style={{
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    width: '100%'
                }}
            />

            {/* Footer info */}
            <div style={{
                marginTop: '10px',
                fontSize: '10px',
                color: '#666',
                textAlign: 'center'
            }}>
                ⚡ Virtual scrolling enabled - rendering {Math.min(maxVisibleItems, items.length)} of {items.length} items
            </div>
        </motion.div>
    );
};

export default React.memo(VirtualizedArray);
