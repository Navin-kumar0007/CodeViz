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

// Socket handlers
const setupClassroomSocket = require('./socket/classroomSocket');

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
app.use(helmet());

// 🪵 LOGGING MIDDLEWARE (Morgan -> Winston)
app.use(morgan('combined', { stream: logger.stream }));

// Global Rate Limit
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000, // ⚡️ DEV MODE: 5000 requests per 15 mins (Prevent 429s)
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ error: "Too many requests" });
    }
});
app.use(globalLimiter);

// ⚡️ STRICTER Execution Limit
const executionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50, // ⚡️ DEV MODE: 50 executions per minute (Allow rapid testing)
    message: { error: "Too many code executions. Please wait." }
});

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
app.use('/', executionLimiter, codeRoutes); // 🛡️ Apply strict limit to execution
app.use('/api/users', userRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/discussions', discussionRoutes);

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