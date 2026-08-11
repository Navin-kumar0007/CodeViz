const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createTeam, myTeams, getTeam, addMember, removeMember, activateTeam } = require('../controllers/teamController');

router.use(protect);

router.route('/').post(createTeam);
router.get('/mine', myTeams);
router.get('/:id', getTeam);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.post('/:id/activate', activateTeam);

module.exports = router;
