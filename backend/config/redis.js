const redis = require('redis');

let redisClient;

const connectRedis = async () => {
    // 1. Create Client
    // If running in Docker, hostname is 'redis'. If local, 'localhost'.
    // We try 'redis' first (production default), or fallback via ENV.
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = redis.createClient({
        url: redisUrl,
        socket: {
            connectTimeout: 5000, // Fail fast if no Redis
            reconnectStrategy: (retries) => {
                if (retries > 5) {
                    console.log('⚠️ Redis: Too many retries. Giving up.');
                    return new Error('Redis connection failed');
                }
                return Math.min(retries * 50, 1000);
            }
        }
    });

    redisClient.on('error', (err) => {
        // Suppress connection refused errors in dev mode to avoid console spam
        if (err.code === 'ECONNREFUSED') {
            // console.warn("Redis not found (Caching Disabled)");
        } else {
            console.error('❌ Redis Error:', err.message);
        }
    });

    try {
        await redisClient.connect();
        console.log('✅ Redis Connected');
    } catch (err) {
        console.warn('⚠️ Redis Connection Failed. Caching will be disabled.');
        redisClient = null; // Set to null so we don't try to use it
    }
};

const getClient = () => redisClient;

module.exports = { connectRedis, getClient };
