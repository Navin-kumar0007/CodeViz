const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const LearningProgress = require('../models/LearningProgress');
const Course = require('../models/Course');

const DIFF_ORDER = { easy: 0, medium: 1, hard: 2 };

/**
 * Build a per-user "weakness model" from submission history: for each topic /
 * category, how much they've attempted, solved, and their accuracy. Struggling
 * areas (attempted but low accuracy) rank above untouched gaps.
 */
async function computeWeaknesses(userId) {
  const subs = await Submission.find({ user: userId }).populate('problem', 'category topics difficulty');

  const byArea = {}; // area -> { attempts, acceptedProblems:Set, wrong }
  const touch = (area) => { if (!byArea[area]) byArea[area] = { attempts: 0, accepted: new Set(), wrong: 0 }; return byArea[area]; };

  for (const s of subs) {
    if (!s.problem) continue;
    const areas = [s.problem.category, ...(s.problem.topics || [])].filter(Boolean);
    for (const area of areas) {
      const a = touch(area);
      a.attempts += 1;
      if (s.verdict === 'accepted') a.accepted.add(String(s.problem._id));
      else a.wrong += 1;
    }
  }

  const struggling = Object.entries(byArea)
    .map(([name, a]) => ({ name, type: 'topic', attempts: a.attempts, solved: a.accepted.size, accuracy: Math.round((a.accepted.size / Math.max(1, a.attempts)) * 100) }))
    .filter((x) => x.attempts >= 2 && x.accuracy < 65)
    .sort((x, y) => x.accuracy - y.accuracy);

  // Gaps: categories that have problems but the user has never attempted.
  const allCategories = await Problem.distinct('category');
  const attempted = new Set(Object.keys(byArea));
  const gaps = allCategories
    .filter((c) => c && !attempted.has(c))
    .map((name) => ({ name, type: 'category', attempts: 0, solved: 0, accuracy: null }));

  return { struggling, gaps, byArea };
}

/**
 * Personalised focus plan: weak areas + targeted unsolved problems + the next
 * lesson to resume. Powers "it knows what you don't know".
 */
async function getFocusPlan(userId) {
  const { struggling, gaps } = await computeWeaknesses(userId);
  const weakAreas = [...struggling.slice(0, 3), ...gaps.slice(0, Math.max(0, 3 - struggling.length))].slice(0, 4);

  // Problems already solved (exclude from recommendations).
  const solvedIds = await Submission.find({ user: userId, verdict: 'accepted' }).distinct('problem');

  // Recommend unsolved problems targeting weak areas (category OR topic match).
  const areaNames = weakAreas.map((w) => w.name);
  let recommended = [];
  if (areaNames.length) {
    recommended = await Problem.find({
      _id: { $nin: solvedIds },
      $or: [{ category: { $in: areaNames } }, { topics: { $in: areaNames } }],
    }).select('title slug difficulty category topics').limit(20);
  }
  // Fall back to any unsolved problem if no weak-area match yet.
  if (recommended.length === 0) {
    recommended = await Problem.find({ _id: { $nin: solvedIds } }).select('title slug difficulty category topics').sort({ order: 1 }).limit(6);
  }
  recommended.sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1));
  const recommendedProblems = recommended.slice(0, 5).map((p) => ({
    title: p.title, slug: p.slug, difficulty: p.difficulty, category: p.category,
    reason: areaNames.includes(p.category) || (p.topics || []).some((t) => areaNames.includes(t))
      ? `Targets your weak area: ${(p.topics || []).find((t) => areaNames.includes(t)) || p.category}`
      : 'A good next step',
  }));

  // Next lesson to resume: first incomplete lesson across published courses.
  const progress = await LearningProgress.findOne({ userId });
  const pathProgress = progress ? Object.fromEntries(progress.pathProgress) : {};
  const courses = await Course.find({ published: true }).select('slug title category lessons.lessonId lessons.title').sort({ order: 1 });
  let nextLesson = null;
  for (const c of courses) {
    const done = new Set(pathProgress[c.slug]?.completed || []);
    const next = c.lessons.find((l) => !done.has(l.lessonId));
    if (next && done.size > 0) { nextLesson = { courseSlug: c.slug, courseTitle: c.title, lessonId: next.lessonId, lessonTitle: next.title }; break; }
  }
  // If nothing in-progress, suggest the first lesson of the first course.
  if (!nextLesson && courses[0]?.lessons[0]) {
    nextLesson = { courseSlug: courses[0].slug, courseTitle: courses[0].title, lessonId: courses[0].lessons[0].lessonId, lessonTitle: courses[0].lessons[0].title };
  }

  const summary = weakAreas.length
    ? (struggling.length
      ? `You're strongest elsewhere, but ${struggling[0].name} needs work (${struggling[0].accuracy}% accuracy). Focus here next.`
      : `You haven't explored ${gaps[0]?.name} yet — a good area to grow into.`)
    : 'Solve a few problems and this plan will personalise to your weak spots.';

  return { weakAreas, recommendedProblems, nextLesson, summary };
}

