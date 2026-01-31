const mongoose = require('mongoose');

/**
 * Classroom Model
 * Stores classroom data, enrolled students, and live session state
 */

const classroomSchema = mongoose.Schema(
    {
        // Unique 6-character join code (auto-generated)
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            minlength: 6,
            maxlength: 6
        },

        // Classroom name
        name: {
            type: String,
            required: true,
            trim: true
        },

        // Description
        description: {
            type: String,
            default: ''
        },

        // Instructor who created the classroom
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Enrolled students
        students: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],

        // Live session state
        isLive: {
            type: Boolean,
            default: false
        },

        // Current code being shared (for live sessions)
        liveCode: {
            type: String,
            default: ''
        },

        // Language for live code
        liveLanguage: {
            type: String,
            default: 'python'
        },

        // Classroom settings
        settings: {
            isPublic: {
                type: Boolean,
                default: true  // Visible in classroom browser
            },
            maxStudents: {
                type: Number,
                default: 50
            },
            allowChat: {
                type: Boolean,
                default: true
            }
        },

        // Status
        isActive: {
            type: Boolean,
            default: true  // Archivable
        }
    },
    { timestamps: true }
);

// Generate unique 6-character code
classroomSchema.statics.generateCode = async function () {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
    let code;
    let exists = true;

    while (exists) {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        exists = await this.findOne({ code });
    }

    return code;
};

// Get student count
classroomSchema.virtual('studentCount').get(function () {
    return this.students ? this.students.length : 0;
});

// Check if user is enrolled
classroomSchema.methods.isEnrolled = function (userId) {
    return this.students.some(s => s.toString() === userId.toString());
};

// Check if user is instructor
classroomSchema.methods.isInstructor = function (userId) {
    return this.instructor.toString() === userId.toString();
};

module.exports = mongoose.model('Classroom', classroomSchema);
