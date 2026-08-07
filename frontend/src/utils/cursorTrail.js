/** Shared config for the app-wide cursor trail (persisted + live-updating). */
export const TRAIL_KEY = 'cz_cursor_trail';
export const TRAIL_EVENT = 'cz-cursor-trail-change';

export const DEFAULT_TRAIL = { enabled: true, length: 14, thickness: 3, glow: 3, color: 'accent' };

export const TRAIL_COLORS = {
  accent: 'var(--cz-accent)',
  emerald: '#10b981',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  cyan: '#06b6d4',
};

export function getTrail() {
  try { return { ...DEFAULT_TRAIL, ...JSON.parse(localStorage.getItem(TRAIL_KEY) || '{}') }; }
  catch { return { ...DEFAULT_TRAIL }; }
}

export function setTrail(patch) {
  const next = { ...getTrail(), ...patch };
  localStorage.setItem(TRAIL_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(TRAIL_EVENT, { detail: next }));
  return next;
}

export function trailColorValue(key) {
  return TRAIL_COLORS[key] || key || TRAIL_COLORS.accent;
}
