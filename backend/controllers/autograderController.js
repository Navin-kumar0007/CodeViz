const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');
const axios = require('axios');

// @desc    Submit and auto-grade an assignment
// @route   POST /api/autograder/:assignmentId
// @access  Private
const submitAssignment = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
        res.status(404);
        throw new Error('Assignment not found');
    }

    // --- Secure Docker Execution ---
    try {
        const dockerService = require('../services/dockerService');
        const runRes = await dockerService.runInSandbox(code, assignment.language, '');

        if (runRes.error && !runRes.output) {
            return res.json({
                success: false,
                grade: 0,
                feedback: `Execution Error: ${runRes.error}`,
                isCorrect: false
            });
        }

        if (runRes.error) {
            return res.json({
                success: false,
                grade: 0,
                feedback: `Compile/Runtime Error: ${runRes.error}`,
                isCorrect: false
            });
        }

        let output = runRes.output || '';

        // Compare output
        const actual = output.trim();
        const expected = (assignment.expectedOutput || '').trim();

        let isCorrect = true;
        let feedback = '';
        let grade = assignment.maxPoints;

        if (expected && actual !== expected) {
            isCorrect = false;
            grade = 0;
            feedback = `Output mismatch.\nExpected: ${expected}\nGot: ${actual}`;
        } else {
            feedback = 'Perfect! Output matches the expected result.';
        }

        // Authorship telemetry → integrity flag (typed vs pasted).
        const t = req.body.integrity || {};
        const typed = Math.max(0, t.typedChars || 0);
        const pasted = Math.max(0, t.pastedChars || 0);
        const totalChars = typed + pasted;
        const pasteRatio = totalChars ? Number((pasted / totalChars).toFixed(2)) : 0;
        const integrity = {
            typedChars: typed,
            pastedChars: pasted,
            keystrokes: t.keystrokes || 0,
            durationMs: t.durationMs || 0,
            pasteRatio,
            flagged: pasteRatio >= 0.6 && pasted > 40, // mostly-pasted, non-trivial size
        };

        // Update submission
        let submissionIndex = assignment.submissions.findIndex(s => s.student.toString() === req.user._id.toString());
        if (submissionIndex >= 0) {
            assignment.submissions[submissionIndex].code = code;
            assignment.submissions[submissionIndex].grade = grade;
            assignment.submissions[submissionIndex].feedback = feedback;
            assignment.submissions[submissionIndex].submittedAt = new Date();
            assignment.submissions[submissionIndex].integrity = integrity;
        } else {
            assignment.submissions.push({
                student: req.user._id,
                code,
                language: assignment.language,
                grade,
                feedback,
                integrity
            });
        }

        await assignment.save();

        res.json({
            success: true,
            grade,
            maxPoints: assignment.maxPoints,
            feedback,
            output: actual,
            isCorrect
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Execution failed', error: error.message });
    }
});

module.exports = { submitAssignment };
