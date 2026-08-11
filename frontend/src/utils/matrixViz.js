// Helpers for visualizing 2D arrays (DP tables, grids, matrices) in the live tracer.
// Pure + tested so the Canvas rendering logic stays trustworthy.

export function is2DArray(v) {
  return Array.isArray(v) && v.length > 0 && v.every((row) => Array.isArray(row));
}

// Cells that changed from the previous step → the "filling in" highlight. When the
// matrix didn't exist before (just appeared), we return an empty set so the whole
// grid doesn't flash on first render.
export function changedCells(prev, curr) {
  const changed = new Set();
  if (!is2DArray(curr) || !is2DArray(prev)) return changed;
  for (let r = 0; r < curr.length; r++) {
    const row = curr[r];
    for (let c = 0; c < row.length; c++) {
      const before = Array.isArray(prev[r]) ? prev[r][c] : undefined;
      if (before === undefined || before !== row[c]) changed.add(`${r},${c}`);
    }
  }
  return changed;
}

// Best-effort "cursor" cell from integer loop variables (i/row/r, j/col/c), if they
// point inside the matrix — draws where the algorithm is currently working.
export function cursorFromVars(vars, rows, cols) {
  if (!vars || typeof vars !== 'object') return null;
  const pick = (names) => {
    for (const n of names) {
      const val = vars[n];
      if (typeof val === 'number' && Number.isInteger(val)) return val;
    }
    return null;
  };
  const r = pick(['i', 'row', 'r', 'y']);
  const c = pick(['j', 'col', 'c', 'x']);
  if (r == null || c == null) return null;
  if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
  return { r, c };
}
