import { useState, useEffect } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';

// Enable only for fine pointers (desktop) and when motion is not reduced.
const trailEnabled = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  return !reduce && !coarse;
};

/**
 * App-wide cursor trail — a smooth, glowing ribbon that follows the pointer
 * across the whole app (viewport-fixed). Mounted once at the app root.
 * Pointer-events: none, so it never blocks interaction. Disabled for touch and
 * for users who prefer reduced motion.
 */
export default function GlobalCursorTrail() {
  const [points, setPoints] = useState([]);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const smoothX = useSpring(mouseX, { damping: 22, stiffness: 170 });
  const smoothY = useSpring(mouseY, { damping: 22, stiffness: 170 });
  const [enabled] = useState(trailEnabled);

  useEffect(() => {
    if (!enabled) return undefined;
    const onMove = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [enabled, mouseX, mouseY]);

  useEffect(() => {
    if (!enabled) return undefined;
    let raf;
    const tick = () => {
      setPoints((prev) => [{ x: smoothX.get(), y: smoothY.get() }, ...prev.slice(0, 14)]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, smoothX, smoothY]);

  if (!enabled || points.length < 2) return null;

  const d = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  return (
    <svg style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9998 }} aria-hidden="true">
      <defs>
        <linearGradient id="cz-trail" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--cz-accent)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--cz-accent)" stopOpacity="0" />
        </linearGradient>
        <filter id="cz-trail-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d={d} fill="none" stroke="url(#cz-trail)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#cz-trail-glow)" style={{ opacity: 0.55 }} />
      <circle cx={points[0].x} cy={points[0].y} r="3" fill="var(--cz-accent)" filter="url(#cz-trail-glow)" />
    </svg>
  );
}
