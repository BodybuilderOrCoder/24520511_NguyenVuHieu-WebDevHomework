import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import { createSeedStore } from './seed.js';

export const LIMITS = { author: 40, text: 500 };

/**
 * Picks and validates only the allowed fields — never spreads req.body.
 * @returns {{ value: { author: string, text: string } } | { error: string }}
 */
export function parseMessagePayload(body) {
  const { author, text } = body ?? {};
  if (typeof author !== 'string' || typeof text !== 'string') {
    return { error: 'Missing required fields' };
  }

  const clean = { author: author.trim(), text: text.trim() };
  if (!clean.author || !clean.text) {
    return { error: 'Missing required fields' };
  }

  for (const [field, max] of Object.entries(LIMITS)) {
    if (clean[field].length > max) {
      return { error: `Field "${field}" is too long (max ${max} characters)` };
    }
  }
  return { value: clean };
}

export function createApp({
  clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  store = createSeedStore(),
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.param('forum', (req, res, next, forum) => {
    if (!Object.hasOwn(store, forum)) {
      return res.status(404).json({ error: 'Unknown forum' });
    }
    req.messages = store[forum];
    next();
  });

  app.get('/api/messages/:forum', (req, res) => {
    res.json(req.messages);
  });

  app.post('/api/messages/:forum', (req, res) => {
    const result = parseMessagePayload(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const message = {
      id: randomUUID(),
      author: result.value.author,
      text: result.value.text,
      timestamp: new Date().toISOString(),
    };
    req.messages.push(message);
    res.status(201).json(message);
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Express recognises error handlers by arity, so `next` must stay in the signature.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Malformed JSON body' });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Payload too large' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

export const app = createApp();
