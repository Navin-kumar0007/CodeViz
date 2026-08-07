/** Settings store for the app-wide visual effects (persisted + live-updating). */
export const FX_KEY = 'cz_effects';
export const FX_EVENT = 'cz-effects-change';

export const DEFAULT_FX = {
  spotlight: true,
  ripple: true,
  aurora: false,
  magnetic: true,
  countUp: true,
  confetti: true,
};

export function getFx() {
  try { return { ...DEFAULT_FX, ...JSON.parse(localStorage.getItem(FX_KEY) || '{}') }; }
  catch { return { ...DEFAULT_FX }; }
}

export function setFx(patch) {
  const next = { ...getFx(), ...patch };
  localStorage.setItem(FX_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(FX_EVENT, { detail: next }));
  return next;
}

export function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function finePointer() {
  return typeof window !== 'undefined' && window.matchMedia
    && !window.matchMedia('(pointer: coarse)').matches;
}
