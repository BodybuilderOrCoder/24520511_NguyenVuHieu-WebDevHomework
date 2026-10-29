export class Visualizer {
  private canvas: HTMLCanvasElement;
  private analyser: AnalyserNode;
  private context: CanvasRenderingContext2D;
  private data: Uint8Array<ArrayBuffer>;
  private frame: number | null = null;
  private color = '';

  constructor(canvas: HTMLCanvasElement, analyser: AnalyserNode) {
    this.canvas = canvas;
    this.analyser = analyser;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable in this browser.');
    this.context = context;
    this.data = new Uint8Array(analyser.frequencyBinCount);
  }

  start(): void {
    if (this.frame !== null) return;
    this.color = getComputedStyle(this.canvas).getPropertyValue('--spectrum').trim();
    this.frame = requestAnimationFrame(this.draw);
  }

  stop(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private draw = (): void => {
    const { width, height } = this.canvas;
    this.analyser.getByteFrequencyData(this.data);
    this.context.clearRect(0, 0, width, height);
    this.context.fillStyle = this.color;
    const barWidth = width / this.data.length;
    for (let i = 0; i < this.data.length; i++) {
      const barHeight = this.data[i] / 255 * height;
      this.context.fillRect(i * barWidth, height - barHeight, Math.max(1, barWidth - 1), barHeight);
    }
    this.frame = requestAnimationFrame(this.draw);
  };
}
