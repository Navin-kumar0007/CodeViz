/**
 * Migrate the frontend's bundled course content into MongoDB.
 *
 * The authored content lives in the ESM registry at
 * frontend/src/data/courses/index.js (COURSES). We dynamic-import it (Node 20
 * supports importing ESM from CommonJS), then upsert each course by slug so the
 * seeder is idempotent and re-runnable.
 *
 * Usage:  node seeds/seedCourses.js
 */
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const Course = require('../models/Course');

const COURSES_INDEX = path.resolve(__dirname, '../../frontend/src/data/courses/index.js');
// esbuild ships with the frontend; use it to resolve the registry's
// extensionless ESM imports (which Node's own loader rejects) and bundle the
// whole thing into a CJS module we can evaluate in-process.
const esbuild = require(path.resolve(__dirname, '../../frontend/node_modules/esbuild'));

async function loadCourses() {
  const result = await esbuild.build({
    entryPoints: [COURSES_INDEX],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;
  const mod = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', 'require', code)(mod, mod.exports, require);
  if (!Array.isArray(mod.exports.COURSES)) throw new Error('COURSES export not found or not an array');
  return mod.exports.COURSES;
}

function toDoc(course, order) {
  return {
    slug: course.id,
    title: course.title || '',
    icon: course.icon || '📘',
    category: course.category || 'General',
    description: course.description || '',
    prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
    difficulty: course.difficulty || '',
    order,
    published: true,
    lessons: (course.lessons || []).map((l) => ({
      lessonId: l.id,
      title: l.title || '',
      duration: l.duration || '',
      explanation: l.explanation || [],
      keyConcepts: l.keyConcepts || [],
      code: l.code || {},
      quiz: l.quiz || [],
    })),
  };
}

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeviz';
  await mongoose.connect(uri);
  console.log('Connected:', uri);

  const courses = await loadCourses();
  console.log(`Loaded ${courses.length} courses from frontend registry.`);

  let up = 0;
  let lessons = 0;
  for (let i = 0; i < courses.length; i += 1) {
    const doc = toDoc(courses[i], i);
    lessons += doc.lessons.length;
    await Course.findOneAndUpdate({ slug: doc.slug }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
    up += 1;
    console.log(`  ✓ ${doc.slug.padEnd(24)} ${doc.lessons.length} lessons`);
  }

  console.log(`\nSeeded ${up} courses, ${lessons} lessons total.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
