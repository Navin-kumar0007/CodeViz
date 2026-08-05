const aiService = require('./aiService');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

/** URL-safe slug from a title, with a short suffix to avoid collisions. */
function slugify(title) {
  const base = String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return `${base || 'problem'}-ai${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Generate `count` problems at a difficulty via the AI orchestrator and persist
 * them to the Problem bank (marked aiGenerated). Fills the content-depth gap
 * with on-demand, personalised problems. Returns the saved docs.
 */
async function generateAndSaveProblems({ difficulty = 'medium', count = 1, userId }) {
  const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 3);
  const raw = await aiService.generateInterviewProblems(difficulty, n, userId);
  const list = Array.isArray(raw) ? raw : [raw];

  const saved = [];
  for (const p of list) {
    if (!p?.title || !p?.description) continue;
    const starter = typeof p.starterCode === 'string' ? { python: p.starterCode } : (p.starterCode || {});
    const testCases = (p.testCases || []).map((tc) => ({
      input: String(tc.input ?? ''),
      expectedOutput: String(tc.expectedOutput ?? tc.output ?? ''),
      isHidden: false,
    }));
    const doc = await Problem.create({
      title: p.title,
      slug: slugify(p.title),
      difficulty: ['easy', 'medium', 'hard'].includes(p.difficulty) ? p.difficulty : difficulty,
      category: p.category || 'general',
      description: p.description,
      constraints: p.constraints || [],
      examples: testCases.slice(0, 2).map((tc) => ({ input: tc.input, output: tc.expectedOutput })),
      testCases,
      starterCode: starter,
      hints: p.hints || [],
      companyTags: p.companies || [],
      aiGenerated: true,
      generatedFor: userId,
      order: 9000 + Math.floor(Math.random() * 1000),
    });
    saved.push(doc);
  }
  return saved;
}

/** Deep AI code review via the rubric reviewer. */
async function reviewCode({ code, language, userId, skillLevel = 'intermediate' }) {
  return aiService.rubricReview(code, language, userId, skillLevel, 'standard');
}

/**
 * Data-driven "what next" recommendation: looks at the user's accepted
 * submissions to gauge level, then picks an unsolved problem at the right
 * difficulty (with a short human rationale).
 */
async function recommendNext({ userId }) {
  const solved = await Submission.find({ user: userId, verdict: 'accepted' }).distinct('problem');
  const solvedCount = solved.length;
  const nextDifficulty = solvedCount < 5 ? 'easy' : solvedCount < 20 ? 'medium' : 'hard';

  const order = ['easy', 'medium', 'hard'];
  let problem = null;
  for (let i = order.indexOf(nextDifficulty); i < order.length && !problem; i++) {
    problem = await Problem.findOne({ _id: { $nin: solved }, difficulty: order[i] }).sort({ order: 1 });
  }
  if (!problem) problem = await Problem.findOne({ _id: { $nin: solved } }).sort({ order: 1 });

  if (!problem) {
    return { problem: null, solvedCount, reason: "You've solved everything available — generate a fresh AI problem to keep going." };
  }
  const reason = solvedCount === 0
    ? 'A gentle starter to build momentum.'
    : `You've solved ${solvedCount} problem${solvedCount === 1 ? '' : 's'}. This ${problem.difficulty} ${String(problem.category).replace(/_/g, ' ')} problem is your next step up.`;

  return {
    reason,
    solvedCount,
    problem: {
      _id: problem._id, title: problem.title, slug: problem.slug,
      difficulty: problem.difficulty, category: problem.category,
    },
  };
}

module.exports = { generateAndSaveProblems, reviewCode, recommendNext };
