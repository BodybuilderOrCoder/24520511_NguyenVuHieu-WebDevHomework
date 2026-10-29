import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAudio } from '../src/audio-loader.ts';

test('HTTP errors and invalid audio reject with useful errors', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 404 }));
  await assert.rejects(loadAudio({}, '/missing.wav', new AbortController().signal), /HTTP 404/);
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) }));
  const context = { decodeAudioData: async () => { throw new Error('Invalid audio'); } };
  await assert.rejects(loadAudio(context, '/bad.wav', new AbortController().signal), /Invalid audio/);
});

test('downloaded bytes are decoded and the AudioBuffer is returned', async (t) => {
  const bytes = new ArrayBuffer(8);
  const buffer = { duration: 1 };
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, arrayBuffer: async () => bytes }));
  const context = { decodeAudioData: async (received) => {
    assert.equal(received, bytes);
    return buffer;
  } };
  assert.equal(await loadAudio(context, '/tone.wav', new AbortController().signal), buffer);
});

test('cancellation during decoding prevents late success', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
  const controller = new AbortController();
  const context = { decodeAudioData: async () => {
    controller.abort();
    return { duration: 1 };
  } };
  await assert.rejects(loadAudio(context, '/tone.wav', controller.signal), { name: 'AbortError' });
});
