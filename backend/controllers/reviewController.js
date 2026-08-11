const ReviewItem = require('../models/ReviewItem');
const reviewService = require('../services/reviewService');

const GRADES = ['again', 'hard', 'good', 'easy'];

// GET /api/review/due — the spaced-repetition queue that's due now + counts.
const getDue = async (req, res) => {
  try {
    const [items, c] = await Promise.all([
      reviewService.getDue(req.user._id),
      reviewService.counts(req.user._id),
    ]);
    res.json({ items, ...c });
  } catch (err) {
    console.error('getDue error:', err);
    res.status(500).json({ error: 'Could not load your review queue' });
  }
};

// POST /api/review/:problemId/grade { grade } — self-graded review outcome; reschedules.
const gradeItem = async (req, res) => {
  try {
    const { grade } = req.body;
    if (!GRADES.includes(grade)) return res.status(400).json({ error: 'Invalid grade' });
    const item = await ReviewItem.findOne({ user: req.user._id, problem: req.params.problemId });
    if (!item) return res.status(404).json({ error: 'Not in your review queue' });
    reviewService.schedule(item, grade);
    await item.save();
    const c = await reviewService.counts(req.user._id);
    res.json({ item, ...c });
  } catch (err) {
    console.error('gradeItem error:', err);
    res.status(500).json({ error: 'Could not save your review' });
  }
};

module.exports = { getDue, gradeItem };
