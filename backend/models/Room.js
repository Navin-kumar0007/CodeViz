const mongoose = require('mongoose');

/**
 * Room Model
 * Peer-to-peer collaboration rooms for real-time code editing
 */

const roomSchema = mongoose.Schema(
    {
        // Unique 6-character join code
        roomCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            minlength: 6,
            maxlength: 6
        },

        // Room name
        name: {
            type: String,
            required: true,
            trim: true
        },

        // Creator of the room
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Active participants
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],

        // Max participants
        maxParticipants: {
            type: Number,
            default: 5,
            max: 10
        },

        // Shared code
        code: {
            type: String,
            default: '# Start coding together!\nprint("Hello, World!")\n'
        },

        // Programming language
        language: {
            type: String,
            default: 'python',
            enum: ['python', 'javascript', 'java', 'cpp']
        },

        // Room visibility
        isPublic: {
            type: Boolean,
            default: true
        },

        // Active status (rooms auto-expire)
        isActive: {
            type: Boolean,
            default: true
        },

        // Chat messages (embedded)
        chat: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            userName: String,
            message: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],

        // Auto-expire after 2 hours
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 2 * 60 * 60 * 1000)
        },

        // ─── Battle Mode Fields ───
        mode: {
            type: String,
            enum: ['collaborate', 'battle'],
            default: 'collaborate'
        },

        battle: {
            problem: {
                title: String,
                description: String,
                starterCode: String,
                expectedOutput: String,
                difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
                xpReward: { type: Number, default: 50 },
                timeLimit: { type: Number, default: 600 } // seconds
            },
            startTime: Date,
            endTime: Date,
            status: {
                type: String,
                enum: ['waiting', 'countdown', 'active', 'finished'],
                default: 'waiting'
            },
            submissions: [{
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                userName: String,
                code: String,
                output: String,
                correct: Boolean,
                submittedAt: Date
            }],
            winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            winnerName: String
        }
    },
    { timestamps: true }
);

// TTL index — auto-delete expired rooms
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast room lookups by code + active status
roomSchema.index({ roomCode: 1, isActive: 1 });

// Generate unique 6-character code
roomSchema.statics.generateCode = async function () {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    let exists = true;

    while (exists) {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        exists = await this.findOne({ roomCode: code, isActive: true });
    }

    return code;
};

module.exports = mongoose.model('Room', roomSchema);
