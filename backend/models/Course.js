const mongoose = require('mongoose');

// A single lesson, embedded in a course. Heavy content blocks (explanation,
// quiz) are kept as Mixed to faithfully preserve the authored shape — the
// `explanation` blocks use a reserved `type` key that would otherwise collide
// with Mongoose's schema-type syntax.
const lessonSchema = new mongoose.Schema(
  {
    lessonId: { type: String, required: true }, // maps to the client's lesson `id`
    title: { type: String, default: '' },
    duration: { type: String, default: '' },
    explanation: { type: [mongoose.Schema.Types.Mixed], default: [] },
    keyConcepts: { type: [String], default: [] },
    code: { type: Map, of: String, default: {} },
    quiz: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // client `id`
    title: { type: String, default: '' },
    icon: { type: String, default: '📘' },
    category: { type: String, default: 'General', index: true },
    description: { type: String, default: '' },
    prerequisites: { type: [String], default: [] },
    difficulty: { type: String, default: '' },
    order: { type: Number, default: 0, index: true }, // preserves curriculum ordering
    published: { type: Boolean, default: true, index: true },
    aiGenerated: { type: Boolean, default: false },
    lessons: { type: [lessonSchema], default: [] },
  },
  { timestamps: true }
);

// Serialize a DB document back into the exact shape the frontend `COURSES`
// array uses. Quiz answer keys (`correct`, `explanation`) are stripped by
// default so they never reach the client — grading happens server-side via the
// quiz endpoint. Pass { withAnswers: true } only for trusted/admin contexts.
courseSchema.methods.toClientShape = function ({ withAnswers = false } = {}) {
  const sanitizeQuiz = (quiz) =>
    (quiz || []).map((q) => {
      if (withAnswers) return q;
      // eslint-disable-next-line no-unused-vars
      const { correct, explanation, ...safe } = q;
      return safe; // keep question + options only
    });

  return {
    id: this.slug,
    title: this.title,
    icon: this.icon,
    category: this.category,
    description: this.description,
    prerequisites: this.prerequisites || [],
    difficulty: this.difficulty || undefined,
    lessons: (this.lessons || []).map((l) => ({
      id: l.lessonId,
      title: l.title,
      duration: l.duration,
      explanation: l.explanation || [],
      keyConcepts: l.keyConcepts || [],
      code: l.code instanceof Map ? Object.fromEntries(l.code) : (l.code || {}),
      quiz: sanitizeQuiz(l.quiz),
    })),
  };
};

module.exports = mongoose.model('Course', courseSchema);
