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

    const isInstructor = classroom.isInstructor(req.user._id);

    // Students only see published assignments
    let filter = { classroom: classroom._id };
    if (!isInstructor) filter.isPublished = true;

    const assignments = await Assignment.find(filter).sort({ createdAt: -1 }).lean();
    const uid = String(req.user._id);

    // Never leak other students' submissions or the expected output (the answer).
    const shaped = assignments.map((a) => {
        const subs = a.submissions || [];
        if (isInstructor) {
            return {
                ...a,
                submissions: undefined,
                submissionCount: subs.length,
                gradedCount: subs.filter((s) => typeof s.grade === 'number').length,
            };
        }
        const mine = subs.find((s) => String(s.student) === uid);
        return {
            ...a,
            submissions: undefined,
            expectedOutput: undefined, // hide the answer from students
            mySubmission: mine ? { grade: mine.grade, feedback: mine.feedback, submittedAt: mine.submittedAt } : null,
        };
    });

    res.json(shaped);
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

// ── Announcements (class feed) ──────────────────────────────────────────────
const Announcement = require('../models/Announcement');

// GET /api/campus/classrooms/:id/announcements — feed for members (pinned first).
const listAnnouncements = asyncHandler(async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) { res.status(404); throw new Error('Classroom not found'); }
    if (!classroom.isEnrolled(req.user._id) && !classroom.isInstructor(req.user._id) && req.user.role !== 'admin') {
        res.status(403); throw new Error('Not authorized');
    }
    const items = await Announcement.find({ classroom: classroom._id })
        .sort({ pinned: -1, createdAt: -1 })
        .populate('author', 'name')
        .lean();
    res.json(items);
});

// POST /api/campus/classrooms/:id/announcements — post (instructor only).
const postAnnouncement = asyncHandler(async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) { res.status(404); throw new Error('Classroom not found'); }
    if (!classroom.isInstructor(req.user._id) && req.user.role !== 'admin') {
        res.status(403); throw new Error('Only the instructor can post announcements');
    }
    const body = String(req.body.body || '').trim();
    if (!body) { res.status(400); throw new Error('Announcement body is required'); }
    const a = await Announcement.create({
        classroom: classroom._id,
        author: req.user._id,
        title: String(req.body.title || '').trim(),
        body,
        pinned: !!req.body.pinned,
    });
    await a.populate('author', 'name');
    res.status(201).json(a);
});

// PATCH /api/campus/classrooms/:id/announcements/:annId — toggle pin (instructor).
const pinAnnouncement = asyncHandler(async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) { res.status(404); throw new Error('Classroom not found'); }
    if (!classroom.isInstructor(req.user._id) && req.user.role !== 'admin') {
        res.status(403); throw new Error('Only the instructor can pin announcements');
    }
    const a = await Announcement.findOne({ _id: req.params.annId, classroom: classroom._id });
    if (!a) { res.status(404); throw new Error('Announcement not found'); }
    a.pinned = !a.pinned;
    await a.save();
    res.json({ _id: a._id, pinned: a.pinned });
});

// DELETE /api/campus/classrooms/:id/announcements/:annId — delete (instructor).
const deleteAnnouncement = asyncHandler(async (req, res) => {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) { res.status(404); throw new Error('Classroom not found'); }
    if (!classroom.isInstructor(req.user._id) && req.user.role !== 'admin') {
        res.status(403); throw new Error('Only the instructor can delete announcements');
    }
    await Announcement.deleteOne({ _id: req.params.annId, classroom: classroom._id });
    res.json({ deleted: true });
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
    buildGradebook,
    listAnnouncements,
    postAnnouncement,
    pinAnnouncement,
    deleteAnnouncement
};
