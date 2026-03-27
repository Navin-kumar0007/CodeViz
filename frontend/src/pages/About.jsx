import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ════════════════════════════════════════════
   ABOUT PAGE — Digital Observatory
   Phase 12: "Built by Engineers, For Engineers"
   ════════════════════════════════════════════ */

const About = () => {
    const navigate = useNavigate();

    return (
        <div style={s.page}>
            {/* Ambient Nebula */}
            <div style={{ ...s.nebula, top: '-20%', left: '10%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />
            <div style={{ ...s.nebula, bottom: '-10%', right: '5%', background: 'radial-gradient(ellipse, rgba(0,229,238,0.05) 0%, transparent 70%)' }} />

            {/* Navbar */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={s.navbar}
            >
                <span onClick={() => navigate('/home')} style={s.logo}>Code<span style={s.logoAccent}>Viz</span></span>
                <div style={s.navLinks}>
                    <button onClick={() => navigate('/home')} style={s.navLink}>Home</button>
                    <button onClick={() => navigate('/login')} style={s.navLink}>Log In</button>
                    <button onClick={() => navigate('/signup')} style={s.navCta}>Get Started</button>
                </div>
            </motion.nav>

            {/* === Section 1: Hero === */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={s.hero}
            >
                {/* Decorative hex mesh */}
                <div style={s.hexMesh}>
                    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" style={{ opacity: 0.08 }}>
                        <polygon points="120,10 220,65 220,175 120,230 20,175 20,65" stroke="#00E5EE" strokeWidth="1" fill="none" />
                        <polygon points="120,40 190,80 190,160 120,200 50,160 50,80" stroke="#7C3AED" strokeWidth="0.5" fill="none" />
                        <polygon points="120,70 160,95 160,145 120,170 80,145 80,95" stroke="#00E5EE" strokeWidth="0.5" fill="none" />
                    </svg>
                </div>

                <h1 style={s.heroTitle}>
                    Built by Engineers,{'\n'}
                    <span style={s.gradientText}>For Engineers</span>
                </h1>
                <p style={s.heroSub}>
                    CodeViz was born from a simple frustration: algorithms are beautiful, but textbooks make them boring. <span style={{ color: '#00E5EE' }}>We're changing that.</span>
                </p>
                <div style={s.heroDots}>
                    <span style={{...s.dot, background: '#00E5EE'}} />
                    <span style={{...s.dot, background: '#7C3AED'}} />
                    <span style={{...s.dot, background: '#10B981'}} />
                </div>
            </motion.section>

            {/* === Section 2: Three Pillars === */}
            <motion.section
                initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                style={s.section}
            >
                <div style={s.pillarsGrid}>
                    {[
                        { icon: '🔬', title: 'Visualize', desc: 'We believe seeing is understanding. Every algorithm deserves a visual story — not just a wall of text.', color: '#00E5EE' },
                        { icon: '🎮', title: 'Gamify', desc: 'Learning should feel like play. XP, streaks, battles — mastery through engagement, not memorization.', color: '#F43F5E' },
                        { icon: '🤖', title: 'Augment', desc: "AI doesn't replace thinking — it accelerates it. Our Socratic AI guides, never solves.", color: '#7C3AED' },
                    ].map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            whileHover={{ y: -4, borderColor: `${p.color}30` }}
                            style={s.pillarCard}
                        >
                            <div style={{...s.pillarIcon, background: `${p.color}12`, border: `1px solid ${p.color}25`}}>
                                <span style={{ fontSize: '28px' }}>{p.icon}</span>
                            </div>
                            <h3 style={{...s.pillarTitle, color: p.color}}>{p.title}</h3>
                            <p style={s.pillarDesc}>{p.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* === Section 3: Platform Stats === */}
            <motion.section
                initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7 }}
                style={{ ...s.section, paddingTop: '40px', paddingBottom: '40px' }}
            >
                <div style={s.statsBar}>
                    {[
                        { num: '10,000+', label: 'Active Students' },
                        { num: '500+', label: 'Algorithm Visualizations' },
                        { num: '50,000+', label: 'Code Executions' },
                        { num: '12', label: 'Supported Languages' },
                    ].map((st, i) => (
                        <div key={i} style={s.statBox}>
                            <span style={s.statNum}>{st.num}</span>
                            <span style={s.statLabel}>{st.label}</span>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* === Section 4: The Operators (Team) === */}
            <motion.section
                initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
                style={{ ...s.section, background: 'rgba(10,10,15,0.5)' }}
            >
                <div style={s.sectionHeader}>
                    <h2 style={s.h2}>The Operators</h2>
                    <p style={s.h2Sub}>The minds behind the Observatory.</p>
                </div>
                <div style={s.teamGrid}>
                    {[
                        { name: 'Navin Kumar', role: 'Founder & Lead Engineer', bio: 'Full-stack architect passionate about making algorithms accessible to everyone through visual learning.' },
                        { name: 'CodeViz Team', role: 'Contributors', bio: 'A growing community of developers, educators, and designers building the future of coding education.' },
                    ].map((m, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -4, borderColor: 'rgba(0,229,238,0.2)' }}
                            style={s.teamCard}
                        >
                            <div style={s.avatar}>
                                <span style={{ fontSize: '32px' }}>{m.name === 'Navin Kumar' ? '🧑‍💻' : '👥'}</span>
                            </div>
                            <h3 style={s.teamName}>{m.name}</h3>
                            <span style={s.teamRole}>{m.role}</span>
                            <p style={s.teamBio}>{m.bio}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* === Section 5: Tech Stack === */}
            <motion.section
                initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7 }}
                style={s.section}
            >
                <div style={s.sectionHeader}>
                    <h2 style={s.h2}>Powered By</h2>
                </div>
                <div style={s.techGrid}>
                    {[
                        { name: 'React', icon: '⚛️' },
                        { name: 'Node.js', icon: '🟢' },
                        { name: 'MongoDB', icon: '🍃' },
                        { name: 'Python', icon: '🐍' },
                        { name: 'Docker', icon: '🐳' },
                        { name: 'Gemini AI', icon: '✨' },
                    ].map((t, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -2, borderColor: 'rgba(0,229,238,0.2)' }}
                            style={s.techPill}
                        >
                            <span style={{ fontSize: '18px' }}>{t.icon}</span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#9898A6' }}>{t.name}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* === Section 6: Join the Mission === */}
            <motion.section
                initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7 }}
                style={{ ...s.section, background: 'rgba(10,10,15,0.5)', paddingBottom: '60px' }}
            >
                <div style={s.missionBlock}>
                    <div style={s.missionText}>
                        <h2 style={{ ...s.h2, textAlign: 'left', fontSize: '28px' }}>Join the Mission</h2>
                        <p style={{ color: '#9898A6', marginTop: '12px', lineHeight: 1.7, fontSize: '14px' }}>
                            Our codebase is open source. We believe the best of
                            engineering education should be accessible to all developers.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={s.missionBtn}>
                                ⭐ Star on GitHub
                            </a>
                            <a href="#" style={s.missionGhostBtn}>💬 Discord</a>
                        </div>
                    </div>
                    <div style={s.missionVisual}>
                        <div style={s.ghCard}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '18px' }}>📦</span>
                                <span style={{ fontWeight: 700, color: '#E8E8ED', fontSize: '14px' }}>CodeViz</span>
                            </div>
                            {['Last commit: 2h ago', 'Contributors: 12', 'Stars: 1.2k', 'Open Issues: 8'].map((line, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', color: '#5A5A6A' }}>
                                    <span>{line.split(':')[0]}</span>
                                    <span style={{ color: '#9898A6' }}>{line.split(':')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Footer */}
            <footer style={s.footer}>
                <span style={{ color: '#4A4A58', fontSize: '12px' }}>© 2026 CodeViz. All rights reserved.</span>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <button onClick={() => navigate('/home')} style={s.footerLink}>Home</button>
                    <a href="#" style={s.footerLink}>Privacy</a>
                    <a href="#" style={s.footerLink}>Terms</a>
                </div>
            </footer>
        </div>
    );
};

/* ═══════════════════════════════════════════ */
const s = {
    page: {
        background: '#050508', minHeight: '100vh', color: '#E8E8ED',
        position: 'relative', overflow: 'hidden',
    },
    nebula: {
        position: 'fixed', width: '700px', height: '700px', borderRadius: '50%',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0,
    },

    // Navbar
    navbar: {
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 48px', background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    },
    logo: {
        fontSize: '22px', fontWeight: 800, color: '#E8E8ED', cursor: 'pointer',
        letterSpacing: '-0.02em',
    },
    logoAccent: {
        background: 'linear-gradient(135deg, #00E5EE, #7C3AED)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    navLinks: { display: 'flex', gap: '16px', alignItems: 'center' },
    navLink: {
        background: 'none', border: 'none', color: '#9898A6', fontSize: '13px',
        fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    },
    navCta: {
        background: 'linear-gradient(135deg, #00E5EE, #00b8c0)', color: '#050508',
        border: 'none', padding: '8px 22px', borderRadius: '100px', fontSize: '13px',
        fontWeight: 700, cursor: 'pointer',
    },

    // Hero
    hero: {
        minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '140px 48px 60px',
        position: 'relative', zIndex: 1,
    },
    hexMesh: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)' },
    heroTitle: {
        fontSize: '52px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em',
        whiteSpace: 'pre-line', marginBottom: '20px',
    },
    gradientText: {
        background: 'linear-gradient(135deg, #00E5EE, #7C3AED)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    heroSub: {
        fontSize: '17px', color: '#9898A6', maxWidth: '550px', lineHeight: 1.7, marginBottom: '24px',
    },
    heroDots: { display: 'flex', gap: '8px' },
    dot: { width: '8px', height: '8px', borderRadius: '50%', opacity: 0.6 },

    // Sections
    section: { padding: '80px 48px', position: 'relative', zIndex: 1 },
    sectionHeader: { textAlign: 'center', marginBottom: '40px' },
    h2: { fontSize: '32px', fontWeight: 800, color: '#E8E8ED', letterSpacing: '-0.02em', marginBottom: '8px' },
    h2Sub: { fontSize: '14px', color: '#5A5A6A' },

    // Pillars
    pillarsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
        maxWidth: '900px', margin: '0 auto',
    },
    pillarCard: {
        background: 'rgba(17,17,22,0.7)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px',
        padding: '32px', textAlign: 'center', cursor: 'default',
        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
    },
    pillarIcon: {
        width: '56px', height: '56px', borderRadius: '14px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
    },
    pillarTitle: { fontSize: '18px', fontWeight: 700, marginBottom: '10px' },
    pillarDesc: { fontSize: '13px', color: '#9898A6', lineHeight: 1.7 },

    // Stats
    statsBar: {
        display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap',
        padding: '32px', borderRadius: '16px',
        background: 'rgba(17,17,22,0.5)', border: '1px solid rgba(255,255,255,0.04)',
        maxWidth: '900px', margin: '0 auto',
    },
    statBox: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' },
    statNum: {
        fontSize: '32px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
        background: 'linear-gradient(135deg, #00E5EE, #7C3AED)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    statLabel: { fontSize: '12px', color: '#5A5A6A', fontWeight: 500 },

    // Team
    teamGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px',
        maxWidth: '700px', margin: '0 auto',
    },
    teamCard: {
        background: 'rgba(17,17,22,0.7)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: '28px', textAlign: 'center',
        transition: 'all 0.3s ease',
    },
    avatar: {
        width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(0,229,238,0.1), rgba(124,58,237,0.1))',
        border: '2px solid rgba(0,229,238,0.2)',
    },
    teamName: { fontSize: '16px', fontWeight: 700, color: '#E8E8ED', marginBottom: '4px' },
    teamRole: { fontSize: '12px', color: '#00E5EE', fontWeight: 600 },
    teamBio: { fontSize: '13px', color: '#9898A6', lineHeight: 1.6, marginTop: '12px' },

    // Tech Stack
    techGrid: {
        display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
        maxWidth: '600px', margin: '0 auto',
    },
    techPill: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
        borderRadius: '100px', background: 'rgba(17,17,22,0.7)',
        border: '1px solid rgba(255,255,255,0.06)', cursor: 'default',
        transition: 'all 0.3s ease',
    },

    // Mission
    missionBlock: {
        maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '40px', alignItems: 'center',
    },
    missionText: { flex: 1 },
    missionVisual: { flex: 1 },
    missionBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'linear-gradient(135deg, #00E5EE, #00b8c0)', color: '#050508',
        padding: '10px 24px', borderRadius: '100px', fontSize: '13px', fontWeight: 700,
        textDecoration: 'none', transition: 'all 0.2s',
    },
    missionGhostBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'transparent', color: '#E8E8ED', border: '1px solid rgba(255,255,255,0.12)',
        padding: '10px 24px', borderRadius: '100px', fontSize: '13px', fontWeight: 600,
        textDecoration: 'none', transition: 'all 0.2s',
    },
    ghCard: {
        background: 'rgba(10,10,15,0.9)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px', padding: '20px',
    },

    // Footer
    footer: {
        borderTop: '1px solid rgba(255,255,255,0.04)', padding: '24px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', zIndex: 1,
    },
    footerLink: {
        fontSize: '12px', color: '#5A5A6A', textDecoration: 'none', background: 'none',
        border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    },
};

export default About;
