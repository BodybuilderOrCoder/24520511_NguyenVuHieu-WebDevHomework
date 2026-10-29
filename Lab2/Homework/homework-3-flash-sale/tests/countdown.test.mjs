import test from 'node:test';
import assert from 'node:assert/strict';
import { remainingMs, formatTime, startCountdown } from '../src/countdown.ts';

test('cleanup cancels RAF, including cancellation inside the tick callback', (t) => {
  const frames = new Map();
  let id = 0;
  t.mock.method(Date, 'now', () => 1000);
  globalThis.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  t.after(() => { delete globalThis.requestAnimationFrame; delete globalThis.cancelAnimationFrame; });
  const stop = startCountdown(5000, () => stop());
  const callback = frames.get(1);
  frames.delete(1);
  callback();
  assert.equal(frames.size, 0);
  stop();
  stop();
  const cancel = startCountdown(5000, () => assert.fail('cancelled callback ran'));
  cancel();
  assert.equal(frames.size, 0);
  startCountdown(1000, () => {});
  const [frameId, finalTick] = frames.entries().next().value;
  frames.delete(frameId);
  finalTick();
  assert.equal(frames.size, 0);
});

test('countdown catches up after throttling and clamps at zero', (t) => {
  let now = 1000;
  let callback;
  t.mock.method(Date, 'now', () => now);
  globalThis.requestAnimationFrame = (next) => { callback = next; return 1; };
  globalThis.cancelAnimationFrame = () => {};
  t.after(() => { delete globalThis.requestAnimationFrame; delete globalThis.cancelAnimationFrame; });
  const values = [];
  startCountdown(5000, (value) => values.push(value));
  callback();
  now = 4500;
  callback();
  now = 9000;
  callback();
  assert.deepEqual(values, [4000, 500, 0]);
  assert.equal(remainingMs(5000, 10000), 0);
  assert.equal(formatTime(61234), '01:01.234');
});
