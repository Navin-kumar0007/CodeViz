import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import throttle from 'lodash/throttle';

const PRESET_COLORS = ['#A78BFA', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899'];
const TOOLS = [
    { id: 'pen', icon: '✏️', label: 'Pen' },
    { id: 'rect', icon: '▭', label: 'Rectangle' },
    { id: 'circle', icon: '◯', label: 'Circle' },
    { id: 'arrow', icon: '→', label: 'Arrow' },
    { id: 'text', icon: 'T', label: 'Text' },
];

const Whiteboard = React.memo(({ socket, isEditor }) => {
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState(null);
    const [undoneStack, setUndoneStack] = useState([]);
    const [activeTool, setActiveTool] = useState('pen');
    const [activeColor, setActiveColor] = useState('#A78BFA');
    const [strokeWidth, setStrokeWidth] = useState(4);
    const [textInput, setTextInput] = useState(null); // { x, y } for text placement
    const svgRef = useRef(null);

    useEffect(() => {
        if (!socket) return;
        const handleSync = (data) => {
            setPaths(data.elements || []);
            setUndoneStack([]);
        };
        socket.on('whiteboard-sync', handleSync);
        return () => { socket.off('whiteboard-sync', handleSync); };
    }, [socket]);

    const throttledBroadcast = useMemo(
        () => throttle((newElements) => {
            if (socket) socket.emit('whiteboard-update', { elements: newElements });
        }, 66),
        [socket]
    );

    // ─── UNDO / REDO ───
    const undo = useCallback(() => {
        if (!isEditor || paths.length === 0) return;
        setPaths(prev => {
            const newPaths = [...prev];
            const removed = newPaths.pop();
            setUndoneStack(u => [...u, removed]);
            throttledBroadcast(newPaths);
            return newPaths;
        });
    }, [isEditor, paths.length, throttledBroadcast]);

    const redo = useCallback(() => {
        if (!isEditor || undoneStack.length === 0) return;
        setUndoneStack(prev => {
            const newUndone = [...prev];
            const restored = newUndone.pop();
            setPaths(p => {
                const newPaths = [...p, restored];
                throttledBroadcast(newPaths);
                return newPaths;
            });
            return newUndone;
        });
    }, [isEditor, undoneStack.length, throttledBroadcast]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo]);

    // ─── POINTER HANDLERS ───
    const handlePointerDown = useCallback((e) => {
        if (!isEditor || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (activeTool === 'text') {
            setTextInput({ x, y });
            return;
        }

        if (activeTool === 'pen') {
            setCurrentPath({ type: 'pen', points: [[x, y]], color: activeColor, width: strokeWidth });
        } else {
            setCurrentPath({ type: activeTool, startX: x, startY: y, endX: x, endY: y, color: activeColor, width: strokeWidth });
        }
        setUndoneStack([]); // Clear redo on new action
    }, [isEditor, activeTool, activeColor, strokeWidth]);

    const handlePointerMove = useCallback((e) => {
        if (!isEditor || !currentPath || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (currentPath.type === 'pen') {
            setCurrentPath(prev => prev ? { ...prev, points: [...prev.points, [x, y]] } : null);
        } else {
            setCurrentPath(prev => prev ? { ...prev, endX: x, endY: y } : null);
        }
    }, [isEditor, currentPath]);

    const handlePointerUp = useCallback(() => {
        if (!isEditor || !currentPath) return;
        setPaths(prev => {
            const newPaths = [...prev, currentPath];
            throttledBroadcast(newPaths);
            return newPaths;
        });
        setCurrentPath(null);
    }, [isEditor, currentPath, throttledBroadcast]);

    const handleTextSubmit = useCallback((text) => {
        if (!text.trim() || !textInput) return;
        const newElem = { type: 'text', x: textInput.x, y: textInput.y, text: text.trim(), color: activeColor, fontSize: 16 };
        setPaths(prev => {
            const newPaths = [...prev, newElem];
            throttledBroadcast(newPaths);
            return newPaths;
        });
        setTextInput(null);
        setUndoneStack([]);
    }, [textInput, activeColor, throttledBroadcast]);

    const clearCanvas = useCallback(() => {
        if (!isEditor) return;
        setPaths([]);
        setUndoneStack([]);
        if (socket) socket.emit('whiteboard-update', { elements: [] });
    }, [isEditor, socket]);

    // ─── SVG PATH BUILDER ───
    const buildPathData = useCallback((points) => {
        if (!points || points.length === 0) return '';
        return points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
    }, []);

    // ─── RENDER SHAPE ───
    const renderElement = useCallback((el, i) => {
        if (el.type === 'pen') {
            return <path key={i} d={buildPathData(el.points)} fill="none" stroke={el.color} strokeWidth={el.width} strokeLinecap="round" strokeLinejoin="round" />;
        }
        if (el.type === 'rect') {
            const x = Math.min(el.startX, el.endX), y = Math.min(el.startY, el.endY);
            const w = Math.abs(el.endX - el.startX), h = Math.abs(el.endY - el.startY);
            return <rect key={i} x={x} y={y} width={w} height={h} fill="none" stroke={el.color} strokeWidth={el.width} rx="4" />;
        }
        if (el.type === 'circle') {
            const cx = (el.startX + el.endX) / 2, cy = (el.startY + el.endY) / 2;
            const rx = Math.abs(el.endX - el.startX) / 2, ry = Math.abs(el.endY - el.startY) / 2;
            return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={el.color} strokeWidth={el.width} />;
        }
        if (el.type === 'arrow') {
            const markerId = `arrow-${i}`;
            return (
                <g key={i}>
                    <defs>
                        <marker id={markerId} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill={el.color} /></marker>
                    </defs>
                    <line x1={el.startX} y1={el.startY} x2={el.endX} y2={el.endY} stroke={el.color} strokeWidth={el.width} markerEnd={`url(#${markerId})`} />
                </g>
            );
        }
        if (el.type === 'text') {
            return <text key={i} x={el.x} y={el.y} fill={el.color} fontSize={el.fontSize || 16} fontFamily="var(--font-code, monospace)">{el.text}</text>;
        }
        return null;
    }, [buildPathData]);

    const toolbarBtnStyle = (active) => ({
        width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255,255,255,0.05)',
        border: active ? '1px solid #A78BFA' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', cursor: 'pointer', fontSize: '16px', color: '#e0e0e0',
        transition: 'all 150ms',
    });

    return (
        <div style={{ flex: 1, position: 'relative', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Status Badge */}
            <div style={{ position: 'absolute', top: 15, left: 15, background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', color: '#ccc', zIndex: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                {isEditor ? '🖌️ You have the Chalk' : '👁️ View Only Mode'}
            </div>

            {/* Toolbar — Tools + Colors + Undo/Redo */}
            {isEditor && (
                <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(30,30,30,0.9)', padding: '6px 12px', borderRadius: '12px', zIndex: 20, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                    {/* Tool Buttons */}
                    {TOOLS.map(t => (
                        <button key={t.id} onClick={() => setActiveTool(t.id)} style={toolbarBtnStyle(activeTool === t.id)} title={t.label}>{t.icon}</button>
                    ))}

                    {/* Divider */}
                    <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

                    {/* Color Picker */}
                    {PRESET_COLORS.map(c => (
                        <button key={c} onClick={() => setActiveColor(c)} style={{
                            width: '24px', height: '24px', borderRadius: '50%', background: c, cursor: 'pointer',
                            border: activeColor === c ? '2px solid #fff' : '2px solid transparent',
                            transition: 'all 150ms', transform: activeColor === c ? 'scale(1.2)' : 'scale(1)',
                        }} />
                    ))}

                    {/* Divider */}
                    <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

                    {/* Undo / Redo */}
                    <button onClick={undo} disabled={paths.length === 0} style={{ ...toolbarBtnStyle(false), opacity: paths.length === 0 ? 0.3 : 1 }} title="Undo (⌘Z)">↩</button>
                    <button onClick={redo} disabled={undoneStack.length === 0} style={{ ...toolbarBtnStyle(false), opacity: undoneStack.length === 0 ? 0.3 : 1 }} title="Redo (⌘⇧Z)">↪</button>
                </div>
            )}

            {/* Clear Button */}
            {isEditor && (
                <button onClick={clearCanvas} style={{ position: 'absolute', top: 15, right: 15, background: 'rgba(229, 57, 53, 0.2)', color: '#ef5350', border: '1px solid rgba(229, 57, 53, 0.4)', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10 }}>
                    🗑️ Clear
                </button>
            )}

            {/* SVG Canvas */}
            <svg
                ref={svgRef}
                style={{ width: '100%', height: '100%', touchAction: 'none', cursor: isEditor ? (activeTool === 'text' ? 'text' : 'crosshair') : 'default' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {paths.map((el, i) => renderElement(el, i))}
                {currentPath && renderElement(currentPath, 'active')}
            </svg>

            {/* Text Input Overlay */}
            {textInput && isEditor && (
                <div style={{ position: 'absolute', left: textInput.x, top: textInput.y, zIndex: 30 }}>
                    <input
                        autoFocus
                        placeholder="Type text..."
                        style={{ background: 'rgba(0,0,0,0.8)', border: `2px solid ${activeColor}`, color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '14px', fontFamily: 'var(--font-code)', outline: 'none', minWidth: '120px' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleTextSubmit(e.target.value);
                            if (e.key === 'Escape') setTextInput(null);
                        }}
                        onBlur={(e) => { if (e.target.value.trim()) handleTextSubmit(e.target.value); else setTextInput(null); }}
                    />
                </div>
            )}
        </div>
    );
});

export default Whiteboard;
