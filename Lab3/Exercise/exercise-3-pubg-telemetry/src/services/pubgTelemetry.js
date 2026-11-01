
import { PUBG_VN_SQUADS } from '../data/pubgSquads.js';

const PACKET_LOSS_RATE = 0.35;
const MIN_DELAY_MS = 800;
const MAX_DELAY_MS = 1800;

export function fetchKraftonPubgTelemetry(
  squadId,
  { signal } = {}
) {
  return new Promise((resolve, reject) => {
    const squad = PUBG_VN_SQUADS.find(
      (item) => item.id === squadId
    );

    if (!squad) {
      reject(new Error(`Unknown squad: ${squadId}`));
      return;
    }

    // Handle requests already aborted before starting.
    if (signal?.aborted) {
      reject(
        new DOMException('Request aborted', 'AbortError')
      );
      return;
    }

    const delay =
      MIN_DELAY_MS +
      Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

    const timerId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);

      // Simulate 35% packet loss.
      if (Math.random() < PACKET_LOSS_RATE) {
        reject(
          new Error('Satellite packet lost. Connection timed out.')
        );
        return;
      }

      resolve({ ...squad });
    }, delay);

    function handleAbort() {
      clearTimeout(timerId);
      signal?.removeEventListener('abort', handleAbort);

      reject(
        new DOMException('Request aborted', 'AbortError')
      );
    }

    signal?.addEventListener('abort', handleAbort, {
      once: true,
    });
  });
}

