const Room = require('../models/Room');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getRandomProblem } = require('../scripts/battleProblems');

// Simple HTML sanitizer — strips all tags
const sanitizeText = (str) => (str || '').replace(/<[^>]*>/g, '').trim();

// Throttled DB save — only writes once every 5 seconds per room
const pendingRoomSaves = new Map();
const throttledRoomSave = (roomCode, data) => {
    if (pendingRoomSaves.has(roomCode)) return;
    pendingRoomSaves.set(roomCode, true);
    setTimeout(async () => {
        try {
            await Room.findOneAndUpdate({ roomCode }, data);
        } catch (err) {
            console.error('Throttled room save error:', err);
        } finally {
            pendingRoomSaves.delete(roomCode);
        }
    }, 5000);
};

/**
 * Socket.io handler for peer-to-peer collaboration rooms
 * Namespace: /room
 */

const setupRoomSocket = (io) => {
    const roomIO = io.of('/room');

    // JWT Authentication middleware
    roomIO.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication required'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;

            // Get user name for chat
            const user = await User.findById(decoded.id).select('name');
            socket.userName = user ? user.name : 'Anonymous';
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    roomIO.on('connection', (socket) => {
        console.log(`🔗 User ${socket.userName} (${socket.userId}) connected to room socket`);

        /**
         * Join a room by roomCode
         */
        socket.on('join-room', async (roomCode) => {
            try {
                const room = await Room.findOne({ roomCode, isActive: true })
                    .populate('host', 'name')
                    .populate('participants', 'name');

                if (!room) {
                    socket.emit('error', { message: 'Room not found or expired' });
                    return;
                }

                // Check capacity
                if (room.participants.length >= room.maxParticipants &&
                    !room.participants.some(p => p._id.toString() === socket.userId)) {
                    socket.emit('error', { message: 'Room is full' });
                    return;
                }

                // Add participant if not already in
                if (!room.participants.some(p => p._id.toString() === socket.userId)) {
                    room.participants.push(socket.userId);
                    await room.save();
                }

                // Join socket room
                socket.join(roomCode);
                socket.roomCode = roomCode;

                // Get updated participant list
                const updatedRoom = await Room.findOne({ roomCode })
                    .populate('host', 'name')
                    .populate('participants', 'name');

                // Send room state to joining user
                socket.emit('room-state', {
                    roomCode: updatedRoom.roomCode,
                    name: updatedRoom.name,
                    host: updatedRoom.host,
                    participants: updatedRoom.participants,
                    code: updatedRoom.code,
                    language: updatedRoom.language,
                    mode: updatedRoom.mode || 'collaborate',
                    battle: updatedRoom.battle || null,
                    chat: (updatedRoom.chat || []).slice(-50).map(m => ({
                        userName: m.userName,
                        message: m.message,
                        timestamp: m.timestamp
                    }))
                });

                // Broadcast updated participant list to everyone
                roomIO.to(roomCode).emit('participants-update', {
                    participants: updatedRoom.participants
                });

                // Notify others
                socket.to(roomCode).emit('user-joined', {
                    userId: socket.userId,
                    userName: socket.userName
                });

                console.log(`👤 ${socket.userName} joined room ${roomCode}`);
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        /**
         * Code update — broadcast to all peers (last-write-wins)
         */
        socket.on('code-update', async (data) => {
            if (!socket.roomCode) return;

            // Broadcast to others in the room
            socket.to(socket.roomCode).emit('code-sync', {
                code: data.code,
                userId: socket.userId,
                userName: socket.userName
            });

            // Throttled DB save — only writes once every 5 seconds
            throttledRoomSave(socket.roomCode, { code: data.code });
        });

        /**
         * Language change — sync across all participants
         */
        socket.on('language-change', async (data) => {
            if (!socket.roomCode) return;

            socket.to(socket.roomCode).emit('language-sync', {
                language: data.language,
                userName: socket.userName
            });

            try {
                await Room.findOneAndUpdate(
                    { roomCode: socket.roomCode },
                    { language: data.language }
                );
            } catch (error) {
                console.error('Language change error:', error);
            }
        });

        /**
         * Cursor position sharing for presence awareness
         */
        socket.on('cursor-update', (data) => {
            if (!socket.roomCode) return;

            socket.to(socket.roomCode).emit('cursor-sync', {
                userId: socket.userId,
                userName: socket.userName,
                line: data.line,
                column: data.column
            });
        });

        /**
         * Chat message
         */
        socket.on('chat-message', async (data) => {
            if (!socket.roomCode || !data.message?.trim()) return;

            const chatMsg = {
                user: socket.userId,
                userName: socket.userName,
                message: sanitizeText(data.message).substring(0, 500),
                timestamp: new Date()
            };

            // Broadcast to everyone in room (including sender)
            roomIO.to(socket.roomCode).emit('chat-message', chatMsg);

            // Save to DB with $slice cap at 200 messages
            try {
                await Room.findOneAndUpdate(
                    { roomCode: socket.roomCode },
                    { $push: { chat: { $each: [chatMsg], $slice: -200 } } }
                );
            } catch (error) {
                console.error('Chat save error:', error);
            }
        });

        // ─── BATTLE MODE EVENTS ───

        /**
         * Host starts a battle — picks problem, broadcasts to room
         */
        socket.on('battle-start', async (data) => {
            if (!socket.roomCode) return;

            try {
                const room = await Room.findOne({ roomCode: socket.roomCode });
                if (!room || room.mode !== 'battle') return;
                if (room.host.toString() !== socket.userId) {
                    socket.emit('error', { message: 'Only the host can start the battle' });
                    return;
                }

                // Get random problem based on difficulty
                const problem = getRandomProblem(data.difficulty || null);

                room.battle = {
                    problem,
                    status: 'countdown',
                    startTime: new Date(Date.now() + 5000), // 5 sec countdown
                    submissions: []
                };
                await room.save();

                // Broadcast countdown
                roomIO.to(socket.roomCode).emit('battle-countdown', {
                    seconds: 5,
                    problem: {
                        title: problem.title,
                        description: problem.description,
                        difficulty: problem.difficulty,
                        xpReward: problem.xpReward,
                        timeLimit: problem.timeLimit
                    }
                });

                // After countdown, set to active
                setTimeout(async () => {
                    const r = await Room.findOne({ roomCode: socket.roomCode });
                    if (r && r.battle) {
                        r.battle.status = 'active';
                        r.battle.startTime = new Date();
                        await r.save();

                        roomIO.to(socket.roomCode).emit('battle-active', {
                            starterCode: problem.starterCode,
                            timeLimit: problem.timeLimit,
                            startTime: r.battle.startTime
                        });
                    }
                }, 5000);

                console.log(`⚔️ Battle started in room ${socket.roomCode}: ${problem.title}`);
            } catch (error) {
                console.error('Battle start error:', error);
                socket.emit('error', { message: 'Failed to start battle' });
            }
        });

        /**
         * Player submits their solution
         */
        socket.on('battle-submit', async (data) => {
            if (!socket.roomCode) return;

            try {
                const room = await Room.findOne({ roomCode: socket.roomCode });
                if (!room || !room.battle || room.battle.status !== 'active') return;

                // Check if already submitted
                const alreadySubmitted = room.battle.submissions.some(
                    s => s.userId.toString() === socket.userId
                );
                if (alreadySubmitted) {
                    socket.emit('error', { message: 'Already submitted' });
                    return;
                }

                // Multi-test-case validation
                const problem = room.battle.problem;
                const testCases = problem.testCases || [];
                let testCaseResults = [];
                let isCorrect = false;

                if (testCases.length > 0) {
                    // New multi-test format — compare output per test case
                    // data.testOutputs should be an array of outputs from the frontend
                    const outputs = data.testOutputs || [];
                    testCaseResults = testCases.map((tc, i) => {
                        const actual = (outputs[i] || '').trim();
                        const expected = (tc.expectedOutput || '').trim();
                        return { passed: actual === expected, input: tc.input, expected, actual };
                    });
                    isCorrect = testCaseResults.every(r => r.passed);
                } else {
                    // Legacy single-output format (backward compatible)
                    const userOutput = (data.output || '').trim();
                    const expectedOutput = (problem.expectedOutput || '').trim();
                    isCorrect = userOutput === expectedOutput;
                    testCaseResults = [{ passed: isCorrect, input: '', expected: expectedOutput, actual: userOutput }];
                }

                room.battle.submissions.push({
                    userId: socket.userId,
                    userName: socket.userName,
                    code: data.code,
                    output: userOutput,
                    correct: isCorrect,
                    submittedAt: new Date()
                });

                // Check if this is the first correct submission (winner!)
                if (isCorrect && !room.battle.winner) {
                    room.battle.winner = socket.userId;
                    room.battle.winnerName = socket.userName;
                    room.battle.status = 'finished';
                    room.battle.endTime = new Date();

                    // Award XP to winner
                    try {
                        const xp = room.battle.problem.xpReward || 50;
                        await User.findByIdAndUpdate(socket.userId, {
                            $inc: { xp: xp }
                        });
                    } catch { /* silent */ }
                }

                await room.save();

                // Broadcast result
                roomIO.to(socket.roomCode).emit('battle-submission', {
                    userId: socket.userId,
                    userName: socket.userName,
                    correct: isCorrect,
                    testCaseResults,
                    passedCount: testCaseResults.filter(r => r.passed).length,
                    totalCount: testCaseResults.length,
                    submittedAt: new Date()
                });

                // If winner determined, broadcast final result
                if (room.battle.status === 'finished') {
                    roomIO.to(socket.roomCode).emit('battle-finished', {
                        winner: {
                            userId: room.battle.winner,
                            userName: room.battle.winnerName
                        },
                        submissions: room.battle.submissions.map(s => ({
                            userId: s.userId,
                            userName: s.userName,
                            correct: s.correct,
                            submittedAt: s.submittedAt
                        })),
                        xpAwarded: room.battle.problem.xpReward
                    });
                }

                // If all participants submitted (even if no winner), end battle
                if (room.battle.submissions.length >= room.participants.length && room.battle.status !== 'finished') {
                    room.battle.status = 'finished';
                    room.battle.endTime = new Date();
                    await room.save();

                    roomIO.to(socket.roomCode).emit('battle-finished', {
                        winner: null,
                        submissions: room.battle.submissions.map(s => ({
                            userId: s.userId,
                            userName: s.userName,
                            correct: s.correct,
                            submittedAt: s.submittedAt
                        })),
                        xpAwarded: 0
                    });
                }

                console.log(`📝 ${socket.userName} submitted battle solution: ${isCorrect ? '✅ CORRECT' : '❌ WRONG'}`);
            } catch (error) {
                console.error('Battle submit error:', error);
                socket.emit('error', { message: 'Failed to submit' });
            }
        });

        /**
         * Relay typing progress (lines count, no code leak)
         */
        socket.on('battle-progress', (data) => {
            if (!socket.roomCode) return;
            socket.to(socket.roomCode).emit('battle-opponent-progress', {
                userId: socket.userId,
                userName: socket.userName,
                lineCount: data.lineCount || 0,
                charCount: data.charCount || 0
            });
        });

        /**
         * Leave room
         */
        socket.on('leave-room', async () => {
            await handleLeave(socket, roomIO);
        });

        /**
         * Disconnect
         */
        socket.on('disconnect', async () => {
            await handleLeave(socket, roomIO);
            console.log(`🔗 User ${socket.userName} disconnected from room socket`);
        });
    });

    return roomIO;
};

/**
 * Handle user leaving a room
 */
async function handleLeave(socket, roomIO) {
    if (!socket.roomCode) return;

    const roomCode = socket.roomCode;
    socket.leave(roomCode);

    try {
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        // Remove from participants
        room.participants = room.participants.filter(
            p => p.toString() !== socket.userId
        );

        // If room is empty, deactivate it
        if (room.participants.length === 0) {
            room.isActive = false;
        }

        await room.save();

        // Get updated list
        const updatedRoom = await Room.findOne({ roomCode })
            .populate('participants', 'name');

        // Broadcast updated participants
        roomIO.to(roomCode).emit('participants-update', {
            participants: updatedRoom?.participants || []
        });

        roomIO.to(roomCode).emit('user-left', {
            userId: socket.userId,
            userName: socket.userName
        });
    } catch (error) {
        console.error('Leave room error:', error);
    }

    socket.roomCode = null;
}

module.exports = setupRoomSocket;
