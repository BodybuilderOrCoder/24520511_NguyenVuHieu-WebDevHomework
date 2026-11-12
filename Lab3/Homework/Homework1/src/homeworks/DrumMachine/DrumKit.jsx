import { useCallback, useId, useState } from 'react';
import { DRUM_PADS } from './data/drumPads.js';
import styles from './DrumKit.module.css';
import { DrumPad } from './DrumPad.jsx';
import { useDrumAudio } from './useDrumAudio.js';
import { useDrumKeyboard } from './useDrumKeyboard.js';

/**
 * Giao diện bàn trống phòng thu (Phase 3: Tích hợp W3C `e.code`, Anti-Repeat & Input Focus Isolation).
 */
export function DrumKit() {
  const presetInputId = useId();
  const audioModeSelectId = useId();

  const { triggerSound, currentDb, peakDb, audioMode, setAudioMode } =
    useDrumAudio();
  const [activePadIds, setActivePadIds] = useState(() => new Set());
  const [lastHitInfo, setLastHitInfo] = useState(null);
  const [presetName, setPresetName] = useState('Studio Kit V1');

  const handleTrigger = useCallback(
    (padId, source = 'POINTER', code = '') => {
      const result = triggerSound(padId);
      if (!result) return;

      setActivePadIds((prev) => {
        if (prev.has(padId)) return prev;
        const next = new Set(prev);
        next.add(padId);
        return next;
      });

      setLastHitInfo({
        padName: result.pad.name,
        keyLabel: result.pad.keyLabel,
        code: code || result.pad.code,
        decibels: result.decibels,
        latencyMs: result.latencyMs,
        source,
      });
    },
    [triggerSound]
  );

  const handleRelease = useCallback((padId) => {
    setActivePadIds((prev) => {
      if (!prev.has(padId)) return prev;
      const next = new Set(prev);
      next.delete(padId);
      return next;
    });
  }, []);

  useDrumKeyboard({
    enabled: true,
    onTrigger: handleTrigger,
    onRelease: handleRelease,
  });

  return (
    <main className={styles.studioLayout}>
      <header className={styles.studioHeader}>
        <section className={styles.brandGroup} aria-label="Thông tin bàn trống">
          <span className={styles.badgePill}>UIT Lab 3 • Homework 1</span>
          <h1 className={styles.studioTitle}>Production Studio Drum Kit</h1>
          <p className={styles.studioSubtitle}>
            React 19 • W3C Physical KeyCode (`e.code`) • Telex-Safe &amp; WCAG 2.2 AA
          </p>
        </section>

        <form
          className={styles.toolbarForm}
          aria-label="Cấu hình Preset và Engine âm thanh"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor={presetInputId} className={styles.controlField}>
            <span>Tên Preset:</span>
            <input
              id={presetInputId}
              type="text"
              className={styles.textInput}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Nhập tên preset (cô lập phím trống)..."
            />
          </label>

          <label htmlFor={audioModeSelectId} className={styles.controlField}>
            <span>Chế độ Audio:</span>
            <select
              id={audioModeSelectId}
              className={styles.selectInput}
              value={audioMode}
              onChange={(e) => setAudioMode(e.target.value)}
            >
              <option value="HYBRID">Hybrid (Lab WAV + Web Audio Synth)</option>
              <option value="SYNTH_ONLY">Web Audio Synth Only (&lt; 2ms)</option>
            </select>
          </label>
        </form>
      </header>

      <section className={styles.padSection} aria-labelledby="drum-grid-heading">
        <header className={styles.sectionHeader}>
          <h2 id="drum-grid-heading" className={styles.sectionTitle}>
            Bàn Trống 7 Nhạc Cụ Chuẩn — Preset: {presetName || 'Mặc định'}
          </h2>
          <p className={styles.sectionHint}>
            Cường độ hiện tại: {currentDb} dB (Đỉnh: {peakDb} dB)
          </p>
        </header>

        <section className={styles.drumGrid} aria-label="Lưới nút trống">
          {DRUM_PADS.map((pad) => (
            <DrumPad
              key={pad.id}
              pad={pad}
              isActive={activePadIds.has(pad.id)}
              onTrigger={handleTrigger}
              onRelease={handleRelease}
            />
          ))}
        </section>

        <output className={styles.liveOutput} role="status" aria-live="polite">
          {lastHitInfo
            ? `Vừa kích hoạt: ${lastHitInfo.padName} (${lastHitInfo.code}) qua ${lastHitInfo.source} — ${lastHitInfo.decibels} dB (${lastHitInfo.latencyMs} ms)`
            : 'Sẵn sàng gõ trống bằng chuột, cảm ứng hoặc bàn phím (W, A, S, D, J, K, L).'}
        </output>
      </section>
    </main>
  );
}
