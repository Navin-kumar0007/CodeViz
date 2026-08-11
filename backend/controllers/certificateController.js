const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');

const SECRET = process.env.CERT_SECRET || process.env.JWT_SECRET || 'codeviz-cert-secret';

function sign(payload) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 32);
}
function credentialPayload(c) {
  return `${c.userId}|${c.courseSlug}|${new Date(c.issueDate).getTime()}`;
}

/**
 * Issue a course-completion certificate — ONLY if the user has actually
 * completed every lesson. Idempotent (returns the existing one). Reused by the
 * endpoint and by the auto-issue hook on lesson completion.
 * @returns {{ certificate, issued: boolean } | { error }}
 */
async function issueForCourse(userId, slug) {
  const course = await Course.findOne({ slug, published: true });
  if (!course || course.lessons.length === 0) return { error: 'course-not-found' };

  const progress = await LearningProgress.findOne({ userId });
  const pdata = progress?.pathProgress?.get(slug);
  const completed = new Set(pdata?.completed || []);
  const allDone = course.lessons.every((l) => completed.has(l.lessonId));
  if (!allDone) return { error: 'not-complete', remaining: course.lessons.length - completed.size };

  const existing = await Certificate.findOne({ userId, courseSlug: slug });
  if (existing) return { certificate: existing, issued: false };

  // Average quiz score across the course's lessons (if any recorded).
  const scores = pdata?.quizScores instanceof Map ? [...pdata.quizScores.values()] : Object.values(pdata?.quizScores || {});
  const score = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const credentialId = `CV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const issueDate = new Date();
  const cert = new Certificate({
    userId, courseName: course.title, courseSlug: slug, credentialId, issueDate,
    score, lessonsCompleted: course.lessons.length, type: 'mastery',
  });
  cert.signature = sign(credentialPayload(cert));
  await cert.save();
  return { certificate: cert, issued: true };
}

// POST /api/certificates/course/:slug — claim a certificate for a completed course.
const claimForCourse = async (req, res) => {
  try {
    const result = await issueForCourse(req.user._id, req.params.slug);
    if (result.error === 'course-not-found') return res.status(404).json({ message: 'Course not found' });
    if (result.error === 'not-complete') return res.status(403).json({ message: `Complete all lessons first (${result.remaining} left).` });
    res.status(result.issued ? 201 : 200).json(result.certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/certificates/my
const getMy = async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user._id }).sort('-createdAt');
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
};

// GET /api/certificates/verify/:credentialId  (public)
const verify = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ credentialId: req.params.credentialId }).populate('userId', 'name');
    if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });
    const valid = cert.signature ? cert.signature === sign(credentialPayload(cert)) : true;
    res.json({
      valid,
      credentialId: cert.credentialId,
      holder: cert.userId?.name || 'Unknown',
      courseName: cert.courseName,
      score: cert.score,
      lessonsCompleted: cert.lessonsCompleted,
      type: cert.type,
      issueDate: cert.issueDate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification error' });
  }
};

module.exports = { issueForCourse, claimForCourse, getMy, verify, sign, credentialPayload };
