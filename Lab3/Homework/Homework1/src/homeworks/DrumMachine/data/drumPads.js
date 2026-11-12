/**
 * @file drumPads.js
 * @description Schema bất biến cho 7 nhạc cụ chuẩn (W, A, S, D, J, K, L)
 * Kết nối trực tiếp với bộ âm thanh trống từ Lab trước (/sounds/*.wav)
 * kèm cấu hình Web Audio Synthesizer dự phòng độ trễ < 10ms.
 */

export const DRUM_PADS = Object.freeze([
  Object.freeze({
    id: 'kick',
    code: 'KeyW',
    keyLabel: 'W',
    name: 'Kick Bass',
    vietnameseRole: 'Trống cái trầm',
    freq: 110,
    endFreq: 42,
    decay: 0.38,
    noiseLevel: 0.08,
    baseDb: 92,
    sampleUrl: '/sounds/kick.wav',
    colorToken: '--pad-kick',
  }),
  Object.freeze({
    id: 'snare',
    code: 'KeyA',
    keyLabel: 'A',
    name: 'Snare Crisp',
    vietnameseRole: 'Trống lẫy đanh',
    freq: 185,
    endFreq: 95,
    decay: 0.26,
    noiseLevel: 0.72,
    baseDb: 88,
    sampleUrl: '/sounds/snare.wav',
    colorToken: '--pad-snare',
  }),
  Object.freeze({
    id: 'hihat',
    code: 'KeyS',
    keyLabel: 'S',
    name: 'Closed Hi-Hat',
    vietnameseRole: 'Chũm chọe đóng',
    freq: 920,
    endFreq: 640,
    decay: 0.14,
    noiseLevel: 0.92,
    baseDb: 74,
    sampleUrl: '/sounds/hihat.wav',
    colorToken: '--pad-hihat',
  }),
  Object.freeze({
    id: 'clap',
    code: 'KeyD',
    keyLabel: 'D',
    name: 'Studio Clap',
    vietnameseRole: 'Tiếng vỗ tay phòng thu',
    freq: 450,
    endFreq: 260,
    decay: 0.24,
    noiseLevel: 0.85,
    baseDb: 84,
    sampleUrl: '/sounds/clap.wav',
    colorToken: '--pad-clap',
  }),
  Object.freeze({
    id: 'tom1',
    code: 'KeyJ',
    keyLabel: 'J',
    name: 'High Rack Tom',
    vietnameseRole: 'Trống Tom cao',
    freq: 160,
    endFreq: 82,
    decay: 0.34,
    noiseLevel: 0.12,
    baseDb: 85,
    sampleUrl: '/sounds/tom1.wav',
    colorToken: '--pad-tom1',
  }),
  Object.freeze({
    id: 'tom2',
    code: 'KeyK',
    keyLabel: 'K',
    name: 'Floor Low Tom',
    vietnameseRole: 'Trống Tom trầm',
    freq: 105,
    endFreq: 54,
    decay: 0.42,
    noiseLevel: 0.1,
    baseDb: 89,
    sampleUrl: '/sounds/tom2.wav',
    colorToken: '--pad-tom2',
  }),
  Object.freeze({
    id: 'crash',
    code: 'KeyL',
    keyLabel: 'L',
    name: 'Crash Cymbal',
    vietnameseRole: 'Chũm chọe ngân vang',
    freq: 1200,
    endFreq: 520,
    decay: 0.85,
    noiseLevel: 0.95,
    baseDb: 96,
    sampleUrl: '/sounds/crash.wav',
    colorToken: '--pad-crash',
  }),
]);

/**
 * Tra cứu O(1) theo W3C physical key code (e.code)
 * Miễn nhiễm hoàn toàn với bộ gõ tiếng Việt (Telex / VNI).
 * @type {Map<string, typeof DRUM_PADS[number]>}
 */
export const padByCodeMap = new Map(DRUM_PADS.map((pad) => [pad.code, pad]));

/**
 * Tra cứu O(1) theo id nhạc cụ ('kick', 'snare', ...)
 * @type {Map<string, typeof DRUM_PADS[number]>}
 */
export const padByIdMap = new Map(DRUM_PADS.map((pad) => [pad.id, pad]));
