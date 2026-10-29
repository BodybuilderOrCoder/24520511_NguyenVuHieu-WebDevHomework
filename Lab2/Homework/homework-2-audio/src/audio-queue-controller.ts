import type { AudioLoader, AudioTask, QueueObserver, TaskHandle } from './contracts.ts';

export class AudioTaskQueue {
  private queue: AudioTask[] = [];
  private active: AudioTask | null = null;
  private nextId = 1;
  private disposed = false;
  private loader: AudioLoader;
  private observer: QueueObserver;

  constructor(loader: AudioLoader, observer: QueueObserver = () => {}) {
    this.loader = loader;
    this.observer = observer;
  }

  enqueue(url: string): TaskHandle {
    if (this.disposed) throw new Error('Queue has been disposed');
    const id = this.nextId++;
    const result = new Promise<AudioBuffer>((resolve, reject) => {
      const task: AudioTask = {
        id, url, status: 'queued', controller: new AbortController(), resolve, reject,
      };
      this.queue.push(task);
      this.notify(task);
    });
    void this.processNext();
    return { id, result, cancel: () => this.cancel(id) };
  }

  dispose(): void {
    this.disposed = true;
    for (const task of [...this.queue]) this.cancel(task.id);
    if (this.active) this.cancel(this.active.id);
  }

  private notify(task: AudioTask): void {
    try {
      this.observer({ id: task.id, url: task.url, status: task.status });
    } catch (error) {
      console.error('Queue observer failed:', error);
    }
  }

  private cancel(id: number): void {
    const task = this.active?.id === id ? this.active : this.queue.find((item) => item.id === id);
    if (!task || task.status === 'cancelled') return;
    this.queue = this.queue.filter((item) => item.id !== id);
    task.status = 'cancelled';
    task.controller.abort();
    task.reject(new DOMException('Task cancelled', 'AbortError'));
    this.notify(task);
  }

  private async processNext(): Promise<void> {
    if (this.active) return;
    const task = this.queue.shift();
    if (!task) return;
    this.active = task;
    task.status = 'active';
    this.notify(task);
    try {
      const buffer = await this.loader(task.url, task.controller.signal);
      task.controller.signal.throwIfAborted();
      task.status = 'resolved';
      task.resolve(buffer);
    } catch (error) {
      if (!task.controller.signal.aborted) {
        task.status = 'rejected';
        task.reject(error);
      }
    } finally {
      if (!task.controller.signal.aborted) this.notify(task);
      this.active = null;
      void this.processNext();
    }
  }
}
