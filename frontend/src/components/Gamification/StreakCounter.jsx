import { Flame } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const StreakCounter = ({ streak }) => {
  const { current, longest } = streak || { current: 0, longest: 0 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Motion.span
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2 }}
        style={{
          width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--cz-hard)', background: 'color-mix(in srgb, var(--cz-hard) 14%, transparent)',
          border: '1px solid color-mix(in srgb, var(--cz-hard) 32%, transparent)', flexShrink: 0,
        }}
      >
        <Flame size={19} strokeWidth={2.2} />
      </Motion.span>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--cz-text)' }}>{current} day streak</span>
        <span style={{ fontSize: '12px', color: 'var(--cz-muted)' }}>Best: {longest}</span>
      </div>
    </div>
  );
};

export default StreakCounter;
