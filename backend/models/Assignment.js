const mongoose = require('mongoose');

/**
 * Assignment Model
 * Stores coding exercises assigned to a classroom
 */

const submissionSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'python'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    grade: {
        type: Number,
        min: 0,
        max: 100,
        default: null  // null = not graded yet
    },
    feedback: {
        type: String,
        default: ''
    },
    // Authorship telemetry (same signals as the main submission pipeline) so the
    // per-cohort integrity dashboard can flag pasted-in work.
    integrity: {
        typedChars: { type: Number, default: 0 },
        pastedChars: { type: Number, default: 0 },
        keystrokes: { type: Number, default: 0 },
        durationMs: { type: Number, default: 0 },
        pasteRatio: { type: Number, default: 0 }, // pasted / (typed + pasted)
        flagged: { type: Boolean, default: false } // high paste ratio → likely not hand-typed
    }
});

const assignmentSchema = mongoose.Schema(
    {
        // Which classroom this belongs to
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom',
            required: true
        },

        // Assignment details
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ''
        },

        // Expected output for automated grading
        expectedOutput: {
            type: String,
            default: ''
        },

        // Starter code template
        starterCode: {
            type: String,
            default: '# Write your solution here\n'
        },

        // Expected language
        language: {
            type: String,
            default: 'python'
        },

        // Due date (optional)
        dueDate: {
            type: Date,
            default: null
        },

        // Points possible
        maxPoints: {
            type: Number,
            default: 100
        },

        // Student submissions
        submissions: [submissionSchema],

        // Is assignment published (visible to students)
        isPublished: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Get submission count
assignmentSchema.virtual('submissionCount').get(function () {
    return this.submissions ? this.submissions.length : 0;
});

// Check if student has submitted
assignmentSchema.methods.hasSubmitted = function (studentId) {
    return this.submissions.some(s => s.student.toString() === studentId.toString());
};

// Get student's submission
assignmentSchema.methods.getSubmission = function (studentId) {
    return this.submissions.find(s => s.student.toString() === studentId.toString());
};

// Check if past due
assignmentSchema.methods.isPastDue = function () {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate;
};

module.exports = mongoose.model('Assignment', assignmentSchema);
