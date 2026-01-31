const Classroom = require('../models/Classroom');
const LearningProgress = require('../models/LearningProgress');
const User = require('../models/User');
const Assignment = require('../models/Assignment');

/**
 * @desc    Get classroom overview analytics
 * @route   GET /api/analytics/classroom/:id
 * @access  Private (Instructor only)
 */
const getClassroomAnalytics = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('students', 'name email');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Verify instructor
        if (classroom.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const studentIds = classroom.students.map(s => s._id);

        // Get learning progress for all students
        const progressData = await LearningProgress.find({
            userId: { $in: studentIds }
        });

        // Calculate metrics
        let totalScore = 0;
        let totalLessons = 0;
        let activeStudents = 0;

        const studentStats = [];

        for (const student of classroom.students) {
            const progress = progressData.find(
                p => p.userId.toString() === student._id.toString()
            );

            const stats = {
                _id: student._id,
                name: student.name,
                email: student.email,
                lessonsCompleted: progress?.lessonsCompleted || 0,
                totalScore: progress?.totalScore || 0,
                achievements: progress?.achievements?.length || 0,
                lastActive: progress?.updatedAt || null
            };

            if (progress) {
                totalScore += progress.totalScore || 0;
                totalLessons += progress.lessonsCompleted || 0;
                if (progress.lessonsCompleted > 0) activeStudents++;
            }

            studentStats.push(stats);
        }

        const totalStudents = classroom.students.length;
        const avgScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;
        const avgLessons = totalStudents > 0 ? Math.round(totalLessons / totalStudents * 10) / 10 : 0;
        const engagementRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

        // Get top performers
        const topPerformers = [...studentStats]
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 5);

        // Get recent activity
        const recentActivity = [...studentStats]
            .filter(s => s.lastActive)
            .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
            .slice(0, 10);

        res.json({
            classroom: {
                _id: classroom._id,
                name: classroom.name,
                code: classroom.code
            },
            summary: {
                totalStudents,
                activeStudents,
                avgScore,
                avgLessons,
                engagementRate
            },
            topPerformers,
            recentActivity
        });
    } catch (error) {
        console.error('Error getting classroom analytics:', error);
        res.status(500).json({ message: 'Failed to get analytics' });
    }
};

/**
 * @desc    Get all students' progress in a classroom
 * @route   GET /api/analytics/classroom/:id/students
 * @access  Private (Instructor only)
 */
const getStudentProgress = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id)
            .populate('students', 'name email');

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Verify instructor
        if (classroom.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const studentIds = classroom.students.map(s => s._id);

        // Get detailed progress for all students
        const progressData = await LearningProgress.find({
            userId: { $in: studentIds }
        });

        const students = classroom.students.map(student => {
            const progress = progressData.find(
                p => p.userId.toString() === student._id.toString()
            );

            // Calculate path-by-path progress
            const pathBreakdown = {};
            if (progress?.pathProgress) {
                progress.pathProgress.forEach((value, key) => {
                    const completed = value.completed?.length || 0;
                    const scores = [];
                    if (value.quizScores) {
                        value.quizScores.forEach(score => scores.push(score));
                    }
                    const avgQuizScore = scores.length > 0
                        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                        : 0;

                    pathBreakdown[key] = {
                        lessonsCompleted: completed,
                        avgQuizScore
                    };
                });
            }

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                lessonsCompleted: progress?.lessonsCompleted || 0,
                totalScore: progress?.totalScore || 0,
                achievements: progress?.achievements || [],
                pathBreakdown,
                lastActive: progress?.updatedAt || null,
                joinedAt: student.createdAt
            };
        });

        // Sort options
        const { sortBy = 'totalScore', order = 'desc' } = req.query;
        students.sort((a, b) => {
            const aVal = a[sortBy] || 0;
            const bVal = b[sortBy] || 0;
            return order === 'desc' ? bVal - aVal : aVal - bVal;
        });

        res.json({ students });
    } catch (error) {
        console.error('Error getting student progress:', error);
        res.status(500).json({ message: 'Failed to get student progress' });
    }
};

/**
 * @desc    Get quiz/assignment analytics
 * @route   GET /api/analytics/assignment/:id
 * @access  Private (Instructor only)
 */
const getAssignmentAnalytics = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('submissions.student', 'name email');

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Verify instructor owns the classroom
        const classroom = await Classroom.findById(assignment.classroom);
        if (!classroom || classroom.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Calculate submission stats
        const submissions = assignment.submissions;
        const totalSubmissions = submissions.length;

        const grades = submissions
            .filter(s => s.grade !== null)
            .map(s => s.grade);

        const avgGrade = grades.length > 0
            ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
            : 0;

        const gradeDistribution = {
            'A (90-100)': grades.filter(g => g >= 90).length,
            'B (80-89)': grades.filter(g => g >= 80 && g < 90).length,
            'C (70-79)': grades.filter(g => g >= 70 && g < 80).length,
            'D (60-69)': grades.filter(g => g >= 60 && g < 70).length,
            'F (<60)': grades.filter(g => g < 60).length
        };

        res.json({
            assignment: {
                _id: assignment._id,
                title: assignment.title,
                dueDate: assignment.dueDate,
                maxPoints: assignment.maxPoints
            },
            stats: {
                totalStudents: classroom.students.length,
                totalSubmissions,
                submissionRate: Math.round((totalSubmissions / classroom.students.length) * 100),
                avgGrade,
                gradeDistribution
            },
            submissions: submissions.map(s => ({
                student: s.student,
                submittedAt: s.submittedAt,
                grade: s.grade,
                feedback: s.feedback
            }))
        });
    } catch (error) {
        console.error('Error getting assignment analytics:', error);
        res.status(500).json({ message: 'Failed to get assignment analytics' });
    }
};

/**
 * @desc    Get instructor's overall dashboard stats
 * @route   GET /api/analytics/dashboard
 * @access  Private (Instructor only)
 */
const getInstructorDashboard = async (req, res) => {
    try {
        // Get all classrooms for this instructor
        const classrooms = await Classroom.find({ instructor: req.user._id });

        let totalStudents = 0;
        let totalScore = 0;
        let totalLessons = 0;

        const classroomStats = [];

        for (const classroom of classrooms) {
            const studentIds = classroom.students;
            totalStudents += studentIds.length;

            const progressData = await LearningProgress.find({
                userId: { $in: studentIds }
            });

            let classScore = 0;
            let classLessons = 0;

            progressData.forEach(p => {
                classScore += p.totalScore || 0;
                classLessons += p.lessonsCompleted || 0;
            });

            totalScore += classScore;
            totalLessons += classLessons;

            classroomStats.push({
                _id: classroom._id,
                name: classroom.name,
                code: classroom.code,
                studentCount: studentIds.length,
                avgScore: studentIds.length > 0 ? Math.round(classScore / studentIds.length) : 0,
                isLive: classroom.isLive
            });
        }

        res.json({
            summary: {
                totalClassrooms: classrooms.length,
                totalStudents,
                avgScoreAcrossAll: totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0,
                avgLessonsAcrossAll: totalStudents > 0 ? Math.round(totalLessons / totalStudents * 10) / 10 : 0
            },
            classrooms: classroomStats
        });
    } catch (error) {
        console.error('Error getting instructor dashboard:', error);
        res.status(500).json({ message: 'Failed to get dashboard' });
    }
};

module.exports = {
    getClassroomAnalytics,
    getStudentProgress,
    getAssignmentAnalytics,
    getInstructorDashboard
};
