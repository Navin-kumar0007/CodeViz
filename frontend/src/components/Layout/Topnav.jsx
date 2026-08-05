import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const Topnav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const initials = userInfo.name ? userInfo.name.substring(0, 2).toUpperCase() : 'U';

  const parts = location.pathname.split('/').filter(Boolean);
  const crumbs = ['CodeViz', ...parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '))];

  return (
    <div style={{
      height: '56px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 90,
      background: 'color-mix(in srgb, var(--cz-surface) 88%, transparent)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--cz-line)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
    }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', fontFamily: 'ui-monospace, monospace' }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={c + i}>
            <span style={{ color: i === crumbs.length - 1 ? 'var(--cz-text)' : 'var(--cz-muted)', fontWeight: i === crumbs.length - 1 ? 700 : 500 }}>{c}</span>
            {i < crumbs.length - 1 && <span style={{ color: 'var(--cz-faint)' }}>/</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => { const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true }); window.dispatchEvent(e); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '22px', justifyContent: 'space-between',
            minWidth: '208px', height: '32px', padding: '0 10px 0 12px', cursor: 'text',
            background: 'var(--cz-elevated)', border: '1px solid var(--cz-line)', borderRadius: '8px',
            color: 'var(--cz-muted)', fontSize: '12.5px',
          }}
        >
          <span style={{ opacity: 0.8 }}>Search…</span>
          <span style={{ display: 'flex', gap: '2px', fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: 'var(--cz-faint)' }}>
            <kbd style={{ padding: '1px 5px', border: '1px solid var(--cz-line)', borderRadius: '4px', background: 'var(--cz-surface)' }}>⌘</kbd>
            <kbd style={{ padding: '1px 5px', border: '1px solid var(--cz-line)', borderRadius: '4px', background: 'var(--cz-surface)' }}>K</kbd>
          </span>
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--cz-line)', background: 'var(--cz-elevated)', color: 'var(--cz-muted)', cursor: 'pointer', fontSize: '14px' }}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <button
          onClick={() => navigate('/profile')}
          aria-label="Profile"
          style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--cz-accent)', color: 'var(--cz-accent-fg)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}
        >
          {initials}
        </button>
      </div>
    </div>
  );
};

export default Topnav;
