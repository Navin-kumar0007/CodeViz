import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/* ═══════════════════════════════════════════
   Sidebar — Grouped Navigation
   5 categories: Core, Collaborate, Tools, Grow, Admin
   ═══════════════════════════════════════════ */

const navGroups = [
    {
        label: 'Core',
        items: [
            { path: '/', icon: '⌂', label: 'Dashboard' },
            { path: '/practice', icon: '⟩_', label: 'Practice' },
            { path: '/problems', icon: '📋', label: 'Problems' },
            { path: '/learn', icon: '📖', label: 'Learn' },
            { path: '/roadmap', icon: '🗺️', label: 'Roadmap' },
            { path: '/concept-map', icon: '🕸️', label: 'Concept Map' },
            { path: '/git-learn', icon: '🐙', label: 'Git Learn' },
        ]
    },
    {
        label: 'Collaborate',
        items: [
            { path: '/room', icon: '👥', label: 'Collab Room' },
            { path: '/classroom', icon: '🏫', label: 'Classroom' },
            { path: '/campus', icon: '🎓', label: 'Campus' },
            { path: '/forum', icon: '💬', label: 'Forum' },
            { path: '/peer-review', icon: '👀', label: 'Peer Review' },
        ]
    },
    {
        label: 'Tools',
        items: [
            { path: '/code-review', icon: '🤖', label: 'Code Review' },
            { path: '/test-lab', icon: '🧪', label: 'Test Lab' },
            { path: '/translator', icon: '🌐', label: 'Translate' },
            { path: '/quiz-creator', icon: '✏️', label: 'Quiz Creator' },
            { path: '/algo-race', icon: '🏎️', label: 'Algo Race' },
        ]
    },
    {
        label: 'Grow',
        items: [
            { path: '/interview-prep', icon: '🎯', label: 'Interview Prep' },
            { path: '/video-lessons', icon: '🎬', label: 'Video Lessons' },
            { path: '/progress', icon: '📊', label: 'Progress Reports' },
            { path: '/sessions', icon: '🎥', label: 'Sessions' },
        ]
    },
];

