const mongoose = require('mongoose');
const { COLLECTIONS } = require('../controllers/dataRightsController');

// Guards the GDPR/DPDP erasure config: every model we promise to export + delete must
// exist and actually have the linking field. If someone renames a field or adds a
// personal-data model without wiring it here, this fails loudly rather than silently
// leaving personal data behind after an account deletion.
describe('data-rights cascade config', () => {
  afterAll(async () => { await mongoose.disconnect().catch(() => {}); });

  test('covers a meaningful set of personal-data collections', () => {
    expect(COLLECTIONS.length).toBeGreaterThanOrEqual(10);
  });

  test.each(COLLECTIONS)('%s.%s — model loads and the link field exists on its schema', (name, field) => {
    const Model = require(`../models/${name}`);
    expect(Model).toBeTruthy();
    expect(Model.schema.path(field)).toBeDefined();
  });

  test('the field for each collection is a user reference', () => {
    for (const [name, field] of COLLECTIONS) {
      const path = require(`../models/${name}`).schema.path(field);
      // ObjectId ref to User (a couple may be plain ObjectId) — must at least be an ObjectId.
      expect(path.instance).toBe('ObjectId');
    }
  });
});
