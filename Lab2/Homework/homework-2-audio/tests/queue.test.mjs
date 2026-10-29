import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioTaskQueue } from '../src/audio-queue-controller.ts';
import { downloadAudio } from '../src/audio-loader.ts';

test('dispose rejects all tasks and prevents new enqueues', async () => {
  const queue = new AudioTaskQueue((_url, signal) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  const tasks = [queue.enqueue('one'), queue.enqueue('two'), queue.enqueue('three')];
  const rejected = tasks.map((task) => assert.rejects(task.result, { name: 'AbortError' }));
  queue.dispose();
  queue.dispose();
  await Promise.all(rejected);
  assert.throws(() => queue.enqueue('four'), /disposed/);
});

test('a failed task or throwing observer does not block subsequent tasks', async (t) => {
  t.mock.method(console, 'error', () => {});
  const queue = new AudioTaskQueue(async (url) => {
    if (url === 'bad') throw new Error('Decode failed');
    return { url };
  }, () => { throw new Error('UI failed'); });
  const bad = queue.enqueue('bad');
  const good = queue.enqueue('good');
  await assert.rejects(bad.result, /Decode failed/);
  assert.deepEqual(await good.result, { url: 'good' });
});

test('pending cancellation skips download; active cancellation discards late decoding', async () => {
  const order = [];
  let finish;
  const queue = new AudioTaskQueue(async (url) => {
    order.push(url);
    if (url === 'first') await new Promise((resolve) => { finish = resolve; });
    return { url };
  });
  const first = queue.enqueue('first');
  const pending = queue.enqueue('pending');
  const last = queue.enqueue('last');
  const firstRejected = assert.rejects(first.result, { name: 'AbortError' });
  const pendingRejected = assert.rejects(pending.result, { name: 'AbortError' });
  pending.cancel();
  pending.cancel();
  first.cancel();
  await Promise.all([firstRejected, pendingRejected]);
  assert.deepEqual(order, ['first']);
  finish();
  assert.deepEqual(await last.result, { url: 'last' });
  assert.deepEqual(order, ['first', 'last']);
});

test('fetch receives cancellation signal and rejects aborted requests', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url, { signal }) => {
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  });
  const controller = new AbortController();
  const result = downloadAudio('/test.wav', controller.signal);
  controller.abort();
  await assert.rejects(result, { name: 'AbortError' });
});

test('rapid concurrent enqueue calls run once each in FIFO order', async () => {
  const order = [];
  let active = 0;
  let maximum = 0;
  const queue = new AudioTaskQueue(async (url) => {
    active++;
    maximum = Math.max(maximum, active);
    order.push(url);
    await new Promise((resolve) => setTimeout(resolve, 2));
    active--;
    return { url };
  });
  const handles = Array.from({ length: 20 }, (_, i) => queue.enqueue(String(i)));
  const results = await Promise.all(handles.map((handle) => handle.result));
  assert.deepEqual(order, Array.from({ length: 20 }, (_, i) => String(i)));
  assert.deepEqual(results.map((buffer) => buffer.url), order);
  assert.equal(new Set(handles.map((handle) => handle.id)).size, 20);
  assert.equal(maximum, 1);
});
