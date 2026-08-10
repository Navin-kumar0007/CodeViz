/**
 * Bulk-generate practice problems with the AI orchestrator to grow the bank.
 * Idempotent-ish: each run adds new AI problems (deduped by slug suffix).
 *
 * Usage:
 *   node seeds/seedProblems.js --count 6                  # 6 per difficulty
 *   node seeds/seedProblems.js --difficulty medium --count 10
 *   node seeds/seedProblems.js --total 300                # grow the bank to 300 total
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const { generateAndSaveProblems } = require('../services/aiMentorService');

const args = process.argv.slice(2);
const perDiff = args.includes('--count') ? parseInt(args[args.indexOf('--count') + 1], 10) : 5;
const only = args.includes('--difficulty') ? args[args.indexOf('--difficulty') + 1] : null;
const total = args.includes('--total') ? parseInt(args[args.indexOf('--total') + 1], 10) : null;
const DIFFS = only ? [only] : ['easy', 'medium', 'hard'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Grow the bank toward a total count, cycling difficulties. Stops on target,
// or after too many empty rounds (quota exhausted / all dupes).
async function runToTarget(target) {
  let current = await Problem.countDocuments();
  console.log(`Current: ${current} problems. Target: ${target}.\n`);
  let idle = 0;
  const order = ['easy', 'medium', 'hard'];
  let di = 0;
  while (current < target && idle < 8) {
    const difficulty = order[di % 3]; di += 1;
    process.stdout.write(`  ⏳ ${difficulty} … `);
    try {
      const saved = await generateAndSaveProblems({ difficulty, count: 3, dedupe: true });
      current += saved.length;
      idle = saved.length ? 0 : idle + 1;
      console.log(`+${saved.length} (total ${current}) ${saved.map((p) => p.title).join(', ')}`);
    } catch (e) {
      idle += 1;
      console.log(`✗ ${e.message}`);
    }
    await sleep(2500);
  }
  console.log(`\nDone. ${current} problems total${idle >= 8 ? ' (stopped: quota/dupes)' : ''}.`);
}

async function run() {
  if (total) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
    await runToTarget(total);
    await mongoose.disconnect();
    process.exit(0);
    return;
  }
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
  let made = 0; let failed = 0;
  for (const difficulty of DIFFS) {
    let remaining = perDiff;
    while (remaining > 0) {
      const batch = Math.min(remaining, 3); // generator caps at 3/call
      process.stdout.write(`  ⏳ ${difficulty} x${batch} … `);
      try {
        const saved = await generateAndSaveProblems({ difficulty, count: batch, dedupe: true });
        made += saved.length;
        remaining -= batch;
        console.log(`✓ ${saved.map((p) => p.title).join(', ') || 'none'}`);
      } catch (e) {
        failed += 1; remaining -= batch;
        console.log(`✗ ${e.message}`);
      }
      await sleep(2500);
    }
  }
  console.log(`\nDone. added ${made} problems, ${failed} failed batches.`);
  await mongoose.disconnect();
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
