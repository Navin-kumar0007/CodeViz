import { useState, useEffect } from 'react';
import { reducedMotion } from '../utils/effects';

/** Animate a number from 0 → target with an ease-out. Set enabled=false to skip. */
export function useCountUp(target, { duration = 900, enabled = true } = {}) {
  const animate = enabled && !reducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!animate) return undefined;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, animate, duration]);

  // When not animating, always reflect the live target.
  return animate ? val : target;
}

export default useCountUp;
