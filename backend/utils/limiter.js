/**
 * A tiny async concurrency limiter with a bounded wait queue.
 * acquire() resolves when a slot is free; rejects with BUSY when the queue is
 * full. release() hands the slot to the next waiter (or frees it).
 */
function createLimiter({ max = 4, maxQueue = 50 } = {}) {
  let active = 0;
  const waiters = [];

  function acquire() {
    if (active < max) { active++; return Promise.resolve(); }
    if (waiters.length >= maxQueue) return Promise.reject(new Error('BUSY'));
    return new Promise((resolve) => waiters.push(resolve));
  }

  function release() {
    const next = waiters.shift();
    if (next) next();            // slot stays 'active', handed to the next waiter
    else active = Math.max(0, active - 1);
  }

  return { acquire, release, stats: () => ({ active, queued: waiters.length, max }) };
}

module.exports = { createLimiter };
