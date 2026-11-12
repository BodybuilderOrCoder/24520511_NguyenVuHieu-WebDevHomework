import { useCallback, useState } from 'react';
import { DRUM_PADS } from './data/drumPads.js';
import styles from './DrumKit.module.css';
import { DrumPad } from './DrumPad.jsx';
import { useDrumAudio } from './useDrumAudio.js';

/**
 * Giao diện bàn trống phòng thu (Phase 2: Semantic & Responsive Grid, Zero <div>-soup).
 */
export function DrumKit() {
  const { triggerSound, currentDb, peakDb } = useDrumAudio();
  const [activePadIds, setActivePadIds] = useState(() => new Set());
  const [lastHitInfo, setLastHitInfo] = useState(null);

  const handleTrigger = useCallback(
    (padId, source = 'POINTER') => {
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

  return (
    <main className={styles.studioLayout}>
      <header className={styles.studioHeader}>
        <section className={styles.brandGroup} aria-label="Thông tin bàn trống">
          <span className={styles.badgePill}>UIT Lab 3 • Homework 1</span>
          <h1 className={styles.studioTitle}>Production Studio Drum Kit</h1>
          <p className={styles.studioSubtitle}>
            React 19 • Web Audio API Hybrid Synth &amp; WAV Loader • WCAG 2.2 AA
          </p>
        </section>
      </header>

      <section className={styles.padSection} aria-labelledby="drum-grid-heading">
        <header className={styles.sectionHeader}>
          <h2 id="drum-grid-heading" className={styles.sectionTitle}>
            Bàn Trống 7 Nhạc Cụ Chuẩn (W, A, S, D, J, K, L)
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
            ? `Vừa kích hoạt: ${lastHitInfo.padName} (Phím ${lastHitInfo.keyLabel}) — ${lastHitInfo.decibels} dB (${lastHitInfo.latencyMs} ms)`
            : 'Sẵn sàng gõ trống bằng chuột, cảm ứng hoặc bàn phím.'}
        </output>
      </section>
    </main>
  );
}
