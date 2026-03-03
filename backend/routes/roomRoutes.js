const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRoom, joinRoom, getActiveRooms } = require('../controllers/roomController');

// All routes are protected
router.post('/', protect, createRoom);
router.post('/join', protect, joinRoom);
router.get('/active', protect, getActiveRooms);

module.exports = router;
