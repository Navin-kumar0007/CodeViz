import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

/**
 * ConceptCard - Educational popup explaining data structure concepts
 * Shows when a new data structure type is detected
 */

const CONCEPTS = {
    array: {
        icon: '📊',
        title: 'Array',
        description: 'An ordered collection of elements, each identified by an index starting from 0.',
        keyPoints: [
            'Access any element instantly using its index: arr[0]',
            'Great for storing lists of similar items',
            'Fixed or dynamic size depending on language'
        ],
        example: 'arr = [10, 20, 30] → arr[1] = 20'
    },
    stack: {
        icon: '📚',
        title: 'Stack (LIFO)',
        description: 'Last In, First Out - like a stack of plates. The last item added is the first removed.',
        keyPoints: [
            'push() adds to the top',
            'pop() removes from the top',
            'Used in: undo operations, function calls, parsing'
        ],
        example: 'push(1), push(2), pop() → returns 2'
    },
    queue: {
        icon: '🎫',
        title: 'Queue (FIFO)',
        description: 'First In, First Out - like a line at a store. The first item added is the first removed.',
        keyPoints: [
            'enqueue() adds to the back',
            'dequeue() removes from the front',
            'Used in: task scheduling, BFS, print queues'
        ],
        example: 'enqueue(1), enqueue(2), dequeue() → returns 1'
    },
    linkedList: {
        icon: '🔗',
        title: 'Linked List',
        description: 'A chain of nodes, each containing data and a pointer to the next node.',
        keyPoints: [
            'Each node has: value + next pointer',
            'Easy to insert/delete (no shifting)',
            'Must traverse from head to find elements'
        ],
        example: '10 → 20 → 30 → null'
    },
    tree: {
        icon: '🌲',
        title: 'Binary Tree',
        description: 'A hierarchical structure where each node has at most two children (left and right).',
        keyPoints: [
            'Root is the top node',
            'Leaf nodes have no children',
            'Used in: file systems, databases, decision trees'
        ],
        example: 'Root(10) → Left(5), Right(15)'
    },
    graph: {
        icon: '🕸️',
        title: 'Graph',
        description: 'A collection of nodes (vertices) connected by edges. Can represent networks and relationships.',
        keyPoints: [
            'Nodes store data, edges show connections',
            'Can be directed or undirected',
            'Used in: social networks, maps, recommendations'
        ],
        example: 'A → [B, C] means A connects to B and C'
    }
};

const ConceptCard = ({ type, onDismiss, isVisible }) => {
    const concept = CONCEPTS[type];

    if (!concept) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <Motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    style={styles.container}
                >
                    <div style={styles.header}>
                        <div style={styles.iconWrapper}>
                            <span style={styles.icon}>{concept.icon}</span>
                        </div>
                        <div>
                            <div style={styles.title}>{concept.title}</div>
                            <div style={styles.badge}>💡 Concept Card</div>
                        </div>
                        <button onClick={onDismiss} style={styles.closeBtn}>✕</button>
                    </div>

                    <p style={styles.description}>{concept.description}</p>

                    <div style={styles.keyPointsSection}>
                        <div style={styles.keyPointsTitle}>Key Points:</div>
                        <ul style={styles.keyPoints}>
                            {concept.keyPoints.map((point, i) => (
                                <Motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    style={styles.keyPoint}
                                >
                                    {point}
                                </Motion.li>
                            ))}
                        </ul>
                    </div>

                    <div style={styles.example}>
                        <span style={styles.exampleLabel}>Example:</span>
                        <code style={styles.exampleCode}>{concept.example}</code>
                    </div>
                </Motion.div>
            )}
        </AnimatePresence>
    );
};

const styles = {
    container: {
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))',
        border: '1px solid rgba(102, 126, 234, 0.4)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '15px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
    },
    iconWrapper: {
        width: '45px',
        height: '45px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    },
    icon: {
        fontSize: '24px'
    },
    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '16px'
    },
    badge: {
        fontSize: '10px',
        color: '#a78bfa',
        fontWeight: 'bold'
    },
    closeBtn: {
        marginLeft: 'auto',
        background: 'transparent',
        border: 'none',
        color: '#888',
        fontSize: '18px',
        cursor: 'pointer',
        padding: '5px'
    },
    description: {
        color: '#d1d5db',
        fontSize: '13px',
        lineHeight: '1.6',
        margin: '0 0 12px 0'
    },
    keyPointsSection: {
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '12px'
    },
    keyPointsTitle: {
        color: '#a78bfa',
        fontSize: '11px',
        fontWeight: 'bold',
        marginBottom: '6px',
        textTransform: 'uppercase'
    },
    keyPoints: {
        margin: 0,
        paddingLeft: '16px'
    },
    keyPoint: {
        color: '#e5e7eb',
        fontSize: '12px',
        marginBottom: '4px'
    },
    example: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    exampleLabel: {
        color: '#888',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    exampleCode: {
        background: 'rgba(0, 0, 0, 0.3)',
        color: '#4fc3f7',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace'
    }
};

export default ConceptCard;
