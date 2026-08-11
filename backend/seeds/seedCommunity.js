/**
 * Seed starter community activity so new users don't land on an empty forum.
 * Creates a few varied discussions (solution notes, tips, questions) on the top
 * problems, authored by existing users, with a few upvotes. Idempotent: skips a
 * problem that already has seeded threads.
 *
 * Usage: node seeds/seedCommunity.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Discussion = require('../models/Discussion');
const Problem = require('../models/Problem');
const User = require('../models/User');

// { category, title, content } templates — {t} is replaced with the problem title.
const TEMPLATES = [
  { category: 'tip', title: 'Hint before you look at the editorial', content: 'Try to spot the repeated work first. For {t}, ask whether a hashmap or two pointers removes a nested loop — that\'s usually the whole trick.' },
  { category: 'solution', title: 'Clean O(n) approach — walkthrough', content: 'My approach to {t}: scan once, keep the state you need in a map/set, and check the complement/condition as you go. Watching it in the visualizer made the invariant obvious. Time O(n), space O(n).' },
  { category: 'help', title: 'Why is my solution TLE on the hidden cases?', content: 'I solved {t} with a brute-force double loop and it passes the samples but times out. Is the intended complexity O(n log n) or O(n)? Any nudge appreciated!' },
  { category: 'discussion', title: 'Which pattern did this remind you of?', content: '{t} felt like a classic once it clicked. Curious what pattern others reached for — sliding window, two pointers, or a map?' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
  const users = await User.find({}).select('_id').limit(10);
  if (users.length === 0) { console.log('No users to author threads.'); await mongoose.disconnect(); return; }

  const problems = await Problem.find({}).select('slug title').sort({ order: 1 }).limit(15);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let made = 0; let skipped = 0;
  for (const p of problems) {
    const key = `problem:${p.slug}`;
    if (await Discussion.exists({ lessonId: key })) { skipped += 1; continue; }
    // 2–3 threads per problem, varied categories.
    const n = 2 + (Math.random() > 0.5 ? 1 : 0);
    const chosen = [...TEMPLATES].sort(() => Math.random() - 0.5).slice(0, n);
    for (const t of chosen) {
      const author = pick(users)._id;
      // a few likes from other users
      const likers = users.filter((u) => String(u._id) !== String(author)).slice(0, Math.floor(Math.random() * 4)).map((u) => u._id);
      await Discussion.create({
        lessonId: key,
        title: t.title,
        category: t.category,
        content: t.content.replace(/\{t\}/g, p.title),
        userId: author,
        likes: likers,
        tags: [p.slug],
      });
      // reflect the upvotes as reputation for the author
      if (likers.length) await User.findByIdAndUpdate(author, { $inc: { reputation: likers.length } });
      made += 1;
    }
  }
  console.log(`\nSeeded ${made} discussions across ${problems.length} problems (skipped ${skipped} already-populated).`);
  await mongoose.disconnect();
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
