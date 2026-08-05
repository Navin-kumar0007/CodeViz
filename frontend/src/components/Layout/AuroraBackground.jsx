import { useState, useEffect } from 'react';
import { getFx, FX_EVENT, reducedMotion } from '../../utils/effects';

/**
 * Subtle ambient aurora — slow-drifting accent blobs as a faint fixed overlay.
 * Low opacity so it never hurts readability. Toggle in settings.
 */
export default function AuroraBackground() {
  const [on, setOn] = useState(() => getFx().aurora && !reducedMotion());
  useEffect(() => {
    const onChange = (e) => setOn((e.detail || getFx()).aurora && !reducedMotion());
    window.addEventListener(FX_EVENT, onChange);
    return () => window.removeEventListener(FX_EVENT, onChange);
  }, []);

  if (!on) return null;

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes cz-aurora-a{0%,100%{transform:translate(-10%,-10%) scale(1)}50%{transform:translate(15%,10%) scale(1.25)}}
        @keyframes cz-aurora-b{0%,100%{transform:translate(10%,15%) scale(1.1)}50%{transform:translate(-15%,-10%) scale(0.9)}}
        @keyframes cz-aurora-c{0%,100%{transform:translate(20%,-15%) scale(1)}50%{transform:translate(-10%,20%) scale(1.2)}}
      `}</style>
      <span style={blob('cz-aurora-a 22s', 'var(--cz-accent)', '8%', '55vw', '5%', '5%')} />
      <span style={blob('cz-aurora-b 28s', '#8b5cf6', '6%', '48vw', '55%', '40%')} />
      <span style={blob('cz-aurora-c 25s', '#06b6d4', '6%', '46vw', '20%', '70%')} />
    </div>
  );
}

function blob(animation, color, alpha, size, top, left) {
  return {
    position: 'absolute', top, left, width: size, height: size, borderRadius: '50%',
    background: `radial-gradient(circle, color-mix(in srgb, ${color} 60%, transparent), transparent 70%)`,
    opacity: alpha, filter: 'blur(60px)', animation: `${animation} ease-in-out infinite`,
  };
}
