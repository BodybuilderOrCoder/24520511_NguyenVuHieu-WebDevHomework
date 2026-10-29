import { mkdirSync, writeFileSync } from 'node:fs';

// Eight-second mono PCM WAVs; no third-party audio assets.
const directory = new URL('../public/audio/', import.meta.url);
mkdirSync(directory, { recursive: true });
for (const [name, frequency] of [['low', 220], ['mid', 440], ['high', 880]]) {
  const rate = 22050;
  const samples = rate * 8;
  const bytes = Buffer.alloc(44 + samples * 2);
  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(rate, 24);
  bytes.writeUInt32LE(rate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) {
    const seconds = i / rate;
    const fade = Math.min(1, seconds * 20, (8 - seconds) * 20);
    const pulse = .6 + .4 * Math.sin(2 * Math.PI * 2 * seconds);
    const value = Math.sin(2 * Math.PI * frequency * seconds) * .18 * fade * pulse;
    bytes.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }
  writeFileSync(new URL(`${name}.wav`, directory), bytes);
}
writeFileSync(new URL('invalid.wav', directory), 'This is deliberately not audio.');
