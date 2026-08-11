const { buildScorecard, hiringSignal } = require('../services/scorecardService');

const problem = (id, difficulty) => ({ id, difficulty, title: `P${id}`, category: 'arrays' });

const strongSession = {
  timeLimit: 60,
  startedAt: new Date(Date.now() - 30 * 60000), // finished in 30 of 60 min
  completedAt: new Date(),
  problems: [problem('a', 'medium'), problem('b', 'hard'), problem('c', 'easy')],
  results: [
    { problemId: 'a', passed: true, score: 95, intuitionScore: 88, timeTaken: 600, struggleTokens: { backtrackCount: 0 } },
    { problemId: 'b', passed: true, score: 90, intuitionScore: 85, timeTaken: 700, struggleTokens: { backtrackCount: 1 } },
    { problemId: 'c', passed: true, score: 100, intuitionScore: 90, timeTaken: 300, struggleTokens: { backtrackCount: 0 } },
  ],
};

const weakSession = {
  timeLimit: 60,
  startedAt: new Date(Date.now() - 62 * 60000), // ran over time
  completedAt: new Date(),
  problems: [problem('a', 'easy'), problem('b', 'medium'), problem('c', 'hard')],
  results: [
    { problemId: 'a', passed: false, score: 20, intuitionScore: 30, timeTaken: 1200, struggleTokens: { backtrackCount: 6 } },
    { problemId: 'b', passed: false, score: 10, intuitionScore: 25, timeTaken: 1500, struggleTokens: { backtrackCount: 8 } },
    { problemId: 'c', passed: false, score: 0, intuitionScore: 20, timeTaken: 900, struggleTokens: { backtrackCount: 4 } },
  ],
};

describe('scorecardService.buildScorecard', () => {
  test('strong performance → high overall + hire signal + strengths', () => {
    const sc = buildScorecard(strongSession);
    expect(sc.overall).toBeGreaterThanOrEqual(80);
    expect(['Strong hire', 'Hire']).toContain(sc.signal);
    expect(sc.rubric).toHaveLength(4);
    expect(sc.rubric.every((d) => d.score >= 0 && d.score <= 100)).toBe(true);
    expect(sc.strengths.length).toBeGreaterThan(0);
    expect(sc.stats.solved).toBe(3);
  });

  test('weak performance → low overall + no-hire signal + improvements', () => {
    const sc = buildScorecard(weakSession);
    expect(sc.overall).toBeLessThan(45);
    expect(sc.signal).toMatch(/no.hire/i);
    expect(sc.improvements.length).toBeGreaterThan(0);
    expect(sc.stats.solved).toBe(0);
  });

  test('correctness tracks solve rate', () => {
    const sc = buildScorecard(strongSession);
    const correctness = sc.rubric.find((d) => d.key === 'correctness');
    expect(correctness.score).toBe(100); // all 3 passed
  });

  test('rubric scores never leave 0–100 even with extreme backtracks', () => {
    const sc = buildScorecard(weakSession);
    for (const d of sc.rubric) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(100);
    }
  });

  test('handles an empty session without throwing', () => {
    const sc = buildScorecard({ problems: [], results: [] });
    expect(sc.overall).toBeGreaterThanOrEqual(0);
    expect(sc.rubric).toHaveLength(4);
  });

  test('hiringSignal bands are monotonic', () => {
    expect(hiringSignal(90).signal).toBe('Strong hire');
    expect(hiringSignal(30).signal).toMatch(/no.hire/i);
  });
});
