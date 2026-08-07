/**
 * Bulk-generate editorials (solution walkthroughs) for problems that lack one.
 * Idempotent: skips problems that already have an editorial (unless --force).
 *
 * Usage:
 *   node seeds/seedEditorials.js --limit 10
 *   node seeds/seedEditorials.js --force
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const { generateEditorial } = require('../services/aiMentorService');

const args = process.argv.slice(2);
const force = args.includes('--force');
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
  const filter = force ? {} : { editorial: null };
  const problems = await Problem.find(filter).sort({ order: 1 });
  console.log(`${problems.length} problem(s) to process.\n`);

  let made = 0; let failed = 0;
  for (const problem of problems) {
    if (made >= limit) break;
    process.stdout.write(`  ⏳ ${problem.slug} … `);
    try {
      const editorial = await generateEditorial({ problem });
      problem.editorial = editorial;
      if (editorial.topics?.length && (!problem.topics || problem.topics.length === 0)) problem.topics = editorial.topics;
      await problem.save();
      made += 1;
      console.log(`✓ ${Object.keys(editorial.solutionCode).join(',')} · ${editorial.timeComplexity}`);
    } catch (e) {
      failed += 1;
      console.log(`✗ ${e.message}`);
    }
    await sleep(2500);
  }
  console.log(`\nDone. generated ${made}, failed ${failed}.`);
  await mongoose.disconnect();
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
