import React, { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';

// --- CUSTOM NODE COMPONENTS ---

const NeuralNode = ({ data, isConnectable }) => {
    const isFractured = data.status === 'fractured';
    const isPassed = data.status === 'passed';
    const isMicro = data.isMicro;

    const baseStyle = {
        padding: '12px 20px',
        borderRadius: isMicro ? '8px' : '0px',
        border: `1px solid ${isFractured ? '#f56565' : isPassed ? 'var(--accent-teal)' : 'var(--border-ghost)'}`,
        background: isFractured ? 'rgba(245,101,101,0.1)' : isPassed ? 'rgba(13,148,136,0.1)' : 'var(--bg-panel)',
        color: isFractured ? '#f56565' : isPassed ? 'var(--accent-teal)' : 'var(--text-primary)',
        boxShadow: isFractured ? '0 0 15px rgba(245,101,101,0.3)' : isPassed ? '0 0 15px rgba(13,148,136,0.3)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        minWidth: '150px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontSize: '11px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease'
    };

    return (
        <div style={baseStyle}>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ background: '#555', border: 'none' }} />
            
            <span style={{ fontSize: '18px' }}>
                {isFractured ? '⚠️' : isPassed ? '✅' : isMicro ? '💊' : '🧠'}
            </span>
            <span>{data.label}</span>
            {isFractured && (
                 <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ fontSize: '9px', color: '#f56565' }}
                 >
                     FRACTURE DETECTED
                 </motion.div>
            )}
            
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ background: '#555', border: 'none' }} />
        </div>
    );
};

const nodeTypes = { neural: NeuralNode };

const initialNodes = [
  { id: '1', type: 'neural', data: { label: 'Variables & Data', status: 'passed' }, position: { x: 250, y: 50 } },
  { id: '2', type: 'neural', data: { label: 'Control Flow', status: 'passed' }, position: { x: 250, y: 200 } },
  { id: '3', type: 'neural', data: { label: 'Arrays & Hashing', status: 'active' }, position: { x: 250, y: 350 } },
  { id: '4', type: 'neural', data: { label: 'Two Pointers', status: 'locked' }, position: { x: 250, y: 500 } },
  { id: '5', type: 'neural', data: { label: 'Sliding Window', status: 'locked' }, position: { x: 250, y: 650 } }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'var(--accent-teal)' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: 'var(--accent-teal)' } },
  { id: 'e3-4', source: '3', target: '4', style: { stroke: '#555' } },
  { id: 'e4-5', source: '4', target: '5', style: { stroke: '#555' } }
];

const NeuralPathway = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    // Simulate 3 failures to trigger the "Fracture" mechanic
    const simulateFailure = () => {
        setNodes((nds) => {
            return nds.map((n) => {
                if (n.id === '3') {
                    // Fracture the active node
                    return { ...n, data: { ...n.data, status: 'fractured' } };
                }
                return n;
            }).concat({
                id: '3a', 
                type: 'neural', 
                data: { label: 'Micro-Lesson: Index bounds', status: 'active', isMicro: true }, 
                position: { x: 450, y: 400 }
            });
        });
        
        // Add the branching edge
        setEdges((eds) => eds.concat({
            id: 'e3-3a', 
            source: '3', 
            target: '3a', 
            animated: true, 
            style: { stroke: '#f56565', strokeWidth: 2, strokeDasharray: '5,5' },
            label: 'Requires Remediation',
            labelStyle: { fill: '#f56565', fontSize: 10, fontWeight: 'bold' }
        }));
    };

    // Heal the fracture
    const simulateHealing = () => {
        setNodes((nds) => {
            return nds.map((n) => {
                if (n.id === '3a') {
                    return { ...n, data: { ...n.data, status: 'passed' } };
                }
                if (n.id === '3') {
                    return { ...n, data: { ...n.data, status: 'passed' } };
                }
                if (n.id === '4') {
                    return { ...n, data: { ...n.data, status: 'active' } };
                }
                return n;
            });
        });
        
        setEdges((eds) => {
            return eds.map(e => {
                if (e.id === 'e3-3a') return { ...e, style: { stroke: 'var(--accent-teal)' }, animated: false, label: 'Repaired' };
                if (e.id === 'e3-4') return { ...e, style: { stroke: 'var(--accent-teal)' }, animated: true };
                return e;
            });
        });
    };

    return (
        <div style={S.page}>
            <header style={S.header}>
                <div>
                    <h2 style={S.title}>Adaptive Neural Pathway</h2>
                    <p style={S.subtitle}>Dynamic curriculum that mutates based on your failure points.</p>
                </div>
                <div style={S.controls}>
                    <button onClick={simulateFailure} style={S.btnFracture}>💥 Simulate 3 Failures</button>
                    <button onClick={simulateHealing} style={S.btnHeal}>💉 Simulate Remediation</button>
                </div>
            </header>
            
            <div style={S.flowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="#333" gap={20} size={1} />
                    <Controls style={{ button: { backgroundColor: 'var(--bg-panel)', color: '#fff', border: '1px solid var(--border-ghost)' } }} />
                </ReactFlow>
            </div>
        </div>
    );
};

const S = {
    page: { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' },
    header: { padding: '20px 30px', borderBottom: '1px solid var(--border-ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', zIndex: 10 },
    title: { margin: '0 0 5px 0', fontSize: '20px', color: 'var(--text-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' },
    subtitle: { margin: 0, fontSize: '13px', color: 'var(--text-muted)' },
    controls: { display: 'flex', gap: '10px' },
    btnFracture: { padding: '8px 16px', background: 'rgba(245,101,101,0.1)', color: '#f56565', border: '1px solid #f56565', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },
    btnHeal: { padding: '8px 16px', background: 'rgba(13,148,136,0.1)', color: 'var(--accent-teal)', border: '1px solid var(--accent-teal)', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },
    flowWrapper: { flex: 1, position: 'relative' }
};

export default NeuralPathway;
