const { extractJson, validateVisual, validateEditorial } = require('../services/aiMentorService');

describe('extractJson (robust LLM JSON extraction)', () => {
  test('strips markdown fences', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });
  test('escapes raw control chars inside strings so JSON.parse succeeds', () => {
    // A stray newline+tab inside a string literal (AI-generated code) used to throw
    // "Bad control character in string literal".
    const bad = '{"code":"def f():\n\treturn 1"}';
    const out = extractJson(bad);
    const parsed = JSON.parse(out); // must not throw
    expect(parsed.code).toContain('return 1');
    expect(parsed.code).toContain('\n'); // newline preserved (as a real newline post-parse)
  });
  test('ignores trailing prose after the JSON object', () => {
    expect(extractJson('{"a":1}\nHope this helps!')).toBe('{"a":1}');
  });
  test('ignores leading prose before the JSON object', () => {
    expect(extractJson('Sure, here:\n{"a":1}')).toBe('{"a":1}');
  });
  test('respects braces inside string values', () => {
    const out = extractJson('{"code":"if (x) { y }"} extra');
    expect(out).toBe('{"code":"if (x) { y }"}');
  });
});

describe('validateVisual (concept-animation spec sanitising)', () => {
  test('accepts a valid array spec, drops out-of-range indices', () => {
    const spec = validateVisual({
      kind: 'array', title: 'T', data: [1, 2, 3],
      steps: [{ caption: 'a', compare: [0, 99], pointers: { i: 1, bad: 50 } }, { caption: 'b', done: [2] }],
    });
    expect(spec.kind).toBe('array');
    expect(spec.steps[0].compare).toEqual([0]); // 99 dropped
    expect(spec.steps[0].pointers).toEqual({ i: 1 }); // out-of-range 'bad' dropped
  });

  test('clamps diagram node coords and drops edges with unknown nodes', () => {
    const spec = validateVisual({
      kind: 'diagram', title: 'D',
      nodes: [{ id: 'a', label: 'A', x: -50, y: 999 }, { id: 'b', label: 'B', x: 300, y: 100 }],
      edges: [{ id: 'e1', from: 'a', to: 'b' }, { id: 'e2', from: 'a', to: 'ghost' }],
      steps: [{ caption: 'x', packet: { edge: 'e1' } }, { caption: 'y', packet: { edge: 'nope' } }],
    });
    expect(spec.nodes[0].x).toBeGreaterThanOrEqual(0);
    expect(spec.nodes[0].y).toBeLessThanOrEqual(260);
    expect(spec.edges.map((e) => e.id)).toEqual(['e1']); // ghost edge removed
    expect(spec.steps[0].packet).toEqual({ edge: 'e1' });
    expect(spec.steps[1].packet).toBeUndefined(); // unresolved packet dropped
  });

  test('rejects specs with too few steps', () => {
    expect(() => validateVisual({ kind: 'array', data: [1, 2], steps: [{ caption: 'only one' }] })).toThrow();
  });
});

describe('validateEditorial', () => {
  test('keeps only requested languages and caps steps', () => {
    const ed = validateEditorial({
      approach: 'Use a hashmap', steps: new Array(20).fill('step'),
      timeComplexity: 'O(n)', spaceComplexity: 'O(n)',
      solutionCode: { python: 'x=1', javascript: 'let x=1', ruby: 'x=1' },
      topics: ['hashmap'],
    }, ['python', 'javascript']);
    expect(Object.keys(ed.solutionCode).sort()).toEqual(['javascript', 'python']); // ruby dropped
    expect(ed.steps.length).toBeLessThanOrEqual(10);
    expect(ed.topics).toContain('hashmap');
  });
  test('throws without an approach', () => {
    expect(() => validateEditorial({ solutionCode: {} }, ['python'])).toThrow();
  });
});
