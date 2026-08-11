const Contest = require('../models/Contest');
const ContestEntry = require('../models/ContestEntry');
const { leaderboard } = require('../services/contestService');

// GET /api/contests — list (upcoming/live/past), no problems.
const listContests = async (req, res) => {
  try {
    const contests = await Contest.find({ published: true }).sort({ startAt: -1 }).select('-problems');
    res.json(contests.map((c) => ({
      title: c.title, slug: c.slug, description: c.description,
      startAt: c.startAt, endAt: c.endAt, status: c.status,
    })));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// GET /api/contests/:slug — detail. Problems shown only once the contest is live/ended.
const getContest = async (req, res) => {
  try {
    const c = await Contest.findOne({ slug: req.params.slug, published: true })
      .populate('problems', 'title slug difficulty');
    if (!c) return res.status(404).json({ message: 'Contest not found' });

    let registered = false;
    let myScore = null;
    if (req.user?._id) {
      const entry = await ContestEntry.findOne({ contest: c._id, user: req.user._id });
      registered = !!entry;
      myScore = entry ? { score: entry.score, solved: entry.solved.map((s) => String(s.problem)) } : null;
    }

    res.json({
      title: c.title, slug: c.slug, description: c.description,
      startAt: c.startAt, endAt: c.endAt, status: c.status,
      participants: await ContestEntry.countDocuments({ contest: c._id }),
      // Hide the problem set until the contest starts.
      problems: c.status === 'upcoming' ? [] : (c.problems || []).map((p) => ({ title: p.title, slug: p.slug, difficulty: p.difficulty })),
      registered, myScore,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// POST /api/contests/:slug/register
const register = async (req, res) => {
  try {
    const c = await Contest.findOne({ slug: req.params.slug, published: true });
    if (!c) return res.status(404).json({ message: 'Contest not found' });
    if (c.status === 'ended') return res.status(400).json({ message: 'Contest has ended' });
    await ContestEntry.findOneAndUpdate(
      { contest: c._id, user: req.user._id },
      { $setOnInsert: { contest: c._id, user: req.user._id, score: 0, solved: [] } },
      { upsert: true }
    );
    res.status(201).json({ registered: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// GET /api/contests/:slug/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const c = await Contest.findOne({ slug: req.params.slug, published: true }).select('_id');
    if (!c) return res.status(404).json({ message: 'Contest not found' });
    res.json(await leaderboard(c._id));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { listContests, getContest, register, getLeaderboard };
