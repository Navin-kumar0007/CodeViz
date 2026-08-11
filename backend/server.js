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
const interviewRoutes = require('./routes/interviewRoutes');
const plagiarismRoutes = require('./routes/plagiarismRoutes');
const videoRoutes = require('./routes/videoRoutes');
const reportRoutes = require('./routes/reportRoutes');
const problemRoutes = require('./routes/problemRoutes');
const peerReviewRoutes = require('./routes/peerReviewRoutes');
const autograderRoutes = require('./routes/autograderRoutes');

// Socket handlers
const setupClassroomSocket = require('./socket/classroomSocket');
const setupRoomSocket = require('./socket/roomSocket');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger'); // 🪵 Import Logger
const cookieParser = require('cookie-parser');

// 🔒 Production config guard — refuse to boot with insecure/missing secrets so a
// misconfigured prod deploy fails loudly instead of running wide open.
if (process.env.NODE_ENV === 'production') {
    const problems = [];
    const secret = process.env.JWT_SECRET || '';
    if (!secret || secret.length < 24 || /^(secret|changeme|dev|test|codeviz)/i.test(secret)) {
        problems.push('JWT_SECRET must be set to a long, random value (>= 24 chars).');
    }
    if (!process.env.MONGO_URI) problems.push('MONGO_URI must be set (use MongoDB Atlas, not localhost).');
    if (!process.env.FRONTEND_URL) problems.push('FRONTEND_URL should be set for CORS + email links.');
    if (problems.length) {
        console.error('\n❌ Refusing to start in production — fix these:\n  - ' + problems.join('\n  - ') + '\n');
        process.exit(1);
    }
}

// 1. Connect to Database
connectDB();

// 🧊 Connect to Redis (Graceful)
const { connectRedis } = require('./config/redis');
connectRedis();

const app = express();

// 🛰️ Error monitoring (Sentry) — no-op unless SENTRY_DSN is set.
let Sentry = null;
if (process.env.SENTRY_DSN) {
    try {
        Sentry = require('@sentry/node');
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: 0.1,
        });
        logger.info('🛰️  Sentry error monitoring enabled');
    } catch (e) { console.warn('Sentry init skipped:', e.message); Sentry = null; }
}

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

// Accept an explicit allow-list, plus any Cloudflare quick-tunnel domain (whose
// URL changes each run) so local tunnel testing needs no reconfiguration.
const corsOrigin = (origin, cb) => {
    if (!origin) return cb(null, true); // curl / same-origin / mobile apps
    if (allowedOrigins.includes(origin) || /\.trycloudflare\.com$/.test(origin) || /\.ngrok(-free)?\.app$/.test(origin)) {
        return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'));
};

// 3. Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: corsOrigin,
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
    origin: corsOrigin,
    credentials: true
}));

// 💳 Stripe webhook needs the RAW body for signature verification — mount it
// BEFORE express.json() so the JSON parser doesn't consume the body.
const billingRoutes = require('./routes/billingRoutes');
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingRoutes.webhookHandler);

app.use(express.json());
app.use(cookieParser());

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
app.use('/api/certificates', require('./routes/certificateRoutes')); // 🎓 Certificate System
app.use('/api/challenges', dailyChallengeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/plagiarism', plagiarismRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/courses', require('./routes/courseRoutes')); // 📚 Learn hub content (DB-backed)
app.use('/api/integrity', require('./routes/integrityRoutes')); // 🔍 Academic-integrity signals
app.use('/api/peer-reviews', peerReviewRoutes);
app.use('/api/autograder', autograderRoutes);
app.use('/api/billing', billingRoutes); // 💳 Billing (entitlements, checkout, portal)
app.use('/api/share', require('./routes/shareRoutes')); // 🔗 Shareable viz embeds (growth)
app.use('/api/contact', require('./routes/contactRoutes')); // 📨 Contact form
app.use('/api/public', require('./routes/publicRoutes')); // 🌐 Unauth SEO reads
app.use('/api/contests', require('./routes/contestRoutes')); // 🏆 Weekly contests
app.use('/api/review', require('./routes/reviewRoutes')); // 🔁 Spaced repetition
app.get('/sitemap.xml', require('./controllers/publicController').sitemap); // 🗺️ Sitemap

// 🌱 Temporary Seed Route removed (Data seeded successfully)

// 6. Health check (for uptime monitors + load balancers)
const mongoose = require('mongoose');
app.get('/health', (req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    res.status(dbUp ? 200 : 503).json({
        status: dbUp ? 'ok' : 'degraded',
        db: dbUp ? 'connected' : 'disconnected',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

// Test Route
app.get('/', (req, res) => {
    res.send('API is running with Socket.io support...');
});

// Central error handler — report to Sentry (if enabled) and return a safe error.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (Sentry) Sentry.captureException(err);
    logger.error(err.stack || err.message || String(err));
    res.status(err.status || 500).json({ message: err.expose ? err.message : 'Server error' });
});

// 7. Start server
const PORT = process.env.PORT || 5001;
// Bind to 127.0.0.1 by default (safe on a host behind nginx). Set BIND_HOST=0.0.0.0
// when the backend runs in a container that nginx reaches over the network.
const BIND_HOST = process.env.BIND_HOST || '127.0.0.1';
server.listen(PORT, BIND_HOST, () => {
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