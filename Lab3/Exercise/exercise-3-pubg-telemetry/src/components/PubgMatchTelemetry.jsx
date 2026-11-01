
import { useEffect, useState } from 'react';
import { fetchKraftonPubgTelemetry } from '../services/pubgTelemetry.js';
import styles from './PubgMatchTelemetry.module.css';

// Four-state machine: IDLE | LOADING | SUCCESS | ERROR
// A request begins immediately on component mount,
// so the initial visible state is LOADING.
const INITIAL_VIEW = {
  status: 'LOADING',
  data: null,
  error: null,
};

export default function PubgMatchTelemetry({ squadId = 'te' }) {
  const [view, setView] = useState(INITIAL_VIEW);
  const [retryTick, setRetryTick] = useState(0);


function handleRetry() {
  // Reset UI immediately, in the event handler.
  setView({
    status: 'LOADING',
    data: null,
    error: null,
  });

  // Trigger a new request through useEffect.
  setRetryTick((previous) => previous + 1);
}


  useEffect(() => {
    const controller = new AbortController();

    fetchKraftonPubgTelemetry(squadId, {
      signal: controller.signal,
    })
      .then((payload) => {
        // Never update state from an aborted request.
        if (controller.signal.aborted) return;

        setView({
          status: 'SUCCESS',
          data: payload,
          error: null,
        });
      })
      .catch((error) => {
        // An intentional abort is not packet loss.
        if (
          controller.signal.aborted ||
          error?.name === 'AbortError'
        ) {
          return;
        }

        setView({
          status: 'ERROR',
          data: null,
          error: error?.message ?? 'Unknown telemetry error',
        });
      });

    // Cleanup on unmount or dependency changes.
    return () => {
      controller.abort();
    };
  }, [squadId, retryTick]);

  return (
    <section
      className={styles.telemetry}
      aria-labelledby="telemetry-title"
    >
      <header>
        <h2 id="telemetry-title">
          PUBG VN Live Match Telemetry
        </h2>

        <p>
          Simulated telemetry — not a real live feed
        </p>
      </header>

      <p role="status">
        Current state: {view.status}
      </p>

      <section className={styles.telemetryBody}>
        {view.status === 'IDLE' && (
          <p>Waiting for telemetry connection...</p>
        )}

        {view.status === 'LOADING' && (
          <section
            className={styles.skeleton}
            aria-busy="true"
            aria-label="Loading PUBG match telemetry"
          >
            <p
              role="status"
              className={styles.loadingText}
            >
              Syncing KRAFTON Radar...
            </p>

            <span
              className={styles.skeletonLine}
              aria-hidden="true"
            />

            <span
              className={styles.skeletonLineShort}
              aria-hidden="true"
            />

            <span
              className={styles.skeletonLine}
              aria-hidden="true"
            />
          </section>
        )}

        
{view.status === 'ERROR' && (
  <section
    className={styles.errorPanel}
    role="alert"
    aria-labelledby="telemetry-error-title"
  >
    <h3 id="telemetry-error-title">
      Blue-Zone Link Lost
    </h3>

    <p>
      Satellite connection failed: {view.error}
    </p>

    <button
      type="button"
      className={styles.retryButton}
      onClick={handleRetry}
    >
      Reconnect Satellite
    </button>
  </section>
)}

        {view.status === 'SUCCESS' && view.data && (
          <article
            className={styles.card}
            aria-labelledby="squad-name"
          >
            <header className={styles.cardHeader}>
              <h3 id="squad-name">
                {view.data.name}
              </h3>

              <p>{view.data.status}</p>
            </header>

            <dl className={styles.stats}>
              <dt>Map</dt>
              <dd>{view.data.map}</dd>

              <dt>Phase</dt>
              <dd>{view.data.phase}</dd>

              <dt>Alive</dt>
              <dd>{view.data.alive}</dd>

              <dt>Kills</dt>
              <dd>{view.data.kills}</dd>

              <dt>WWCD Probability</dt>
              <dd>{view.data.wwcdProb}</dd>

              <dt>Status</dt>
              <dd>{view.data.status}</dd>
            </dl>
          </article>
        )}
      </section>
    </section>
  );
}
