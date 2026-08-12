/**
 * Fix + strengthen problem test cases so every problem grades cleanly with multiple
 * CORRECT test cases. Correctness comes from running the problem's editorial (reference)
 * solution — never from AI-claimed outputs. AI is used only to suggest extra INPUTS;
 * their outputs are recomputed by the reference. Existing inputs are re-verified too
 * (fixes wrong/empty expected outputs).
 *
 * Idempotent: only touches problems with < --min cases or an empty expected output.
 * Usage:  node seeds/backfillTestCases.js [--min 3] [--target 5] [--limit N] [--only slug]
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const dockerService = require('../services/dockerService');
const aiService = require('../services/aiService');
const { buildReference } = require('../utils/referenceRunner');

const args = process.argv.slice(2);
const argN = (f, d) => (args.includes(f) ? parseInt(args[args.indexOf(f) + 1], 10) : d);
const minCases = argN('--min', 3);
const target = argN('--target', 5);
const limit = argN('--limit', Infinity);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

// Run the reference on an input; return its stdout, or null if it errored/timed out.
async function refOutput(ref, input) {
  try {
    const r = await dockerService.runInSandbox(ref.code, ref.language, input);
    if (r.timeout || r.error) return null;
    const out = typeof r.output === 'string' ? r.output : '';
    return out.trim().length ? out : null; // reject empty output — it can't grade
  } catch { return null; }
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
  const q = only ? { slug: only } : {};
  const all = await Problem.find(q).select('title slug testCases starterCode editorial description difficulty');
  console.log(`Scanning ${all.length} problems (min ${minCases}, target ${target})\n`);

  let fixed = 0, cases = 0, skipped = 0; const flagged = [];
  let processed = 0;
  for (const p of all) {
    const tc = p.testCases || [];
    const needsWork = only || tc.length < minCases || tc.some((t) => !t.expectedOutput);
    if (!needsWork) continue;
    if (processed >= limit) break;
    processed += 1;

    const ref = buildReference(p);
    if (!ref) { flagged.push(p.slug); skipped += 1; console.log(`  ⚠ ${p.title} — no runnable reference`); continue; }

    // Candidate inputs: existing valid ones + AI-suggested extras.
    let inputs = tc.map((t) => t.input).filter((i) => typeof i === 'string' && i.length);
    if (inputs.length < target) {
      try {
        const gen = await aiService.generateInterviewTestCases(
          `Title: ${p.title}\nDescription: ${p.description}\nStarter (python): ${p.starterCode?.python || ''}\nDifficulty: ${p.difficulty}\nReturn ONLY diverse stdin inputs matching the program's input format (edge cases, larger sizes, negatives/empties).`,
          null,
        );
        (gen || []).forEach((g) => { if (typeof g.input === 'string' && g.input.length) inputs.push(g.input); });
      } catch { /* AI unavailable — proceed with existing inputs */ }
    }
    inputs = [...new Set(inputs)].slice(0, target + 4);

    // Compute correct outputs via the reference; keep only clean runs.
    const good = [];
    for (const input of inputs) {
      const out = await refOutput(ref, input);
      if (out !== null) good.push({ input, expectedOutput: out });
      if (good.length >= target) break;
    }
    if (good.length === 0) { flagged.push(p.slug); skipped += 1; console.log(`  ⚠ ${p.title} — reference produced no clean output`); continue; }

    good.forEach((c, i) => { c.isHidden = i >= 2; }); // first 2 visible, rest hidden
    p.testCases = good;
    await p.save();
    fixed += 1; cases += good.length;
    console.log(`  ✓ ${p.title} → ${good.length} test cases`);
  }

  console.log(`\nDone. fixed ${fixed} problems (${cases} test cases), skipped ${skipped}.`);
  if (flagged.length) console.log('flagged (need manual attention / not stdin-gradeable):', flagged.join(', '));
  await mongoose.disconnect();
  process.exit(0);
}
run();
