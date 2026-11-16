import { randomUUID } from 'node:crypto';

const SEED = {
  nasa: [
    { author: 'Mission Control', text: 'Artemis crew cleared for trans-lunar injection.' },
    { author: 'Katherine J.', text: 'Trajectory numbers re-checked by hand. Go for launch.' },
    { author: 'Margaret H.', text: 'Priority displays tested — the guidance computer will shed low-priority jobs.' },
  ],
  'esports-tribunal': [
    { author: 'Referee Desk', text: 'Match 3 paused: desync reported on server EU-2.' },
    { author: 'Team Captain', text: 'Requesting a replay review of round 14.' },
  ],
  notNasa: [
    { author: 'Moon Skeptic', text: 'Has anyone actually checked the shadows in the photos?' },
    { author: 'Physics Teacher', text: 'Yes. Light sources plus uneven terrain. Happy to explain.' },
  ],
};

/** Builds a fresh in-memory store so every app instance (and test) is isolated. */
export function createSeedStore(now = Date.now()) {
  return Object.fromEntries(
    Object.entries(SEED).map(([forum, messages]) => [
      forum,
      messages.map((msg, index) => ({
        id: randomUUID(),
        author: msg.author,
        text: msg.text,
        timestamp: new Date(now - (messages.length - index) * 60_000).toISOString(),
      })),
    ])
  );
}