/**
 * Job-readiness score (0–100): a single, honest number derived entirely from real
 * signals, plus the highest-leverage things to improve it. Five weighted factors:
 *   volume     — how many distinct problems solved
 *   difficulty — weighted toward the mediums/hards interviews actually ask
 *   breadth    — how many core topic areas are covered
 *   accuracy   — distinct-solved / distinct-attempted
 *   retention  — spaced-repetition items held in good standing (ties in the Review loop)
 */
const READINESS_WEIGHTS = { volume: 0.25, difficulty: 0.25, breadth: 0.20, accuracy: 0.15, retention: 0.15 };

function readinessBand(score) {
  if (score >= 80) return 'Interview-ready';
  if (score >= 60) return 'Nearly there';
  if (score >= 40) return 'Building up';
  if (score >= 20) return 'Foundational';
  return 'Just starting';
}

async function computeReadiness(userId) {
  const ReviewItem = require('../models/ReviewItem');
  const [accepted, allSubs, allCats, tracked, retained] = await Promise.all([
    Submission.find({ user: userId, verdict: 'accepted' }).populate('problem', 'difficulty category').lean(),
    Submission.find({ user: userId }).select('problem').lean(),
    Problem.distinct('category'),
    ReviewItem.countDocuments({ user: userId }),
    ReviewItem.countDocuments({ user: userId, reps: { $gte: 2 } }),
  ]);

  const solvedIds = new Set();
  let easy = 0, medium = 0, hard = 0;
  const cats = new Set();
  for (const s of accepted) {
    if (!s.problem) continue;
    const id = String(s.problem._id);
    if (solvedIds.has(id)) continue;
    solvedIds.add(id);
    if (s.problem.difficulty === 'easy') easy += 1;
    else if (s.problem.difficulty === 'medium') medium += 1;
    else if (s.problem.difficulty === 'hard') hard += 1;
    if (s.problem.category) cats.add(s.problem.category);
  }
  const attemptedIds = new Set(allSubs.map((s) => String(s.problem)).filter(Boolean));
  const coreCats = allCats.filter(Boolean);
  const solvedCount = solvedIds.size;

  const raw = {
    volume: Math.min(1, solvedCount / 60),
    difficulty: Math.min(1, (medium * 2 + hard * 3) / 50),
    breadth: Math.min(1, cats.size / Math.max(1, Math.min(coreCats.length, 10))),
    accuracy: attemptedIds.size ? solvedIds.size / attemptedIds.size : 0,
    retention: tracked ? Math.min(1, retained / Math.max(8, tracked)) : 0,
  };
  const score = Math.round(100 * Object.entries(READINESS_WEIGHTS).reduce((sum, [k, w]) => sum + w * raw[k], 0));

  // Highest-leverage improvements: rank factors by (gap × weight), turn into advice.
  const uncovered = coreCats.filter((c) => !cats.has(c));
  const adviceFor = {
    difficulty: { label: 'Level up the difficulty', detail: `You've solved ${medium} medium + ${hard} hard. Interviews lean here — aim for more.` },
    breadth: { label: 'Broaden your coverage', detail: uncovered.length ? `Untouched areas: ${uncovered.slice(0, 3).join(', ')}.` : 'Keep spreading across topics.' },
    volume: { label: 'Build solving volume', detail: `${solvedCount} solved so far. Consistent reps compound fast.` },
    accuracy: { label: 'Tighten correctness', detail: `Your solve rate is ${Math.round(raw.accuracy * 100)}% of attempted problems.` },
    retention: { label: 'Lock it in with review', detail: tracked ? `${retained}/${tracked} problems are firmly retained.` : 'Start reviewing solved problems so they stick.' },
  };
  const levers = Object.keys(READINESS_WEIGHTS)
    .map((k) => ({ key: k, weightedGap: (1 - raw[k]) * READINESS_WEIGHTS[k], ...adviceFor[k] }))
    .filter((l) => l.weightedGap > 0.01)
    .sort((a, b) => b.weightedGap - a.weightedGap)
    .slice(0, 3)
    .map(({ key, label, detail }) => ({ key, label, detail }));

  return {
    score,
    band: readinessBand(score),
    signals: Object.fromEntries(Object.keys(raw).map((k) => [k, Math.round(raw[k] * 100)])),
    levers,
    solved: solvedCount,
    byDifficulty: { easy, medium, hard },
  };
}

module.exports = { computeWeaknesses, getFocusPlan, computeReadiness, readinessBand };
