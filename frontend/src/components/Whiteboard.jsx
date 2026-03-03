import React, { useState, useRef, useEffect } from 'react';

const Whiteboard = ({ socket, classroomId, isEditor }) => {
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState(null);
    const svgRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const handleSync = (data) => {
            setPaths(data.elements || []);
        };

        socket.on('whiteboard-sync', handleSync);

        // When joining a live class, ask the server/instructor if there are existing paths?
        // Let's just rely on the next whiteboard sync for simplicity, or we could add an 'init' state.

        return () => {
            socket.off('whiteboard-sync', handleSync);
        };
    }, [socket]);

    const handlePointerDown = (e) => {
        if (!isEditor || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentPath({ points: [[x, y]], color: '#A78BFA', width: 4 }); // Purple-ish chalk theme
    };

    const handlePointerMove = (e) => {
        if (!isEditor || !currentPath || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentPath(prev => ({
            ...prev,
            points: [...prev.points, [x, y]]
        }));
    };

    const handlePointerUp = () => {
        if (!isEditor || !currentPath) return;
        const newPaths = [...paths, currentPath];
        setPaths(newPaths);
        setCurrentPath(null);
        // Broadcast the new vectors
        socket.emit('whiteboard-update', { elements: newPaths });
    };

    const clearCanvas = () => {
        if (!isEditor) return;
        setPaths([]);
        socket.emit('whiteboard-update', { elements: [] });
    };

    // Construct SVG path data string
    const buildPathData = (points) => {
        if (!points || points.length === 0) return '';
        const d = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`));
        return d.join(' ');
    };

    return (
        <div style={{ flex: 1, position: 'relative', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 15, left: 15, background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', color: '#ccc', zIndex: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                {isEditor ? '🖌️ You have the Chalk' : '👁️ View Only Mode'}
            </div>

            {isEditor && (
                <button
                    onClick={clearCanvas}
                    style={{ position: 'absolute', top: 15, right: 15, background: 'rgba(229, 57, 53, 0.2)', color: '#ef5350', border: '1px solid rgba(229, 57, 53, 0.4)', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10 }}>
                    🗑️ Clear Canvas
                </button>
            )}

            <svg
                ref={svgRef}
                style={{ width: '100%', height: '100%', touchAction: 'none', cursor: isEditor ? 'crosshair' : 'default' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {/* Re-render historic drawing vectors */}
                {paths.map((p, i) => (
                    <path
                        key={i}
                        d={buildPathData(p.points)}
                        fill="none"
                        stroke={p.color}
                        strokeWidth={p.width}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ))}

                {/* Render the actively drawn line sequence */}
                {currentPath && (
                    <path
                        d={buildPathData(currentPath.points)}
                        fill="none"
                        stroke={currentPath.color}
                        strokeWidth={currentPath.width}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
            </svg>
        </div>
    );
};

export default Whiteboard;
