export type TaskStatus = 'queued' | 'active' | 'resolved' | 'rejected' | 'cancelled';

export interface TaskSnapshot {
  readonly id: number;
  readonly url: string;
  readonly status: TaskStatus;
}

export interface AudioTask extends TaskSnapshot {
  status: TaskStatus;
  readonly controller: AbortController;
  readonly resolve: (buffer: AudioBuffer) => void;
  readonly reject: (reason: unknown) => void;
}

export interface TaskHandle {
  readonly id: number;
  readonly result: Promise<AudioBuffer>;
  cancel(): void;
}

export type AudioLoader = (url: string, signal: AbortSignal) => Promise<AudioBuffer>;
export type QueueObserver = (task: TaskSnapshot) => void;

export type ViewState =
  | { status: 'IDLE' }
  | { status: 'LOADING' }
  | { status: 'SUCCESS'; message: string }
  | { status: 'ERROR'; message: string };

export interface Track {
  readonly id: string;
  readonly title: string;
  readonly url: string;
}
