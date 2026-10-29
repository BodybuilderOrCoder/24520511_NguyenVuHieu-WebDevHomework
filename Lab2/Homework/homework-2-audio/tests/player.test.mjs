import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioPlayer } from '../src/audio-player.ts';

function fakeContext() {
  const sources = [];
  return {
    sources, destination: {}, resume: async () => {},
    state: 'running', closes: 0,
    async close() { this.closes++; this.state = 'closed'; },
    createAnalyser() { return { fftSize: 0, connect() {}, disconnect() {} }; },
    createBufferSource() {
      const source = { starts: 0, stops: 0, disconnects: 0,
        connect(target) { this.target = target; }, start() { this.starts++; }, stop() { this.stops++; },
        disconnect() { this.disconnects++; }, onended: null,
      };
      sources.push(source);
      return source;
    },
  };
}

test('play, switch, natural end and replay use fresh sources and release old ones', async () => {
  const context = fakeContext();
  let ended = 0;
  const player = new AudioPlayer(context, () => ended++);
  await player.play({});
  assert.equal(player.analyser.fftSize, 512);
  assert.equal(context.sources[0].target, player.analyser);
  await player.play({});
  assert.equal(context.sources[0].stops, 1);
  assert.equal(context.sources[0].disconnects, 1);
  context.sources[1].onended();
  assert.equal(ended, 1);
  assert.equal(player.playing, false);
  await player.play({});
  player.stop();
  player.stop();
  assert.equal(context.sources.length, 3);
  assert.ok(context.sources.every((source) => source.starts === 1 && source.disconnects === 1));
});

test('dispose stops audio and closes context exactly once', async () => {
  const context = fakeContext();
  const player = new AudioPlayer(context);
  await player.play({});
  await player.dispose();
  await player.dispose();
  assert.equal(context.sources[0].disconnects, 1);
  assert.equal(context.closes, 1);
  await assert.rejects(player.play({}), /disposed/);
});

test('stop during resume prevents late playback', async () => {
  const context = fakeContext();
  let resume;
  context.resume = () => new Promise((resolve) => { resume = resolve; });
  const player = new AudioPlayer(context);
  const playing = player.play({});
  player.stop();
  resume();
  assert.equal(await playing, false);
  assert.equal(context.sources.length, 0);
});
