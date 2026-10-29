export function remainingMs(deadline: number, now = Date.now()): number {
  if (!Number.isFinite(deadline) || !Number.isFinite(now)) throw new Error('Invalid countdown timestamp');
  return Math.max(0, deadline - now);
}

export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor(ms / 1000) % 60;
  const milliseconds = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

export function startCountdown(deadline: number, onTick: (remaining: number) => void): () => void {
  remainingMs(deadline); // Validate before scheduling work.
  let frame: number | null = null;
  let stopped = false;
  function tick(): void {
    frame = null;
    if (stopped) return;
    const remaining = remainingMs(deadline);
    onTick(remaining);
    if (remaining > 0 && !stopped) frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return () => {
    stopped = true;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  };
}
