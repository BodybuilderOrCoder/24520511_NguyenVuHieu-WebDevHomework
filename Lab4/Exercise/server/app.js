import cors from 'cors';
import express from 'express';
import { createSeedStore } from './seed.js';

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
