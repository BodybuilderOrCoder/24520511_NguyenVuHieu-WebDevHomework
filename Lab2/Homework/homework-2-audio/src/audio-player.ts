export class AudioPlayer {
  readonly context: AudioContext;
  readonly analyser: AnalyserNode;
  private source: AudioBufferSourceNode | null = null;
  private generation = 0;
  private disposed = false;
  private onEnded: () => void;

  constructor(context: AudioContext, onEnded: () => void = () => {}) {
    this.context = context;
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.connect(context.destination);
    this.onEnded = onEnded;
  }

  get playing(): boolean {
    return this.source !== null;
  }

  async play(buffer: AudioBuffer): Promise<boolean> {
    if (this.disposed) throw new Error('Player has been disposed');
    this.stop();
    const generation = this.generation;
    await this.context.resume();
    if (generation !== this.generation) return false;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.analyser);
    source.onended = () => {
      if (this.source !== source) return;
      source.disconnect();
      source.onended = null;
      this.source = null;
      this.onEnded();
    };
    this.source = source;
    try {
      source.start();
    } catch (error) {
      this.stop();
      throw error;
    }
    return true;
  }

  stop(): void {
    this.generation++;
    if (!this.source) return;
    this.source.onended = null;
    this.source.stop();
    this.source.disconnect();
    this.source = null;
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.analyser.disconnect();
    if (this.context.state !== 'closed') await this.context.close();
  }
}
