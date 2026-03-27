import React, { useState, useEffect } from 'react';
import { useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

const TraceRibbon = ({ containerRef }) => {
    const [points, setPoints] = useState([]);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth movement
    const springConfig = { damping: 20, stiffness: 150 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef?.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [containerRef, mouseX, mouseY]);

    // Create a "tail" effect by storing history of points
    useEffect(() => {
        const updatePoints = () => {
            setPoints(prev => {
                const newPoint = { x: smoothX.get(), y: smoothY.get() };
                const newPoints = [newPoint, ...prev.slice(0, 15)];
                return newPoints;
            });
            requestAnimationFrame(updatePoints);
        };
        const anim = requestAnimationFrame(updatePoints);
        return () => cancelAnimationFrame(anim);
    }, [smoothX, smoothY]);

    if (points.length < 2) return null;

    // Generate path string from points
    const pathData = points.reduce((acc, point, i) => {
        return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, '');

    return (
        <svg
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1000,
            }}
        >
            <defs>
                <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <path
                d={pathData}
                fill="none"
                stroke="url(#ribbonGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                style={{ opacity: 0.6 }}
            />
            {/* Lead Particle */}
            <circle
                cx={points[0].x}
                cy={points[0].y}
                r="3"
                fill="var(--accent-cyan)"
                filter="url(#glow)"
            />
        </svg>
    );
};

export default TraceRibbon;
