import { useEffect, useState } from 'react';

/**
 * Định dạng mili-giây còn lại sang chuỗi đồng hồ `MM:SS.d`
 * @param {number} ms
 */
export function formatAirdropClock(ms) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const deciseconds = String(Math.floor((safeMs % 1000) / 100));
  return `${minutes}:${seconds}.${deciseconds}`;
}

/**
 * Custom Hook đếm ngược Airdrop không trôi (Zero-Drift Timer)
 * - Tính toán khoảng cách tuyệt đối: `Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs))`
 * - Tuyệt đối cấm `setSeconds(s => s - 1)`
 * - Tự động đồng bộ lại ngay lập tức khi người dùng quay lại tab (`visibilitychange`)
 *
 * @param {number} targetEpochMs
 * @param {number} [serverOffsetMs=0]
 */
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs))
  );

  useEffect(() => {
    const syncWallClock = () => {
      const nextRemaining = Math.max(
        0,
        targetEpochMs - (Date.now() + serverOffsetMs)
      );
      setRemainingMs(nextRemaining);
    };

    syncWallClock();

    const intervalId = window.setInterval(syncWallClock, 100);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWallClock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [targetEpochMs, serverOffsetMs]);

  const isLive = remainingMs > 0;
  const formattedClock = formatAirdropClock(remainingMs);

  return {
    remainingMs,
    isLive,
    formattedClock,
  };
}
