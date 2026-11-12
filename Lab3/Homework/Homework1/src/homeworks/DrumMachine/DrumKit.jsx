import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { DRUM_PADS } from './data/drumPads.js';
import { DecibelMeter } from './DecibelMeter.jsx';
import styles from './DrumKit.module.css';
import { DrumPad } from './DrumPad.jsx';
import { HitHistoryLog } from './HitHistoryLog.jsx';
import { useDrumAudio } from './useDrumAudio.js';
import { useDrumKeyboard } from './useDrumKeyboard.js';

const MAX_HISTORY_ITEMS = 8;

/**
 * Giao diện bàn trống phòng thu hoàn chỉnh (Phase 4: A11y Visual Hit Log, Decibel Meter, Keyboard Lock Toggle).
 * Tuân thủ 100% Zero <div>-soup, React 19 useId(), Pure Derived State & Effect Cleanup.
 */
export function DrumKit() {
  const keyboardToggleId = useId();
  const presetInputId = useId();
  const audioModeSelectId = useId();

  const {
    triggerSound,
    currentDb,
    peakDb,
    audioMode,
    setAudioMode,
    resetPeakDb,
  } = useDrumAudio();

  const [activePadIds, setActivePadIds] = useState(() => new Set());
  const [hitHistory, setHitHistory] = useState([]);
  const [totalHits, setTotalHits] = useState(0);
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(true);
  const [presetName, setPresetName] = useState('Studio Kit V1');

  // State bộ thu phát lại nhịp trống (kế thừa từ Lab trước với AbortController cleanup)
  const [recorderState, setRecorderState] = useState('IDLE'); // 'IDLE' | 'RECORDING' | 'PLAYING'
  const [recordedBeats, setRecordedBeats] = useState([]);
  const recordStartPerfRef = useRef(0);
  const replayAbortRef = useRef(null);
  const hitCounterRef = useRef(0);

  const handleRelease = useCallback((padId) => {
    setActivePadIds((prev) => {
      if (!prev.has(padId)) return prev;
      const next = new Set(prev);
      next.delete(padId);
      return next;
    });
  }, []);

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

      hitCounterRef.current += 1;
      const hitId = `hit-${hitCounterRef.current}-${padId}`;

      setTotalHits((prev) => prev + 1);
      setHitHistory((prev) => {
        const nextEntry = {
          id: hitId,
          padId: result.pad.id,
          name: result.pad.name,
          keyLabel: result.pad.keyLabel,
          code: code || result.pad.code,
          decibels: result.decibels,
          latencyMs: result.latencyMs,
          source,
        };
        return [...prev.slice(-(MAX_HISTORY_ITEMS - 1)), nextEntry];
      });

      setRecordedBeats((prev) => {
        if (recorderState !== 'RECORDING') return prev;
        return [
          ...prev,
          {
            id: hitId,
            padId: result.pad.id,
            offsetMs: Math.max(0, performance.now() - recordStartPerfRef.current),
          },
        ];
      });
    },
    [recorderState, triggerSound]
  );

  useDrumKeyboard({
    enabled: isKeyboardEnabled,
    onTrigger: handleTrigger,
    onRelease: handleRelease,
  });

  const handleStartRecord = useCallback(() => {
    if (replayAbortRef.current) {
      replayAbortRef.current.abort();
      replayAbortRef.current = null;
    }
    recordStartPerfRef.current = performance.now();
    setRecordedBeats([]);
    setRecorderState('RECORDING');
  }, []);

  const handleStopRecord = useCallback(() => {
    if (replayAbortRef.current) {
      replayAbortRef.current.abort();
      replayAbortRef.current = null;
    }
    setActivePadIds(new Set());
    setRecorderState('IDLE');
  }, []);

  const handleReplayRecord = useCallback(async () => {
    if (recordedBeats.length === 0 || recorderState !== 'IDLE') return;

    if (replayAbortRef.current) {
      replayAbortRef.current.abort();
    }
    const controller = new AbortController();
    replayAbortRef.current = controller;
    setRecorderState('PLAYING');

    let previousOffset = 0;
    try {
      for (const beat of recordedBeats) {
        if (controller.signal.aborted) break;
        const delayMs = Math.max(0, beat.offsetMs - previousOffset);
        previousOffset = beat.offsetMs;

        await new Promise((resolve, reject) => {
          const timerId = window.setTimeout(resolve, delayMs);
          controller.signal.addEventListener(
            'abort',
            () => {
              window.clearTimeout(timerId);
              reject(new DOMException('Replay aborted', 'AbortError'));
            },
            { once: true }
          );
        });

        if (controller.signal.aborted) break;
        handleTrigger(beat.padId, 'SEQUENCER');
        window.setTimeout(() => handleRelease(beat.padId), 110);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error(err);
      }
    } finally {
      if (replayAbortRef.current === controller) {
        replayAbortRef.current = null;
        setRecorderState('IDLE');
      }
    }
  }, [handleRelease, handleTrigger, recordedBeats, recorderState]);

  useEffect(() => {
    return () => {
      if (replayAbortRef.current) {
        replayAbortRef.current.abort();
        replayAbortRef.current = null;
      }
    };
  }, []);

  const handleClearHistory = useCallback(() => {
    setHitHistory([]);
  }, []);

  return (
    <main className={styles.studioLayout}>
      <header className={styles.studioHeader}>
        <section className={styles.brandGroup} aria-label="Thông tin bàn trống">
          <span className={styles.badgePill}>UIT Lab 3 • Homework 1</span>
          <h1 className={styles.studioTitle}>Production Studio Drum Kit</h1>
          <p className={styles.studioSubtitle}>
            React 19 • Web Audio API Hybrid Engine • W3C `e.code` Telex-Safe • WCAG 2.2 AA
          </p>
        </section>

        <form
          className={styles.toolbarForm}
          aria-label="Bảng điều khiển bàn phím và cấu hình phòng thu"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor={keyboardToggleId} className={styles.controlField}>
            <input
              id={keyboardToggleId}
              type="checkbox"
              className={styles.checkboxInput}
              checked={isKeyboardEnabled}
              onChange={(e) => setIsKeyboardEnabled(e.target.checked)}
            />
            <span>
               lắng nghe bàn phím ({isKeyboardEnabled ? 'Đang bật' : 'Đã khóa'})
            </span>
          </label>

          <label htmlFor={presetInputId} className={styles.controlField}>
            <span>Tên Preset:</span>
            <input
              id={presetInputId}
              type="text"
              className={styles.textInput}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Nhập tên preset..."
            />
          </label>

          <label htmlFor={audioModeSelectId} className={styles.controlField}>
            <span>Nguồn âm:</span>
            <select
              id={audioModeSelectId}
              className={styles.selectInput}
              value={audioMode}
              onChange={(e) => setAudioMode(e.target.value)}
            >
              <option value="HYBRID">Hybrid (Lab WAV + Synth)</option>
              <option value="SYNTH_ONLY">Web Audio Synth (&lt; 2ms)</option>
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
            Gõ phím vật lý <strong>W, A, S, D, J, K, L</strong> (an toàn với UniKey/EVKey Telex) hoặc chạm trực tiếp.
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
      </section>

      <section
        className={styles.telemetryGrid}
        aria-label="Phản hồi thị giác và lịch sử nhịp trống cho người khiếm thính"
      >
        <DecibelMeter
          currentDb={currentDb}
          peakDb={peakDb}
          totalHits={totalHits}
          onResetPeak={resetPeakDb}
        />

        <HitHistoryLog
          hitHistory={hitHistory}
          onClearHistory={handleClearHistory}
          recorderState={recorderState}
          recordedCount={recordedBeats.length}
          onStartRecord={handleStartRecord}
          onStopRecord={handleStopRecord}
          onReplayRecord={handleReplayRecord}
        />
      </section>
    </main>
  );
}
