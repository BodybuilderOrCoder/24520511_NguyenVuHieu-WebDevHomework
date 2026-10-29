import test from 'node:test';
import assert from 'node:assert/strict';
import { delay } from '../src/delay.ts';

test('pending and already-aborted simulated requests reject predictably', async () => {
  const controller = new AbortController();
  const result = delay(10000, controller.signal);
  controller.abort();
  await assert.rejects(result, { name: 'AbortError' });
  await assert.rejects(delay(10000, controller.signal), { name: 'AbortError' });
  await delay(1, new AbortController().signal);
});
