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

module.exports = { computeWeaknesses, getFocusPlan };
