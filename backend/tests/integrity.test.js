const { buildReport } = require('../services/integrityService');

// includeAiSignal:false keeps these pure (no network).
const mk = (integrity, code = 'x=1') => ({ _id: 's', code, language: 'python', integrity });

describe('integrityService.buildReport (authorship signals)', () => {
  test('mostly-typed submission looks original', async () => {
    const r = await buildReport(mk({ typedChars: 180, pastedChars: 5, keystrokes: 190, durationMs: 240000, pasteEvents: [{ size: 5, at: 1000 }] }), { includeAiSignal: false });
    expect(r.overall).toBe('looks-original');
    expect(r.authorship.typedPct).toBeGreaterThanOrEqual(90);
    expect(r.flags.some((f) => f.level === 'ok')).toBe(true);
  });

  test('mostly-pasted submission triggers review-suggested', async () => {
    const r = await buildReport(mk({ typedChars: 20, pastedChars: 400, keystrokes: 12, durationMs: 8000, pasteEvents: [{ size: 400, at: 2000 }] }), { includeAiSignal: false });
    expect(r.overall).toBe('review-suggested');
    expect(r.authorship.pastePct).toBeGreaterThanOrEqual(90);
    expect(r.authorship.biggestPaste).toBe(400);
    expect(r.flags.some((f) => f.level === 'high')).toBe(true);
  });

  test('no telemetry yields insufficient-data, never crashes', async () => {
    const r = await buildReport(mk(undefined), { includeAiSignal: false });
    expect(r.overall).toBe('insufficient-data');
    expect(r.authorship.typedPct).toBeNull();
    expect(r.disclaimer).toMatch(/not proof|not the sole/i);
  });
});
