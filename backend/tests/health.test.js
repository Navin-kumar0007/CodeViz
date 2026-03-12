const request = require('supertest');
const express = require('express');

// Minimal test to verify Express app initializes
describe('Backend Health', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });
  });

  it('GET /api/health should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should include a timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.timestamp).toBeDefined();
    expect(typeof res.body.timestamp).toBe('number');
  });
});
