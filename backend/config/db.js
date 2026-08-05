const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 30000, // ⚡️ Increased to 30s (was 5s) to prevent timeout errors
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Don't hard-crash the whole server on DB failure — let the API boot so
        // frontend dev / non-DB routes still work. Auth & data routes will error
        // until a reachable MONGO_URI is configured.
        console.error(`❌ MongoDB connection failed: ${error.message}`);
        console.error(`   Server is running WITHOUT a database. Fix MONGO_URI in backend/.env.`);
    }
};

module.exports = connectDB;