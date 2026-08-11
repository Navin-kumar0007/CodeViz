const { readinessBand } = require('../services/adaptiveService');

// The job-readiness band drives the dashboard label + hire framing, so the
// thresholds are part of the contract.
describe('adaptive readinessBand', () => {
  test('maps scores to the right bands', () => {
    expect(readinessBand(0)).toBe('Just starting');
    expect(readinessBand(19)).toBe('Just starting');
    expect(readinessBand(20)).toBe('Foundational');
    expect(readinessBand(39)).toBe('Foundational');
    expect(readinessBand(40)).toBe('Building up');
    expect(readinessBand(59)).toBe('Building up');
    expect(readinessBand(60)).toBe('Nearly there');
    expect(readinessBand(79)).toBe('Nearly there');
    expect(readinessBand(80)).toBe('Interview-ready');
    expect(readinessBand(100)).toBe('Interview-ready');
  });

  test('bands only improve as the score rises (monotonic)', () => {
    const order = ['Just starting', 'Foundational', 'Building up', 'Nearly there', 'Interview-ready'];
    let last = -1;
    for (let s = 0; s <= 100; s += 5) {
      const idx = order.indexOf(readinessBand(s));
      expect(idx).toBeGreaterThanOrEqual(last);
      last = idx;
    }
  });
});
