import { useCallback, useEffect, useRef, useState } from 'react';
import { RELATIONSHIP_PHASES } from './relationshipFsm.js';

/**
 * Custom Hook quản lý bộ đếm 'Seen Không Rep' (Ghosting Timer) 5 giây (`5000ms`)
 * và kiểm tra trạng thái "Đang gõ..." bất đồng bộ gắn với `AbortController`.
 *
 * - Khi `phase === 'DATING_NO_LOVE'`, khởi chạy đồng hồ chờ phản hồi 5000ms.
 * - Nếu hết 5000ms không có tương tác đáp lại (`lastPingTick`), tự động chuyển sang `'GHOSTED_EXIT'`.
 * - Khi bấm "Dừng Lại (Unbind & Free Memory)" hoặc unmount, dọn dẹp tức thì cả `clearTimeout`, `clearInterval` và `controller.abort()`.
 *
 * @param {string} phase
 * @param {number} lastPingTick
 * @param {number} timeoutMs
 * @param {() => void} onGhostTimeout
 */
export function useGhostingTimer(
  phase,
  lastPingTick,
  timeoutMs = 5000,
  onGhostTimeout
) {
  const [remainingMs, setRemainingMs] = useState(timeoutMs);
  const [pingStatus, setPingStatus] = useState('IDLE'); // 'IDLE' | 'WAITING_READ_RECEIPT' | 'SEEN_NO_REP' | 'ABORTED_CLEAN'
  const pingAbortRef = useRef(null);

  const cancelPendingPing = useCallback(() => {
    if (pingAbortRef.current) {
      pingAbortRef.current.abort();
      pingAbortRef.current = null;
      setPingStatus('ABORTED_CLEAN');
    }
  }, []);

  const sendMessagePing = useCallback(() => {
    if (pingAbortRef.current) {
      pingAbortRef.current.abort();
    }
    const controller = new AbortController();
    pingAbortRef.current = controller;
    setPingStatus('WAITING_READ_RECEIPT');

    const receiptTimer = window.setTimeout(() => {
      if (!controller.signal.aborted) {
        setPingStatus('SEEN_NO_REP');
      }
    }, 350);

    controller.signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(receiptTimer);
      },
      { once: true }
    );
  }, []);

  useEffect(() => {
    if (phase !== RELATIONSHIP_PHASES.DATING_NO_LOVE) {
      if (pingAbortRef.current) {
        pingAbortRef.current.abort();
        pingAbortRef.current = null;
      }
      return undefined;
    }

    const controller = new AbortController();
    const deadlineMs = Date.now() + timeoutMs;

    const tick = () => {
      if (controller.signal.aborted) return;
      const left = Math.max(0, deadlineMs - Date.now());
      setRemainingMs(left);
    };

    const intervalId = window.setInterval(tick, 100);
    const timeoutId = window.setTimeout(() => {
      if (!controller.signal.aborted) {
        setRemainingMs(0);
        onGhostTimeout();
      }
    }, timeoutMs);

    // BONUS-03.3: Deterministic Cleanup
    return () => {
      controller.abort();
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
      if (pingAbortRef.current) {
        pingAbortRef.current.abort();
        pingAbortRef.current = null;
      }
    };
  }, [phase, lastPingTick, timeoutMs, onGhostTimeout]);

  const secondsRemaining =
    phase === RELATIONSHIP_PHASES.DATING_NO_LOVE
      ? Number((remainingMs / 1000).toFixed(1))
      : 0;

  return {
    secondsRemaining,
    pingStatus,
    sendMessagePing,
    cancelPendingPing,
  };
}
