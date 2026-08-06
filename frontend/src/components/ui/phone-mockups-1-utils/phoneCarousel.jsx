import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';

/**
 * @typedef {{ src: string, alt?: string }} ImageItem
 */

/**
 * PhoneCarousel — an iPhone-style mockup that cross-fades through app
 * screenshots. Auto-advances; click the dots to jump. Adapted for CodeViz
 * (JS + Tailwind + framer-motion) — the original shadcn util wasn't provided,
 * so this is a self-contained implementation of the same `{ images }` API.
 *
 * @param {{ images: ImageItem[], interval?: number, className?: string }} props
 */
export function PhoneCarousel({ images = [], interval = 3200, className }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [paused, count, interval]);

  if (count === 0) return null;

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Phone frame */}
      <div
        className="relative w-[280px] h-[580px] rounded-[3rem] p-3 shadow-2xl"
        style={{ background: 'linear-gradient(145deg, #1c1c22, #0b0b0f)', boxShadow: '0 30px 70px rgba(0,0,0,.45), inset 0 0 0 2px rgba(255,255,255,.06)' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Screen */}
        <div className="relative w-full h-full rounded-[2.3rem] overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={images[index].src}
              alt={images[index].alt || `Screenshot ${index + 1}`}
              loading="lazy"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
        </div>
      </div>

      {/* Dots */}
      {count > 1 && (
        <div className="flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all',
                i === index ? 'w-6 bg-accent' : 'w-2 bg-line hover:bg-muted'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PhoneCarousel;
