import { describe, it, expect } from 'vitest';
import { is2DArray, changedCells, cursorFromVars } from './matrixViz';

describe('is2DArray', () => {
  it('detects a list of lists', () => {
    expect(is2DArray([[1, 2], [3, 4]])).toBe(true);
  });
  it('rejects flat arrays, empty, and non-arrays', () => {
    expect(is2DArray([1, 2, 3])).toBe(false);
    expect(is2DArray([])).toBe(false);
    expect(is2DArray('nope')).toBe(false);
    expect(is2DArray([[1], 2])).toBe(false); // ragged/mixed
  });
});

describe('changedCells', () => {
  it('flags cells that changed between steps', () => {
    const prev = [[0, 0], [0, 0]];
    const curr = [[0, 5], [0, 0]];
    const ch = changedCells(prev, curr);
    expect(ch.has('0,1')).toBe(true);
    expect(ch.has('0,0')).toBe(false);
    expect(ch.size).toBe(1);
  });
  it('returns empty when the matrix just appeared (no prev)', () => {
    expect(changedCells(undefined, [[1, 2]]).size).toBe(0);
    expect(changedCells([1, 2, 3], [[1, 2]]).size).toBe(0); // prev not 2D
  });
  it('flags newly grown cells', () => {
    const ch = changedCells([[1]], [[1, 2]]);
    expect(ch.has('0,1')).toBe(true);
  });
});

describe('cursorFromVars', () => {
  it('reads i/j into a cursor inside bounds', () => {
    expect(cursorFromVars({ i: 1, j: 2 }, 3, 3)).toEqual({ r: 1, c: 2 });
  });
  it('accepts row/col aliases', () => {
    expect(cursorFromVars({ row: 0, col: 1 }, 2, 2)).toEqual({ r: 0, c: 1 });
  });
  it('returns null when out of bounds or missing', () => {
    expect(cursorFromVars({ i: 5, j: 0 }, 3, 3)).toBeNull();
    expect(cursorFromVars({ i: 1 }, 3, 3)).toBeNull();
    expect(cursorFromVars(null, 3, 3)).toBeNull();
  });
});
