/**
 * Bulk-generate practice problems with the AI orchestrator to grow the bank.
 * Idempotent-ish: each run adds new AI problems (deduped by slug suffix).
 *
 * Usage:
 *   node seeds/seedProblems.js --count 6                  # 6 per difficulty
 *   node seeds/seedProblems.js --difficulty medium --count 10
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { generateAndSaveProblems } = require('../services/aiMentorService');

const args = process.argv.slice(2);
const perDiff = args.includes('--count') ? parseInt(args[args.indexOf('--count') + 1], 10) : 5;
const only = args.includes('--difficulty') ? args[args.indexOf('--difficulty') + 1] : null;
const DIFFS = only ? [only] : ['easy', 'medium', 'hard'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
  let made = 0; let failed = 0;
  for (const difficulty of DIFFS) {
    let remaining = perDiff;
    while (remaining > 0) {
      const batch = Math.min(remaining, 3); // generator caps at 3/call
      process.stdout.write(`  ⏳ ${difficulty} x${batch} … `);
      try {
        const saved = await generateAndSaveProblems({ difficulty, count: batch });
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
