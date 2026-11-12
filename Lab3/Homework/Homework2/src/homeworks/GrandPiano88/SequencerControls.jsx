import { memo, useId } from 'react';
import styles from './GrandPiano88.module.css';

/**
 * Bảng điều khiển FIFO Melody Recorder & Variable-Speed Abortable Sequencer.
 * Liên kết nhãn qua React 19 `useId()` và thông báo trạng thái qua `<output role="status" aria-live="polite">`.
 */
export const SequencerControls = memo(function SequencerControls({
  sequencerState,
  playbackRate,
  onChangePlaybackRate,
  eventsQueue,
  activeReplayIndex,
  onStartRecording,
  onStopSequence,
  onPlaySequence,
  onLoadDemoMelody,
}) {
  const speedSelectId = useId();

  const queuePreview =
    eventsQueue.length > 0
      ? eventsQueue.map((e) => e.noteName).join(' → ')
      : 'Hàng đợi FIFO đang trống.';

  return (
    <section
      className={styles.sequencerPanel}
      aria-labelledby="sequencer-heading"
    >
      <header className={styles.panelHeader}>
        <h2 id="sequencer-heading" className={styles.panelTitle}>
          Bộ Thu &amp; Phát Lại Giai Điệu FIFO (Concurrent Abortable Sequencer)
        </h2>

        <form
          className={styles.controlsForm}
          aria-label="Điều khiển tốc độ và trạng thái Sequencer"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor={speedSelectId} className={styles.fieldLabel}>
            <span>Tốc độ phát (Playback Speed):</span>
            <select
              id={speedSelectId}
              className={styles.selectControl}
              value={String(playbackRate)}
              onChange={(e) => onChangePlaybackRate(Number(e.target.value))}
            >
              <option value="0.5">0.5x (Chậm)</option>
              <option value="1">1.0x (Chuẩn)</option>
              <option value="2">2.0x (Nhanh gấp đôi)</option>
            </select>
          </label>

          <button
            type="button"
            className={styles.transportBtn}
            id="btn-record-seq"
            onClick={onStartRecording}
            disabled={sequencerState === 'RECORDING'}
          >
            {sequencerState === 'RECORDING' ? 'Đang thu (Recording)...' : 'Thu Giai Điệu (Record)'}
          </button>

          <button
            type="button"
            className={styles.transportBtn}
            id="btn-play-seq"
            onClick={() => onPlaySequence()}
            disabled={sequencerState === 'PLAYING' || eventsQueue.length === 0}
          >
            Phát Lại ({eventsQueue.length} nốt)
          </button>

          <button
            type="button"
            className={styles.transportBtn}
            id="btn-stop-seq"
            onClick={onStopSequence}
            disabled={sequencerState === 'IDLE'}
          >
            Stop Sequence
          </button>

          <button
            type="button"
            className={styles.transportBtn}
            id="btn-demo-seq"
            onClick={onLoadDemoMelody}
            disabled={sequencerState !== 'IDLE'}
          >
            Nạp Giai Điệu Mẫu (C4-E4-G4-C5)
          </button>
        </form>
      </header>

      <output
        id="sequencer-live-status"
        className={styles.statusOutput}
        role="status"
        aria-live="polite"
        data-sequencer-state={sequencerState}
      >
        Trạng thái Sequencer: <strong>{sequencerState}</strong> | Tốc độ:{' '}
        <strong>{playbackRate.toFixed(1)}x</strong> | Hàng đợi FIFO ({eventsQueue.length}{' '}
        nốt
        {activeReplayIndex >= 0 ? `, đang phát #${activeReplayIndex + 1}` : ''}):{' '}
        {queuePreview}
      </output>
    </section>
  );
});
