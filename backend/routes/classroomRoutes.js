const express = require('express');
const router = express.Router();
const {
    createClassroom,
    getPublicClassrooms,
    getMyClassrooms,
    getClassroom,
    joinClassroom,
    leaveClassroom,
    startLiveSession,
    stopLiveSession,
    updateLiveCode
} = require('../controllers/classroomController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getPublicClassrooms);

// Protected routes (require authentication)
router.post('/', protect, createClassroom);
router.get('/my', protect, getMyClassrooms);
router.get('/:id', protect, getClassroom);
router.post('/join', protect, joinClassroom);
router.post('/:id/leave', protect, leaveClassroom);
router.post('/:id/start', protect, startLiveSession);
router.post('/:id/stop', protect, stopLiveSession);
router.put('/:id/code', protect, updateLiveCode);

module.exports = router;
