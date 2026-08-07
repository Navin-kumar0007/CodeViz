/**
 * Bulk-generate animated concept visuals for lessons that don't have one,
 * using the AI orchestrator. Idempotent: skips lessons that already carry a
 * `visual` (unless --force). Slow (one LLM call per lesson) — run in batches.
 *
 * Usage:
 *   node seeds/seedVisuals.js --only system-design      # one course
 *   node seeds/seedVisuals.js --limit 10                # cap total generated
 *   node seeds/seedVisuals.js --force                   # regenerate existing
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { generateVisual } = require('../services/aiMentorService');

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
  const filter = only ? { slug: new RegExp(only) } : {};
  const courses = await Course.find(filter).sort({ order: 1 });
  console.log(`Scanning ${courses.length} course(s).\n`);

  let made = 0; let skipped = 0; let failed = 0;
  for (const course of courses) {
    let dirty = false;
    for (const lesson of course.lessons) {
      if (made >= limit) break;
      if (lesson.visual && !force) { skipped += 1; continue; }
      const summary = (lesson.explanation || []).map((b) => b?.content).filter(Boolean).slice(0, 2).join(' ');
      process.stdout.write(`  ⏳ ${course.slug}/${lesson.lessonId} … `);
      try {
        const spec = await generateVisual({ courseTitle: course.title, lessonTitle: lesson.title, summary });
        lesson.visual = spec;
        dirty = true; made += 1;
        console.log(`✓ ${spec.kind} (${spec.steps.length} steps)`);
      } catch (e) {
        failed += 1;
        console.log(`✗ ${e.message}`);
      }
      await sleep(2500);
    }
    if (dirty) { course.markModified('lessons'); await course.save(); }
    if (made >= limit) break;
  }

  console.log(`\nDone. generated ${made}, skipped ${skipped}, failed ${failed}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
