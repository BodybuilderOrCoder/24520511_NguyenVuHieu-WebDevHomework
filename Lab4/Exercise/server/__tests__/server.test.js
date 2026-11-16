import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';

const ORIGIN = 'http://localhost:5173';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let app;
beforeEach(() => {
  app = createApp({ clientOrigin: ORIGIN });
});

describe('WBS 1.4.1 — GET /api/messages/:forum + CORS', () => {
  it.each(['nasa', 'esports-tribunal', 'notNasa'])('GET %s → 200 with a Message[]', async (forum) => {
    const res = await request(app).get(`/api/messages/${forum}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    for (const msg of res.body) {
      expect(msg).toEqual({
        id: expect.any(String),
        author: expect.any(String),
        text: expect.any(String),
        timestamp: expect.any(String),
      });
    }
  });

  it('sends Access-Control-Allow-Origin for the configured client origin', async () => {
    const res = await request(app).get('/api/messages/nasa').set('Origin', ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
  });

  it('does not reflect an unknown origin', async () => {
    const res = await request(app).get('/api/messages/nasa').set('Origin', 'https://evil.example');
    expect(res.headers['access-control-allow-origin']).not.toBe('https://evil.example');
  });

  it('answers the CORS preflight for POST with JSON', async () => {
    const res = await request(app)
      .options('/api/messages/nasa')
      .set('Origin', ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-methods']).toMatch(/POST/);
  });

  it('returns 404 JSON for an unknown forum', async () => {
    const res = await request(app).get('/api/messages/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Unknown forum' });
  });
});
