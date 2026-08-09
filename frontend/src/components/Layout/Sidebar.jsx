import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Code2, ListChecks, GraduationCap, Brain, Network, GitBranch,
  History, Swords, School, Building2, MessagesSquare, Users, ScanSearch,
  FlaskConical, Languages, PencilRuler, Flag, Target, Video, BarChart3, Flame,
  Home, Hexagon, Bot, Shield, UserCog,
} from 'lucide-react';

const ROLE_RANK = { student: 1, instructor: 2, admin: 3 };

const navGroups = [
  {
    label: 'Main',
    items: [
      { path: '/', Icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/practice', Icon: Code2, label: 'Workspace' },
      { path: '/problems', Icon: ListChecks, label: 'Problems' },
      { path: '/learn', Icon: GraduationCap, label: 'Learn Hub' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { path: '/neural-pathway', Icon: Brain, label: 'Neural Pathway' },
      { path: '/concept-map', Icon: Network, label: 'Concept Map' },
      { path: '/git-learn', Icon: GitBranch, label: 'Git Learn' },
      { path: '/sessions', Icon: History, label: 'Sessions' },
    ],
  },
  {
    label: 'Collaborate',
    items: [
      { path: '/room', Icon: Swords, label: 'Battle Room' },
      { path: '/classroom', Icon: School, label: 'Classroom' },
      { path: '/campus', Icon: Building2, label: 'Campus', minRole: 'instructor' },
      { path: '/forum', Icon: MessagesSquare, label: 'Forum' },
      { path: '/peer-review', Icon: Users, label: 'Peer Review' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { path: '/code-review', Icon: ScanSearch, label: 'Code Review' },
      { path: '/test-lab', Icon: FlaskConical, label: 'Test Lab' },
      { path: '/translator', Icon: Languages, label: 'Translate' },
      { path: '/quiz-creator', Icon: PencilRuler, label: 'Quiz Studio' },
      { path: '/algo-race', Icon: Flag, label: 'Algo Race' },
    ],
  },
  {
    label: 'Grow',
    items: [
      { path: '/mentor', Icon: Bot, label: 'AI Mentor' },
      { path: '/interview-prep', Icon: Target, label: 'Interview Prep' },
      { path: '/video-lessons', Icon: Video, label: 'Video Lessons' },
      { path: '/progress', Icon: BarChart3, label: 'Progress' },
      { path: '/daily-challenge', Icon: Flame, label: 'Daily Challenge' },
    ],
  },
  {
    label: 'Staff',
    items: [
      { path: '/instructor', Icon: UserCog, label: 'Instructor', minRole: 'instructor' },
      { path: '/admin', Icon: Shield, label: 'Admin', minRole: 'admin' },
      { path: '/admin/content', Icon: PencilRuler, label: 'Content', minRole: 'admin' },
    ],
  },
];

function NavItem({ item, active, expanded, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={item.label}
      style={{
        position: 'relative', width: '100%', border: 'none', cursor: 'pointer',
        background: active
          ? 'color-mix(in srgb, var(--cz-accent) 14%, transparent)'
          : hover ? 'var(--cz-elevated)' : 'transparent',
        borderRadius: '9px', display: 'flex', alignItems: 'center', gap: '11px',
        justifyContent: expanded ? 'flex-start' : 'center',
        padding: expanded ? '8px 11px' : '8px 0', height: '36px',
        transition: 'background 160ms ease', textAlign: 'left',
      }}
    >
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          height: '18px', width: '3px', background: 'var(--cz-accent)', borderRadius: '0 3px 3px 0',
        }} />
      )}
      <span style={{
        width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        color: active ? 'var(--cz-accent)' : hover ? 'var(--cz-text)' : 'var(--cz-muted)',
        transition: 'color 160ms ease',
      }}><item.Icon size={17} strokeWidth={2} /></span>
      {expanded && (
        <span style={{
          fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontWeight: active ? 600 : 500,
          color: active ? 'var(--cz-text)' : hover ? 'var(--cz-text)' : 'var(--cz-muted)',
          transition: 'color 160ms ease',
        }}>{item.label}</span>
      )}
    </button>
  );
}

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => {
    try { const i = localStorage.getItem('userInfo'); return i ? JSON.parse(i) : null; } catch { return null; }
  });
  const [expanded, setExpanded] = useState(false);
  const isActive = (p) => location.pathname === p;

  return (
    <nav
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
        width: expanded ? '236px' : '62px',
        background: 'var(--cz-surface)', borderRight: '1px solid var(--cz-line)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 240ms cubic-bezier(0.22,1,0.36,1)',
        boxShadow: expanded ? 'var(--cz-shadow-lg)' : 'none',
      }}
    >
      <style>{`.cz-sb-scroll::-webkit-scrollbar{width:0;height:0}`}</style>

      {/* Brand */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer', flexShrink: 0,
          height: '56px', borderBottom: '1px solid var(--cz-line)',
          justifyContent: expanded ? 'flex-start' : 'center', padding: expanded ? '0 18px' : '0',
        }}
      >
        <span style={{
          width: '30px', height: '30px', flexShrink: 0, borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'color-mix(in srgb, var(--cz-accent) 16%, transparent)',
          border: '1px solid color-mix(in srgb, var(--cz-accent) 40%, transparent)',
          color: 'var(--cz-accent)',
        }}><Hexagon size={17} strokeWidth={2.5} /></span>
        {expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--cz-text)', letterSpacing: '-0.02em' }}>CodeViz</span>
            <span style={{ fontSize: '9px', color: 'var(--cz-faint)', fontFamily: 'ui-monospace, monospace', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Observatory</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="cz-sb-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: expanded ? '10px 10px' : '10px 7px', scrollbarWidth: 'none' }}>
        {navGroups.map((group) => {
          // Hide items (and empty groups) the user's role can't access.
          const myRank = ROLE_RANK[user?.role] || 1;
          const items = group.items.filter((i) => !i.minRole || myRank >= (ROLE_RANK[i.minRole] || 99));
          if (items.length === 0) return null;
          return (
          <div key={group.label} style={{ marginBottom: '4px' }}>
            <div style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--cz-faint)',
              fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase',
              opacity: expanded ? 1 : 0, height: expanded ? 'auto' : 0,
              padding: expanded ? '10px 12px 5px' : 0, overflow: 'hidden', transition: 'opacity 200ms ease',
            }}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {items.map((item) => (
                <NavItem key={item.path} item={item} active={isActive(item.path)} expanded={expanded} onClick={() => navigate(item.path)} />
              ))}
            </div>
          </div>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{ flexShrink: 0, borderTop: '1px solid var(--cz-line)', padding: expanded ? '10px 10px' : '10px 7px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <NavItem item={{ path: '/home', Icon: Home, label: 'Home Page' }} active={false} expanded={expanded} onClick={() => { window.location.href = '/home'; }} />
        {expanded && user && (
          <div
            onClick={() => navigate('/profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 11px', borderRadius: '9px', background: 'var(--cz-elevated)', border: '1px solid var(--cz-line)', cursor: 'pointer', marginTop: '4px' }}
          >
            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--cz-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--cz-accent-fg)', flexShrink: 0 }}>
              {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cz-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'User'}</div>
              <div style={{ fontSize: '10px', color: 'var(--cz-faint)', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role || 'student'}</div>
            </div>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--cz-success)', flexShrink: 0 }} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
