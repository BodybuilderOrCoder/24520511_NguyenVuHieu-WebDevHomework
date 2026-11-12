import { memo } from 'react';
import { usePubgAirdropTimer } from './usePubgAirdropTimer.js';

/**
 * Hiển thị đồng hồ đếm ngược hòm thính Airdrop bằng thẻ ngữ nghĩa `<time>`
 * với `font-variant-numeric: tabular-nums` để chống nhảy chữ (Zero Layout Shift).
 */
export const AirdropCountdown = memo(function AirdropCountdown({
  targetEpochMs,
  serverOffsetMs = 0,
  className = '',
}) {
  const { remainingMs, isLive, formattedClock } = usePubgAirdropTimer(
    targetEpochMs,
    serverOffsetMs
  );

  const isoDuration = `PT${(remainingMs / 1000).toFixed(1)}S`;

  return (
    <time
      className={className}
      dateTime={isoDuration}
      data-remaining-ms={remainingMs}
      data-is-live={isLive}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {isLive ? `Còn lại: ${formattedClock}` : '00:00.0 (Hết giờ)'}
    </time>
  );
});
