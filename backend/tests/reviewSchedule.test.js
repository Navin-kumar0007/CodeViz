const { schedule, clampEase } = require('../services/reviewService');

// schedule() only touches plain fields, so a plain object stands in for a ReviewItem.
const fresh = () => ({ ease: 2.3, intervalDays: 0, reps: 0, lapses: 0, dueAt: new Date(), lastGrade: 'good' });

describe('reviewService.schedule (SM-2 lite)', () => {
  test('good grades push the interval further out each rep', () => {
    const it = fresh();
    schedule(it, 'good');
    expect(it.reps).toBe(1);
    expect(it.intervalDays).toBe(1);
    schedule(it, 'good');
    expect(it.reps).toBe(2);
    expect(it.intervalDays).toBe(3);
    schedule(it, 'good');
    expect(it.reps).toBe(3);
    expect(it.intervalDays).toBe(Math.round(3 * 2.3)); // prevInterval * ease
  });

  test('again resets reps, records a lapse, drops ease, and resurfaces same day', () => {
    const it = fresh();
    schedule(it, 'good'); schedule(it, 'good'); // build up an interval
    const easeBefore = it.ease;
    schedule(it, 'again');
    expect(it.reps).toBe(0);
    expect(it.lapses).toBe(1);
    expect(it.intervalDays).toBe(0);
    expect(it.ease).toBeCloseTo(easeBefore - 0.2, 5);
    expect(it.dueAt.getTime() - Date.now()).toBeLessThan(24 * 60 * 60 * 1000); // due within the day
  });

  test('easy raises ease and spaces further than good', () => {
    const good = fresh(); schedule(good, 'good'); schedule(good, 'good');
    const easy = fresh(); schedule(easy, 'easy'); schedule(easy, 'easy');
    expect(easy.ease).toBeGreaterThan(good.ease);
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
  });

  test('hard lowers ease', () => {
    const it = fresh();
    schedule(it, 'hard');
    expect(it.ease).toBeCloseTo(2.15, 5);
    expect(it.intervalDays).toBe(1);
  });

  test('ease stays clamped to [1.3, 2.8]', () => {
    let e = 2.3;
    for (let i = 0; i < 20; i++) e = clampEase(e + 0.15);
    expect(e).toBeLessThanOrEqual(2.8);
    for (let i = 0; i < 20; i++) e = clampEase(e - 0.2);
    expect(e).toBeGreaterThanOrEqual(1.3);
  });

  test('dueAt advances by the computed interval on success', () => {
    const it = fresh();
    schedule(it, 'good'); // interval 1 day
    const delta = it.dueAt.getTime() - Date.now();
    expect(delta).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(delta).toBeLessThan(25 * 60 * 60 * 1000);
  });
});
