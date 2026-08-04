import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * MotionFlowArray — "Motion-Flow" array visualization.
 * Instead of recoloring static boxes, it animates the algorithm's ACTIONS,
 * derived purely from consecutive trace states (prev vs current array):
 *   • swap of two indices  -> the two values physically arc & trade slots
 *   • single value change  -> that cell flashes
 *   • index variables (i/j/left/right/mid…) -> labeled pointers that glide
 * Value is dual-encoded as number + bar height.
 */

const COL = {
  cell: '#1e2436', cellLine: '#313a54', text: '#e7eaf3', muted: '#8b93a7',
  swap: '#37d67a', sorted: '#2dd4bf',
};
const PTR_COLORS = ['#5b7cff', '#f5b544', '#2dd4bf', '#f472b6', '#a78bfa', '#38bdf8'];
const CELL_W = 46, GAP = 10;

const KIND_TAG = {
  stack: 'STACK · top →',
  queue: 'QUEUE · front → rear',
};

export default function MotionFlowArray({ name, arr, prevArr, pointers = {}, sortedIndices = [], kind = 'array' }) {
  const wrapRef = useRef(null);
  const cellRefs = useRef([]);
  const overlayRef = useRef(null);
  const [centers, setCenters] = useState([]);
  const reduce = typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nums = arr.map(v => (typeof v === 'number' ? v : 0));
  const maxV = Math.max(1, ...nums.map(Math.abs));
  const minV = Math.min(0, ...nums);
  const barH = (v) => 34 + ((v - minV) / ((maxV - minV) || 1)) * 120;

  const arrKey = JSON.stringify(arr);

  // Measure cell centers so pointer markers can glide to them.
  useLayoutEffect(() => {
    const cs = cellRefs.current.map(el => (el ? el.offsetLeft + el.offsetWidth / 2 : 0));
    setCenters(cs);
  }, [arrKey]);

  // Diff prev -> current to drive motion. Instead of only recognising an atomic
  // two-index swap (Python `a,b = b,a`), we detect any *value move*: for each
  // changed cell, find where its new value came from and fly it in. This makes
  // temp-variable swaps (JS/Java/C++), insertion shifts and selection moves all
  // animate the same way, regardless of language.
  useEffect(() => {
    if (!prevArr || prevArr.length !== arr.length) return;
    const diffs = [];
    for (let k = 0; k < arr.length; k++) if (!Object.is(arr[k], prevArr[k])) diffs.push(k);
    if (diffs.length === 0) return;
    if (diffs.length > 4) { diffs.forEach(flash); return; } // array rebuilt: just flash

    const usedSrc = new Set();
    diffs.forEach((d) => {
      const newVal = arr[d];
      let src = -1;
      // Prefer a source among the changed indices (true swap), else anywhere.
      for (const s of diffs) {
        if (s !== d && !usedSrc.has(s) && Object.is(prevArr[s], newVal)) { src = s; break; }
      }
      if (src === -1) {
        for (let s = 0; s < prevArr.length; s++) {
          if (s !== d && !usedSrc.has(s) && Object.is(prevArr[s], newVal)) { src = s; break; }
        }
      }
      if (src !== -1) { usedSrc.add(src); flyValue(newVal, src, d); }
      else flash(d);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrKey]);

  const flash = (i) => {
    const el = cellRefs.current[i]?.querySelector('.mf-bar');
    if (!el || reduce) return;
    el.animate(
      [{ boxShadow: `0 0 0 2px ${COL.swap}`, background: '#233028' },
       { boxShadow: '0 0 0 0 transparent', background: COL.cell }],
      { duration: 520, easing: 'ease-out' }
    );
  };

  const mkFlyer = (value, from, to, wr, up) => {
    const ov = overlayRef.current;
    if (!ov) return;
    const el = document.createElement('div');
    const x0 = from.left - wr.left, y0 = from.top - wr.top;
    const x1 = to.left - wr.left, y1 = to.top - wr.top;
    el.textContent = String(value);
    Object.assign(el.style, {
      position: 'absolute', left: x0 + 'px', top: y0 + 'px',
      width: from.width + 'px', height: from.height + 'px', display: 'flex',
      alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6px',
      borderRadius: '8px 8px 4px 4px', fontFamily: 'ui-monospace, Menlo, monospace',
      fontWeight: '600', fontSize: '14px', color: '#06231a',
      background: 'linear-gradient(180deg,#4ee39a,#2bb767)',
      boxShadow: '0 10px 24px rgba(55,214,122,.35)', zIndex: '5',
    });
    ov.appendChild(el);
    const dip = (up ? -1 : 1) * 46;
    el.animate(
      [{ transform: 'translate(0,0)' },
       { transform: `translate(${(x1 - x0) / 2}px, ${(y1 - y0) / 2 + dip}px)`, offset: 0.5 },
       { transform: `translate(${x1 - x0}px, ${y1 - y0}px)` }],
      { duration: 460, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }
    );
    setTimeout(() => el.remove(), 500);
  };

  // Fly `value` from source index -> destination index along an arc.
  const flyValue = (value, srcIdx, dstIdx) => {
    const wrap = wrapRef.current;
    const cs = cellRefs.current[srcIdx], cd = cellRefs.current[dstIdx];
    if (!wrap || !cs || !cd || reduce) { flash(dstIdx); return; }
    const wr = wrap.getBoundingClientRect();
    const rs = cs.getBoundingClientRect(), rd = cd.getBoundingClientRect();
    mkFlyer(value, rs, rd, wr, srcIdx > dstIdx); // arc up when moving left, down when moving right
    const bar = cd.querySelector('.mf-bar');
    if (bar) { bar.style.opacity = '0.15'; setTimeout(() => { bar.style.opacity = '1'; }, 460); }
  };

  const ptrEntries = Object.entries(pointers).slice(0, 6);

  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, color: COL.text }}>{name}</span>
        <span style={{ fontSize: '11px', color: COL.muted }}>len {arr.length}</span>
        {KIND_TAG[kind] && (
          <span style={{
            fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.5px', color: '#5b7cff', padding: '2px 8px', borderRadius: '999px',
            background: 'color-mix(in srgb, #5b7cff 16%, transparent)',
            border: '1px solid color-mix(in srgb, #5b7cff 40%, transparent)',
          }}>{KIND_TAG[kind]}</span>
        )}
      </div>

      <div ref={wrapRef} style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', paddingTop: '32px' }}>
        {/* Gliding pointer markers */}
        {ptrEntries.map(([pname, pidx], k) => (
          typeof centers[pidx] === 'number' && centers[pidx] > 0 ? (
            <div key={pname} style={{
              position: 'absolute', top: 0, left: 0,
              transform: `translateX(${centers[pidx]}px) translateX(-50%)`,
              transition: reduce ? 'none' : 'transform .4s cubic-bezier(.65,0,.35,1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, pointerEvents: 'none',
            }}>
              <span style={{
                fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700, fontSize: '11px',
                color: PTR_COLORS[k % PTR_COLORS.length], padding: '2px 7px', borderRadius: '6px',
                background: `color-mix(in srgb, ${PTR_COLORS[k % PTR_COLORS.length]} 18%, transparent)`,
                border: `1px solid color-mix(in srgb, ${PTR_COLORS[k % PTR_COLORS.length]} 45%, transparent)`,
                whiteSpace: 'nowrap',
              }}>{pname}</span>
              <span style={{ width: '2px', height: '10px', background: PTR_COLORS[k % PTR_COLORS.length], opacity: 0.6 }} />
            </div>
          ) : null
        ))}

        {/* Cells */}
        <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: GAP + 'px', minHeight: '160px' }}>
          {arr.map((val, idx) => {
            const isSorted = sortedIndices.includes(idx);
            const isEnd = (kind === 'stack' && idx === arr.length - 1) || (kind === 'queue' && idx === 0);
            const endLabel = kind === 'stack' ? 'top' : 'front';
            const h = typeof val === 'number' ? barH(val) : 60;
            const border = isEnd ? '#5b7cff' : (isSorted ? COL.sorted : COL.cellLine);
            return (
              <div key={idx} ref={el => { cellRefs.current[idx] = el; }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' }}>
                <div className="mf-bar" style={{
                  width: CELL_W + 'px', height: h + 'px', borderRadius: '8px 8px 4px 4px',
                  background: isSorted ? 'color-mix(in srgb, #2dd4bf 22%, #1e2436)' : COL.cell,
                  border: `1px solid ${border}`,
                  boxShadow: isEnd ? '0 0 0 2px color-mix(in srgb, #5b7cff 30%, transparent)' : 'none',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6px',
                  fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 600, fontSize: '14px', color: COL.text,
                  transition: 'opacity .2s, background .25s, border-color .25s, box-shadow .25s',
                }}>{String(val)}</div>
                <div style={{ marginTop: '6px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11px', color: isEnd ? '#5b7cff' : COL.muted }}>{isEnd ? endLabel : idx}</div>
              </div>
            );
          })}
        </div>

        {/* Flyer overlay for arc-swaps */}
        <div ref={overlayRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }} />
      </div>
    </div>
  );
}
