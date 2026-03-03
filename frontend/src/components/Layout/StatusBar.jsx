import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const StatusBar = () => {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        try {
            const info = localStorage.getItem('userInfo');
            if (info) setUser(JSON.parse(info));
        } catch { }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getPageName = () => {
        const map = {
            '/': 'Dashboard',
            '/practice': 'Practice Playground',
            '/learn': 'Structured Learning',
            '/classroom': 'Classroom',
            '/room': 'Collab Room',
            '/quiz-creator': 'Quiz Creator',
            '/instructor': 'Analytics',
            '/admin': 'Admin Panel',
        };
        return map[location.pathname] || location.pathname;
    };

    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <footer style={styles.bar}>
            <div style={styles.left}>
                <span style={styles.branch}>⎇ main</span>
                <span style={styles.sep}>│</span>
                <span style={styles.page}>{getPageName()}</span>
            </div>
            <div style={styles.right}>
                {user && (
                    <>
                        <span style={styles.item}>
                            <span style={styles.dot} />
                            {user.role || 'student'}
                        </span>
                        <span style={styles.sep}>│</span>
                    </>
                )}
                <span style={styles.item}>CodeViz v1.0</span>
                <span style={styles.sep}>│</span>
                <span style={styles.item}>{timeStr}</span>
            </div>
        </footer>
    );
};

const styles = {
    bar: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--statusbar-height, 28px)',
        background: '#181825',
        borderTop: '1px solid var(--border-color, #313150)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px 0 72px',
        fontFamily: 'var(--font-code)',
        fontSize: '11px',
        color: 'var(--text-muted, #6C7086)',
        zIndex: 101,
        userSelect: 'none',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    branch: {
        color: 'var(--accent-blue, #61DAFB)',
        fontWeight: 500,
    },
    page: {
        color: 'var(--text-secondary, #A6ADC8)',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    sep: {
        color: 'var(--border-color, #313150)',
        fontSize: '10px',
    },
    dot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'var(--accent-green, #98C379)',
    },
};

export default StatusBar;
