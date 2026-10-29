import { AudioTaskQueue } from './audio-queue-controller.ts';
import { loadAudio } from './audio-loader.ts';
import { AudioPlayer } from './audio-player.ts';
import { Visualizer } from './visualizer.ts';
import type { TaskHandle, TaskSnapshot, Track, ViewState } from './contracts.ts';

const tracks: Track[] = [
  { id: 'low', title: 'Low pulse · 220 Hz', url: '/audio/low.wav' },
  { id: 'mid', title: 'Middle tone · 440 Hz', url: '/audio/mid.wav' },
  { id: 'high', title: 'High tone · 880 Hz', url: '/audio/high.wav' },
  { id: 'missing', title: 'Missing file', url: '/audio/missing.wav' },
  { id: 'invalid', title: 'Invalid audio', url: '/audio/invalid.wav' },
];

interface TaskRow {
  track: Track;
  snapshot: TaskSnapshot;
  element: HTMLLIElement;
  label: HTMLParagraphElement;
  cancel: HTMLButtonElement;
  play: HTMLButtonElement;
  retry: HTMLButtonElement;
  handle?: TaskHandle;
  buffer?: AudioBuffer;
}

const root = document.querySelector<HTMLElement>('#main-content')!;
const list = document.querySelector<HTMLOListElement>('#queue')!;
const selector = document.querySelector<HTMLSelectElement>('#track')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const errorMessage = document.querySelector<HTMLParagraphElement>('#error')!;
const loading = document.querySelector<HTMLParagraphElement>('#loading')!;
const empty = document.querySelector<HTMLParagraphElement>('#empty')!;
const stopButton = document.querySelector<HTMLButtonElement>('#stop')!;
const nowPlaying = document.querySelector<HTMLParagraphElement>('#now-playing')!;
const rows = new Map<number, TaskRow>();
let player: AudioPlayer | null = null;
let visualizer: Visualizer | null = null;
let queue: AudioTaskQueue | null = null;
let state: ViewState = { status: 'IDLE' };
let mounted = true;
let lifecycle = 0;

function setView(next: ViewState): void {
  const pending = [...rows.values()].some(({ snapshot }) =>
    snapshot.status === 'queued' || snapshot.status === 'active');
  state = pending && next.status === 'SUCCESS' ? { status: 'LOADING' } : next;
  root.dataset.state = state.status;
  loading.hidden = !pending;
  list.setAttribute('aria-busy', String(pending));
  errorMessage.hidden = state.status !== 'ERROR';
  errorMessage.textContent = state.status === 'ERROR' ? state.message : '';
  status.textContent = state.status === 'LOADING' ? 'Loading tracks in FIFO order…'
    : state.status === 'IDLE' ? 'Ready to load a track.' : state.message;
}

function actionButton(label: string, action: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.dataset.action = action;
  return button;
}

function updateTask(snapshot: TaskSnapshot): void {
  let row = rows.get(snapshot.id);
  if (!row) {
    const track = tracks.find((item) => item.url === snapshot.url)!;
    const element = document.createElement('li');
    element.dataset.taskId = String(snapshot.id);
    const label = document.createElement('p');
    const actions = document.createElement('span');
    actions.className = 'task-actions';
    const cancel = actionButton('Cancel', 'cancel');
    const play = actionButton('Play / replay', 'play');
    const retry = actionButton('Retry', 'retry');
    actions.append(cancel, play, retry);
    element.append(label, actions);
    list.append(element);
    row = { track, snapshot, element, label, cancel, play, retry };
    rows.set(snapshot.id, row);
  }
  row.snapshot = snapshot;
  row.label.textContent = `#${snapshot.id} ${row.track.title} — ${snapshot.status}`;
  row.cancel.disabled = !['queued', 'active'].includes(snapshot.status);
  row.play.disabled = snapshot.status !== 'resolved' || !row.buffer;
  row.retry.hidden = !['rejected', 'cancelled'].includes(snapshot.status);
  empty.hidden = rows.size > 0;
  if (snapshot.status === 'queued' || snapshot.status === 'active') setView({ status: 'LOADING' });
}

