import { useCallback, useId, useRef, useState } from 'react';
import {
  computeDerivedCompatibility,
  createEffortSignal,
  EM_EFFORT_WEIGHT,
  INITIAL_EFFORT_SIGNALS,
  RIVAL_EFFORT_WEIGHT,
} from './effortReducer.js';
import {
  PHASE_META,
  RELATIONSHIP_PHASES,
  transitionRelationshipPhase,
} from './relationshipFsm.js';
import styles from './SituationshipAnalyzer.module.css';
import { useGhostingTimer } from './useGhostingTimer.js';

/**
 * Giao diện phân tích 'Hẹn Hò Nhưng Không Yêu' (Phase 3: Tích hợp Ghosting Timer 5s & AbortController Cleanup)
 * - Hoàn toàn không có thẻ `<div>` (Zero `<div>`-soup).
 * - Tính toán dẫn xuất thuần khiết trong render (`computeDerivedCompatibility`), không dùng `useEffect` để đồng bộ `isRedFlag`.
 */
export function SituationshipAnalyzer() {
  const roiMeterId = useId();
  const actorSelectId = useId();
  const stepsInputId = useId();
  const labelInputId = useId();

  // Single FSM state — tuyệt đối không dùng Boolean Soup (`isDating`, `isLoved`)
  const [phase, setPhase] = useState(RELATIONSHIP_PHASES.DATING_NO_LOVE);
  const [signals, setSignals] = useState(INITIAL_EFFORT_SIGNALS);
  const [lastPingTick, setLastPingTick] = useState(0);

  const [actorInput, setActorInput] = useState('EM');
  const [stepsInput, setStepsInput] = useState('100');
  const [labelInput, setLabelInput] = useState('Em thức trắng đêm nhắn tin');
  const signalSeqRef = useRef(10);

  const handleAutoGhostExit = useCallback(() => {
    setPhase((prev) =>
      transitionRelationshipPhase(prev, RELATIONSHIP_PHASES.GHOSTED_EXIT)
    );
  }, []);

  const {
    secondsRemaining,
    pingStatus,
    sendMessagePing,
    cancelPendingPing,
  } = useGhostingTimer(phase, lastPingTick, 5000, handleAutoGhostExit);

  // BONUS-02.1: Pure Derived Metrics calculated directly during render (Zero useEffect!)
  const derived = computeDerivedCompatibility(phase, signals);
  const currentMeta = PHASE_META[phase];

  const handlePhaseTransition = useCallback(
    (targetPhase) => {
      if (targetPhase === RELATIONSHIP_PHASES.GHOSTED_EXIT) {
        cancelPendingPing();
      }
      setPhase((prev) => transitionRelationshipPhase(prev, targetPhase));
      if (targetPhase === RELATIONSHIP_PHASES.DATING_NO_LOVE) {
        setLastPingTick((t) => t + 1);
      }
    },
    [cancelPendingPing]
  );

  const handlePingNow = useCallback(() => {
    setLastPingTick((t) => t + 1);
    sendMessagePing();
  }, [sendMessagePing]);

  const handleAddSignal = useCallback(
    (event) => {
      event.preventDefault();
      signalSeqRef.current += 1;
      const newSignal = createEffortSignal({
        id: `sig-${signalSeqRef.current}`,
        actor: actorInput,
        label: labelInput,
        steps: Number(stepsInput) || 1,
      });
      setSignals((prev) => [...prev, newSignal]);
      if (actorInput === 'AI_DO') {
        cancelPendingPing();
      } else {
        setLastPingTick((t) => t + 1);
      }
    },
    [actorInput, cancelPendingPing, labelInput, stepsInput]
  );

  return (
    <main className={styles.analyzerPage} data-current-phase={phase}>
      <header className={styles.heroHeader}>
        <section className={styles.brandGroup} aria-label="Thông tin máy trạng thái">
          <span className={styles.phaseBadge} id="fsm-phase-badge">
            {currentMeta.badge}
          </span>
          <h1 className={styles.heroTitle}>{currentMeta.title}</h1>
          <p className={styles.lyricText}>{currentMeta.lyricQuote}</p>
        </section>

        <nav className={styles.phaseNav} aria-label="Chuyển đổi trạng thái mối quan hệ (FSM)">
          <button
            type="button"
            id="btn-phase-friends"
            className={`${styles.phaseButton} ${
              phase === RELATIONSHIP_PHASES.FRIENDS ? styles.phaseButtonActive : ''
            }`}
            aria-pressed={phase === RELATIONSHIP_PHASES.FRIENDS}
            onClick={() => handlePhaseTransition(RELATIONSHIP_PHASES.FRIENDS)}
          >
            Bạn Bè (FRIENDS)
          </button>

          <button
            type="button"
            id="btn-phase-dating"
            className={`${styles.phaseButton} ${
              phase === RELATIONSHIP_PHASES.DATING_NO_LOVE
                ? styles.phaseButtonActive
                : ''
            }`}
            aria-pressed={phase === RELATIONSHIP_PHASES.DATING_NO_LOVE}
            onClick={() =>
              handlePhaseTransition(RELATIONSHIP_PHASES.DATING_NO_LOVE)
            }
          >
            Hẹn Hò Không Yêu (DATING_NO_LOVE)
          </button>

          <button
            type="button"
            id="btn-phase-official"
            className={`${styles.phaseButton} ${
              phase === RELATIONSHIP_PHASES.OFFICIAL_LOVE
                ? styles.phaseButtonActive
                : ''
            }`}
            aria-pressed={phase === RELATIONSHIP_PHASES.OFFICIAL_LOVE}
            onClick={() =>
              handlePhaseTransition(RELATIONSHIP_PHASES.OFFICIAL_LOVE)
            }
          >
            Yêu Chính Thức (OFFICIAL_LOVE)
          </button>

          <button
            type="button"
            id="btn-phase-exit"
            className={`${styles.phaseButton} ${styles.dangerExitBtn}`}
            aria-pressed={phase === RELATIONSHIP_PHASES.GHOSTED_EXIT}
            onClick={() =>
              handlePhaseTransition(RELATIONSHIP_PHASES.GHOSTED_EXIT)
            }
          >
            Dừng Lại (Unbind &amp; Free Memory)
          </button>
        </nav>
      </header>

      <section className={styles.dashboardGrid} aria-label="Bảng phân tích nỗ lực bất đối xứng">
        <article
          className={`${styles.panelCard} ${
            derived.isRedFlag ? styles.redFlagActiveCard : ''
          }`}
          aria-labelledby="red-flag-meter-heading"
        >
          <header className={styles.cardHeader}>
            <h2 id="red-flag-meter-heading" className={styles.cardTitle}>
              Thước Đo Bất Đối Xứng &amp; Đồng Hồ “Seen Không Rep”
            </h2>
            <button
              type="button"
              id="btn-ping-message"
              className={styles.actionButton}
              disabled={phase !== RELATIONSHIP_PHASES.DATING_NO_LOVE}
              onClick={handlePingNow}
            >
              Nhắn Tin Ping (Gia hạn 5s)
            </button>
          </header>

          <label htmlFor={roiMeterId} className={styles.formField}>
            <span>
              Tỷ trọng sức ảnh hưởng của Em ({derived.emotionalRoiPercent}%):
            </span>
          </label>
          <meter
            id={roiMeterId}
            className={styles.roiMeter}
            min={0}
            max={100}
            low={35}
            high={75}
            optimum={80}
            value={derived.emotionalRoiPercent}
          >
            {derived.emotionalRoiPercent}%
          </meter>

          <dl className={styles.metricsList}>
            <dt className={styles.metricTerm}>
              Nỗ lực của Em (×{EM_EFFORT_WEIGHT})
            </dt>
            <dd className={styles.metricValue} id="em-impact-score">
              {derived.emRawSteps} bước → {derived.emImpactScore} điểm
            </dd>

            <dt className={styles.metricTerm}>
              Ai đó (×{RIVAL_EFFORT_WEIGHT})
            </dt>
            <dd className={styles.metricValue} id="rival-impact-score">
              {derived.rivalRawSteps} bước → {derived.rivalImpactScore} điểm
            </dd>

            <dt className={styles.metricTerm}>Cảnh báo Red-Flag</dt>
            <dd className={styles.metricValue} id="red-flag-indicator">
              {derived.isRedFlag ? 'RED-FLAG NGUY HIỂM' : 'An toàn'}
            </dd>

            <dt className={styles.metricTerm}>Bộ đếm Seen Không Rep</dt>
            <dd className={styles.metricValue} id="ghosting-timer-value">
              <time dateTime={`PT${secondsRemaining}S`}>
                {phase === RELATIONSHIP_PHASES.DATING_NO_LOVE
                  ? `${secondsRemaining.toFixed(1)}s (${pingStatus})`
                  : `Đã ngắt timer (${pingStatus})`}
              </time>
            </dd>
          </dl>

          <output
            id="diagnostic-live-output"
            className={styles.diagnosticOutput}
            role="status"
            aria-live="polite"
            data-red-flag={derived.isRedFlag}
          >
            {derived.diagnosticMessage}
          </output>
        </article>

        <article className={styles.panelCard} aria-labelledby="effort-log-heading">
          <header className={styles.cardHeader}>
            <h2 id="effort-log-heading" className={styles.cardTitle}>
              Thêm Tín Hiệu Nỗ Lực &amp; Nhật Ký Bất Biến
            </h2>
          </header>

          <form
            className={styles.signalForm}
            aria-label="Biểu mẫu ghi nhận hành động tình cảm"
            onSubmit={handleAddSignal}
          >
            <label htmlFor={actorSelectId} className={styles.formField}>
              <span>Chủ thể hành động:</span>
              <select
                id={actorSelectId}
                className={styles.selectControl}
                value={actorInput}
                onChange={(e) => setActorInput(e.target.value)}
              >
                <option value="EM">Em (Trọng số ×0.1)</option>
                <option value="AI_DO">Ai đó (Trọng số ×50.0)</option>
              </select>
            </label>

            <label htmlFor={stepsInputId} className={styles.formField}>
              <span>Số bước nỗ lực (Steps):</span>
              <input
                id={stepsInputId}
                type="number"
                min="1"
                max="1000"
                className={styles.inputControl}
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
              />
            </label>

            <label htmlFor={labelInputId} className={styles.formField}>
              <span>Mô tả hành động:</span>
              <input
                id={labelInputId}
                type="text"
                className={styles.inputControl}
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
              />
            </label>

            <button type="submit" id="btn-add-signal" className={styles.actionButton}>
              Ghi nhận nỗ lực (Immutable Spread)
            </button>
          </form>

          <ul className={styles.signalLogList} aria-label="Danh sách tín hiệu nỗ lực">
            {signals.map((sig) => (
              <li key={sig.id} className={styles.signalLogItem}>
                <strong>[{sig.actor === 'EM' ? 'Em' : 'Ai đó'}]</strong>
                <span>{sig.label}</span>
                <span>
                  {sig.steps} bước = {(sig.steps * sig.weight).toFixed(1)} đ
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
