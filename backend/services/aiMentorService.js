const aiService = require('./aiService');
const geminiProvider = require('./geminiService');
const groqProvider = require('./groqService');
const ollamaProvider = require('./ollamaService');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

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

// --- AI course generation -------------------------------------------------

/** Clean, stable slug (no random suffix) so re-generation upserts in place. */
function courseSlug(topic) {
  return String(topic).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'course';
}

const DEFAULT_LANGS = ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust', 'c'];

function buildCoursePrompt({ topic, category, lessonCount, langs, difficulty }) {
  return `You are an expert curriculum designer for a coding-education platform.
Generate a COMPLETE, accurate, beginner-to-advanced course on: "${topic}".

Return ONLY valid minified JSON (no markdown fences, no prose) with this exact shape:
{
  "title": string,
  "icon": string (a single emoji),
  "category": ${JSON.stringify(category)},
  "difficulty": ${JSON.stringify(difficulty)},
  "description": string (1-2 sentences),
  "prerequisites": string[] (course slugs or []),
  "lessons": [
    {
      "id": string (kebab-case),
      "title": string,
      "duration": string (e.g. "6 min"),
      "explanation": [ { "type": "text" | "tip" | "warning", "content": string (may use **markdown** bold) } ],
      "keyConcepts": string[] (3-5 bullet strings),
      "code": { ${langs.map((l) => `"${l}": string`).join(', ')} },
      "quiz": [ { "question": string, "options": [string, string, string, string], "correct": integer 0-3, "explanation": string } ]
    }
  ]
}

Rules:
- Produce EXACTLY ${lessonCount} lessons, ordered from fundamentals to advanced.
- Each lesson: 2-4 explanation blocks, 3-5 keyConcepts, a runnable code sample in EACH requested language (${langs.join(', ')}), and 2-3 quiz questions.
- Code must be correct and idiomatic per language. "correct" is the 0-based index of the right option.
- Content must be technically accurate and current. No placeholders.`;
}

async function callLLM(prompt) {
  // Provider order is configurable. Set COURSE_GEN_PROVIDER=ollama to generate
  // entirely on a self-hosted local model (no external API, no quotas).
  const preferLocal = (process.env.COURSE_GEN_PROVIDER || '').toLowerCase() === 'ollama';
  const chain = preferLocal
    ? ['ollama', 'gemini', 'groq']
    : ['gemini', 'groq', 'ollama'];

  let lastError = null;
  for (const provider of chain) {
    try {
      let text = null;
      if (provider === 'gemini') text = await geminiProvider.generateResponse(prompt, null);
      else if (provider === 'groq') text = await groqProvider.generateGroqResponse(prompt);
      else if (provider === 'ollama') text = await ollamaProvider.generateOllamaResponse(prompt);
      if (text) return text;
    } catch (e) {
      lastError = e;
      console.warn(`Course-gen provider [${provider}] failed:`, e.message);
    }
  }
  throw new Error(`All AI providers failed for course generation. Last: ${lastError?.message || 'no output'}`);
}

function validateAndNormalize(raw, { topic, category, difficulty }) {
  if (!raw || !Array.isArray(raw.lessons) || raw.lessons.length === 0) {
    throw new Error('AI returned no lessons');
  }
  const lessons = raw.lessons
    .filter((l) => l && l.title && Array.isArray(l.explanation))
    .map((l, i) => {
      const quiz = (Array.isArray(l.quiz) ? l.quiz : [])
        .filter((q) => q && q.question && Array.isArray(q.options) && q.options.length >= 2)
        .map((q) => ({
          question: String(q.question),
          options: q.options.map(String),
          correct: Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length ? q.correct : 0,
          explanation: q.explanation ? String(q.explanation) : '',
        }));
      return {
        lessonId: courseSlug(l.id || l.title) + (i === 0 ? '' : `-${i}`),
        title: String(l.title),
        duration: l.duration || '6 min',
        explanation: l.explanation.filter((b) => b && b.content),
        keyConcepts: Array.isArray(l.keyConcepts) ? l.keyConcepts.map(String) : [],
        code: l.code && typeof l.code === 'object' ? l.code : {},
        quiz,
      };
    });
  if (lessons.length === 0) throw new Error('AI lessons failed validation');

  return {
    slug: courseSlug(raw.title || topic),
    title: raw.title || topic,
    icon: raw.icon || '📗',
    category: raw.category || category,
    description: raw.description || '',
    difficulty: raw.difficulty || difficulty,
    prerequisites: Array.isArray(raw.prerequisites) ? raw.prerequisites : [],
    lessons,
    aiGenerated: true,
  };
}

/**
 * Generate a full course via the AI orchestrator and upsert it into the Course
 * collection. Idempotent by slug. Returns the saved doc.
 */
async function generateCourse({ topic, category = 'General', lessonCount = 5, langs, difficulty = 'beginner' }) {
  const useLangs = Array.isArray(langs) && langs.length ? langs : DEFAULT_LANGS;
  const count = Math.min(Math.max(parseInt(lessonCount, 10) || 5, 2), 10);
  const prompt = buildCoursePrompt({ topic, category, lessonCount: count, langs: useLangs, difficulty });

  const text = await callLLM(prompt);
  const parsed = groqProvider.safeParseJson(text);
  const normalized = validateAndNormalize(parsed, { topic, category, difficulty });

  const saved = await Course.findOneAndUpdate(
    { slug: normalized.slug },
    { ...normalized, published: true, order: 8000 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return saved;
}

module.exports = { generateAndSaveProblems, reviewCode, recommendNext, generateCourse };
