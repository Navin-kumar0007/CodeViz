const Classroom = require('../models/Classroom');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Socket.io handler for classroom real-time features
 * Handles live code broadcasting and classroom presence
 */

const setupClassroomSocket = (io) => {
    // Namespace for classroom features
    const classroomIO = io.of('/classroom');
    const roomUsers = new Map(); // classroomId -> Map(socketId -> { userId, name, isInstructor })

    // Authentication middleware for socket connections
    classroomIO.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    classroomIO.on('connection', (socket) => {
        console.log(`📡 User ${socket.userId} connected to classroom socket`);

        /**
         * Join a classroom room
         * @param {string} classroomId - The classroom ID to join
         */
        socket.on('join-classroom', async (classroomId) => {
            try {
                const classroom = await Classroom.findById(classroomId)
                    .populate('instructor', 'name')
                    .populate('students', 'name');

                if (!classroom) {
                    socket.emit('error', { message: 'Classroom not found' });
                    return;
                }

                // Check if user has access
                const isInstructor = classroom.instructor._id.toString() === socket.userId;
                const isEnrolled = classroom.students.some(s => (s._id || s).toString() === socket.userId);

                if (!isInstructor && !isEnrolled && !classroom.settings?.isPublic) {
                    socket.emit('error', { message: 'Not authorized' });
                    return;
                }

                // Join the room
                socket.join(classroomId);
                socket.classroomId = classroomId;
                socket.isInstructor = isInstructor;

                console.log(`👤 User ${socket.userId} joined classroom ${classroomId}`);

                let userName = 'Unknown';
                if (isInstructor) {
                    userName = classroom.instructor.name;
                } else {
                    const student = classroom.students.find(s => (s._id || s).toString() === socket.userId);
                    if (student) {
                        userName = student.name;
                    } else {
                        // User is viewing but not formally enrolled
                        const publicUser = await User.findById(socket.userId).select('name');
                        if (publicUser) userName = publicUser.name;
                    }
                }

                // Add to active users
                if (!roomUsers.has(classroomId)) {
                    roomUsers.set(classroomId, new Map());
                }

                const roomMap = roomUsers.get(classroomId);
                const isRejoin = roomMap.has(socket.userId);

                roomMap.set(socket.userId, {
                    socketId: socket.id,
                    userId: socket.userId,
                    name: userName,
                    isInstructor: isInstructor
                });

                // Send current state to the joining user
                socket.emit('classroom-state', {
                    isLive: classroom.isLive,
                    code: classroom.liveCode,
                    language: classroom.liveLanguage,
                    instructor: classroom.instructor.name,
                    allowStudentEditing: classroom.allowStudentEditing,
                    activeEditor: classroom.activeEditor
                });

                // Emit roster update to everyone in the room
                io.of('/classroom').to(classroomId).emit('roster-update', Array.from(roomUsers.get(classroomId).values()));

                // Emit System log to Chat only if not rejoining from another tab
                if (!isRejoin) {
                    const joinMsg = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        name: 'System',
                        text: `${userName} joined the classroom.`,
                        isInstructor: false,
                        isSystem: true,
                        timestamp: new Date().toISOString()
                    };
                    io.of('/classroom').to(classroomId).emit('receive-chat-message', joinMsg);
                }

                // Notify others (if instructor joins, students know)
                if (isInstructor) {
                    socket.to(classroomId).emit('instructor-joined');
                }
            } catch (error) {
                console.error('Join classroom error:', error);
                socket.emit('error', { message: 'Failed to join classroom' });
            }
        });

        /**
         * Instructor or ActiveEditor broadcasts code update
         * @param {object} data - { code, language }
         */
        socket.on('code-update', async (data) => {
            try {
                const classroom = await Classroom.findById(socket.classroomId);
                const isEditor = socket.isInstructor || (classroom.activeEditor && classroom.activeEditor.toString() === socket.userId);

                if (!isEditor) {
                    socket.emit('error', { message: 'Only the active editor can broadcast code' });
                    return;
                }

                // Broadcast to all students in the room
                socket.to(socket.classroomId).emit('code-sync', {
                    code: data.code,
                    language: data.language || 'python',
                    editorId: socket.userId
                });

                // Periodically save to database (throttled in real app)
                await Classroom.findByIdAndUpdate(socket.classroomId, {
                    liveCode: data.code,
                    liveLanguage: data.language || 'python'
                });
            } catch (error) {
                console.error('Code update error:', error);
            }
        });

        /**
         * Interactive Whiteboard Object Broadcasting
         */
        socket.on('whiteboard-update', async (data) => {
            try {
                const classroom = await Classroom.findById(socket.classroomId);
                const isEditor = socket.isInstructor || (classroom.activeEditor && classroom.activeEditor.toString() === socket.userId);

                if (!isEditor) {
                    return;
                }

                // Broadcast to all students in the room
                socket.to(socket.classroomId).emit('whiteboard-sync', {
                    elements: data.elements,
                    appState: data.appState,
                    editorId: socket.userId
                });
            } catch (error) {
                console.error('Whiteboard update error:', error);
            }
        });

        /**
         * Student requests edit access (Raise Hand)
         */
        socket.on('request-edit-access', () => {
            if (socket.isInstructor) return;
            // Forward request to the instructor(s) in the room
            socket.to(socket.classroomId).emit('edit-access-requested', {
                userId: socket.userId
            });
        });

        /**
         * Instructor grants edit access to a student
         */
        socket.on('grant-edit-access', async (targetUserId) => {
            if (!socket.isInstructor) {
                socket.emit('error', { message: 'Only instructor can grant edit access' });
                return;
            }
            try {
                await Classroom.findByIdAndUpdate(socket.classroomId, {
                    activeEditor: targetUserId
                });
                io.of('/classroom').to(socket.classroomId).emit('edit-access-granted', {
                    activeEditor: targetUserId
                });

                const grantedUser = Array.from(roomUsers.get(socket.classroomId)?.values() || []).find(u => u.userId === targetUserId);
                const sysMsg = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: 'System',
                    text: `${grantedUser ? grantedUser.name : 'A user'} was passed the chalk.`,
                    isSystem: true,
                    timestamp: new Date().toISOString()
                };
                io.of('/classroom').to(socket.classroomId).emit('receive-chat-message', sysMsg);

            } catch (error) {
                console.error('Grant access error:', error);
            }
        });

        /**
         * Revoke edit access (Instructor takes back control or Student yields)
         */
        socket.on('revoke-edit-access', async () => {
            try {
                const classroom = await Classroom.findById(socket.classroomId);
                if (!socket.isInstructor && classroom.activeEditor?.toString() !== socket.userId) {
                    return; // Ignore if neither instructor nor the active editor
                }
                await Classroom.findByIdAndUpdate(socket.classroomId, {
                    activeEditor: null
                });
                io.of('/classroom').to(socket.classroomId).emit('edit-access-revoked');
            } catch (error) {
                console.error('Revoke access error:', error);
            }
        });

        /**
         * Real-time Chat
         */
        socket.on('send-chat-message', (messageText) => {
            if (!socket.classroomId || !roomUsers.has(socket.classroomId)) return;
            const userObj = roomUsers.get(socket.classroomId).get(socket.userId);
            if (!userObj) return;

            const chatMessage = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                userId: userObj.userId,
                name: userObj.name,
                text: messageText,
                isInstructor: userObj.isInstructor,
                timestamp: new Date().toISOString()
            };

            io.of('/classroom').to(socket.classroomId).emit('receive-chat-message', chatMessage);
        });

        /**
         * Instructor starts live session
         */
        socket.on('start-session', async () => {
            if (!socket.isInstructor) {
                socket.emit('error', { message: 'Only instructor can start session' });
                return;
            }

            try {
                await Classroom.findByIdAndUpdate(socket.classroomId, {
                    isLive: true
                });

                // Notify all students
                socket.to(socket.classroomId).emit('session-started');
                socket.emit('session-started');

                const sysMsg = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name: 'System',
                    text: `The instructor has started the live session.`,
                    isSystem: true,
                    timestamp: new Date().toISOString()
                };
                io.of('/classroom').to(socket.classroomId).emit('receive-chat-message', sysMsg);

                console.log(`🟢 Live session started in ${socket.classroomId}`);
            } catch (error) {
                console.error('Start session error:', error);
            }
        });

        /**
         * Instructor ends live session
         */
        socket.on('end-session', async () => {
            if (!socket.isInstructor) {
                socket.emit('error', { message: 'Only instructor can end session' });
                return;
            }

            try {
                await Classroom.findByIdAndUpdate(socket.classroomId, {
                    isLive: false
                });

                // Notify all students
                socket.to(socket.classroomId).emit('session-ended');
                socket.emit('session-ended');

                console.log(`🔴 Live session ended in ${socket.classroomId}`);
            } catch (error) {
                console.error('End session error:', error);
            }
        });

        /**
         * Handle disconnect
         */
        socket.on('disconnect', () => {
            console.log(`📡 User ${socket.userId} disconnected`);

            if (socket.classroomId && socket.isInstructor) {
                // Notify students instructor left
                socket.to(socket.classroomId).emit('instructor-left');
            }

            if (socket.classroomId && roomUsers.has(socket.classroomId)) {
                const roomMap = roomUsers.get(socket.classroomId);
                const userSession = roomMap.get(socket.userId);

                // Only delete the user from the roster if this disconnecting socket is their active session
                if (userSession && userSession.socketId === socket.id) {
                    roomMap.delete(socket.userId);
                    io.of('/classroom').to(socket.classroomId).emit('roster-update', Array.from(roomMap.values()));

                    const leaveMsg = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        name: 'System',
                        text: `${userSession.name} left the classroom.`,
                        isInstructor: false,
                        isSystem: true,
                        timestamp: new Date().toISOString()
                    };
                    io.of('/classroom').to(socket.classroomId).emit('receive-chat-message', leaveMsg);
                }
            }
        });
    });

    return classroomIO;
};

module.exports = setupClassroomSocket;
