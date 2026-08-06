import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * ConceptPlayer — a self-contained, declarative animation player for teaching
 * data-structure & algorithm concepts. No backend, no tracer: each lesson ships
 * a small spec of steps and this component plays them with captions + controls.
 *
 * spec = {
 *   title: string,
 *   kind: 'array' | 'stack' | 'queue',
 *   data: number[],                       // initial array (array kind)
 *   steps: [{
 *     caption: string,
 *     array?: number[],                   // full array state (array kind; carried forward)
 *     stack?: (number|string)[],          // full stack state (stack kind, bottom→top)
 *     queue?: (number|string)[],          // full queue state (queue kind, front→back)
 *     pointers?: { [name]: index },       // labelled arrows above a column
 *     compare?: number[],                 // indices being compared (amber)
 *     highlight?: number[],               // indices emphasised (accent)
 *     dim?: number[],                     // indices eliminated (faded)
 *     done?: number[],                    // indices finalised (green)
 *   }]
 * }
 */

const COLORS = {
  base: { bg: 'var(--cz-elevated)', bd: 'var(--cz-line)', fg: 'var(--cz-text)' },
  highlight: { bg: 'color-mix(in srgb, var(--cz-accent) 22%, var(--cz-surface))', bd: 'var(--cz-accent)', fg: 'var(--cz-text)' },
  compare: { bg: 'color-mix(in srgb, var(--cz-warning) 24%, var(--cz-surface))', bd: 'var(--cz-warning)', fg: 'var(--cz-text)' },
  done: { bg: 'color-mix(in srgb, var(--cz-success) 24%, var(--cz-surface))', bd: 'var(--cz-success)', fg: 'var(--cz-text)' },
  dim: { bg: 'var(--cz-surface)', bd: 'var(--cz-line)', fg: 'var(--cz-faint)' },
};

function roleAt(step, i) {
  if (step.done?.includes(i)) return 'done';
  if (step.compare?.includes(i)) return 'compare';
  if (step.highlight?.includes(i)) return 'highlight';
  if (step.dim?.includes(i)) return 'dim';
  return 'base';
}

const CELL = 46;
const GAP = 8;

