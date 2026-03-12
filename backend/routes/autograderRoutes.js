const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitAssignment } = require('../controllers/autograderController');

// @route   POST /api/autograder/:assignmentId
router.post('/:assignmentId', protect, submitAssignment);

module.exports = router;
