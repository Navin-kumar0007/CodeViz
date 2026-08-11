const express = require('express');
const router = express.Router();
const { listProblems, getProblem } = require('../controllers/publicController');

// Unauthenticated, SEO-safe reads.
router.get('/problems', listProblems);
router.get('/problems/:slug', getProblem);

module.exports = router;
