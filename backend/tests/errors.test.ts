import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Error handling', () => {
  it('returns 404 for unknown routes', async () => {
    const app = createApp();
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for protected route without auth', async () => {
    const app = createApp();
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
