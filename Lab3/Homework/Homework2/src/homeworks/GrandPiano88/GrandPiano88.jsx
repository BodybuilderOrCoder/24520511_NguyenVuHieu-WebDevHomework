import { useCallback, useEffect } from 'react';
import styles from './GrandPiano88.module.css';
import { PianoKey } from './PianoKey.jsx';
import { usePolyphonicAudio } from './usePolyphonicAudio.js';
import { KEY_BY_CODE, KEY_BY_MIDI, PIANO_KEYS_88 } from './utils/pianoScale.js';

const IGNORED_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

/**
 * Bàn đàn Concert Grand Piano 88 phím (A0 -> C8, MIDI 21..108)
 * Phase 3: Cô lập render từng phím với React.memo + useCallback và hỗ trợ bàn phím cứng W3C `e.code`.
 */
export function GrandPiano88() {
  const {
    activeMidis,
    noteOn,
    noteOff,
    panicStopAll,
    lastEvictedMidi,
    stolenVoicesTotal,
    maxVoices,
  } = usePolyphonicAudio(8);

  const handleNoteOn = useCallback(
    (midi) => {
      noteOn(midi);
    },
    [noteOn]
  );

  const handleNoteOff = useCallback(
    (midi) => {
      noteOff(midi);
    },
    [noteOff]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleWindowKeyDown = (event) => {
      if (event.repeat) return;
      const tag = event.target?.tagName?.toUpperCase?.() || '';
      if (IGNORED_TAGS.includes(tag) || event.target?.isContentEditable) return;

      const matchedKey = KEY_BY_CODE.get(event.code);
      if (!matchedKey) return;

      event.preventDefault();
      handleNoteOn(matchedKey.midi);
    };

    const handleWindowKeyUp = (event) => {
      const matchedKey = KEY_BY_CODE.get(event.code);
      if (!matchedKey) return;
      handleNoteOff(matchedKey.midi);
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    window.addEventListener('keyup', handleWindowKeyUp);

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
      window.removeEventListener('keyup', handleWindowKeyUp);
    };
  }, [handleNoteOn, handleNoteOff]);

  const activeNotesSummary =
    activeMidis.size > 0
      ? Array.from(activeMidis)
          .map((m) => KEY_BY_MIDI.get(m)?.noteName || m)
          .join(', ')
      : 'Không có phím đang nhấn';

  const lastEvictedName =
    lastEvictedMidi !== null
      ? KEY_BY_MIDI.get(lastEvictedMidi)?.noteName || `MIDI ${lastEvictedMidi}`
      : 'Chưa thu hồi';

  return (
    <main className={styles.concertHall}>
      <header className={styles.hallHeader}>
        <section className={styles.titleGroup} aria-label="Thông tin đàn Piano 88 phím">
          <span className={styles.badgePill}>UIT Lab 3 • Homework 2</span>
          <h1 className={styles.hallTitle}>
            88-Key Polyphonic Grand Piano &amp; FIFO Sequencer
          </h1>
          <p className={styles.hallSubtitle}>
            Thuật toán 88 phím ($A0 \rightarrow C8$) • `React.memo` Render Isolation • 8-Voice FIFO Stealing
          </p>
        </section>

        <dl className={styles.telemetrySummary}>
          <dt className={styles.statTerm}>Giọng đa âm (Active Pool)</dt>
          <dd className={styles.statValue}>
            {activeMidis.size} / {maxVoices} voices
          </dd>
          <dt className={styles.statTerm}>FIFO Voice Stealing</dt>
          <dd className={styles.statValue}>
            {stolenVoicesTotal} lần ({lastEvictedName})
          </dd>
          <dt className={styles.statTerm}>Nốt đang vang</dt>
          <dd className={styles.statValue}>{activeNotesSummary}</dd>
        </dl>
      </header>

      <section
        className={styles.keyboardSection}
        aria-label="88-Key Concert Grand Piano"
      >
        <header className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            Bàn Phím 88 Phím Chuẩn Quốc Tế (52 Trắng + 36 Đen)
          </h2>
          <button
            type="button"
            className={styles.transportBtn}
            onClick={panicStopAll}
            disabled={activeMidis.size === 0}
          >
            Ngắt toàn bộ âm (Panic Stop)
          </button>
        </header>

        <section
          className={styles.keyboardViewport}
          aria-label="Khung cuộn ngang 88 phím đàn"
        >
          <section className={styles.keyboardRack} aria-label="Dãy 88 phím đàn">
            {PIANO_KEYS_88.map((keyItem) => (
              <PianoKey
                key={keyItem.midi}
                midi={keyItem.midi}
                noteName={keyItem.noteName}
                isBlack={keyItem.isBlack}
                shortcutLabel={keyItem.shortcutLabel}
                isPressed={activeMidis.has(keyItem.midi)}
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
              />
            ))}
          </section>
        </section>
      </section>
    </main>
  );
}
