
import { useEffect, useState } from 'react';
import { fetchKraftonPubgTelemetry } from '../services/pubgTelemetry.js';
import styles from './PubgMatchTelemetry.module.css';

const INITIAL_VIEW = {
  status: 'IDLE',
  data: null,
  error: null,
};

export default function PubgMatchTelemetry({ squadId = 'te' }) {
  const [view, setView] = useState(INITIAL_VIEW);
  const [retryTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setView({
      status: 'LOADING',
      data: null,
      error: null,
    });

    fetchKraftonPubgTelemetry(squadId, {
      signal: controller.signal,
    })
      .then((payload) => {
        if (controller.signal.aborted) return;

        setView({
          status: 'SUCCESS',
          data: payload,
          error: null,
        });
      })
      .catch((error) => {
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

      {view.status === 'IDLE' && (
        <p>Waiting for telemetry connection...</p>
      )}

      {view.status === 'LOADING' && (
        <p role="status">
          Connecting to satellite...
        </p>
      )}

      {view.status === 'ERROR' && (
        <p role="alert">
          Satellite connection failed: {view.error}
        </p>
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
  );
}
