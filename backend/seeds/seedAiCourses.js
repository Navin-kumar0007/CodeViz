/**
 * Bulk-generate modern-technology courses with the AI orchestrator and store
 * them in MongoDB. Idempotent (upsert by slug); skips courses that already
 * exist unless --force is passed.
 *
 * Usage:
 *   node seeds/seedAiCourses.js                 # generate all missing
 *   node seeds/seedAiCourses.js --only react    # one topic (slug substring)
 *   node seeds/seedAiCourses.js --force         # regenerate even if present
 *   node seeds/seedAiCourses.js --lessons 4     # override lesson count
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { generateCourse } = require('../services/aiMentorService');

// Curated catalog of modern / in-demand topics missing from the current hub.
const CATALOG = [
  { topic: 'TypeScript Fundamentals', category: 'Web Development', langs: ['typescript'] },
  { topic: 'React Essentials', category: 'Web Development', langs: ['javascript', 'typescript'] },
  { topic: 'Next.js App Router', category: 'Web Development', langs: ['typescript'] },
  { topic: 'Tailwind CSS', category: 'Web Development', langs: ['html', 'javascript'] },
  { topic: 'Node.js & Express APIs', category: 'Backend Engineering', langs: ['javascript', 'typescript'] },
  { topic: 'REST API Design', category: 'Backend Engineering', langs: ['javascript', 'python'] },
  { topic: 'GraphQL', category: 'Backend Engineering', langs: ['javascript'] },
  { topic: 'Authentication & JWT', category: 'Backend Engineering', langs: ['javascript'] },
  { topic: 'SQL & Relational Databases', category: 'Databases', langs: ['sql'] },
  { topic: 'MongoDB & NoSQL', category: 'Databases', langs: ['javascript'] },
  { topic: 'Redis & Caching', category: 'Databases', langs: ['javascript'] },
  { topic: 'System Design Fundamentals', category: 'System Design', langs: ['python'] },
  { topic: 'Git & Version Control', category: 'Cloud & DevOps', langs: ['bash'] },
  { topic: 'Linux & Bash Scripting', category: 'Cloud & DevOps', langs: ['bash'] },
  { topic: 'AWS Cloud Basics', category: 'Cloud & DevOps', langs: ['bash', 'python'] },
  { topic: 'CI/CD Pipelines', category: 'Cloud & DevOps', langs: ['yaml'] },
  { topic: 'Web Security & OWASP', category: 'Security', langs: ['javascript'] },
  { topic: 'Rust Programming', category: 'Languages', langs: ['rust'] },
  { topic: 'Go Programming', category: 'Languages', langs: ['go'] },
  { topic: 'Python Mastery', category: 'Languages', langs: ['python'] },
  { topic: 'LLMs & Prompt Engineering', category: 'Artificial Intelligence', langs: ['python'] },
  { topic: 'RAG & Vector Databases', category: 'Artificial Intelligence', langs: ['python'] },
  { topic: 'Building AI Agents', category: 'Artificial Intelligence', langs: ['python'] },
];

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');
const lessons = args.includes('--lessons') ? parseInt(args[args.indexOf('--lessons') + 1], 10) : 5;

const slugOf = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
  console.log('Connected. Catalog:', CATALOG.length, 'topics\n');

  const list = only ? CATALOG.filter((c) => slugOf(c.topic).includes(only)) : CATALOG;
  let made = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of list) {
    const slug = slugOf(item.topic);
    if (!force && (await Course.exists({ slug }))) {
      console.log(`  ⏭  ${item.topic} (exists)`);
      skipped += 1;
      continue;
    }
    process.stdout.write(`  ⏳ ${item.topic} … `);
    try {
      const c = await generateCourse({ ...item, lessonCount: lessons, difficulty: 'beginner' });
      console.log(`✓ ${c.lessons.length} lessons`);
      made += 1;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failed += 1;
    }
    await sleep(2500); // be gentle on provider quotas
  }

  console.log(`\nDone. generated ${made}, skipped ${skipped}, failed ${failed}.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
