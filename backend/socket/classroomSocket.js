const Classroom = require('../models/Classroom');
const jwt = require('jsonwebtoken');

/**
 * Socket.io handler for classroom real-time features
 * Handles live code broadcasting and classroom presence
 */

const setupClassroomSocket = (io) => {
    // Namespace for classroom features
    const classroomIO = io.of('/classroom');

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
                    .populate('instructor', 'name');

                if (!classroom) {
                    socket.emit('error', { message: 'Classroom not found' });
                    return;
                }

                // Check if user has access
                const isInstructor = classroom.instructor._id.toString() === socket.userId;
                const isEnrolled = classroom.students.some(s => s.toString() === socket.userId);

                if (!isInstructor && !isEnrolled) {
                    socket.emit('error', { message: 'Not authorized' });
                    return;
                }

                // Join the room
                socket.join(classroomId);
                socket.classroomId = classroomId;
                socket.isInstructor = isInstructor;

                console.log(`👤 User ${socket.userId} joined classroom ${classroomId}`);

                // Send current state to the joining user
                socket.emit('classroom-state', {
                    isLive: classroom.isLive,
                    code: classroom.liveCode,
                    language: classroom.liveLanguage,
                    instructor: classroom.instructor.name
                });

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
         * Instructor broadcasts code update
         * @param {object} data - { code, language }
         */
        socket.on('code-update', async (data) => {
            if (!socket.isInstructor) {
                socket.emit('error', { message: 'Only instructor can broadcast code' });
                return;
            }

            try {
                // Broadcast to all students in the room
                socket.to(socket.classroomId).emit('code-sync', {
                    code: data.code,
                    language: data.language || 'python'
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
        });
    });

    return classroomIO;
};

module.exports = setupClassroomSocket;
