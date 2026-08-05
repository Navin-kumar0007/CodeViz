const { safeParseJson } = require('../services/groqService');

describe('safeParseJson (LLM JSON recovery)', () => {
  test('strips markdown fences and parses', () => {
    const out = safeParseJson('```json\n{"a":1}\n```');
    expect(out).toEqual({ a: 1 });
  });

  test('escapes raw newlines/tabs inside string literals', () => {
    const broken = '[{"title":"X","starterCode":"def f():\n\treturn 1\n"}]';
    const out = safeParseJson(broken);
    expect(out[0].title).toBe('X');
    expect(out[0].starterCode).toContain('\n'); // preserved as real newline
    expect(out[0].starterCode).toContain('def f()');
  });

  test('isolates JSON body from surrounding prose', () => {
    const out = safeParseJson('Sure! Here you go:\n{"ok":true}\nHope that helps.');
    expect(out).toEqual({ ok: true });
  });

  test('throws on non-JSON garbage', () => {
    expect(() => safeParseJson('completely not json at all')).toThrow();
  });
});
