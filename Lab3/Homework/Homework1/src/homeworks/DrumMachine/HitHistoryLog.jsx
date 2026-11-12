import { memo } from 'react';
import styles from './DrumKit.module.css';

/**
 * Bảng lịch sử nhịp gõ trực quan & vùng công bố Screen Reader (<output role="status" aria-live="polite">).
 * Derived chuỗi nhịp điệu trực tiếp trong quá trình render (Rule 5: STATE HYGIENE - Zero useEffect).
 */
export const HitHistoryLog = memo(function HitHistoryLog({
  hitHistory,
  onClearHistory,
  recorderState,
  recordedCount,
  onStartRecord,
  onStopRecord,
  onReplayRecord,
}) {
  // Pure derived sequence string (Zero useEffect state synchronization)
  const sequenceSummary =
    hitHistory.length > 0
      ? hitHistory.map((item) => item.name).join(' → ')
      : 'Chưa có nhịp trống nào được ghi nhận.';

  const latestHit = hitHistory.at(-1) ?? null;

  return (
    <article className={styles.telemetryCard} aria-labelledby="hit-log-heading">
      <header className={styles.sectionHeader}>
        <h2 id="hit-log-heading" className={styles.sectionTitle}>
          Nhật Ký Nhịp Điệu &amp; Bộ Thu FIFO (Visual Hit Log)
        </h2>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onClearHistory}
          disabled={hitHistory.length === 0}
        >
          Xóa lịch sử
        </button>
      </header>

      <output
        id="hit-history-live"
        className={styles.liveOutput}
        role="status"
        aria-live="polite"
      >
        {latestHit
          ? `Chuỗi nhịp (${hitHistory.length}): ${sequenceSummary} — Gần nhất: ${latestHit.name} [${latestHit.keyLabel}] (${latestHit.decibels} dB)`
          : sequenceSummary}
      </output>

      {hitHistory.length > 0 ? (
        <ul className={styles.historyList} aria-label="Danh sách các nhịp vừa gõ">
          {hitHistory.map((entry) => (
            <li key={entry.id} className={styles.historyChip}>
              <strong>[{entry.keyLabel}]</strong> {entry.name} ({entry.decibels} dB)
            </li>
          ))}
        </ul>
      ) : null}

      <section className={styles.actionRow} aria-label="Điều khiển thu và phát lại nhịp trống">
        <button
          type="button"
          className={styles.actionButton}
          onClick={onStartRecord}
          disabled={recorderState === 'RECORDING' || recorderState === 'PLAYING'}
        >
          {recorderState === 'RECORDING' ? 'Đang thu nhịp...' : 'Thu Beat (Record)'}
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onStopRecord}
          disabled={recorderState === 'IDLE'}
        >
          Dừng (Stop)
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onReplayRecord}
          disabled={recorderState !== 'IDLE' || recordedCount === 0}
        >
          Phát lại ({recordedCount} nhịp)
        </button>
      </section>
    </article>
  );
});