export default function ConceptPlayer({ spec }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [speed, setSpeed] = useState(1);

  const steps = useMemo(() => spec.steps || [], [spec.steps]);
  const last = steps.length - 1;

  useEffect(() => {
    if (!playing || reduce || steps.length === 0) return undefined;
    if (idx >= last) return undefined; // reached the end; controls show "Replay"
    const id = setTimeout(() => setIdx((i) => Math.min(i + 1, last)), 1600 / speed);
    return () => clearTimeout(id);
  }, [playing, idx, last, speed, reduce, steps.length]);

  const step = steps[idx] || {};

  // Array state carries forward from the latest step that declared `array`.
  const array = useMemo(() => {
    if (spec.kind !== 'array') return [];
    let arr = spec.data || [];
    for (let s = 0; s <= idx; s += 1) if (steps[s]?.array) arr = steps[s].array;
    return arr;
  }, [spec.kind, spec.data, steps, idx]);

  if (steps.length === 0) return null;

  const restart = () => { setIdx(0); setPlaying(!reduce); };
  const n = spec.kind === 'array' ? array.length : 0;
  const trackWidth = n * CELL + (n - 1) * GAP;

  return (
    <div style={{
      background: 'var(--cz-surface)', border: '1px solid var(--cz-line)', borderRadius: 14,
      padding: '14px 16px', margin: '4px 0 18px', boxShadow: 'var(--cz-shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--cz-accent)', letterSpacing: 0.3 }}>▶ {spec.title || 'Watch it work'}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'monospace', color: 'var(--cz-muted)' }}>step {idx + 1}/{steps.length}</span>
      </div>

      {/* Stage */}
      <div style={{ display: 'flex', justifyContent: 'center', minHeight: spec.kind === 'stack' ? 210 : 120, alignItems: spec.kind === 'stack' ? 'flex-end' : 'center', overflowX: 'auto', padding: '4px 0' }}>
        {spec.kind === 'array' && (
          <div style={{ position: 'relative', width: trackWidth }}>
            {/* Pointer arrows */}
            <div style={{ position: 'relative', height: 34 }}>
              {Object.entries(step.pointers || {}).map(([name, pos]) => (
                <motion.div
                  key={name}
                  initial={false}
                  animate={{ left: pos * (CELL + GAP) }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 26 }}
                  style={{ position: 'absolute', width: CELL, textAlign: 'center', bottom: 0 }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--cz-accent)', fontFamily: 'monospace' }}>{name}</div>
                  <div style={{ fontSize: 12, color: 'var(--cz-accent)', lineHeight: 1 }}>▼</div>
                </motion.div>
              ))}
            </div>
            {/* Cells */}
            <div style={{ display: 'flex', gap: GAP }}>
              {array.map((val, i) => {
                const c = COLORS[roleAt(step, i)];
                // moveByValue keys by value so swaps physically glide (sorts,
                // distinct values only). Default index-key is robust to
                // duplicates and growing arrays.
                return (
                  <motion.div
                    key={spec.moveByValue ? val : i}
                    layout={!reduce}
                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                    animate={reduce ? {} : { scale: roleAt(step, i) === 'compare' ? 1.08 : 1 }}
                    style={{
                      width: CELL, height: CELL, flex: `0 0 ${CELL}px`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: c.bg, border: `2px solid ${c.bd}`, color: c.fg,
                      borderRadius: 10, fontWeight: 700, fontFamily: 'monospace', fontSize: 15,
                    }}
                  >
                    {val}
                  </motion.div>
                );
              })}
            </div>
            {/* Index labels */}
            <div style={{ display: 'flex', gap: GAP, marginTop: 4 }}>
              {array.map((_, i) => (
                <span key={i} style={{ width: CELL, textAlign: 'center', fontSize: 10, color: 'var(--cz-faint)', fontFamily: 'monospace' }}>{i}</span>
              ))}
            </div>
          </div>
        )}

        {spec.kind === 'stack' && (
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 6, minWidth: 120 }}>
            <div style={{ fontSize: 10, color: 'var(--cz-faint)', textAlign: 'center', fontFamily: 'monospace' }}>bottom</div>
            <AnimatePresence mode="popLayout">
              {(step.stack || []).map((val, i, arr) => {
                const isTop = i === arr.length - 1;
                const c = isTop ? COLORS.highlight : COLORS.base;
                return (
                  <motion.div
                    key={`${val}-${i}`}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, x: 40, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    style={{
                      minWidth: 120, padding: '10px 16px', textAlign: 'center',
                      background: c.bg, border: `2px solid ${c.bd}`, color: c.fg,
                      borderRadius: 8, fontWeight: 700, fontFamily: 'monospace', position: 'relative',
                    }}
                  >
                    {val}{isTop && <span style={{ position: 'absolute', right: -46, fontSize: 10, color: 'var(--cz-accent)' }}>← top</span>}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {spec.kind === 'queue' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--cz-faint)', fontFamily: 'monospace' }}>front →</span>
            <AnimatePresence mode="popLayout">
              {(step.queue || []).map((val, i) => (
                <motion.div
                  key={`${val}-${i}`}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  style={{
                    minWidth: CELL, height: CELL, padding: '0 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === 0 ? COLORS.highlight.bg : COLORS.base.bg,
                    border: `2px solid ${i === 0 ? COLORS.highlight.bd : COLORS.base.bd}`,
                    color: 'var(--cz-text)', borderRadius: 10, fontWeight: 700, fontFamily: 'monospace',
                  }}
                >
                  {val}
                </motion.div>
              ))}
            </AnimatePresence>
            <span style={{ fontSize: 10, color: 'var(--cz-faint)', fontFamily: 'monospace' }}>→ back</span>
          </div>
        )}
      </div>

      {/* Caption */}
      <div style={{
        minHeight: 42, marginTop: 10, padding: '8px 12px', borderRadius: 8,
        background: 'var(--cz-elevated)', border: '1px solid var(--cz-line)',
        fontSize: 13, color: 'var(--cz-text)', lineHeight: 1.5,
      }}>
        {step.caption}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <button onClick={() => { setIdx((i) => Math.max(0, i - 1)); setPlaying(false); }} disabled={idx === 0} style={ctrlBtn(idx === 0)}>‹ Prev</button>
        {idx >= last ? (
          <button onClick={restart} style={ctrlBtn(false, true)}>↻ Replay</button>
        ) : (
          <button onClick={() => setPlaying((p) => !p)} style={ctrlBtn(false, true)}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
        )}
        <button onClick={() => { setIdx((i) => Math.min(last, i + 1)); setPlaying(false); }} disabled={idx >= last} style={ctrlBtn(idx >= last)}>Next ›</button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {[1, 1.5, 2].map((s) => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              ...ctrlBtn(false), padding: '4px 8px',
              background: speed === s ? 'var(--cz-accent)' : 'transparent',
              color: speed === s ? 'var(--cz-accent-fg, #fff)' : 'var(--cz-muted)',
            }}>{s}×</button>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 4, marginTop: 10, justifyContent: 'center' }}>
        {steps.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); setPlaying(false); }} aria-label={`Step ${i + 1}`} style={{
            width: i === idx ? 18 : 7, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer',
            background: i === idx ? 'var(--cz-accent)' : 'var(--cz-line)', transition: 'all 0.2s',
          }} />
        ))}
      </div>
    </div>
  );
}

function ctrlBtn(disabled, primary = false) {
  return {
    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
    border: `1px solid ${primary ? 'var(--cz-accent)' : 'var(--cz-line)'}`,
    background: primary ? 'color-mix(in srgb, var(--cz-accent) 14%, transparent)' : 'transparent',
    color: primary ? 'var(--cz-accent)' : 'var(--cz-text)',
    opacity: disabled ? 0.4 : 1, fontFamily: 'inherit',
  };
}
