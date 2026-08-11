const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getClassrooms,
    createClassroom,
    joinClassroom,
    getClassroomById,
    createAssignment,
    getClassroomAssignments,
    getGradebook,
    exportGradebookCsv
} = require('../controllers/campusController');

// All campus routes are protected
router.use(protect);

router.route('/classrooms')
    .get(getClassrooms)
    .post(createClassroom);

router.post('/classrooms/join', joinClassroom);

router.route('/classrooms/:id')
    .get(getClassroomById);

router.route('/classrooms/:id/assignments')
    .get(getClassroomAssignments)
    .post(createAssignment);

router.get('/classrooms/:id/gradebook', getGradebook);
router.get('/classrooms/:id/gradebook.csv', exportGradebookCsv);

module.exports = router;
