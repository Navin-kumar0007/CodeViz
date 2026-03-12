const { LRUCache } = require('lru-cache');
const { getClient } = require('../config/redis');

/**
 * Multi-Tier Cache Service
 * L1: In-memory LRU (Fastest, per-instance)
 * L2: Redis (Shared, persistent)
 */

const l1Options = {
    max: 500, // Store up to 500 items
    ttl: 1000 * 60 * 10, // 10 minutes in-memory
};

const L1_CACHE = new LRUCache(l1Options);
const L2_TTL = 3600; // 1 hour in Redis

/**
 * Get value from multi-tier cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
async function get(key) {
    // 1. Check L1 (Memory)
    const l1Value = L1_CACHE.get(key);
    if (l1Value) {
        console.log(`🧊 L1 CACHE HIT: ${key.slice(0, 30)}...`);
        return l1Value;
    }

    // 2. Check L2 (Redis)
    try {
        const client = getClient();
        if (client) {
            const l2Value = await client.get(key);
            if (l2Value) {
                const parsed = JSON.parse(l2Value);
                // Backfill L1
                L1_CACHE.set(key, parsed);
                console.log(`🌐 L2 CACHE HIT: ${key.slice(0, 30)}...`);
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Cache L2 error:', e.message);
    }

    return null;
}

/**
 * Set value in both cache tiers
 * @param {string} key - Cache key
 * @param {any} value - Value to store
 */
async function set(key, value) {
    // 1. Set L1
    L1_CACHE.set(key, value);

    // 2. Set L2 (Redis)
    try {
        const client = getClient();
        if (client) {
            await client.set(key, JSON.stringify(value), { EX: L2_TTL });
        }
    } catch (e) {
        console.warn('Cache L2 set error:', e.message);
    }
}

module.exports = { get, set };
