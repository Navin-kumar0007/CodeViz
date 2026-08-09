const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const gamificationService = require('../services/gamificationService');
const aiMentorService = require('../services/aiMentorService');

const XP_PER_LESSON = 20; // authoritative reward for completing a lesson

// Find a lesson's raw (answer-bearing) doc inside a course.
async function findLesson(slug, lessonId) {
  const course = await Course.findOne({ slug, published: true });
  if (!course) return { course: null, lesson: null };
  const lesson = (course.lessons || []).find((l) => l.lessonId === lessonId);
  return { course, lesson };
}

async function getOrCreateProgress(userId) {
  let progress = await LearningProgress.findOne({ userId });
  if (!progress) progress = new LearningProgress({ userId, pathProgress: {}, achievements: [] });
  return progress;
}

// GET /api/courses — all published courses in curriculum order, full content.
// Returns the client-shaped array so the frontend can use it exactly like the
// former bundled COURSES constant.
const listCourses = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { published: true };
    if (category) filter.category = category;
    const courses = await Course.find(filter).sort({ order: 1 });
    res.json(courses.map((c) => c.toClientShape()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/courses/:slug — one full course.
const getCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, published: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course.toClientShape());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/courses/meta/list — lightweight catalog (no lesson bodies), for menus.
const listCourseMeta = async (req, res) => {
  try {
    const courses = await Course.find({ published: true })
      .select('slug title icon category description prerequisites difficulty order lessons.lessonId lessons.title lessons.duration')
      .sort({ order: 1 });
    res.json(
      courses.map((c) => ({
        id: c.slug,
        title: c.title,
        icon: c.icon,
        category: c.category,
        description: c.description,
        prerequisites: c.prerequisites || [],
        difficulty: c.difficulty || undefined,
        lessonCount: c.lessons.length,
        lessons: c.lessons.map((l) => ({ id: l.lessonId, title: l.title, duration: l.duration })),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/courses/:slug/lessons/:lessonId/quiz  { answers: [index,...] }
// Grades server-side against the stored answer key. Records the best score in
// the user's LearningProgress (the ONLY writer of quiz scores — the client can
// no longer inflate them). Returns per-question results for feedback.
const gradeQuiz = async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    const { lesson } = await findLesson(slug, lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const quiz = lesson.quiz || [];
    if (quiz.length === 0) return res.status(400).json({ message: 'This lesson has no quiz' });

    let correctCount = 0;
    const results = quiz.map((q, i) => {
      const picked = answers[i];
      const isCorrect = picked === q.correct;
      if (isCorrect) correctCount += 1;
      return { correct: isCorrect, correctIndex: q.correct, explanation: q.explanation || '' };
    });
    const score = Math.round((correctCount / quiz.length) * 100);

    // Persist best score (server-authoritative)
    const progress = await getOrCreateProgress(req.user._id);
    const existing = progress.pathProgress.get(slug) || { completed: [], quizScores: new Map() };
    const scores = existing.quizScores instanceof Map ? existing.quizScores : new Map(Object.entries(existing.quizScores || {}));
    scores.set(lessonId, Math.max(scores.get(lessonId) || 0, score));
    progress.pathProgress.set(slug, { completed: existing.completed || [], quizScores: scores });
    progress.calculateTotalScore();
    await progress.save();

    res.json({ score, correctCount, total: quiz.length, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/courses/:slug/lessons/:lessonId/complete
// Authoritatively marks a lesson complete and awards XP + streak exactly once.
// Idempotent: re-completing awards nothing.
const completeLesson = async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    const { lesson } = await findLesson(slug, lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const progress = await getOrCreateProgress(req.user._id);
    const existing = progress.pathProgress.get(slug) || { completed: [], quizScores: new Map() };
    const completed = new Set(existing.completed || []);
    const alreadyCompleted = completed.has(lessonId);

    let xpAwarded = 0;
    let xpState = null;
    let streakState = null;
    if (!alreadyCompleted) {
      completed.add(lessonId);
      progress.pathProgress.set(slug, {
        completed: [...completed],
        quizScores: existing.quizScores instanceof Map ? existing.quizScores : new Map(Object.entries(existing.quizScores || {})),
      });
      progress.calculateTotalScore();
      await progress.save();

      xpAwarded = XP_PER_LESSON;
      xpState = await gamificationService.addXP(req.user._id, xpAwarded);
      streakState = (await gamificationService.updateStreak(req.user._id)).streak;
    }

    // Auto-issue a course certificate when the final lesson is completed.
    let certificate = null;
    try {
      const { issueForCourse } = require('../services/../controllers/certificateController');
      const result = await issueForCourse(req.user._id, slug);
      if (result.issued) certificate = { credentialId: result.certificate.credentialId, courseName: result.certificate.courseName };
    } catch { /* certificate is best-effort */ }

    res.json({
      completed: true,
      alreadyCompleted,
      xpAwarded,
      xp: xpState?.xp,
      level: xpState?.level,
      streak: streakState,
      lessonsCompleted: progress.lessonsCompleted,
      certificate, // set only when this completion finished the whole course
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/courses/generate  (admin)  { topic, category, lessonCount, langs, difficulty }
// Generates a full course via the AI orchestrator and upserts it. Slow (LLM).
const generateCourse = async (req, res) => {
  try {
    const { topic, category, lessonCount, langs, difficulty } = req.body || {};
    if (!topic) return res.status(400).json({ message: 'topic is required' });
    const course = await aiMentorService.generateCourse({ topic, category, lessonCount, langs, difficulty });
    res.status(201).json({ slug: course.slug, title: course.title, lessons: course.lessons.length });
  } catch (error) {
    res.status(502).json({ message: `Course generation failed: ${error.message}` });
  }
};

// POST /api/courses/:slug/lessons/:lessonId/visual/generate  (admin)
// Generates an animated concept spec for the lesson and saves it. LLM-backed.
const generateLessonVisual = async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    const course = await Course.findOne({ slug });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const lesson = course.lessons.find((l) => l.lessonId === lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const summary = (lesson.explanation || []).map((b) => b?.content).filter(Boolean).slice(0, 2).join(' ');
    const spec = await aiMentorService.generateVisual({ courseTitle: course.title, lessonTitle: lesson.title, summary });
    lesson.visual = spec;
    course.markModified('lessons');
    await course.save();
    res.status(201).json({ slug, lessonId, kind: spec.kind, steps: spec.steps.length });
  } catch (error) {
    res.status(502).json({ message: `Visual generation failed: ${error.message}` });
  }
};

module.exports = { listCourses, getCourse, listCourseMeta, gradeQuiz, completeLesson, generateCourse, generateLessonVisual };
