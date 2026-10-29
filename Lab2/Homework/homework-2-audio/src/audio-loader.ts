export async function downloadAudio(url: string, signal: AbortSignal): Promise<ArrayBuffer> {
  signal.throwIfAborted();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Download failed (HTTP ${response.status})`);
  const bytes = await response.arrayBuffer();
  signal.throwIfAborted();
  return bytes;
}

export async function loadAudio(
  context: BaseAudioContext, url: string, signal: AbortSignal,
): Promise<AudioBuffer> {
  const bytes = await downloadAudio(url, signal);
  const buffer = await context.decodeAudioData(bytes);
  signal.throwIfAborted();
  return buffer;
}
