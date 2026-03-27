/* eslint-disable react-hooks/purity */
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

/* ════════════════════════════════════════════
   GlobalBackground
   Cyberpunk/Neural Gateway aesthetic background.
   Includes Mouse Spotlight and Floating Particles.
   ════════════════════════════════════════════ */

const GlobalBackground = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const particles = React.useMemo(() => [...Array(12)].map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`
    })), []);

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div style={s.container}>
            {/* Grid Overlay */}
            <div style={s.gridOverlay} />

            {/* 1. Dynamic Mouse Spotlight */}
            <div style={{
                ...s.spotlight,
                background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(13,242,242,0.04), transparent 40%)`
            }} />

            {/* 2. Floating Cybernetic Particles Removed for Clean Aesthetic */}

            {/* 3. Deep Ambient Glows */}
            <div style={{ ...s.blurGlow, top: '10%', left: '5%', background: 'var(--accent-cyan)' }} />
            <div style={{ ...s.blurGlow, bottom: '20%', right: '5%', background: 'var(--accent-violet)' }} />
        </div>
    );
};

const s = {
    container: {
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'var(--bg-primary)'
    },
    gridOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
        pointerEvents: 'none'
    },
    spotlight: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
    },
    blurGlow: {
        position: 'absolute',
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        filter: 'blur(300px)',
        opacity: 0.03,
        pointerEvents: 'none'
    }
};

export default GlobalBackground;
