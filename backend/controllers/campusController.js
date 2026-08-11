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

// Assemble the full gradebook matrix (students × assignments) for a classroom,
// including each cell's grade, lateness, and integrity flag. Shared by JSON + CSV.
async function buildGradebook(classroomId) {
    const classroom = await Classroom.findById(classroomId).lean();
    if (!classroom) return null;
    const [assignments, students] = await Promise.all([
        Assignment.find({ classroom: classroomId }).select('title maxPoints dueDate submissions').sort({ createdAt: 1 }).lean(),
        User.find({ _id: { $in: classroom.students || [] } }).select('name email').lean(),
    ]);

    const rows = students.map((s) => {
        const cells = assignments.map((a) => {
            const sub = (a.submissions || []).find((x) => String(x.student) === String(s._id));
            if (!sub) return null;
            const maxPoints = a.maxPoints || 100;
            return {
                grade: typeof sub.grade === 'number' ? sub.grade : null,
                maxPoints,
                submittedAt: sub.submittedAt || null,
                late: !!(a.dueDate && sub.submittedAt && new Date(sub.submittedAt) > new Date(a.dueDate)),
                flagged: !!sub.integrity?.flagged,
                pasteRatio: sub.integrity?.pasteRatio ?? null,
            };
        });
        const graded = cells.filter((c) => c && typeof c.grade === 'number');
        const overallPct = graded.length
            ? Math.round(graded.reduce((acc, c) => acc + (c.grade / (c.maxPoints || 100)) * 100, 0) / graded.length)
            : null;
        return {
            student: { id: s._id, name: s.name, email: s.email },
            cells,
            overallPct,
            submitted: cells.filter(Boolean).length,
            flags: cells.filter((c) => c?.flagged).length,
        };
    });

    return {
        classroom: { id: classroom._id, name: classroom.name },
        assignments: assignments.map((a) => ({ id: a._id, title: a.title, maxPoints: a.maxPoints || 100, dueDate: a.dueDate })),
        rows,
    };
}

// @desc    Gradebook matrix (instructor only)
// @route   GET /api/campus/classrooms/:id/gradebook
const getGradebook = asyncHandler(async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) { res.status(404); throw new Error('Classroom not found'); }
    if (!classroom.isInstructor(req.user._id) && req.user.role !== 'admin') {
        res.status(403); throw new Error('Only the instructor can view the gradebook');
    }
    const gradebook = await buildGradebook(classroom._id);
    res.json(gradebook);
});

// Minimal RFC-4180 CSV field escaping.
const csvCell = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// @desc    Gradebook as a downloadable CSV (instructor only)
// @route   GET /api/campus/classrooms/:id/gradebook.csv
const exportGradebookCsv = asyncHandler(async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) { res.status(404); throw new Error('Classroom not found'); }
    if (!classroom.isInstructor(req.user._id) && req.user.role !== 'admin') {
        res.status(403); throw new Error('Only the instructor can export the gradebook');
    }
    const gb = await buildGradebook(classroom._id);

    const header = ['Student', 'Email', ...gb.assignments.map((a) => a.title), 'Overall %', 'Integrity flags'];
    const lines = [header.map(csvCell).join(',')];
    for (const row of gb.rows) {
        const cells = row.cells.map((c) => {
            if (!c) return '';
            let v = c.grade === null ? '' : String(c.grade);
            if (c.late) v += ' (late)';
            if (c.flagged) v += ' ⚠';
            return v;
        });
        lines.push([
            row.student.name, row.student.email, ...cells,
            row.overallPct === null ? '' : row.overallPct, row.flags,
        ].map(csvCell).join(','));
    }
    const csv = lines.join('\n');

    const safeName = (gb.classroom.name || 'classroom').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="gradebook-${safeName}.csv"`);
    res.send(csv);
});

module.exports = {
    getClassrooms,
    createClassroom,
    joinClassroom,
    getClassroomById,
    createAssignment,
    getClassroomAssignments,
    getGradebook,
    exportGradebookCsv,
    buildGradebook
};
