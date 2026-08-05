const mentor = require('../services/aiMentorService');

/** POST /api/ai/generate-problem { difficulty, count } — AI-generated, saved problems. */
const generateProblem = async (req, res) => {
  try {
    const { difficulty, count } = req.body || {};
    const problems = await mentor.generateAndSaveProblems({ difficulty, count, userId: req.user._id });
    if (!problems.length) return res.status(502).json({ message: 'AI could not produce a valid problem. Try again.' });
    res.json({ count: problems.length, problems });
  } catch (err) {
    console.error('generateProblem error:', err.message);
    res.status(500).json({ message: 'Failed to generate a problem.' });
  }
};

/** POST /api/ai/mentor/review { code, language, skillLevel } — deep AI code review. */
const mentorReview = async (req, res) => {
  try {
    const { code, language, skillLevel } = req.body || {};
    if (!code || !language) return res.status(400).json({ message: 'code and language are required.' });
    const review = await mentor.reviewCode({ code, language, userId: req.user._id, skillLevel });
    res.json(typeof review === 'string' ? { review } : review);
  } catch (err) {
    console.error('mentorReview error:', err.message);
    res.status(500).json({ message: 'Failed to review code.' });
  }
};

/** GET /api/ai/mentor/next — personalized "what to solve next". */
const mentorNext = async (req, res) => {
  try {
    const rec = await mentor.recommendNext({ userId: req.user._id });
    res.json(rec);
  } catch (err) {
    console.error('mentorNext error:', err.message);
    res.status(500).json({ message: 'Failed to get a recommendation.' });
  }
};

module.exports = { generateProblem, mentorReview, mentorNext };
