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
const aiRoutes = require('./routes/aiRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const roomRoutes = require('./routes/roomRoutes');
const dailyChallengeRoutes = require('./routes/dailyChallengeRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const campusRoutes = require('./routes/campusRoutes');

// Socket handlers
const setupClassroomSocket = require('./socket/classroomSocket');
const setupRoomSocket = require('./socket/roomSocket');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger'); // 🪵 Import Logger

// 1. Connect to Database
connectDB();

// 🧊 Connect to Redis (Graceful)
const { connectRedis } = require('./config/redis');
connectRedis();

const app = express();

// 🛡️ SECURITY MIDDLEWARE
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Required for Vite/localhost fetching
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// 🪵 LOGGING MIDDLEWARE (Morgan -> Winston)
app.use(morgan('combined', { stream: logger.stream }));

// Global Rate Limit
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Reasonable protection limits
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ error: "Too many requests. Please wait." });
    }
});
app.use(globalLimiter);

// 🤖 AI Security Rate Limit
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // Max 30 AI Assistance prompts per 15 minutes
    message: { error: "AI Assistant is resting. Too many requests! Please wait a few minutes." }
});

// ⚡️ STRICTER Execution Limit
const executionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50, // ⚡️ DEV MODE: 50 executions per minute (Allow rapid testing)
    message: { error: "Too many code executions. Please wait." }
});

// 2. Create HTTP server (required for Socket.io)
const server = http.createServer(app);

let allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

// 3. Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Setup socket handlers
setupClassroomSocket(io);
setupRoomSocket(io);

// Make io accessible to routes if needed
app.set('io', io);

// 4. Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// 5. Routes
app.use('/run', executionLimiter);
app.use('/trace', executionLimiter);
app.use('/', codeRoutes); // 🛡️ Apply strict limit to execution endpoints only
app.use('/api/users', userRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiLimiter, aiRoutes); // 🛡️ Apply deep limit to expensive LLM calls
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/challenges', dailyChallengeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/campus', campusRoutes);

// 🌱 Temporary Seed Route removed (Data seeded successfully)

// 6. Test Route
app.get('/', (req, res) => {
    res.send('API is running with Socket.io support...');
});

// 7. Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📡 Socket.io ready for connections`);
});

// Graceful error handling for server
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use. Kill the other process: lsof -ti:${PORT} | xargs kill -9`);
    } else if (err.code === 'EPERM') {
        logger.error(`❌ Permission denied on port ${PORT}. Try a different port.`);
    } else {
        logger.error(`❌ Server error: ${err.message}`);
    }
    process.exit(1);
});