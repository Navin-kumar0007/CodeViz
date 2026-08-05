const { createLimiter } = require('../utils/limiter');

describe('concurrency limiter', () => {
  test('grants up to max immediately, queues the rest', async () => {
    const lim = createLimiter({ max: 2, maxQueue: 10 });
    await lim.acquire();
    await lim.acquire();
    expect(lim.stats().active).toBe(2);

    let third = 'pending';
    lim.acquire().then(() => { third = 'granted'; });
    await Promise.resolve();
    expect(third).toBe('pending');       // queued, not granted
    expect(lim.stats().queued).toBe(1);

    lim.release();                        // frees a slot -> next waiter runs
    await Promise.resolve();
    expect(third).toBe('granted');
  });

  test('rejects with BUSY when the queue is full', async () => {
    const lim = createLimiter({ max: 1, maxQueue: 1 });
    await lim.acquire();                  // uses the one slot
    lim.acquire();                        // fills the queue (1)
    await expect(lim.acquire()).rejects.toThrow('BUSY');
  });

  test('release without waiters lowers active', async () => {
    const lim = createLimiter({ max: 3 });
    await lim.acquire();
    expect(lim.stats().active).toBe(1);
    lim.release();
    expect(lim.stats().active).toBe(0);
  });
});
