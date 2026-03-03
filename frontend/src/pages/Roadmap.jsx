import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CAREER_PATHS, getNodesForPath, getEdgesForPath, CATEGORY_COLORS } from '../data/roadmapData';

const API_URL = 'http://localhost:5001/api';

const Roadmap = () => {
    const navigate = useNavigate();
    const [selectedPath, setSelectedPath] = useState('sde');
    const [selectedNode, setSelectedNode] = useState(null);
    const [completedNodes, setCompletedNodes] = useState(new Set());
    const [hoveredNode, setHoveredNode] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const user = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('userInfo')); } catch { return null; }
    }, []);

    // Fetch progress
    useEffect(() => {
        const fetchProgress = async () => {
            if (!user?.token) return;
            try {
                const { data } = await axios.get(`${API_URL}/progress`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (data?.pathProgress) {
                    const completed = new Set();
                    Object.entries(data.pathProgress).forEach(([, progress]) => {
                        if (progress.completed) {
                            progress.completed.forEach(id => completed.add(id));
                        }
                    });
                    setCompletedNodes(completed);
                }
            } catch { /* silently fail */ }
        };
        fetchProgress();
    }, [user?.token]);

    const nodes = useMemo(() => getNodesForPath(selectedPath), [selectedPath]);
    const edges = useMemo(() => getEdgesForPath(selectedPath), [selectedPath]);
    const currentPath = CAREER_PATHS.find(p => p.id === selectedPath);

    // Layout constants
    const NODE_SIZE = 70;
    const H_GAP = 140;
    const V_GAP = 130;
    const PADDING = 60;

    // Calculate node positions
    const nodePositions = useMemo(() => {
        const positions = {};
        const rowCounts = {};
        nodes.forEach(n => { rowCounts[n.row] = (rowCounts[n.row] || 0) + 1; });

        nodes.forEach(n => {
            const nodesInRow = rowCounts[n.row];
            const totalWidth = (nodesInRow - 1) * H_GAP;
            const startX = -totalWidth / 2;

            // Find actual col index within row
            const sameRowNodes = nodes.filter(nn => nn.row === n.row).sort((a, b) => a.col - b.col);
            const colIndex = sameRowNodes.indexOf(n);

            positions[n.id] = {
                x: PADDING + 400 + startX + colIndex * H_GAP,
                y: PADDING + 80 + n.row * V_GAP
            };
        });
        return positions;
    }, [nodes]);

    // SVG dimensions
    const svgWidth = useMemo(() => {
        const xs = Object.values(nodePositions).map(p => p.x);
        return Math.max(...xs) + PADDING + NODE_SIZE;
    }, [nodePositions]);

    const svgHeight = useMemo(() => {
        const ys = Object.values(nodePositions).map(p => p.y);
        return Math.max(...ys) + PADDING + NODE_SIZE + 40;
    }, [nodePositions]);

    // Node states
    const getNodeState = useCallback((node) => {
        // Check if any lesson in this node is completed
        const hasCompleted = node.lessons?.some(l => completedNodes.has(l));
        const allCompleted = node.lessons?.every(l => completedNodes.has(l));

        if (allCompleted && node.lessons?.length > 0) return 'completed';
        if (hasCompleted) return 'in-progress';

        // Check prerequisites
        if (!node.prerequisites || node.prerequisites.length === 0) return 'available';
        const allPrereqsMet = node.prerequisites.every(prereq => {
            const prereqNode = nodes.find(n => n.id === prereq);
            return prereqNode && getNodeState(prereqNode) === 'completed';
        });
        return allPrereqsMet ? 'available' : 'locked';
    }, [completedNodes, nodes]);

    // Progress stats
    const progressStats = useMemo(() => {
        let completed = 0, available = 0, locked = 0, inProgress = 0;
        nodes.forEach(n => {
            const state = getNodeState(n);
            if (state === 'completed') completed++;
            else if (state === 'in-progress') inProgress++;
            else if (state === 'available') available++;
            else locked++;
        });
        return { completed, available, locked, inProgress, total: nodes.length };
    }, [nodes, getNodeState]);

    // Pan handlers
    const handleMouseDown = (e) => {
        if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };
    const handleMouseMove = (e) => {
        if (!isPanning) return;
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    };
    const handleMouseUp = () => setIsPanning(false);

    const stateColors = {
        completed: '#48bb78',
        'in-progress': '#667eea',
        available: '#a0aec0',
        locked: '#4a5568'
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
                    <h1 style={styles.title}>🗺️ Learning Roadmap</h1>
                </div>
                <div style={styles.headerRight}>
                    {/* Progress bar */}
                    <div style={styles.progressContainer}>
                        <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: `${(progressStats.completed / progressStats.total) * 100}%` }} />
                        </div>
                        <span style={styles.progressText}>
                            {progressStats.completed}/{progressStats.total} completed
                        </span>
                    </div>
                    {/* Zoom */}
                    <div style={styles.zoomControls}>
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={styles.zoomBtn}>−</button>
                        <span style={{ fontSize: '11px', color: '#888' }}>{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} style={styles.zoomBtn}>+</button>
                    </div>
                </div>
            </div>

            {/* Path Selector */}
            <div style={styles.pathSelector}>
                {CAREER_PATHS.map(path => (
                    <button
                        key={path.id}
                        onClick={() => { setSelectedPath(path.id); setSelectedNode(null); }}
                        style={{
                            ...styles.pathBtn,
                            background: selectedPath === path.id ? `${path.color}22` : 'rgba(255,255,255,0.03)',
                            borderColor: selectedPath === path.id ? path.color : 'rgba(255,255,255,0.08)',
                            color: selectedPath === path.id ? path.color : '#888'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>{path.icon}</span>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{path.label}</span>
                        <span style={{ fontSize: '10px', opacity: 0.7 }}>{path.description}</span>
                    </button>
                ))}
            </div>

            {/* Stats Row */}
            <div style={styles.statsRow}>
                <span style={{ ...styles.statBadge, background: 'rgba(72, 187, 120, 0.15)', color: '#48bb78' }}>✅ {progressStats.completed} completed</span>
                <span style={{ ...styles.statBadge, background: 'rgba(102, 126, 234, 0.15)', color: '#667eea' }}>🔵 {progressStats.inProgress} in progress</span>
                <span style={{ ...styles.statBadge, background: 'rgba(160, 174, 192, 0.15)', color: '#a0aec0' }}>⚪ {progressStats.available} available</span>
                <span style={{ ...styles.statBadge, background: 'rgba(74, 85, 104, 0.15)', color: '#4a5568' }}>🔒 {progressStats.locked} locked</span>
            </div>

            {/* SVG Skill Tree */}
            <div
                style={styles.svgContainer}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, transformOrigin: 'top left', cursor: isPanning ? 'grabbing' : 'grab' }}
                >
                    {/* Animated Edge Lines */}
                    {edges.map((edge, i) => {
                        const from = nodePositions[edge.from];
                        const to = nodePositions[edge.to];
                        if (!from || !to) return null;

                        const fromState = getNodeState(nodes.find(n => n.id === edge.from));
                        const isCompleted = fromState === 'completed';

                        return (
                            <line
                                key={i}
                                x1={from.x + NODE_SIZE / 2}
                                y1={from.y + NODE_SIZE / 2}
                                x2={to.x + NODE_SIZE / 2}
                                y2={to.y + NODE_SIZE / 2}
                                stroke={isCompleted ? '#48bb78' : 'rgba(255,255,255,0.08)'}
                                strokeWidth={isCompleted ? 2.5 : 1.5}
                                strokeDasharray={isCompleted ? '' : '6 4'}
                                style={{ transition: 'all 0.5s ease' }}
                            />
                        );
                    })}

                    {/* Row category labels */}
                    {[
                        { row: 0, label: 'Foundations' },
                        { row: 1, label: 'Data Structures' },
                        { row: 2, label: 'Algorithms' },
                        { row: 3, label: 'Trees & Graphs' },
                        { row: 4, label: 'Advanced' }
                    ].map(({ row, label }) => (
                        <text
                            key={row}
                            x={20}
                            y={PADDING + 80 + row * V_GAP + NODE_SIZE / 2 + 5}
                            fill="#555"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="start"
                        >
                            {label}
                        </text>
                    ))}

                    {/* Nodes */}
                    {nodes.map(node => {
                        const pos = nodePositions[node.id];
                        if (!pos) return null;
                        const state = getNodeState(node);
                        const isHovered = hoveredNode === node.id;
                        const isSelected = selectedNode?.id === node.id;
                        const color = stateColors[state];
                        const catColor = CATEGORY_COLORS[node.category] || '#888';

                        return (
                            <g
                                key={node.id}
                                style={{ cursor: state === 'locked' ? 'not-allowed' : 'pointer', transition: 'transform 0.2s' }}
                                onClick={() => state !== 'locked' && setSelectedNode(node)}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                            >
                                {/* Glow ring for selected/hovered */}
                                {(isSelected || isHovered) && (
                                    <circle
                                        cx={pos.x + NODE_SIZE / 2}
                                        cy={pos.y + NODE_SIZE / 2}
                                        r={NODE_SIZE / 2 + 6}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="2"
                                        opacity="0.5"
                                    />
                                )}

                                {/* Main circle */}
                                <circle
                                    cx={pos.x + NODE_SIZE / 2}
                                    cy={pos.y + NODE_SIZE / 2}
                                    r={NODE_SIZE / 2}
                                    fill={state === 'locked' ? 'rgba(30,30,50,0.8)' : `rgba(${state === 'completed' ? '72,187,120' : state === 'in-progress' ? '102,126,234' : '160,174,192'},0.15)`}
                                    stroke={color}
                                    strokeWidth={isSelected ? 3 : 2}
                                    style={{ transition: 'all 0.3s ease' }}
                                />

                                {/* Icon */}
                                <text
                                    x={pos.x + NODE_SIZE / 2}
                                    y={pos.y + NODE_SIZE / 2 - 2}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={state === 'locked' ? '18' : '22'}
                                    style={{ filter: state === 'locked' ? 'grayscale(1) opacity(0.3)' : 'none' }}
                                >
                                    {state === 'locked' ? '🔒' : node.icon}
                                </text>

                                {/* Completion checkmark */}
                                {state === 'completed' && (
                                    <circle
                                        cx={pos.x + NODE_SIZE - 5}
                                        cy={pos.y + 10}
                                        r={10}
                                        fill="#48bb78"
                                        stroke="#1a1a2e"
                                        strokeWidth="2"
                                    />
                                )}
                                {state === 'completed' && (
                                    <text
                                        x={pos.x + NODE_SIZE - 5}
                                        y={pos.y + 14}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="white"
                                    >
                                        ✓
                                    </text>
                                )}

                                {/* Label */}
                                <text
                                    x={pos.x + NODE_SIZE / 2}
                                    y={pos.y + NODE_SIZE + 16}
                                    textAnchor="middle"
                                    fill={state === 'locked' ? '#555' : '#ccc'}
                                    fontSize="11"
                                    fontWeight="bold"
                                >
                                    {node.label}
                                </text>

                                {/* Category tag */}
                                <rect
                                    x={pos.x + NODE_SIZE / 2 - 25}
                                    y={pos.y + NODE_SIZE + 22}
                                    width="50"
                                    height="14"
                                    rx="3"
                                    fill={`${catColor}22`}
                                />
                                <text
                                    x={pos.x + NODE_SIZE / 2}
                                    y={pos.y + NODE_SIZE + 32}
                                    textAnchor="middle"
                                    fill={catColor}
                                    fontSize="8"
                                >
                                    {node.category}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Node Detail Panel */}
            <AnimatePresence>
                {selectedNode && (
                    <Motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        style={styles.detailPanel}
                    >
                        <div style={styles.detailHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '28px' }}>{selectedNode.icon}</span>
                                <div>
                                    <h3 style={{ margin: 0, color: '#fff' }}>{selectedNode.label}</h3>
                                    <span style={{ fontSize: '11px', color: CATEGORY_COLORS[selectedNode.category] || '#888' }}>
                                        {selectedNode.category}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNode(null)} style={styles.closeDetailBtn}>×</button>
                        </div>

                        {/* Status */}
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                background: `${stateColors[getNodeState(selectedNode)]}22`,
                                color: stateColors[getNodeState(selectedNode)]
                            }}>
                                {getNodeState(selectedNode) === 'completed' ? '✅ Completed' :
                                    getNodeState(selectedNode) === 'in-progress' ? '🔵 In Progress' :
                                        getNodeState(selectedNode) === 'available' ? '⚪ Available' : '🔒 Locked'}
                            </div>
                        </div>

                        {/* Lessons */}
                        <div style={{ padding: '12px 16px' }}>
                            <h4 style={{ margin: '0 0 8px', color: '#aaa', fontSize: '12px' }}>📚 LESSONS</h4>
                            {selectedNode.lessons?.map(lesson => (
                                <div key={lesson} style={styles.lessonItem}>
                                    <span>{completedNodes.has(lesson) ? '✅' : '○'}</span>
                                    <span style={{ color: completedNodes.has(lesson) ? '#48bb78' : '#ccc' }}>{lesson}</span>
                                </div>
                            ))}
                        </div>

                        {/* Prerequisites */}
                        {selectedNode.prerequisites?.length > 0 && (
                            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <h4 style={{ margin: '0 0 8px', color: '#aaa', fontSize: '12px' }}>🔗 PREREQUISITES</h4>
                                {selectedNode.prerequisites.map(prereq => {
                                    const prereqNode = nodes.find(n => n.id === prereq);
                                    const prereqState = prereqNode ? getNodeState(prereqNode) : 'locked';
                                    return (
                                        <div key={prereq} style={{ ...styles.lessonItem, cursor: 'pointer' }} onClick={() => prereqNode && setSelectedNode(prereqNode)}>
                                            <span>{prereqState === 'completed' ? '✅' : '⚪'}</span>
                                            <span style={{ color: prereqState === 'completed' ? '#48bb78' : '#ccc' }}>{prereqNode?.label || prereq}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Start Button */}
                        {getNodeState(selectedNode) !== 'locked' && (
                            <div style={{ padding: '16px' }}>
                                <button
                                    onClick={() => navigate('/learn')}
                                    style={styles.startBtn}
                                >
                                    {getNodeState(selectedNode) === 'completed' ? '🔄 Review' : '🚀 Start Learning'}
                                </button>
                            </div>
                        )}
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.2)'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    backBtn: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#aaa',
        padding: '6px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px'
    },
    title: {
        margin: 0,
        fontSize: '22px',
        fontWeight: 'bold'
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    progressBar: {
        width: '120px',
        height: '6px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '3px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #48bb78, #38a169)',
        borderRadius: '3px',
        transition: 'width 0.5s ease'
    },
    progressText: {
        fontSize: '12px',
        color: '#888'
    },
    zoomControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px'
    },
    zoomBtn: {
        background: 'none',
        border: 'none',
        color: '#aaa',
        fontSize: '16px',
        cursor: 'pointer',
        padding: '2px 6px'
    },
    pathSelector: {
        display: 'flex',
        gap: '12px',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        overflowX: 'auto'
    },
    pathBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '14px 24px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
        minWidth: '180px',
        transition: 'all 0.3s ease'
    },
    statsRow: {
        display: 'flex',
        gap: '8px',
        padding: '8px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
    },
    statBadge: {
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold'
    },
    svgContainer: {
        flex: 1,
        overflow: 'auto',
        position: 'relative'
    },
    detailPanel: {
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '320px',
        maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(20, 20, 35, 0.98)',
        borderRadius: '16px',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
        zIndex: 100,
        overflow: 'auto',
        backdropFilter: 'blur(20px)'
    },
    detailHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(102, 126, 234, 0.05)'
    },
    closeDetailBtn: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: '24px',
        cursor: 'pointer'
    },
    lessonItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 0',
        fontSize: '13px'
    },
    startBtn: {
        width: '100%',
        padding: '12px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
    }
};

export default Roadmap;
