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

describe('WBS 1.4.2 — POST /api/messages/:forum + validation', () => {
  it.each([
    [{ author: 'Ada' }],
    [{ text: 'Hello' }],
    [{ author: '   ', text: 'Hello' }],
    [{}],
  ])('rejects %j with 400', async (body) => {
    const res = await request(app).post('/api/messages/nasa').send(body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Missing required fields' });
  });

  it('rejects non-string fields with 400', async () => {
    const res = await request(app).post('/api/messages/nasa').send({ author: 42, text: ['x'] });
    expect(res.status).toBe(400);
  });

  it('rejects over-long text with 400', async () => {
    const res = await request(app)
      .post('/api/messages/nasa')
      .send({ author: 'Ada', text: 'x'.repeat(501) });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/too long/i);
  });

  it('rejects malformed JSON with a JSON 400 (no HTML stack trace)', async () => {
    const res = await request(app)
      .post('/api/messages/nasa')
      .set('Content-Type', 'application/json')
      .send('{"author": "Ada",');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Malformed JSON body' });
  });

  it('creates a message with a UUID id and ISO timestamp → 201', async () => {
    const res = await request(app)
      .post('/api/messages/nasa')
      .send({ author: '  Ada  ', text: '  Launch window open  ' });
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(UUID);
    expect(res.body.author).toBe('Ada');
    expect(res.body.text).toBe('Launch window open');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it('only stores whitelisted fields (no mass assignment)', async () => {
    const res = await request(app)
      .post('/api/messages/nasa')
      .send({ author: 'Ada', text: 'hi', id: 'forged', isAdmin: true, timestamp: '1970-01-01' });
    expect(res.status).toBe(201);
    expect(res.body.id).not.toBe('forged');
    expect(res.body).not.toHaveProperty('isAdmin');
    expect(res.body.timestamp).not.toBe('1970-01-01');
  });

  it('makes the new message visible to a subsequent GET on the same forum only', async () => {
    const created = await request(app).post('/api/messages/notNasa').send({ author: 'Bob', text: 'Flat?' });
    const same = await request(app).get('/api/messages/notNasa');
    const other = await request(app).get('/api/messages/nasa');
    expect(same.body.map((m) => m.id)).toContain(created.body.id);
    expect(other.body.map((m) => m.id)).not.toContain(created.body.id);
  });
});
