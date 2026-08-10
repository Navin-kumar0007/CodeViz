const Contest = require('../models/Contest');
const ContestEntry = require('../models/ContestEntry');

const POINTS = { easy: 100, medium: 200, hard: 300 };

/**
 * Record an accepted contest submission. Idempotent per problem: points are
 * awarded once, on the first accept, and only while the contest is live and the
 * problem belongs to it. Safe to call for any submission (no-ops otherwise).
 */
async function recordSolve({ userId, contestSlug, problem }) {
  if (!contestSlug || !problem) return null;
  const contest = await Contest.findOne({ slug: contestSlug, published: true });
  if (!contest) return null;
  if (contest.status !== 'live') return null;
  if (!contest.problems.some((p) => String(p) === String(problem._id))) return null;

  let entry = await ContestEntry.findOne({ contest: contest._id, user: userId });
  if (!entry) entry = new ContestEntry({ contest: contest._id, user: userId, solved: [], score: 0 });

  if (entry.solved.some((s) => String(s.problem) === String(problem._id))) return entry; // already scored

  const points = POINTS[problem.difficulty] || 100;
  const now = new Date();
  entry.solved.push({ problem: problem._id, points, solvedAt: now });
  entry.score += points;
  entry.lastSolveAt = now;
  await entry.save();
  return entry;
}

/** Ranked leaderboard: score desc, then earliest last-solve. */
async function leaderboard(contestId, limit = 100) {
  const entries = await ContestEntry.find({ contest: contestId })
    .populate('user', 'name')
    .sort({ score: -1, lastSolveAt: 1 })
    .limit(limit);
  return entries.map((e, i) => ({
    rank: i + 1,
    user: e.user?.name || 'Anonymous',
    userId: e.user?._id,
    score: e.score,
    solvedCount: e.solved.length,
    lastSolveAt: e.lastSolveAt,
  }));
}

module.exports = { recordSolve, leaderboard, POINTS };
