const Submission = require('../models/Submission');
const { buildReport } = require('../services/integrityService');

// GET /api/integrity/submission/:id
// Owner (self-check) or instructor/admin may view. Returns the fused report.
const getSubmissionReport = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('problem', 'title slug difficulty');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const isOwner = String(submission.user) === String(req.user._id);
    const isStaff = ['instructor', 'admin'].includes(req.user.role);
    if (!isOwner && !isStaff) return res.status(403).json({ message: 'Not authorized' });

    const report = await buildReport(submission, { includeAiSignal: true });
    res.json({ ...report, problem: submission.problem, user: submission.user, createdAt: submission.createdAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/integrity/recent  (instructor/admin)
// Lightweight list of recent submissions with quick authorship flags — no AI
// call per row (fast). Instructors drill into one for the full report.
const getRecent = async (req, res) => {
  try {
    if (!['instructor', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Instructor access only' });
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const subs = await Submission.find({ 'integrity.typedChars': { $exists: true } })
      .sort({ createdAt: -1 }).limit(limit)
      .populate('user', 'name email').populate('problem', 'title slug');

    const rows = subs.map((s) => {
      const i = s.integrity || {};
      const total = (i.typedChars || 0) + (i.pastedChars || 0);
      const pastePct = total ? Math.round(((i.pastedChars || 0) / total) * 100) : null;
      const biggest = (i.pasteEvents || []).reduce((m, p) => Math.max(m, p.size || 0), 0);
      const flag = (pastePct >= 70 || biggest >= 300) ? 'high' : (pastePct >= 40 || biggest >= 120) ? 'medium' : 'ok';
      return {
        submissionId: s._id,
        user: s.user, problem: s.problem, verdict: s.verdict, createdAt: s.createdAt,
        pastePct, biggestPaste: biggest, flag,
      };
    });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSubmissionReport, getRecent };
