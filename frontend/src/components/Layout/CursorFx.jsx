import { useState, useEffect, useRef } from 'react';
import { getFx, FX_EVENT, reducedMotion, finePointer } from '../../utils/effects';

const MAGNET_SEL = 'button, a[role="button"], [data-magnetic]';

/**
 * Pointer-driven effects (desktop, motion-allowed):
 *  • spotlight — soft radial glow follows the cursor
 *  • ripple    — expanding ring on click
 *  • magnetic  — buttons gently pull toward the cursor on hover
 * All gated by user settings (utils/effects) and auto-off on touch / reduced-motion.
 */
export default function CursorFx() {
  const [fx, setFx] = useState(getFx);
  const [capable] = useState(() => finePointer() && !reducedMotion());
  const spotRef = useRef(null);
  const rippleLayer = useRef(null);
  const magnetEl = useRef(null);

  useEffect(() => {
    const onChange = (e) => setFx(e.detail || getFx());
    window.addEventListener(FX_EVENT, onChange);
    return () => window.removeEventListener(FX_EVENT, onChange);
  }, []);

  // Spotlight + magnetic share one mousemove handler.
  useEffect(() => {
    if (!capable) return undefined;
    const onMove = (e) => {
      if (fx.spotlight && spotRef.current) {
        spotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        spotRef.current.style.opacity = '1';
      }
      if (fx.magnetic) {
        const el = e.target.closest?.(MAGNET_SEL);
        if (el !== magnetEl.current) {
          if (magnetEl.current) magnetEl.current.style.transform = '';
          magnetEl.current = el || null;
        }
        if (el) {
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
          el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
          el.style.transition = 'transform 120ms ease-out';
        }
      } else if (magnetEl.current) {
        magnetEl.current.style.transform = '';
        magnetEl.current = null;
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (magnetEl.current) { magnetEl.current.style.transform = ''; magnetEl.current = null; }
    };
  }, [capable, fx.spotlight, fx.magnetic]);

  // Click ripple.
  useEffect(() => {
    if (!capable || !fx.ripple) return undefined;
    const onClick = (e) => {
      const layer = rippleLayer.current;
      if (!layer) return;
      const ring = document.createElement('span');
      ring.className = 'cz-ripple';
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      layer.appendChild(ring);
      setTimeout(() => ring.remove(), 650);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [capable, fx.ripple]);

  if (!capable) return null;

  return (
    <>
      <style>{`
        .cz-ripple{position:fixed;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;
          border:2px solid var(--cz-accent);pointer-events:none;z-index:9997;opacity:.6;
          animation:cz-ripple .6s ease-out forwards;}
        @keyframes cz-ripple{to{transform:scale(6);opacity:0;}}
        @media (prefers-reduced-motion: reduce){.cz-ripple{display:none;}}
      `}</style>
      {fx.spotlight && (
        <div ref={spotRef} aria-hidden="true" style={{
          position: 'fixed', top: 0, left: 0, width: 480, height: 480, marginLeft: -240, marginTop: -240,
          borderRadius: '50%', pointerEvents: 'none', zIndex: 9996, opacity: 0,
          background: 'radial-gradient(circle, color-mix(in srgb, var(--cz-accent) 14%, transparent), transparent 65%)',
          transition: 'opacity .3s',
        }} />
      )}
      <div ref={rippleLayer} aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997 }} />
    </>
  );
}
