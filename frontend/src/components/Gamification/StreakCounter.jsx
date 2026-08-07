import { Flame } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

/** Streak flame that grows/glows brighter and pulses faster the longer the streak. */
const StreakCounter = ({ streak }) => {
  const { current, longest } = streak || { current: 0, longest: 0 };
  const t = Math.min(current, 30) / 30;            // 0..1 intensity
  const glow = 6 + t * 26;                          // px
  const size = 19 + Math.round(t * 6);             // icon size
  const speed = 1.6 - t * 0.8;                     // faster pulse when hotter
  const hot = current >= 14;                       // "on fire" tier

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Motion.span
        animate={{ scale: [1, 1 + 0.1 + t * 0.12, 1] }}
        transition={{ duration: speed, repeat: Infinity, repeatDelay: 1.2 - t }}
        style={{
          width: '40px', height: '40px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: hot ? '#f59e0b' : 'var(--cz-hard)',
          background: `color-mix(in srgb, ${hot ? '#f59e0b' : 'var(--cz-hard)'} ${14 + t * 14}%, transparent)`,
          border: `1px solid color-mix(in srgb, ${hot ? '#f59e0b' : 'var(--cz-hard)'} ${32 + t * 30}%, transparent)`,
          boxShadow: `0 0 ${glow}px color-mix(in srgb, ${hot ? '#f59e0b' : 'var(--cz-hard)'} ${Math.round(30 + t * 40)}%, transparent)`,
          flexShrink: 0,
        }}
      >
        <Flame size={size} strokeWidth={2.2} />
      </Motion.span>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--cz-text)' }}>
          {current} day streak {hot && <span title="On fire!">🔥</span>}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--cz-muted)' }}>Best: {longest}</span>
      </div>
    </div>
  );
};

export default StreakCounter;
