import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navGroups = [
    {
        label: 'MAIN',
        items: [
            { path: '/', icon: '⬡', label: 'Dashboard', color: '#00E5EE' },
            { path: '/practice', icon: '⟐', label: 'Workspace', color: '#7C3AED' },
            { path: '/problems', icon: '⊞', label: 'Problems', color: '#F97316' },
            { path: '/learn', icon: '◈', label: 'Learn Hub', color: '#10B981' },
        ]
    },
    {
        label: 'EXPLORE',
        items: [
            { path: '/neural-pathway', icon: '◎', label: 'Neural Pathway', color: '#EC4899' },
            { path: '/concept-map', icon: '⬢', label: 'Concept Map', color: '#8B5CF6' },
            { path: '/git-learn', icon: '⎇', label: 'Git Learn', color: '#F59E0B' },
            { path: '/sessions', icon: '◉', label: 'Sessions', color: '#06B6D4' },
        ]
    },
    {
        label: 'COLLABORATE',
        items: [
            { path: '/room', icon: '⊡', label: 'Battle Room', color: '#EF4444' },
            { path: '/classroom', icon: '▦', label: 'Classroom', color: '#6366F1' },
            { path: '/campus', icon: '⬡', label: 'Campus', color: '#14B8A6' },
            { path: '/forum', icon: '◯', label: 'Forum', color: '#A855F7' },
            { path: '/peer-review', icon: '◑', label: 'Peer Review', color: '#F472B6' },
        ]
    },
    {
        label: 'TOOLS',
        items: [
            { path: '/code-review', icon: '⟐', label: 'Code Review', color: '#38BDF8' },
            { path: '/test-lab', icon: '⬢', label: 'Test Lab', color: '#4ADE80' },
            { path: '/translator', icon: '⇄', label: 'Translate', color: '#FB923C' },
            { path: '/quiz-creator', icon: '✎', label: 'Quiz Studio', color: '#C084FC' },
            { path: '/algo-race', icon: '▷', label: 'Algo Race', color: '#F43F5E' },
        ]
    },
    {
        label: 'GROW',
        items: [
            { path: '/interview-prep', icon: '◉', label: 'Interview Prep', color: '#22D3EE' },
            { path: '/video-lessons', icon: '▶', label: 'Video Lessons', color: '#A78BFA' },
            { path: '/progress', icon: '◧', label: 'Progress', color: '#34D399' },
            { path: '/daily-challenge', icon: '★', label: 'Daily Challenge', color: '#FBBF24' },
        ]
    },
];

