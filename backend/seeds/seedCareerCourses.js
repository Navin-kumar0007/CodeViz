/**
 * High-value, career- and future-focused courses missing from the hub — each
 * generated beginner→advanced (the course prompt already ramps difficulty) at 8
 * lessons. Idempotent: skips courses that already exist (by slug).
 *
 * Usage:  COURSE_GEN_PROVIDER=groq node seeds/seedCareerCourses.js [--lessons 8] [--only <substr>]
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { generateCourse } = require('../services/aiMentorService');

const CATALOG = [
  // ── Software-engineering fundamentals (career-critical) ──
  { topic: 'Object-Oriented Design & Design Patterns', category: 'Software Engineering', langs: ['java', 'python'] },
  { topic: 'Clean Code & Refactoring', category: 'Software Engineering', langs: ['java', 'python'] },
  { topic: 'Operating Systems Fundamentals', category: 'Computer Science', langs: ['c', 'python'] },
  { topic: 'Computer Networks Fundamentals', category: 'Computer Science', langs: ['python'] },
  // ── Data & AI (current + future) ──
  { topic: 'Data Analysis with Pandas & NumPy', category: 'Data Science', langs: ['python'] },
  { topic: 'Data Engineering & Pipelines', category: 'Data Science', langs: ['python'] },
  { topic: 'MLOps & Model Deployment', category: 'Artificial Intelligence', langs: ['python'] },
  { topic: 'LangChain & LLM App Development', category: 'Artificial Intelligence', langs: ['python'] },
  { topic: 'Fine-Tuning & Optimizing LLMs', category: 'Artificial Intelligence', langs: ['python'] },
  { topic: 'Computer Vision Fundamentals', category: 'Artificial Intelligence', langs: ['python'] },
  { topic: 'Natural Language Processing', category: 'Artificial Intelligence', langs: ['python'] },
  // ── Backend / distributed systems ──
  { topic: 'Microservices Architecture', category: 'Backend Engineering', langs: ['javascript', 'python'] },
  { topic: 'Distributed Systems', category: 'System Design', langs: ['python', 'java'] },
  { topic: 'Apache Kafka & Event-Driven Systems', category: 'Backend Engineering', langs: ['java', 'python'] },
  { topic: 'gRPC & Protocol Buffers', category: 'Backend Engineering', langs: ['python', 'go'] },
  // ── Cloud / DevOps ──
  { topic: 'Terraform & Infrastructure as Code', category: 'Cloud & DevOps', langs: ['python'] },
  { topic: 'Serverless Architecture', category: 'Cloud & DevOps', langs: ['javascript', 'python'] },
  { topic: 'Observability & Monitoring', category: 'Cloud & DevOps', langs: ['python'] },
  // ── Security ──
  { topic: 'Cryptography Fundamentals', category: 'Security', langs: ['python'] },
  { topic: 'DevSecOps & Cloud Security', category: 'Security', langs: ['python'] },
  // ── Emerging / future ──
  { topic: 'Blockchain & Smart Contracts with Solidity', category: 'Emerging Tech', langs: ['javascript'] },
  { topic: 'WebAssembly Fundamentals', category: 'Emerging Tech', langs: ['rust', 'javascript'] },
  // ── Career prep ──
  { topic: 'Coding Interview Patterns', category: 'Career', langs: ['python', 'java'] },
];

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const lessons = args.includes('--lessons') ? parseInt(args[args.indexOf('--lessons') + 1], 10) : 8;
const slugOf = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz');
  console.log('Connected. Career catalog:', CATALOG.length, 'topics\n');
  const list = only ? CATALOG.filter((c) => slugOf(c.topic).includes(only)) : CATALOG;
  let made = 0, skipped = 0, failed = 0;
  for (const item of list) {
    const slug = slugOf(item.topic);
    if (await Course.exists({ slug })) { console.log(`  ⏭  ${item.topic} (exists)`); skipped += 1; continue; }
    process.stdout.write(`  ⏳ ${item.topic} … `);
    try {
      const c = await generateCourse({ ...item, lessonCount: lessons, difficulty: 'beginner' });
      console.log(`✓ ${c.lessons.length} lessons`);
      made += 1;
    } catch (e) { console.log(`✗ ${e.message}`); failed += 1; }
    await sleep(2500);
  }
  console.log(`\nDone. generated ${made}, skipped ${skipped}, failed ${failed}.`);
  await mongoose.disconnect();
  process.exit(0);
}
run();
