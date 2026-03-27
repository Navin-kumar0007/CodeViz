import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Topnav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const initials = userInfo.name ? userInfo.name.substring(0, 2).toUpperCase() : 'U';

    // Generate simple breadcrumbs from path
    const pathParts = location.pathname.split('/').filter(p => p);
    const breadcrumbs = ['CodeViz', ...pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '))];

    return (
        <div style={S.container}>
            <div style={S.breadcrumbs}>
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb + index}>
                        <span style={index === breadcrumbs.length - 1 ? S.crumbActive : S.crumb}>
                            {crumb}
                        </span>
                        {index < breadcrumbs.length - 1 && <span style={S.separator}>/</span>}
                    </React.Fragment>
                ))}
            </div>
            <div style={S.actions}>
                <div style={S.search}>
                    <span style={{ opacity: 0.5 }}>Search...</span>
                    <span style={S.shortcut}>⌘ K</span>
                </div>
                <div style={S.avatar} onClick={() => navigate('/profile')}>{initials}</div>
            </div>
        </div>
    );
};

const S = {
    container: {
        height: 'var(--header-height)',
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: 'var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 90,
    },
    breadcrumbs: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontFamily: 'var(--font-code)',
    },
    crumb: {
        color: 'var(--text-secondary)',
    },
    crumbActive: {
        color: 'var(--text-primary)',
        fontWeight: 700,
    },
    separator: {
        color: 'var(--border-strong)',
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    search: {
        fontSize: '12px',
        fontFamily: 'var(--font-code)',
        color: 'var(--text-secondary)',
        background: 'var(--bg-panel)',
        padding: '6px 12px',
        borderRadius: '100px',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'text',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        minWidth: '200px',
        justifyContent: 'space-between',
        transition: 'border-color var(--transition-fast)',
    },
    shortcut: {
        border: '1px solid var(--border-ghost)',
        padding: '2px 4px',
        borderRadius: '6px',
        fontSize: '10px',
        background: 'var(--bg-panel)',
        color: 'var(--text-muted)',
    },
    avatar: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(17,17,22,0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: '#00E5EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontFamily: 'var(--font-code)',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: 'none',
        transition: 'all var(--transition-fast)',
    }
};

export default Topnav;
