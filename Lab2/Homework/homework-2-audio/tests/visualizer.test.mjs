import test from 'node:test';
import assert from 'node:assert/strict';
import { Visualizer } from '../src/visualizer.ts';

test('visualizer reuses data, draws bars, and owns at most one RAF', (t) => {
  for (const name of ['requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle']) {
    globalThis[name] = () => {};
    t.after(() => { delete globalThis[name]; });
  }
  const frames = new Map();
  let next = 0;
  let bars = 0;
  const arrays = new Set();
  t.mock.method(globalThis, 'requestAnimationFrame', (callback) => {
    frames.set(++next, callback);
    return next;
  });
  t.mock.method(globalThis, 'cancelAnimationFrame', (id) => frames.delete(id));
  t.mock.method(globalThis, 'getComputedStyle', () => ({ getPropertyValue: () => 'blue' }));
  const context = { clearRect() {}, fillRect() { bars++; } };
  const canvas = { width: 960, height: 280, getContext: () => context };
  const analyser = { frequencyBinCount: 256, getByteFrequencyData(data) { arrays.add(data); data.fill(128); } };
  const view = new Visualizer(canvas, analyser);
  view.start();
  view.start();
  for (let i = 0; i < 120; i++) {
    assert.equal(frames.size, 1);
    const [id, callback] = frames.entries().next().value;
    frames.delete(id);
    callback();
  }
  assert.equal(arrays.size, 1);
  assert.equal(bars, 120 * 256);
  view.stop();
  view.stop();
  assert.equal(frames.size, 0);
});
