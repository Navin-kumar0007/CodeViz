/**
 * Create a demo weekly contest (live now, ends in 7 days) from existing problems.
 * Usage: node seeds/seedContest.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');

  const slug = 'weekly-1';
  if (await Contest.exists({ slug })) { console.log('weekly-1 already exists.'); await mongoose.disconnect(); process.exit(0); }

  // 4 problems spread across difficulty.
  const easy = await Problem.find({ difficulty: 'easy' }).limit(2).select('_id');
  const medium = await Problem.find({ difficulty: 'medium' }).limit(1).select('_id');
  const hard = await Problem.find({ difficulty: 'hard' }).limit(1).select('_id');
  const problems = [...easy, ...medium, ...hard].map((p) => p._id);
  if (problems.length < 2) { console.log('Not enough problems to build a contest.'); await mongoose.disconnect(); process.exit(0); }

  const now = Date.now();
  const c = await Contest.create({
    title: 'CodeViz Weekly #1',
    slug,
    description: 'The first weekly. Solve as many as you can before the clock runs out — points scale with difficulty, ties break on who finished first.',
    startAt: new Date(now - 60 * 60 * 1000),          // started 1h ago (live)
    endAt: new Date(now + 7 * 24 * 60 * 60 * 1000),   // ends in 7 days
    problems,
    published: true,
  });
  console.log(`Created contest "${c.title}" (${c.slug}) with ${problems.length} problems, status: ${c.status}`);
  await mongoose.disconnect();
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
