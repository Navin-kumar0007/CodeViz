const { sign, credentialPayload } = require('../controllers/certificateController');

// Certificates are tamper-evident: the signature is an HMAC over (userId|courseSlug|issueTime).
// Any change to those fields must invalidate it — that's the whole trust model.
describe('certificate signing (tamper-evidence)', () => {
  const base = { userId: 'user123', courseSlug: 'python-basics', issueDate: new Date('2026-01-01T00:00:00Z') };

  test('a signature verifies against its own payload', () => {
    const sig = sign(credentialPayload(base));
    expect(sig).toBe(sign(credentialPayload(base))); // deterministic
    expect(sig).toHaveLength(32);
  });

  test('changing the holder invalidates the signature', () => {
    const sig = sign(credentialPayload(base));
    const forged = sign(credentialPayload({ ...base, userId: 'attacker999' }));
    expect(forged).not.toBe(sig);
  });

  test('changing the course invalidates the signature', () => {
    const sig = sign(credentialPayload(base));
    const forged = sign(credentialPayload({ ...base, courseSlug: 'advanced-ml' }));
    expect(forged).not.toBe(sig);
  });

  test('changing the issue date invalidates the signature', () => {
    const sig = sign(credentialPayload(base));
    const forged = sign(credentialPayload({ ...base, issueDate: new Date('2027-06-01T00:00:00Z') }));
    expect(forged).not.toBe(sig);
  });

  test('payload encodes the three trust fields', () => {
    expect(credentialPayload(base)).toBe(`user123|python-basics|${base.issueDate.getTime()}`);
  });
});
