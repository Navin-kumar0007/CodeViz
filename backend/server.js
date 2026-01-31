require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Route imports
const codeRoutes = require('./routes/codeRoutes');
const userRoutes = require('./routes/userRoutes');
const snippetRoutes = require('./routes/snippetRoutes');
const progressRoutes = require('./routes/progressRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const quizRoutes = require('./routes/quizRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Socket handlers
const setupClassroomSocket = require('./socket/classroomSocket');

// 1. Connect to Database
connectDB();

const app = express();

// 2. Create HTTP server (required for Socket.io)
const server = http.createServer(app);

// 3. Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Setup socket handlers
setupClassroomSocket(io);

// Make io accessible to routes if needed
app.set('io', io);

// 4. Middleware
app.use(cors());
app.use(express.json());

// 5. Routes
app.use('/', codeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// 6. Test Route
app.get('/', (req, res) => {
    res.send('API is running with Socket.io support...');
});

// 7. Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready for connections`);
});