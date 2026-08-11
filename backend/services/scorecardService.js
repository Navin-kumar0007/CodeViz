// Deterministic, recruiter-style scorecard built from real interview signals — no AI
// dependency, so it always returns something honest. It reuses signals already on the
// session: whether tests passed, the per-problem submit score, the AI intuition score
// (computed at endSession), backtracking behaviour, and pace vs. the time limit.

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n) => Math.round(n);
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

const DIMENSIONS = {
  correctness: 'Correctness',
  approach: 'Approach & problem-solving',
  codeCraft: 'Code quality',
  composure: 'Composure & pace',
};

// Copy shown when a dimension is a strength / needs work.
const NOTES = {
  correctness: {
    good: 'Solutions passed the test suite — you ship working code under pressure.',
    bad: 'Several solutions failed tests. Drill edge cases and verify before submitting.',
  },
  approach: {
    good: 'Chose sound approaches quickly and translated them into code.',
    bad: 'Approaches were shaky. Talk through a plan and complexity before coding.',
  },
  codeCraft: {
    good: 'Clean, readable code that an interviewer can follow.',
    bad: 'Tighten naming, structure, and edge handling — small craft wins signal seniority.',
  },
  composure: {
    good: 'Steady pace with little backtracking — you stayed composed.',
    bad: 'A lot of backtracking / time pressure. Practice more reps to build fluency.',
  },
};

function hiringSignal(score) {
  if (score >= 85) return { rating: 'interview_ready', signal: 'Strong hire', blurb: 'You would clear a real screen at this level.' };
  if (score >= 72) return { rating: 'excellent', signal: 'Hire', blurb: 'Solid, hireable performance with minor gaps.' };
  if (score >= 58) return { rating: 'solid', signal: 'Lean hire', blurb: 'Close — a bit more polish tips this over.' };
  if (score >= 40) return { rating: 'getting_there', signal: 'Lean no-hire', blurb: 'Real progress, but not consistent yet.' };
  return { rating: 'needs_practice', signal: 'No hire (yet)', blurb: 'Keep reps up — this is where everyone starts.' };
}

function buildScorecard(session) {
  const results = session.results || [];
  const problems = session.problems || [];
  const n = Math.max(1, problems.length);
  const byId = (id) => problems.find((p) => p.id === id) || {};

  const solved = results.filter((r) => r.passed).length;
  const solveRate = solved / n;
  const avgScore = mean(results.map((r) => r.score || 0));
  const scoredIntuition = results.filter((r) => typeof r.intuitionScore === 'number' && r.intuitionScore > 0);
  const avgIntuition = scoredIntuition.length ? mean(scoredIntuition.map((r) => r.intuitionScore)) : 50; // neutral if unscored
  const totalBacktracks = results.reduce((s, r) => s + (r.struggleTokens?.backtrackCount || 0), 0);

  const timeUsedMin = session.completedAt && session.startedAt
    ? (new Date(session.completedAt) - new Date(session.startedAt)) / 60000
    : 0;
  const timeLimit = session.timeLimit || 60;
  const timeRatio = timeUsedMin / timeLimit; // <1 finished early
  // Composure: penalise heavy backtracking and going over time.
  const composure = clamp(100 - totalBacktracks * 7 - Math.max(0, timeRatio - 0.85) * 120);

  // Reward tackling harder problems, not just clearing easies.
  const diffWeight = results.reduce((s, r) => {
    if (!r.passed) return s;
    const d = byId(r.problemId).difficulty;
    return s + (d === 'hard' ? 1 : d === 'medium' ? 0.7 : 0.4);
  }, 0);
  const depth = clamp((diffWeight / n) * 120);

  const rubric = {
    correctness: round(clamp(solveRate * 100)),
    approach: round(clamp(0.6 * avgScore + 0.4 * depth)),
    codeCraft: round(clamp(0.7 * avgIntuition + 0.3 * solveRate * 100)),
    composure: round(composure),
  };

  // Overall leans on correctness + approach (what interviewers weight most).
  const overall = round(clamp(
    0.35 * rubric.correctness + 0.3 * rubric.approach + 0.2 * rubric.codeCraft + 0.15 * rubric.composure,
  ));

  const ranked = Object.keys(rubric).sort((a, b) => rubric[b] - rubric[a]);
  const strengths = ranked.filter((k) => rubric[k] >= 60).slice(0, 2)
    .map((k) => ({ key: k, label: DIMENSIONS[k], score: rubric[k], note: NOTES[k].good }));
  const improvements = [...ranked].reverse().filter((k) => rubric[k] < 75).slice(0, 2)
    .map((k) => ({ key: k, label: DIMENSIONS[k], score: rubric[k], note: NOTES[k].bad }));

  const { rating, signal, blurb } = hiringSignal(overall);

  // Weave in the best AI per-problem analysis, if endSession produced one.
  const aiNote = results.map((r) => r.aiAnalysis).find((a) => a && a.length > 20 && !/fallback/i.test(a)) || null;

  return {
    overall,
    signal,
    signalBlurb: blurb,
    rating,
    rubric: Object.keys(rubric).map((k) => ({ key: k, label: DIMENSIONS[k], score: rubric[k] })),
    strengths,
    improvements: improvements.length ? improvements : [{ key: 'depth', label: 'Push harder problems', score: overall, note: 'Take on more medium/hard problems to stretch your ceiling.' }],
    stats: {
      solved,
      total: problems.length,
      avgScore: round(avgScore),
      timeUsedMin: round(timeUsedMin),
      timeLimit,
      backtracks: totalBacktracks,
    },
    aiNote,
  };
}

module.exports = { buildScorecard, hiringSignal, DIMENSIONS };
