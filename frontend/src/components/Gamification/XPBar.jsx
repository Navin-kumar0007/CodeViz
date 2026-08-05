const XPBar = ({ xp, level }) => {
  const currentLevelXP = (xp || 0) % 100;
  const xpNeeded = 100;
  const progress = (currentLevelXP / xpNeeded) * 100;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '200px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <span style={{
        fontSize: '12px', fontWeight: 700, color: 'var(--cz-accent)', whiteSpace: 'nowrap',
        padding: '4px 10px', borderRadius: '999px',
        background: 'color-mix(in srgb, var(--cz-accent) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--cz-accent) 30%, transparent)',
      }}>Level {level || 1}</span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ height: '8px', background: 'var(--cz-elevated)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--cz-line)' }}>
          <div style={{
            height: '100%', width: `${progress}%`, borderRadius: '999px',
            background: 'linear-gradient(90deg, var(--cz-accent), #8fa2ff)',
            transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
          }} />
        </div>
        <div style={{ fontSize: '11px', color: 'var(--cz-muted)', fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>
          {currentLevelXP} / {xpNeeded} XP
        </div>
      </div>
    </div>
  );
};

export default XPBar;
