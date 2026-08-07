import { getFx, reducedMotion } from './effects';

const COLORS = ['#4f6bff', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e'];

function layer() {
  let el = document.getElementById('cz-fx-layer');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cz-fx-layer';
    el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:10001;overflow:hidden';
    document.body.appendChild(el);
  }
  return el;
}

/** Confetti burst from (x,y) (defaults to top-center). */
export function confetti({ x, y, count = 90 } = {}) {
  if (!getFx().confetti || reducedMotion()) return;
  const root = layer();
  const ox = x ?? window.innerWidth / 2;
  const oy = y ?? window.innerHeight * 0.3;
  const parts = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    const size = 6 + Math.random() * 6;
    el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;width:${size}px;height:${size * 0.6}px;background:${COLORS[i % COLORS.length]};border-radius:2px;will-change:transform,opacity`;
    root.appendChild(el);
    const angle = Math.random() * Math.PI * 2;
    const speed = 6 + Math.random() * 8;
    parts.push({ el, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 6, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 20, life: 0 });
  }
  const start = performance.now();
  const step = (t) => {
    const dt = Math.min(32, t - (step.last || t)); step.last = t;
    let alive = false;
    for (const p of parts) {
      if (!p.el) continue;
      p.vy += 0.35 * (dt / 16); // gravity
      p.x = (p.x || 0) + p.vx * (dt / 16);
      p.y = (p.y || 0) + p.vy * (dt / 16);
      p.rot += p.vr;
      p.life += dt;
      const op = Math.max(0, 1 - p.life / 1400);
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
      p.el.style.opacity = op;
      if (op <= 0) { p.el.remove(); p.el = null; } else alive = true;
    }
    if (alive && performance.now() - start < 2500) requestAnimationFrame(step);
    else parts.forEach((p) => p.el?.remove());
  };
  requestAnimationFrame(step);
}

/** Floating "+N XP" that rises and fades from (x,y). */
export function xpFly({ x, y, amount = 50 } = {}) {
  if (!getFx().confetti || reducedMotion()) return;
  const root = layer();
  const el = document.createElement('div');
  el.textContent = `+${amount} XP`;
  el.style.cssText = `position:absolute;left:${x ?? window.innerWidth / 2}px;top:${y ?? window.innerHeight / 2}px;
    transform:translate(-50%,-50%);font:800 22px/1 'Inter',system-ui,sans-serif;color:#22c55e;
    text-shadow:0 2px 12px rgba(34,197,94,.5);will-change:transform,opacity;pointer-events:none`;
  root.appendChild(el);
  el.animate(
    [{ transform: 'translate(-50%,-50%) scale(0.8)', opacity: 0 },
     { transform: 'translate(-50%,-120%) scale(1.1)', opacity: 1, offset: 0.3 },
     { transform: 'translate(-50%,-260%) scale(1)', opacity: 0 }],
    { duration: 1400, easing: 'cubic-bezier(.22,1,.36,1)' }
  ).onfinish = () => el.remove();
}

/** Convenience: confetti + XP together (e.g. on an accepted submission). */
export function celebrate({ x, y, xp } = {}) {
  confetti({ x, y });
  if (xp) xpFly({ x, y, amount: xp });
}
