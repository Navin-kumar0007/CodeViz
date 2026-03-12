const asyncHandler = require('express-async-handler');
const Classroom = require('../models/Classroom');
const Assignment = require('../models/Assignment');
const User = require('../models/User');

// @desc    Get all classrooms (instructor gets their created ones, student gets enrolled ones)
// @route   GET /api/campus/classrooms
// @access  Private
const getClassrooms = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    let classrooms;

    if (user.role === 'instructor') {
        classrooms = await Classroom.find({ instructor: user._id }).sort({ createdAt: -1 });
    } else {
        classrooms = await Classroom.find({ students: user._id }).populate('instructor', 'name email').sort({ createdAt: -1 });
    }

    res.json(classrooms);
});

// @desc    Create a new classroom
// @route   POST /api/campus/classrooms
// @access  Private (Instructor only)
const createClassroom = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const user = await User.findById(req.user._id);
    if (user.role !== 'instructor') {
        res.status(403);
        throw new Error('Only instructors can create classrooms');
    }

    const code = await Classroom.generateCode();

    const classroom = await Classroom.create({
        instructor: user._id,
        name,
        description,
        code
    });

    res.status(201).json(classroom);
});

// @desc    Join a classroom via code
// @route   POST /api/campus/classrooms/join
// @access  Private
const joinClassroom = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('Please provide an enrollment code');
    }

    const classroom = await Classroom.findOne({ code: code.toUpperCase() });

    if (!classroom) {
        res.status(404);
        throw new Error('Classroom not found with that code');
    }

    if (classroom.isEnrolled(req.user._id)) {
        res.status(400);
        throw new Error('You are already enrolled in this classroom');
    }

    if (classroom.isInstructor(req.user._id)) {
        res.status(400);
        throw new Error('You are the instructor of this classroom');
    }

    classroom.students.push(req.user._id);
    await classroom.save();

    res.json({ message: 'Successfully joined classroom', classroom });
});

// @desc    Get classroom details and roster
// @route   GET /api/campus/classrooms/:id
// @access  Private
const getClassroomById = asyncHandler(async (req, res) => {
    const classroom = await Classroom.findById(req.params.id)
        .populate('instructor', 'name email')
        .populate('students', 'name email xp role');

    if (!classroom) {
        res.status(404);
        throw new Error('Classroom not found');
    }

    // Must be student or instructor
    if (!classroom.isEnrolled(req.user._id) && !classroom.isInstructor(req.user._id)) {
        res.status(403);
        throw new Error('Not authorized to access this classroom');
    }

    res.json(classroom);
});

// @desc    Create an assignment
// @route   POST /api/campus/classrooms/:id/assignments
// @access  Private (Instructor only)
const createAssignment = asyncHandler(async (req, res) => {
    const { title, description, starterCode, expectedOutput, language, dueDate, maxPoints, isPublished } = req.body;

    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
        res.status(404);
        throw new Error('Classroom not found');
    }

    if (!classroom.isInstructor(req.user._id)) {
        res.status(403);
        throw new Error('Not authorized to create assignments for this classroom');
    }

    const assignment = await Assignment.create({
        classroom: classroom._id,
        title,
        description,
        starterCode,
        expectedOutput,
        language,
        dueDate,
        maxPoints,
        isPublished
    });

    res.status(201).json(assignment);
});

// @desc    Get assignments for a classroom
// @route   GET /api/campus/classrooms/:id/assignments
// @access  Private
const getClassroomAssignments = asyncHandler(async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
        res.status(404);
        throw new Error('Classroom not found');
    }

    if (!classroom.isEnrolled(req.user._id) && !classroom.isInstructor(req.user._id)) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Students only see published assignments
    let filter = { classroom: classroom._id };
    if (!classroom.isInstructor(req.user._id)) {
        filter.isPublished = true;
    }

    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });

    res.json(assignments);
});

module.exports = {
    getClassrooms,
    createClassroom,
    joinClassroom,
    getClassroomById,
    createAssignment,
    getClassroomAssignments
};