const NavItem = ({ item, isActive, isExpanded, onClick }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                width: '100%',
                border: 'none',
                background: isActive
                    ? `linear-gradient(135deg, ${item.color}18, ${item.color}08)`
                    : hovered
                        ? 'rgba(255,255,255,0.04)'
                        : 'transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 200ms cubic-bezier(0.23,1,0.32,1)',
                textAlign: 'left',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                padding: isExpanded ? '9px 14px' : '10px 0',
                overflow: 'hidden',
            }}
        >
            {/* Active indicator bar */}
            {isActive && (
                <div style={{
                    position: 'absolute',
                    left: '0px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '20px',
                    width: '3px',
                    background: item.color,
                    borderRadius: '0 100px 100px 0',
                    boxShadow: `0 0 12px ${item.color}80`,
                }} />
            )}

            {/* Icon with colored glow */}
            <div style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                background: isActive
                    ? `${item.color}20`
                    : hovered
                        ? 'rgba(255,255,255,0.06)'
                        : 'transparent',
                border: isActive
                    ? `1px solid ${item.color}30`
                    : '1px solid transparent',
                transition: 'all 200ms ease',
                flexShrink: 0,
                boxShadow: isActive ? `0 0 16px ${item.color}15` : 'none',
            }}>
                <span style={{
                    fontSize: '14px',
                    color: isActive ? item.color : hovered ? '#E8E8ED' : '#5A5A6A',
                    transition: 'color 200ms ease',
                    filter: isActive ? `drop-shadow(0 0 4px ${item.color}60)` : 'none',
                }}>{item.icon}</span>
            </div>

            {/* Label */}
            {isExpanded && (
                <span style={{
                    fontSize: '13px',
                    color: isActive ? '#F0F0F5' : hovered ? '#C8C8D0' : '#6A6A78',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '-0.01em',
                    transition: 'color 200ms ease',
                }}>{item.label}</span>
            )}

            {/* Active right dot indicator */}
            {isActive && isExpanded && (
                <div style={{
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}60`,
                    flexShrink: 0,
                }} />
            )}
        </button>
    );
};

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [brandHovered, setBrandHovered] = useState(false);

    useEffect(() => {
        try {
            const info = localStorage.getItem('userInfo');
            if (info) setUser(JSON.parse(info));
        } catch { /* ignore */ }
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Inject keyframe animation */}
            <style>{`
                @keyframes sidebarPulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
                .sidebar-scroll::-webkit-scrollbar { display: none; }
            `}</style>

            <nav
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: isHovered ? '250px' : '62px',
                    background: 'rgba(10,10,14,0.85)',
                    backdropFilter: 'blur(24px) saturate(1.6)',
                    WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
                    borderRight: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                    overflowY: 'hidden',
                    overflowX: 'hidden',
                    transition: 'width 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: isHovered ? '4px 0 32px rgba(0,0,0,0.4)' : 'none',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Brand Header */}
                <div
                    onClick={() => navigate('/')}
                    onMouseEnter={() => setBrandHovered(true)}
                    onMouseLeave={() => setBrandHovered(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        justifyContent: isHovered ? 'flex-start' : 'center',
                        padding: isHovered ? '18px 20px' : '18px 0',
                        transition: 'all 250ms ease',
                    }}
                >
                    {/* Animated brand icon */}
                    <div style={{
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: brandHovered
                            ? 'linear-gradient(135deg, rgba(0,229,238,0.15), rgba(124,58,237,0.15))'
                            : 'rgba(0,229,238,0.08)',
                        borderRadius: '12px',
                        border: `1px solid ${brandHovered ? 'rgba(0,229,238,0.3)' : 'rgba(0,229,238,0.1)'}`,
                        transition: 'all 300ms ease',
                        boxShadow: brandHovered
                            ? '0 0 20px rgba(0,229,238,0.2), inset 0 0 12px rgba(0,229,238,0.05)'
                            : '0 0 8px rgba(0,229,238,0.05)',
                        flexShrink: 0,
                    }}>
                        <span style={{
                            fontSize: '18px',
                            color: '#00E5EE',
                            fontWeight: 900,
                            filter: 'drop-shadow(0 0 6px rgba(0,229,238,0.5))',
                            transition: 'transform 300ms ease',
                            transform: brandHovered ? 'scale(1.1) rotate(30deg)' : 'scale(1)',
                        }}>⬡</span>
                    </div>
                    {isHovered && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{
                                fontSize: '16px',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #00E5EE, #7C3AED)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                                fontFamily: "'Inter', sans-serif",
                            }}>CodeViz</span>
                            <span style={{
                                fontSize: '9px',
                                color: '#3A3A48',
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                            }}>OBSERVATORY</span>
                        </div>
                    )}
                </div>

                {/* Navigation Groups */}
                <div className="sidebar-scroll" style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: isHovered ? '10px 10px' : '10px 6px',
                    scrollbarWidth: 'none',
                    transition: 'padding 250ms ease',
                }}>
                    {navGroups.map((group) => (
                        <div key={group.label} style={{ marginBottom: '6px' }}>
                            {/* Group Label */}
                            <div style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                letterSpacing: '2px',
                                color: '#3A3A48',
                                fontFamily: "'JetBrains Mono', monospace",
                                textTransform: 'uppercase',
                                transition: 'all 200ms ease',
                                opacity: isHovered ? 1 : 0,
                                height: isHovered ? 'auto' : 0,
                                padding: isHovered ? '10px 14px 4px' : 0,
                                overflow: 'hidden',
                            }}>
                                {group.label}
                            </div>

                            {/* Nav Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {group.items.map(item => (
                                    <NavItem
                                        key={item.path}
                                        item={item}
                                        isActive={isActive(item.path)}
                                        isExpanded={isHovered}
                                        onClick={() => navigate(item.path)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Section — User + Home */}
                <div style={{
                    flexShrink: 0,
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    padding: isHovered ? '12px 10px' : '12px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'padding 250ms ease',
                }}>
                    {/* Home button */}
                    <NavItem
                        item={{ path: '/home', icon: '⌂', label: 'Home Page', color: '#F59E0B' }}
                        isActive={false}
                        isExpanded={isHovered}
                        onClick={() => window.location.href = '/home'}
                    />

                    {/* User mini-card (only when expanded) */}
                    {isHovered && user && (
                        <div
                            onClick={() => navigate('/profile')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                cursor: 'pointer',
                                marginTop: '4px',
                                transition: 'all 200ms ease',
                            }}
                        >
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #00E5EE, #7C3AED)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 800,
                                color: '#fff',
                                fontFamily: "'Inter', sans-serif",
                                flexShrink: 0,
                            }}>
                                {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#E8E8ED',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontFamily: "'Inter', sans-serif",
                                }}>{user.name || 'User'}</div>
                                <div style={{
                                    fontSize: '10px',
                                    color: '#4A4A58',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}>{user.role || 'student'}</div>
                            </div>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#10B981',
                                boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                                flexShrink: 0,
                            }} />
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
