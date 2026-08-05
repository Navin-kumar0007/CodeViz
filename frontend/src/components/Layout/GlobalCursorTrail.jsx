import { useState, useEffect } from 'react';
import { useSpring, useMotionValue } from 'framer-motion';
import { getTrail, TRAIL_EVENT, trailColorValue } from '../../utils/cursorTrail';

// Device gate: only fine pointers (desktop) with motion allowed.
const deviceCapable = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !window.matchMedia('(pointer: coarse)').matches;
};

/**
 * App-wide cursor trail — a smooth glowing ribbon that follows the pointer.
 * Reads user settings (utils/cursorTrail) and live-updates when they change.
 * Mounted once at the app root; pointer-events:none; auto-off on touch / reduced
 * motion / when the user disables it.
 */
export default function GlobalCursorTrail() {
  const [points, setPoints] = useState([]);
  const [cfg, setCfg] = useState(getTrail);
  const [capable] = useState(deviceCapable);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const smoothX = useSpring(mouseX, { damping: 22, stiffness: 170 });
  const smoothY = useSpring(mouseY, { damping: 22, stiffness: 170 });

  const on = capable && cfg.enabled;

  useEffect(() => {
    const onChange = (e) => setCfg(e.detail || getTrail());
    window.addEventListener(TRAIL_EVENT, onChange);
    return () => window.removeEventListener(TRAIL_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!on) return undefined; // render returns null when off, so stale points don't show
    const onMove = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [on, mouseX, mouseY]);

  useEffect(() => {
    if (!on) return undefined;
    let raf;
    const cap = Math.max(2, cfg.length);
    const tick = () => {
      setPoints((prev) => [{ x: smoothX.get(), y: smoothY.get() }, ...prev.slice(0, cap - 1)]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, cfg.length, smoothX, smoothY]);

  if (!on || points.length < 2) return null;

  const color = trailColorValue(cfg.color);
  const d = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  return (
    <svg style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9998 }} aria-hidden="true">
      <defs>
        <linearGradient id="cz-trail" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.75" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="cz-trail-glow"><feGaussianBlur stdDeviation={cfg.glow} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d={d} fill="none" stroke="url(#cz-trail)" strokeWidth={cfg.thickness} strokeLinecap="round" strokeLinejoin="round" filter="url(#cz-trail-glow)" style={{ opacity: 0.6 }} />
      <circle cx={points[0].x} cy={points[0].y} r={Math.max(2, cfg.thickness)} fill={color} filter="url(#cz-trail-glow)" />
    </svg>
  );
}
