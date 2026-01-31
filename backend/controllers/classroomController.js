const Classroom = require('../models/Classroom');
const User = require('../models/User');

/**
 * @desc    Create a new classroom
 * @route   POST /api/classrooms
 * @access  Private (Instructor only)
 */
const createClassroom = async (req, res) => {
    try {
        const { name, description, settings } = req.body;

        // Check if user is instructor
        if (req.user.role !== 'instructor') {
            return res.status(403).json({ message: 'Only instructors can create classrooms' });
        }

        // Generate unique join code
        const code = await Classroom.generateCode();

        const classroom = await Classroom.create({
            code,
            name,
            description: description || '',
            instructor: req.user._id,
            settings: settings || {}
        });

        res.status(201).json(classroom);
    } catch (error) {
        console.error('Error creating classroom:', error);
        res.status(500).json({ message: 'Failed to create classroom' });
    }
};

/**
 * @desc    Get all public classrooms
 * @route   GET /api/classrooms
 * @access  Public
 */
const getPublicClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find({
            'settings.isPublic': true,
            isActive: true
        })
            .populate('instructor', 'name')
            .select('code name description instructor students isLive createdAt')
            .sort('-createdAt');

        res.json(classrooms);
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ message: 'Failed to fetch classrooms' });
    }
};

/**
 * @desc    Get instructor's classrooms
 * @route   GET /api/classrooms/my
 * @access  Private
 */
const getMyClassrooms = async (req, res) => {
    try {
        // Get classrooms where user is instructor
        const teaching = await Classroom.find({ instructor: req.user._id })
            .populate('instructor', 'name')
            .sort('-createdAt');

        // Get classrooms where user is enrolled
        const enrolled = await Classroom.find({ students: req.user._id })
            .populate('instructor', 'name')
            .sort('-createdAt');

        res.json({ teaching, enrolled });
    } catch (error) {
        console.error('Error fetching my classrooms:', error);
        res.status(500).json({ message: 'Failed to fetch classrooms' });
    }
};

/**
 * @desc    Get single classroom details
 * @route   GET /api/classrooms/:id
 * @access  Private (must be enrolled or instructor)
 */
const getClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('students', 'name email');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check access
        const isInstructor = classroom.isInstructor(req.user._id);
        const isEnrolled = classroom.isEnrolled(req.user._id);

        if (!isInstructor && !isEnrolled) {
            return res.status(403).json({ message: 'Not authorized to view this classroom' });
        }

        res.json({ ...classroom.toObject(), isInstructor, isEnrolled });
    } catch (error) {
        console.error('Error fetching classroom:', error);
        res.status(500).json({ message: 'Failed to fetch classroom' });
    }
};

/**
 * @desc    Join a classroom by code
 * @route   POST /api/classrooms/join
 * @access  Private
 */
const joinClassroom = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Classroom code is required' });
        }

        const classroom = await Classroom.findOne({
            code: code.toUpperCase(),
            isActive: true
        }).populate('instructor', 'name');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Check if already enrolled
        if (classroom.isEnrolled(req.user._id)) {
            return res.status(400).json({ message: 'Already enrolled in this classroom' });
        }

        // Check if instructor (can't join own classroom as student)
        if (classroom.isInstructor(req.user._id)) {
            return res.status(400).json({ message: 'You are the instructor of this classroom' });
        }

        // Check max students
        if (classroom.students.length >= classroom.settings.maxStudents) {
            return res.status(400).json({ message: 'Classroom is full' });
        }

        // Add student
        classroom.students.push(req.user._id);
        await classroom.save();

        res.json({ message: 'Successfully joined classroom', classroom });
    } catch (error) {
        console.error('Error joining classroom:', error);
        res.status(500).json({ message: 'Failed to join classroom' });
    }
};

/**
 * @desc    Leave a classroom
 * @route   POST /api/classrooms/:id/leave
 * @access  Private
 */
const leaveClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Remove student
        classroom.students = classroom.students.filter(
            s => s.toString() !== req.user._id.toString()
        );
        await classroom.save();

        res.json({ message: 'Successfully left classroom' });
    } catch (error) {
        console.error('Error leaving classroom:', error);
        res.status(500).json({ message: 'Failed to leave classroom' });
    }
};

/**
 * @desc    Start a live session
 * @route   POST /api/classrooms/:id/start
 * @access  Private (Instructor only)
 */
const startLiveSession = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        if (!classroom.isInstructor(req.user._id)) {
            return res.status(403).json({ message: 'Only the instructor can start a live session' });
        }

        classroom.isLive = true;
        classroom.liveCode = req.body.code || '';
        classroom.liveLanguage = req.body.language || 'python';
        await classroom.save();

        res.json({ message: 'Live session started', classroom });
    } catch (error) {
        console.error('Error starting live session:', error);
        res.status(500).json({ message: 'Failed to start live session' });
    }
};

/**
 * @desc    Stop a live session
 * @route   POST /api/classrooms/:id/stop
 * @access  Private (Instructor only)
 */
const stopLiveSession = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        if (!classroom.isInstructor(req.user._id)) {
            return res.status(403).json({ message: 'Only the instructor can stop a live session' });
        }

        classroom.isLive = false;
        await classroom.save();

        res.json({ message: 'Live session ended' });
    } catch (error) {
        console.error('Error stopping live session:', error);
        res.status(500).json({ message: 'Failed to stop live session' });
    }
};

/**
 * @desc    Update live code (for Socket.io backup)
 * @route   PUT /api/classrooms/:id/code
 * @access  Private (Instructor only)
 */
const updateLiveCode = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        if (!classroom.isInstructor(req.user._id)) {
            return res.status(403).json({ message: 'Only the instructor can update code' });
        }

        classroom.liveCode = req.body.code || '';
        classroom.liveLanguage = req.body.language || classroom.liveLanguage;
        await classroom.save();

        res.json({ message: 'Code updated' });
    } catch (error) {
        console.error('Error updating code:', error);
        res.status(500).json({ message: 'Failed to update code' });
    }
};

module.exports = {
    createClassroom,
    getPublicClassrooms,
    getMyClassrooms,
    getClassroom,
    joinClassroom,
    leaveClassroom,
    startLiveSession,
    stopLiveSession,
    updateLiveCode
};
