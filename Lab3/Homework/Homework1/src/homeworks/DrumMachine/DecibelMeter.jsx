import { memo, useId } from 'react';
import styles from './DrumKit.module.css';

/**
 * Thanh đo cường độ âm thanh trực quan (Decibel Meter) hỗ trợ người khiếm thính (WCAG 2.2 AA).
 * Sử dụng thẻ <meter> chuẩn HTML5 kết hợp <label htmlFor={id}> qua useId().
 */
export const DecibelMeter = memo(function DecibelMeter({
  currentDb = 0,
  peakDb = 0,
  totalHits = 0,
  onResetPeak,
}) {
  const meterId = useId();

  const intensityLabel =
    currentDb >= 88
      ? 'Cường độ cao (Mạnh)'
      : currentDb >= 60
        ? 'Cường độ trung bình'
        : currentDb > 0
          ? 'Cường độ nhẹ'
          : 'Tĩnh lặng (0 dB)';

  return (
    <article className={styles.telemetryCard} aria-labelledby={`${meterId}-title`}>
      <header className={styles.sectionHeader}>
        <h2 id={`${meterId}-title`} className={styles.sectionTitle}>
          Thanh Đo Cường Độ Âm Thanh (Decibel Meter)
        </h2>
        <button
          type="button"
          className={styles.actionButton}
          onClick={onResetPeak}
          disabled={peakDb === 0}
        >
          Đặt lại đỉnh dB
        </button>
      </header>

      <label htmlFor={meterId} className={styles.controlField}>
        <span>Mức âm lượng tức thời ({intensityLabel}):</span>
        <strong>{currentDb} dB</strong>
      </label>

      <meter
        id={meterId}
        className={styles.meterElement}
        min={0}
        max={100}
        low={50}
        high={85}
        optimum={70}
        value={currentDb}
      >
        {currentDb} trên 100 dB
      </meter>

      <dl className={styles.statsList}>
        <section className={styles.statItem} aria-label="Cường độ hiện tại">
          <dt className={styles.statTerm}>Tức thời</dt>
          <dd className={styles.statValue}>{currentDb} dB</dd>
        </section>
        <section className={styles.statItem} aria-label="Cường độ đỉnh">
          <dt className={styles.statTerm}>Đỉnh (Peak)</dt>
          <dd className={styles.statValue}>{peakDb} dB</dd>
        </section>
        <section className={styles.statItem} aria-label="Tổng số nhịp gõ">
          <dt className={styles.statTerm}>Tổng nhịp gõ</dt>
          <dd className={styles.statValue}>{totalHits}</dd>
        </section>
      </dl>
    </article>
  );
});
