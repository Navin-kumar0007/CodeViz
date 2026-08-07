import { useState, useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * DiagramPlayer — a declarative, animated flow-diagram player for CONCEPTUAL
 * topics that cannot be traced (system design, git, security, REST, LLMs…).
 * Boxes + arrows on a fixed 600×260 canvas; steps light nodes/edges, dim
 * others, and send a "packet" travelling along an edge.
 *
 * spec = {
 *   kind: 'diagram', title,
 *   nodes: [{ id, label, sub?, x, y, w?, h?, icon? }],   // x,y = CENTRE in 0..600 / 0..260
 *   edges: [{ id, from, to, label?, dashed? }],
 *   steps: [{
 *     caption,
 *     activeNodes?: [id], dimNodes?: [id],
 *     activeEdges?: [id],
 *     packet?: { edge: id },        // animate a dot from edge.from → edge.to
 *     show?: [id],                  // only these nodes/edges visible (progressive reveal)
 *   }]
 * }
 */

const VB_W = 600;
const VB_H = 260;

export default function DiagramPlayer({ spec }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [speed, setSpeed] = useState(1);

  const steps = useMemo(() => spec.steps || [], [spec.steps]);
  const last = steps.length - 1;
  const nodeById = useMemo(() => Object.fromEntries((spec.nodes || []).map((n) => [n.id, n])), [spec.nodes]);

  useEffect(() => {
    if (!playing || reduce || steps.length === 0) return undefined;
    if (idx >= last) return undefined;
    const id = setTimeout(() => setIdx((i) => Math.min(i + 1, last)), 2000 / speed);
    return () => clearTimeout(id);
  }, [playing, idx, last, speed, reduce, steps.length]);

  if (steps.length === 0) return null;
  const step = steps[idx] || {};
  const restart = () => { setIdx(0); setPlaying(!reduce); };

  const visible = (id) => !step.show || step.show.includes(id);
  const nodeActive = (id) => step.activeNodes?.includes(id);
  const nodeDim = (id) => step.dimNodes?.includes(id);
  const edgeActive = (id) => step.activeEdges?.includes(id);

  const packetEdge = step.packet ? (spec.edges || []).find((e) => e.id === step.packet.edge) : null;
  const packetFrom = packetEdge ? nodeById[packetEdge.from] : null;
  const packetTo = packetEdge ? nodeById[packetEdge.to] : null;

  return (
    <div style={{
      background: 'var(--cz-surface)', border: '1px solid var(--cz-line)', borderRadius: 14,
      padding: '14px 16px', margin: '4px 0 18px', boxShadow: 'var(--cz-shadow-sm)',
      width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--cz-accent)', letterSpacing: 0.3 }}>◇ {spec.title || 'How it works'}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'monospace', color: 'var(--cz-muted)' }}>step {idx + 1}/{steps.length}</span>
      </div>

      {/* Canvas — fixed 600x260 px surface so coordinates map 1:1 (no scaling
          distortion); the wrapper scrolls horizontally on narrow screens. */}
      <div style={{ overflowX: 'auto', width: '100%', minWidth: 0 }}>
      <div style={{ position: 'relative', width: VB_W, height: VB_H, margin: '0 auto', flexShrink: 0 }}>
        {/* Edges + packet (SVG) */}
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width={VB_W} height={VB_H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <marker id="dp-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L7,3 L0,6 Z" fill="var(--cz-muted)" />
            </marker>
            <marker id="dp-arrow-on" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L7,3 L0,6 Z" fill="var(--cz-accent)" />
            </marker>
          </defs>
          {(spec.edges || []).map((e) => {
            // An edge shows automatically once both its endpoints are visible.
            if (!visible(e.from) || !visible(e.to)) return null;
            const a = nodeById[e.from]; const b = nodeById[e.to];
            if (!a || !b) return null;
            const on = edgeActive(e.id);
            return (
              <g key={e.id}>
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={on ? 'var(--cz-accent)' : 'var(--cz-line)'}
                  strokeWidth={on ? 2.5 : 2}
                  strokeDasharray={e.dashed ? '6 5' : undefined}
                  markerEnd={on ? 'url(#dp-arrow-on)' : 'url(#dp-arrow)'}
                />
                {e.label && (
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6} textAnchor="middle"
                    fontSize="11" fontFamily="monospace" fill={on ? 'var(--cz-accent)' : 'var(--cz-muted)'}>
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
          {packetFrom && packetTo && (
            <motion.circle
              key={`packet-${idx}`}
              r="7" fill="var(--cz-accent)"
              initial={reduce ? { cx: packetTo.x, cy: packetTo.y } : { cx: packetFrom.x, cy: packetFrom.y }}
              animate={{ cx: packetTo.x, cy: packetTo.y }}
              transition={reduce ? { duration: 0 } : { duration: 1.1 / speed, ease: 'easeInOut' }}
            />
          )}
        </svg>

        {/* Nodes (HTML overlay) */}
        {(spec.nodes || []).map((n) => {
          if (!visible(n.id)) return null;
          const active = nodeActive(n.id);
          const dim = nodeDim(n.id);
          const w = n.w || 108;
          // Keep the whole node box inside the canvas so it never overflows.
          const cx = Math.max(w / 2 + 2, Math.min(VB_W - w / 2 - 2, n.x));
          const cy = Math.max(28, Math.min(VB_H - 28, n.y));
          return (
            <motion.div
              key={n.id}
              initial={false}
              animate={reduce ? {} : { scale: active ? 1.06 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                position: 'absolute',
                left: cx, top: cy,
                transform: 'translate(-50%, -50%)',
                width: w, minHeight: n.h || 46,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '6px 8px', textAlign: 'center', borderRadius: 10,
                background: active ? 'color-mix(in srgb, var(--cz-accent) 18%, var(--cz-surface))' : 'var(--cz-elevated)',
                border: `2px solid ${active ? 'var(--cz-accent)' : 'var(--cz-line)'}`,
                boxShadow: active ? '0 0 18px color-mix(in srgb, var(--cz-accent) 45%, transparent)' : 'none',
                opacity: dim ? 0.4 : 1, transition: 'opacity 0.3s',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cz-text)', lineHeight: 1.2 }}>
                {n.icon ? `${n.icon} ` : ''}{n.label}
              </span>
              {n.sub && <span style={{ fontSize: 10, color: 'var(--cz-muted)', marginTop: 2 }}>{n.sub}</span>}
            </motion.div>
          );
        })}
      </div>
      </div>

      {/* Caption */}
      <div style={{
        minHeight: 42, marginTop: 12, padding: '8px 12px', borderRadius: 8,
        background: 'var(--cz-elevated)', border: '1px solid var(--cz-line)',
        fontSize: 13, color: 'var(--cz-text)', lineHeight: 1.5,
      }}>
        {step.caption}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <button onClick={() => { setIdx((i) => Math.max(0, i - 1)); setPlaying(false); }} disabled={idx === 0} style={btn(idx === 0)}>‹ Prev</button>
        {idx >= last
          ? <button onClick={restart} style={btn(false, true)}>↻ Replay</button>
          : <button onClick={() => setPlaying((p) => !p)} style={btn(false, true)}>{playing ? '❚❚ Pause' : '▶ Play'}</button>}
        <button onClick={() => { setIdx((i) => Math.min(last, i + 1)); setPlaying(false); }} disabled={idx >= last} style={btn(idx >= last)}>Next ›</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {[1, 1.5, 2].map((s) => (
            <button key={s} onClick={() => setSpeed(s)} style={{ ...btn(false), padding: '4px 8px', background: speed === s ? 'var(--cz-accent)' : 'transparent', color: speed === s ? '#fff' : 'var(--cz-muted)' }}>{s}×</button>
          ))}
        </div>
      </div>

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

function btn(disabled, primary = false) {
  return {
    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: disabled ? 'default' : 'pointer',
    border: `1px solid ${primary ? 'var(--cz-accent)' : 'var(--cz-line)'}`,
    background: primary ? 'color-mix(in srgb, var(--cz-accent) 14%, transparent)' : 'transparent',
    color: primary ? 'var(--cz-accent)' : 'var(--cz-text)',
    opacity: disabled ? 0.4 : 1, fontFamily: 'inherit',
  };
}
