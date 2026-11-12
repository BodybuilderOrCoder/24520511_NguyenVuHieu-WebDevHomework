/**
 * @file pianoScale.js
 * @description Bộ sinh thuật toán 88 phím đàn Grand Piano chuẩn (A0 -> C8, MIDI 21..108)
 * - 52 phím trắng + 36 phím đen = 88 phím
 * - Công thức Equal Temperament: f = 440 * 2^((midi - 69) / 12)
 * - Ánh xạ bàn phím cứng W3C `e.code` cho quãng tám trung tâm (C4..E5)
 */

const PITCH_NAMES = Object.freeze([
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]);

const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);

/**
 * Ánh xạ phím cứng máy tính (`e.code`) sang nốt MIDI quãng tám trung tâm (C4 = 60 -> E5 = 76)
 */
export const KEYBOARD_SHORTCUT_BY_MIDI = Object.freeze({
  60: { code: 'KeyA', label: 'A' },       // C4
  61: { code: 'KeyW', label: 'W' },       // C#4
  62: { code: 'KeyS', label: 'S' },       // D4
  63: { code: 'KeyE', label: 'E' },       // D#4
  64: { code: 'KeyD', label: 'D' },       // E4
  65: { code: 'KeyF', label: 'F' },       // F4
  66: { code: 'KeyT', label: 'T' },       // F#4
  67: { code: 'KeyG', label: 'G' },       // G4
  68: { code: 'KeyY', label: 'Y' },       // G#4
  69: { code: 'KeyH', label: 'H' },       // A4 (440 Hz)
  70: { code: 'KeyU', label: 'U' },       // A#4
  71: { code: 'KeyJ', label: 'J' },       // B4
  72: { code: 'KeyK', label: 'K' },       // C5
  73: { code: 'KeyO', label: 'O' },       // C#5
  74: { code: 'KeyL', label: 'L' },       // D5
  75: { code: 'KeyP', label: 'P' },       // D#5
  76: { code: 'Semicolon', label: ';' },  // E5
});

/**
 * Hàm thuần (pure deterministic generator) sinh đủ 88 phím từ MIDI 21 (A0) đến MIDI 108 (C8)
 */
export function generate88Keys() {
  const keys = [];
  let whiteCounter = 0;

  for (let midi = 21; midi <= 108; midi += 1) {
    const pitchClass = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const pitchName = PITCH_NAMES[pitchClass];
    const noteName = `${pitchName}${octave}`;
    const isBlack = BLACK_PITCH_CLASSES.has(pitchClass);
    const freqHz = Number((440 * Math.pow(2, (midi - 69) / 12)).toFixed(6));

    const whiteKeyIndex = isBlack ? Math.max(0, whiteCounter - 1) : whiteCounter;
    if (!isBlack) {
      whiteCounter += 1;
    }

    const shortcut = KEYBOARD_SHORTCUT_BY_MIDI[midi] ?? null;

    keys.push(
      Object.freeze({
        midi,
        noteName,
        pitchName,
        octave,
        freqHz,
        isBlack,
        whiteKeyIndex,
        shortcutCode: shortcut ? shortcut.code : null,
        shortcutLabel: shortcut ? shortcut.label : null,
      })
    );
  }

  return Object.freeze(keys);
}

export const PIANO_KEYS_88 = generate88Keys();

export const WHITE_KEYS_52 = Object.freeze(
  PIANO_KEYS_88.filter((key) => !key.isBlack)
);

export const BLACK_KEYS_36 = Object.freeze(
  PIANO_KEYS_88.filter((key) => key.isBlack)
);

/**
 * Tra cứu O(1) theo mã MIDI (21..108)
 * @type {Map<number, typeof PIANO_KEYS_88[number]>}
 */
export const KEY_BY_MIDI = new Map(PIANO_KEYS_88.map((key) => [key.midi, key]));

/**
 * Tra cứu O(1) theo W3C `event.code` cho quãng tám trung tâm
 * @type {Map<string, typeof PIANO_KEYS_88[number]>}
 */
export const KEY_BY_CODE = new Map(
  PIANO_KEYS_88.filter((key) => key.shortcutCode).map((key) => [
    key.shortcutCode,
    key,
  ])
);