const bottomItems = [
    { path: '/instructor', icon: '📈', label: 'Analytics', role: 'instructor' },
    { path: '/admin', icon: '⚙', label: 'Admin Panel', role: 'admin' },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [hoveredPath, setHoveredPath] = useState(null);

    useEffect(() => {
        try {
            const info = localStorage.getItem('userInfo');
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (info) setUser(JSON.parse(info));
        } catch { /* ignore */ }
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={S.sidebar}>
            {/* Brand */}
            <div style={S.brand} onClick={() => navigate('/')}>
                <span style={S.brandIcon}>{'{ }'}</span>
            </div>

            {/* Grouped Nav */}
            <div style={S.navScroll}>
                {navGroups.map((group, gi) => (
                    <div key={group.label}>
                        {gi > 0 && <div style={S.separator} />}
                        <div style={S.group}>
                            {group.items.map(item => (
                                <div key={item.path} style={{ position: 'relative' }}
                                    onMouseEnter={() => setHoveredPath(item.path)}
                                    onMouseLeave={() => setHoveredPath(null)}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        style={{
                                            ...S.navBtn,
                                            ...(isActive(item.path) ? S.navBtnActive : {}),
                                        }}
                                    >
                                        <span style={S.navIcon}>{item.icon}</span>
                                        {isActive(item.path) && <div style={S.activeBar} />}
                                    </button>
                                    {/* Tooltip */}
                                    {hoveredPath === item.path && (
                                        <div style={S.tooltip}>
                                            {item.label}
                                            <div style={S.tooltipArrow} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom: Role-based + Home + Avatar */}
            <div style={S.bottomGroup}>
                {bottomItems
                    .filter(item => user?.role === item.role || user?.role === 'admin')
                    .map(item => (
                        <div key={item.path} style={{ position: 'relative' }}
                            onMouseEnter={() => setHoveredPath(item.path)}
                            onMouseLeave={() => setHoveredPath(null)}>
                            <button
                                onClick={() => navigate(item.path)}
                                style={{
                                    ...S.navBtn,
                                    ...(isActive(item.path) ? S.navBtnActive : {}),
                                }}
                            >
                                <span style={S.navIcon}>{item.icon}</span>
                            </button>
                            {hoveredPath === item.path && (
                                <div style={S.tooltip}>
                                    {item.label}
                                    <div style={S.tooltipArrow} />
                                </div>
                            )}
                        </div>
                    ))
                }
                <button
                    onClick={() => window.location.href = '/home'}
                    style={S.navBtn}
                    onMouseEnter={() => setHoveredPath('home')}
                    onMouseLeave={() => setHoveredPath(null)}
                >
                    <span style={S.navIcon}>🏠</span>
                </button>
                {hoveredPath === 'home' && (
                    <div style={{ ...S.tooltip, bottom: '48px' }}>
                        Home Page
                        <div style={S.tooltipArrow} />
                    </div>
                )}
                {user && (
                    <div style={S.avatar} title={user.name}>
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                )}
            </div>
        </nav>
    );
};

const S = {
    sidebar: {
        position: 'fixed',
        left: '20px', // Floating off the edge
        top: '20px',
        bottom: '20px',
        width: '64px',
        background: 'var(--bg-secondary)', // Glassy dark
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px', // Rounded floating dock
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '16px',
        paddingBottom: '20px',
        zIndex: 100,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', // Deep shadow
    },
    brand: {
        width: '42px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        marginBottom: '16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(97,218,251,0.2), rgba(198,120,221,0.2))',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'var(--transition-fast)',
        flexShrink: 0,
        boxShadow: '0 0 15px rgba(97,218,251,0.2)',
    },
    brandIcon: {
        fontFamily: 'var(--font-code)',
        fontSize: '16px',
        fontWeight: 800,
        color: 'var(--accent-blue)',
        textShadow: '0 0 10px rgba(97,218,251,0.8)',
    },
    navScroll: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 0',
    },
    separator: {
        width: '32px',
        height: '1px',
        background: 'rgba(255,255,255,0.05)',
        margin: '6px auto',
    },
    bottomGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0,
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: 'auto',
        width: '100%',
    },
    navBtn: {
        position: 'relative',
        width: '44px',
        height: '44px',
        border: '1px solid transparent',
        background: 'transparent',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        color: 'var(--text-muted)',
    },
    navBtnActive: {
        background: 'rgba(97,218,251,0.15)',
        color: 'var(--accent-cyan)',
        border: '1px solid rgba(97,218,251,0.3)',
        boxShadow: '0 0 20px rgba(97,218,251,0.2)',
    },
    navIcon: {
        fontSize: '20px',
        fontFamily: 'var(--font-code)',
        lineHeight: 1,
    },
    activeBar: {
        position: 'absolute',
        left: '-10px',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '24px',
        width: '4px',
        background: 'var(--accent-blue)',
        borderRadius: '0 4px 4px 0',
        boxShadow: '0 0 10px var(--accent-blue)',
    },
    tooltip: {
        position: 'absolute',
        left: '60px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'var(--bg-elevated)',
        backdropFilter: 'blur(10px)',
        color: 'var(--text-bright)',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontFamily: 'var(--font-code)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        zIndex: 200,
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        border: '1px solid var(--border-color)',
        pointerEvents: 'none',
        letterSpacing: '0.5px',
    },
    tooltipArrow: {
        position: 'absolute',
        left: '-5px',
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
        width: '10px',
        height: '10px',
        background: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '15px',
        fontWeight: 800,
        fontFamily: 'var(--font-code)',
        marginTop: '12px',
        cursor: 'default',
        flexShrink: 0,
        boxShadow: '0 5px 15px rgba(198,120,221,0.3)',
        border: '1px solid rgba(255,255,255,0.2)',
    },
};

export default Sidebar;
