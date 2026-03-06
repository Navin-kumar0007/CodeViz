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
        ]
    },
    {
        label: 'Tools',
        items: [
            { path: '/code-review', icon: '🤖', label: 'Code Review' },
            { path: '/test-lab', icon: '🧪', label: 'Test Lab' },
            { path: '/translator', icon: '🌐', label: 'Translate' },
            { path: '/quiz-creator', icon: '✏️', label: 'Quiz Creator' },
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
        left: 0,
        top: 0,
        bottom: 0,
        width: '60px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '8px',
        paddingBottom: '36px',
        zIndex: 100,
    },
    brand: {
        width: '42px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        marginBottom: '8px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(97,218,251,0.15), rgba(198,120,221,0.15))',
        transition: 'var(--transition-fast)',
        flexShrink: 0,
    },
    brandIcon: {
        fontFamily: 'var(--font-code)',
        fontSize: '14px',
        fontWeight: 700,
        color: 'var(--accent-blue)',
    },
    navScroll: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        scrollbarWidth: 'none',         // Firefox
        msOverflowStyle: 'none',        // IE
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        padding: '4px 0',
    },
    separator: {
        width: '28px',
        height: '1px',
        background: 'var(--border-color)',
        margin: '4px auto',
        opacity: 0.6,
    },
    bottomGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        flexShrink: 0,
        paddingTop: '8px',
        borderTop: '1px solid var(--border-color)',
        marginTop: '8px',
        width: '100%',
    },
    navBtn: {
        position: 'relative',
        width: '44px',
        height: '44px',
        border: 'none',
        background: 'transparent',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 150ms ease',
        color: 'var(--text-muted)',
    },
    navBtnActive: {
        background: 'rgba(97,218,251,0.1)',
        color: 'var(--text-bright)',
    },
    navIcon: {
        fontSize: '18px',
        fontFamily: 'var(--font-code)',
        lineHeight: 1,
    },
    activeBar: {
        position: 'absolute',
        left: 0,
        top: '20%',
        height: '60%',
        width: '3px',
        background: 'var(--accent-blue)',
        borderRadius: '0 3px 3px 0',
    },
    tooltip: {
        position: 'absolute',
        left: '56px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'var(--bg-elevated)',
        color: 'var(--text-bright)',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        zIndex: 200,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '1px solid var(--border-color)',
        pointerEvents: 'none',
    },
    tooltipArrow: {
        position: 'absolute',
        left: '-4px',
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
        width: '8px',
        height: '8px',
        background: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
    },
    avatar: {
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: 'var(--font-code)',
        marginTop: '8px',
        cursor: 'default',
        flexShrink: 0,
    },
};

export default Sidebar;
