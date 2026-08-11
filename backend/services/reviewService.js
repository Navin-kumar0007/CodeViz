const ReviewItem = require('../models/ReviewItem');

const DAY = 24 * 60 * 60 * 1000;
const clampEase = (e) => Math.max(1.3, Math.min(2.8, e));

// SM-2 lite. Mutates the item's ease/interval/reps/dueAt for the given self-grade
// and returns it. `again` = forgot → resurfaces the same day; the rest push the next
// review further out, scaled by the item's ease factor.
function schedule(item, grade) {
  const now = Date.now();
  if (grade === 'again') {
    item.ease = clampEase(item.ease - 0.2);
    item.reps = 0;
    item.lapses += 1;
    item.intervalDays = 0;
    item.dueAt = new Date(now + 6 * 60 * 60 * 1000); // ~later today
  } else {
    item.reps += 1;
    if (grade === 'hard') {
      item.ease = clampEase(item.ease - 0.15);
      item.intervalDays = item.reps <= 1 ? 1 : Math.max(1, Math.round(item.intervalDays * 1.2));
    } else if (grade === 'easy') {
      item.ease = clampEase(item.ease + 0.15);
      item.intervalDays = item.reps <= 1 ? 2 : Math.round(Math.max(1, item.intervalDays) * item.ease * 1.3);
    } else { // good
      item.intervalDays = item.reps <= 1 ? 1 : item.reps === 2 ? 3 : Math.round(Math.max(1, item.intervalDays) * item.ease);
    }
    item.dueAt = new Date(now + item.intervalDays * DAY);
  }
  item.lastGrade = grade;
  item.lastReviewedAt = new Date(now);
  return item;
}

// Called from the submission pipeline. A solved problem enters (or advances in) the
// review queue; a failed attempt only counts as a lapse if the problem was already
// being reviewed (pre-first-solve failures are just normal practice, not review noise).
async function recordAttempt({ userId, problemId, accepted }) {
  let item = await ReviewItem.findOne({ user: userId, problem: problemId });
  if (accepted) {
    if (!item) item = new ReviewItem({ user: userId, problem: problemId });
    schedule(item, 'good');
    await item.save();
    return item;
  }
  if (item) { // failed a problem already in review → lapse
    schedule(item, 'again');
    await item.save();
  }
  return item;
}

// Everything due now (oldest-due first), with the problem populated for the queue UI.
async function getDue(userId, limit = 50) {
  return ReviewItem.find({ user: userId, dueAt: { $lte: new Date() } })
    .sort({ dueAt: 1 })
    .limit(limit)
    .populate('problem', 'title slug difficulty category')
    .lean();
}

async function counts(userId) {
  const now = new Date();
  const [due, total] = await Promise.all([
    ReviewItem.countDocuments({ user: userId, dueAt: { $lte: now } }),
    ReviewItem.countDocuments({ user: userId }),
  ]);
  return { due, total };
}

module.exports = { schedule, recordAttempt, getDue, counts, clampEase };
