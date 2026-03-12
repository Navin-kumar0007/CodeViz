import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const concepts = [
    { id: 'basics', label: 'Programming Basics', category: 'core', x: 400, y: 100, mastered: true },
    { id: 'arrays', label: 'Arrays & Strings', category: 'data', x: 250, y: 250, mastered: true },
    { id: 'math', label: 'Math & Logic', category: 'core', x: 550, y: 250, mastered: false },
    { id: 'linkedlist', label: 'Linked Lists', category: 'data', x: 150, y: 400, mastered: false },
    { id: 'hash', label: 'Hash Tables', category: 'data', x: 350, y: 400, mastered: false },
    { id: 'recursion', label: 'Recursion', category: 'core', x: 650, y: 400, mastered: true },
    { id: 'trees', label: 'Trees & Graphs', category: 'advanced', x: 250, y: 550, mastered: false },
    { id: 'sorting', label: 'Sorting', category: 'algo', x: 450, y: 550, mastered: false },
    { id: 'dp', label: 'Dynamic Programming', category: 'algo', x: 650, y: 550, mastered: false },
    { id: 'graphs', label: 'Advanced Graphs', category: 'advanced', x: 350, y: 700, mastered: false },
];

const edges = [
    { source: 'basics', target: 'arrays' },
    { source: 'basics', target: 'math' },
    { source: 'arrays', target: 'linkedlist' },
    { source: 'arrays', target: 'hash' },
    { source: 'math', target: 'recursion' },
    { source: 'linkedlist', target: 'trees' },
    { source: 'hash', target: 'sorting' },
    { source: 'recursion', target: 'trees' },
    { source: 'recursion', target: 'dp' },
    { source: 'trees', target: 'graphs' },
    { source: 'sorting', target: 'dp' },
];

const ConceptMap = () => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [zoom, setZoom] = useState(1);

    const getCategoryColor = (category, mastered) => {
        if (mastered) return '#48bb78'; // Green
        switch (category) {
            case 'core': return '#4299e1'; // Blue
            case 'data': return '#ed8936'; // Orange
            case 'algo': return '#9f7aea'; // Purple
            case 'advanced': return '#f56565'; // Red
            default: return '#a0aec0';
        }
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>🗺️ Concept Map</h1>
                    <p style={styles.subtitle}>Visualize your learning journey and topic mastery</p>
                </div>
                <div style={styles.controls}>
                    <button style={styles.btn} onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>-</button>
                    <span style={styles.zoomText}>{Math.round(zoom * 100)}%</span>
                    <button style={styles.btn} onClick={() => setZoom(z => Math.min(2, z + 0.1))}>+</button>
                </div>
            </header>

            <div style={styles.container}>
                {/* SVG Graph Area */}
                <div style={{ ...styles.canvasArea, cursor: 'grab' }}>
                    <svg width="100%" height="800" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.3s' }}>

                        {/* Render Edges */}
                        {edges.map((edge, i) => {
                            const source = concepts.find(c => c.id === edge.source);
                            const target = concepts.find(c => c.id === edge.target);

                            const isSourceMastered = source.mastered;
                            const isTargetMastered = target.mastered;
                            const pathColor = isSourceMastered && isTargetMastered ? '#48bb78' : '#4a5568';
                            const strokeWidth = isSourceMastered && isTargetMastered ? 3 : 2;

                            return (
                                <line
                                    key={i}
                                    x1={source.x} y1={source.y}
                                    x2={target.x} y2={target.y}
                                    stroke={pathColor}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={(!isSourceMastered || !isTargetMastered) ? "5,5" : "none"}
                                />
                            );
                        })}

                        {/* Render Nodes */}
                        {concepts.map(node => (
                            <g
                                key={node.id}
                                transform={`translate(${node.x}, ${node.y})`}
                                onClick={() => setSelectedNode(node)}
                                style={{ cursor: 'pointer' }}
                            >
                                <motion.circle
                                    r="40"
                                    fill="#1a202c"
                                    stroke={getCategoryColor(node.category, node.mastered)}
                                    strokeWidth={selectedNode?.id === node.id ? "5" : "3"}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                />
                                <text
                                    textAnchor="middle"
                                    fill="#fff"
                                    dy="5"
                                    fontSize="12"
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    {node.mastered ? '★' : '🔒'}
                                </text>
                                <text
                                    textAnchor="middle"
                                    fill="#cbd5e0"
                                    dy="60"
                                    fontSize="14"
                                    fontWeight="bold"
                                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                                >
                                    {node.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Info Panel */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            style={styles.infoPanel}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2 style={{ margin: 0 }}>{selectedNode.label}</h2>
                                <button onClick={() => setSelectedNode(null)} style={styles.closeBtn}>&times;</button>
                            </div>

                            <div style={{ ...styles.badge, background: getCategoryColor(selectedNode.category, selectedNode.mastered) + '33', color: getCategoryColor(selectedNode.category, selectedNode.mastered) }}>
                                {selectedNode.mastered ? 'Mastered' : 'In Progress'}
                            </div>

                            <p style={{ color: '#a0aec0', marginTop: '15px', lineHeight: '1.6' }}>
                                Master {selectedNode.label} by completing more core challenges. Connect it with other concepts to unlock advanced algorithmic strategies!
                            </p>

                            <button style={{ ...styles.primaryBtn, width: '100%', marginTop: '20px' }}>
                                Practice {selectedNode.label}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const styles = {
    page: { padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#fff', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px' },
    title: { fontSize: '32px', margin: '0 0 10px 0', color: '#fff' },
    subtitle: { color: '#a0aec0', margin: 0, fontSize: '16px' },
    controls: { display: 'flex', alignItems: 'center', gap: '15px', background: '#1a202c', padding: '10px 20px', borderRadius: '8px', border: '1px solid #2d3748' },
    btn: { background: '#2d3748', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    zoomText: { color: '#e2e8f0', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' },
    container: { display: 'flex', gap: '20px', position: 'relative' },
    canvasArea: { flex: 1, background: '#1a202c', borderRadius: '12px', border: '1px solid #2d3748', overflow: 'hidden', position: 'relative' },
    infoPanel: { position: 'absolute', right: '20px', top: '20px', background: '#2d3748', padding: '25px', borderRadius: '12px', width: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #4a5568' },
    closeBtn: { background: 'transparent', border: 'none', color: '#a0aec0', fontSize: '24px', cursor: 'pointer' },
    badge: { display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' },
    primaryBtn: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }
};

export default ConceptMap;
