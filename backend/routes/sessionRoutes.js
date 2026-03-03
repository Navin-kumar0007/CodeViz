const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createSession,
    getSessions,
    getSession,
    getSharedSession,
    deleteSession,
    togglePublic
} = require('../controllers/sessionController');

// Public route — shared session replay
router.get('/shared/:token', getSharedSession);

// Protected routes
router.use(protect);
router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSession);
router.delete('/:id', deleteSession);
router.patch('/:id/toggle-public', togglePublic);

module.exports = router;
