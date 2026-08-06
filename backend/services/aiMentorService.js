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

// --- AI visual (concept animation) generation ----------------------------

function buildVisualPrompt({ courseTitle, lessonTitle, summary }) {
  return `You are creating an ANIMATED explanation for a coding lesson.
Course: "${courseTitle}". Lesson: "${lessonTitle}".
Concept summary: ${summary || lessonTitle}

Choose the best animation type and return ONLY minified JSON (no markdown, no prose).

If the concept is about an ARRAY, STACK, or QUEUE (data moving), use:
{
 "kind":"array"|"stack"|"queue",
 "title": string,
 "data": number[] (array kind only; 5-7 DISTINCT small integers),
 "moveByValue": boolean (true only if elements physically swap/reorder),
 "steps":[ {
   "caption": string,
   "array": number[] (array kind, full state at this step; distinct ints),
   "stack": (number|string)[] (stack kind, bottom→top),
   "queue": (number|string)[] (queue kind, front→back),
   "pointers": { "name": index },
   "compare": index[], "highlight": index[], "dim": index[], "done": index[]
 } ]  (4-8 steps)
}

If the concept is ABSTRACT (systems, flow, process, security, networking, protocols), use a DIAGRAM:
{
 "kind":"diagram",
 "title": string,
 "nodes":[ {"id":string,"label":string,"sub"?:string,"icon"?:string,"x":0-600,"y":0-260} ]  (3-6 nodes; x,y are CENTRE coords),
 "edges":[ {"id":string,"from":nodeId,"to":nodeId,"label"?:string} ],
 "steps":[ {"caption":string,"activeNodes":nodeId[],"activeEdges":edgeId[],"dimNodes":nodeId[],"packet":{"edge":edgeId},"show":id[]} ]  (4-6 steps)
}

Rules: valid JSON only. All indices within array bounds. All edge from/to and packet.edge must reference ids that exist. Keep it accurate and clear. Prefer arrays/stack/queue for data-structure topics, diagram for everything conceptual.`;
}

const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));

function validateVisual(spec) {
  if (!spec || typeof spec !== 'object') throw new Error('not an object');
  const kind = spec.kind;
  const steps = Array.isArray(spec.steps) ? spec.steps.filter((s) => s && typeof s.caption === 'string') : [];
  if (steps.length < 2) throw new Error('needs >= 2 steps');

  if (kind === 'array') {
    const data = Array.isArray(spec.data) ? spec.data.map(Number).filter((x) => Number.isFinite(x)) : [];
    if (data.length < 2) throw new Error('array kind needs data');
    const inRange = (idxArr, len) => Array.isArray(idxArr) ? idxArr.map(Number).filter((i) => Number.isInteger(i) && i >= 0 && i < len) : undefined;
    const cleanSteps = steps.map((s) => {
      const arr = Array.isArray(s.array) ? s.array.map(Number).filter((x) => Number.isFinite(x)) : undefined;
      const len = (arr && arr.length) || data.length;
      const ptr = s.pointers && typeof s.pointers === 'object'
        ? Object.fromEntries(Object.entries(s.pointers).filter(([, v]) => Number.isInteger(v) && v >= 0 && v < len))
        : undefined;
      return { caption: s.caption, array: arr, pointers: ptr, compare: inRange(s.compare, len), highlight: inRange(s.highlight, len), dim: inRange(s.dim, len), done: inRange(s.done, len) };
    });
    return { kind, title: spec.title || '', data, moveByValue: !!spec.moveByValue, steps: cleanSteps };
  }

  if (kind === 'stack' || kind === 'queue') {
    const field = kind;
    const cleanSteps = steps.map((s) => ({ caption: s.caption, [field]: Array.isArray(s[field]) ? s[field] : [] }));
    return { kind, title: spec.title || '', steps: cleanSteps };
  }

  if (kind === 'diagram') {
    const nodes = (Array.isArray(spec.nodes) ? spec.nodes : [])
      .filter((n) => n && n.id && n.label)
      .map((n) => ({ id: String(n.id), label: String(n.label), sub: n.sub, icon: n.icon, x: clampInt(n.x, 30, 570), y: clampInt(n.y, 30, 230), w: n.w }));
    if (nodes.length < 2) throw new Error('diagram needs >= 2 nodes');
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = (Array.isArray(spec.edges) ? spec.edges : [])
      .filter((e) => e && e.id && nodeIds.has(e.from) && nodeIds.has(e.to))
      .map((e) => ({ id: String(e.id), from: e.from, to: e.to, label: e.label, dashed: !!e.dashed }));
    const edgeIds = new Set(edges.map((e) => e.id));
    const filterIds = (arr, set) => Array.isArray(arr) ? arr.filter((x) => set.has(x)) : undefined;
    const cleanSteps = steps.map((s) => ({
      caption: s.caption,
      activeNodes: filterIds(s.activeNodes, nodeIds),
      dimNodes: filterIds(s.dimNodes, nodeIds),
      activeEdges: filterIds(s.activeEdges, edgeIds),
      show: Array.isArray(s.show) ? s.show.filter((x) => nodeIds.has(x)) : undefined,
      packet: s.packet && edgeIds.has(s.packet.edge) ? { edge: s.packet.edge } : undefined,
    }));
    return { kind, title: spec.title || '', nodes, edges, steps: cleanSteps };
  }

  throw new Error(`unknown kind: ${kind}`);
}

/**
 * Generate a validated concept-animation spec for a lesson via the AI
 * orchestrator. Returns the spec (does not save).
 */
async function generateVisual({ courseTitle, lessonTitle, summary }) {
  const prompt = buildVisualPrompt({ courseTitle, lessonTitle, summary });
  const text = await callLLM(prompt);
  const parsed = groqProvider.safeParseJson(text);
  return validateVisual(parsed);
}

module.exports = { generateAndSaveProblems, reviewCode, recommendNext, generateCourse, generateVisual };
