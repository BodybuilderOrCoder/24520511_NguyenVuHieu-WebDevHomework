/**
 * @file PolyphonicSynth.js
 * @description Engine tổng hợp âm thanh đa âm (8-Voice Polyphony) sử dụng ES6 Map
 * bảo toàn thứ tự chèn FIFO để thu hồi giọng cũ nhất (FIFO Voice Stealing)
 * và giảm biên độ mượt mà (40ms ADSR exponential ramp) chống tiếng nổ (click/pop).
 */

export class PolyphonicSynth {
  /**
   * @param {number} maxVoices Số giọng đa âm tối đa (mặc định: 8)
   */
  constructor(maxVoices = 8) {
    this.maxVoices = maxVoices;
    /** @type {AudioContext | null} */
    this.ctx = null;
    /** @type {GainNode | null} */
    this.masterGain = null;
    /**
     * ES6 Map<number, { osc: OscillatorNode, overtoneOsc: OscillatorNode, gain: GainNode, cleanupTimer: number | null }>
     * Bảo toàn thứ tự chèn FIFO (keys().next().value luôn là nốt cũ nhất).
     */
    this.voices = new Map();
    this.stolenCount = 0;
  }

  /**
   * Khởi tạo AudioContext dạng lazy khi có cử chỉ người dùng
   */
  ensureContext() {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Kích hoạt nốt nhạc MIDI với cơ chế FIFO Voice Stealing khi vượt quá maxVoices (8)
   * @param {number} midi
   * @param {number} freqHz
   * @returns {{ evictedMidi: number | null, activeVoiceCount: number }}
   */
  noteOn(midi, freqHz) {
    // Nếu nốt này đang kêu, tắt nốt cũ trước để làm mới thứ tự FIFO
    if (this.voices.has(midi)) {
      this.noteOff(midi);
    }

    let evictedMidi = null;
    if (this.voices.size >= this.maxVoices) {
      const oldestMidi = this.voices.keys().next().value;
      if (oldestMidi !== undefined) {
        evictedMidi = oldestMidi;
        this.stolenCount += 1;
        this.noteOff(oldestMidi);
      }
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) {
      this.voices.set(midi, {
        osc: null,
        overtoneOsc: null,
        gain: null,
        cleanupTimer: null,
      });
      return { evictedMidi, activeVoiceCount: this.voices.size };
    }

    const now = ctx.currentTime;
    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);
    // Attack 12ms mượt mà, sau đó decay nhẹ về mức sustain của tiếng đàn Piano
    voiceGain.gain.linearRampToValueAtTime(0.28, now + 0.012);
    voiceGain.gain.exponentialRampToValueAtTime(0.14, now + 0.28);
    voiceGain.connect(this.masterGain);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqHz, now);

    const overtoneOsc = ctx.createOscillator();
    overtoneOsc.type = 'sine';
    overtoneOsc.frequency.setValueAtTime(freqHz * 2, now);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.08, now);

    osc.connect(voiceGain);
    overtoneOsc.connect(overtoneGain);
    overtoneGain.connect(voiceGain);

    osc.start(now);
    overtoneOsc.start(now);

    this.voices.set(midi, {
      osc,
      overtoneOsc,
      overtoneGain,
      gain: voiceGain,
      cleanupTimer: null,
    });

    return {
      evictedMidi,
      activeVoiceCount: this.voices.size,
    };
  }

  /**
   * Nhả phím đàn với ADSR Release 40ms (`exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)`)
   * trước khi `osc.stop()` và `osc.disconnect()` để triệt tiêu hoàn toàn tiếng nổ (click/pop).
   * @param {number} midi
   */
  noteOff(midi) {
    const voice = this.voices.get(midi);
    if (!voice) return false;

    // Xóa ngay khỏi Map active voices để giải phóng slot trong pool 8 giọng
    this.voices.delete(midi);

    if (!this.ctx || !voice.gain || !voice.osc) {
      return true;
    }

    try {
      const now = this.ctx.currentTime;
      const releaseDurationSec = 0.04;

      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(
        Math.max(0.0002, voice.gain.gain.value || 0.1),
        now
      );
      voice.gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + releaseDurationSec
      );

      voice.osc.stop(now + releaseDurationSec + 0.005);
      voice.overtoneOsc?.stop(now + releaseDurationSec + 0.005);

      const teardown = () => {
        try {
          voice.osc.disconnect();
          voice.overtoneOsc?.disconnect();
          voice.overtoneGain?.disconnect();
          voice.gain.disconnect();
        } catch {
          // Đã ngắt kết nối
        }
      };

      voice.osc.onended = teardown;
    } catch {
      // Context đã đóng
    }

    return true;
  }

  /**
   * Dừng khẩn cấp toàn bộ giọng đang phát (dùng khi bấm Stop Sequence hoặc Unmount)
   */
  panicStop() {
    const activeMidis = Array.from(this.voices.keys());
    for (const midi of activeMidis) {
      this.noteOff(midi);
    }
    this.voices.clear();
  }

  /**
   * Đóng hoàn toàn AudioContext và giải phóng tài nguyên (Rule 6: EFFECT CLEANUP)
   */
  dispose() {
    this.panicStop();
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // Bỏ qua
      }
      this.masterGain = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
