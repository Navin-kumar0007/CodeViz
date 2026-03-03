import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', icon: '⌂', label: 'Dashboard', shortcut: 'D' },
    { path: '/practice', icon: '⟩_', label: 'Practice', shortcut: 'P' },
    { path: '/learn', icon: '📖', label: 'Learn', shortcut: 'L' },
    { path: '/roadmap', icon: '🗺️', label: 'Roadmap', shortcut: 'M' },
    { path: '/classroom', icon: '🏫', label: 'Classroom', shortcut: 'C' },
    { path: '/room', icon: '👥', label: 'Room', shortcut: 'R' },
    { path: '/quiz-creator', icon: '✏️', label: 'Quiz', shortcut: 'Q' },
    { path: '/sessions', icon: '🎥', label: 'Sessions', shortcut: 'S' },
    { path: '/code-review', icon: '🤖', label: 'Review', shortcut: 'V' },
    { path: '/test-lab', icon: '🧪', label: 'Test Lab', shortcut: 'T' },
    { path: '/translator', icon: '🌐', label: 'Translate', shortcut: 'N' },
    { path: '/campus', icon: '🏫', label: 'Campus', shortcut: 'U' },
];

const bottomItems = [
    { path: '/instructor', icon: '📊', label: 'Analytics', role: 'instructor' },
    { path: '/admin', icon: '⚙', label: 'Admin', role: 'admin' },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const info = localStorage.getItem('userInfo');
            if (info) setUser(JSON.parse(info));
        } catch { }
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={styles.sidebar}>
            {/* Brand */}
            <div style={styles.brand} onClick={() => navigate('/')}>
                <span style={styles.brandIcon}>{'{ }'}</span>
            </div>

            {/* Main Nav */}
            <div style={styles.navGroup}>
                {navItems.map(item => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            ...styles.navBtn,
                            ...(isActive(item.path) ? styles.navBtnActive : {}),
                        }}
                        title={`${item.label} (${item.shortcut})`}
                    >
                        <span style={styles.navIcon}>{item.icon}</span>
                        {isActive(item.path) && <div style={styles.activeIndicator} />}
                    </button>
                ))}
            </div>

            {/* Bottom Nav (Role-based) */}
            <div style={styles.bottomGroup}>
                {bottomItems
                    .filter(item => user?.role === item.role || user?.role === 'admin')
                    .map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                ...styles.navBtn,
                                ...(isActive(item.path) ? styles.navBtnActive : {}),
                            }}
                            title={item.label}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                        </button>
                    ))
                }
                {/* Home Page Link */}
                <button
                    onClick={() => window.location.href = '/home'}
                    style={styles.navBtn}
                    title="Visit Home Page"
                >
                    <span style={styles.navIcon}>🏠</span>
                </button>
                {/* User Avatar */}
                {user && (
                    <div style={styles.avatar} title={user.name}>
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                )}
            </div>
        </nav>
    );
};

const styles = {
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
        marginBottom: '16px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(97,218,251,0.15), rgba(198,120,221,0.15))',
        transition: 'var(--transition-fast)',
    },
    brandIcon: {
        fontFamily: 'var(--font-code)',
        fontSize: '14px',
        fontWeight: 700,
        color: 'var(--accent-blue)',
    },
    navGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        flex: 1,
    },
    bottomGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
    },
    navBtn: {
        position: 'relative',
        width: '42px',
        height: '42px',
        border: 'none',
        background: 'transparent',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'var(--transition-fast)',
        color: 'var(--text-muted)',
    },
    navBtnActive: {
        background: 'var(--bg-surface)',
        color: 'var(--text-bright)',
    },
    navIcon: {
        fontSize: '18px',
        fontFamily: 'var(--font-code)',
    },
    activeIndicator: {
        position: 'absolute',
        left: 0,
        top: '25%',
        height: '50%',
        width: '3px',
        background: 'var(--accent-blue)',
        borderRadius: '0 3px 3px 0',
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
    },
};

export default Sidebar;