function playbackEnded(): void {
  visualizer?.stop();
  stopButton.disabled = true;
  nowPlaying.textContent = 'Playback stopped. Use Play / replay to listen again.';
}

function ensureAudio(): void {
  if (player) return;
  const context = new AudioContext();
  try {
    player = new AudioPlayer(context, playbackEnded);
    visualizer = new Visualizer(document.querySelector<HTMLCanvasElement>('#spectrum')!, player.analyser);
    queue = new AudioTaskQueue((url, signal) => loadAudio(context, url, signal), updateTask);
  } catch (error) {
    if (player) void player.dispose().catch(() => {});
    else void context.close().catch(() => {});
    player = null;
    visualizer = null;
    throw error;
  }
}

function enqueue(track: Track): void {
  // Bound retained decoded buffers and rows during repeated use.
  if (rows.size >= 20) {
    setView({ status: 'ERROR', message: 'Queue limit reached (20). Clear finished tasks before adding more.' });
    return;
  }
  ensureAudio();
  const handle = queue!.enqueue(track.url);
  const row = rows.get(handle.id)!;
  const currentLifecycle = lifecycle;
  row.handle = handle;
  void handle.result.then((buffer) => {
    if (!mounted || lifecycle !== currentLifecycle || !rows.has(handle.id)) return;
    row.buffer = buffer;
    updateTask(row.snapshot);
    setView({ status: 'SUCCESS', message: `${track.title} is ready to play.` });
  }).catch((error: unknown) => {
    if (!mounted || lifecycle !== currentLifecycle) return;
    const cancelled = error instanceof DOMException && error.name === 'AbortError';
    setView(cancelled ? { status: 'SUCCESS', message: `${track.title} cancelled.` }
      : { status: 'ERROR', message: `${track.title}: ${error instanceof Error ? error.message : 'Loading failed'}. Use Retry.` });
  });
}

async function handleClick(event: MouseEvent): Promise<void> {
  const button = (event.target as Element).closest('button');
  if (!button || button.disabled || !root.contains(button)) return;
  try {
    if (button.id === 'enqueue') {
      const track = tracks.find((item) => item.id === selector.value);
      if (track) enqueue(track);
    } else if (button.id === 'cancel-all') {
      for (const row of rows.values()) row.handle?.cancel();
    } else if (button.id === 'stop') {
      player?.stop();
      playbackEnded();
    } else if (button.id === 'clear') {
      for (const [id, row] of rows) {
        if (['resolved', 'rejected', 'cancelled'].includes(row.snapshot.status)) {
          row.element.remove();
          rows.delete(id);
        }
      }
      empty.hidden = rows.size > 0;
      setView({ status: rows.size ? 'LOADING' : 'IDLE' });
    } else {
      const row = rows.get(Number(button.closest('li')?.dataset.taskId));
      if (!row) return;
      if (button.dataset.action === 'cancel') row.handle?.cancel();
      if (button.dataset.action === 'retry') enqueue(row.track);
      if (button.dataset.action === 'play' && row.buffer && player) {
        const started = await player.play(row.buffer);
        if (!started || !mounted) return;
        visualizer?.start();
        stopButton.disabled = false;
        nowPlaying.textContent = `Playing: ${row.track.title}`;
      }
    }
  } catch (error) {
    if (!mounted) return;
    setView({ status: 'ERROR', message: error instanceof Error ? error.message : 'Audio unavailable. Try again.' });
  }
}

root.addEventListener('click', handleClick);
setView({ status: 'IDLE' });

function unmount(): void {
  mounted = false;
  lifecycle++;
  root.removeEventListener('click', handleClick);
  queue?.dispose();
  visualizer?.stop();
  void player?.dispose().catch(() => { /* Page is leaving; resources are already disconnected. */ });
  queue = null;
  visualizer = null;
  player = null;
  rows.clear();
  list.replaceChildren();
}

window.addEventListener('pagehide', unmount);
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  mounted = true;
  empty.hidden = false;
  playbackEnded();
  root.addEventListener('click', handleClick);
  setView({ status: 'IDLE' });
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  player?.stop();
  playbackEnded();
  if (player?.context.state === 'running') void player.context.suspend().catch(() => {});
});
