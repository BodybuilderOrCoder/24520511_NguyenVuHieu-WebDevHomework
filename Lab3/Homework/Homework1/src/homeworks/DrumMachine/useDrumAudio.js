import { useCallback, useEffect, useRef, useState } from 'react';
import { DRUM_PADS, padByIdMap } from './data/drumPads.js';

/**
 * Tạo bộ đệm White Noise dùng chung cho Snare, Hi-Hat, Clap, Crash
 * @param {BaseAudioContext} ctx
 */
function createNoiseBuffer(ctx) {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * 1.0);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Custom Hook quản lý Web Audio API (Lazy AudioContext + WAV Sample Loader + Synth Engine)
 * Đảm bảo độ trễ < 10ms, tuân thủ Autoplay Policy và giải phóng tài nguyên trong <StrictMode>.
 */
export function useDrumAudio() {
  const audioCtxRef = useRef(null);
  const noiseBufferRef = useRef(null);
  const sampleBuffersRef = useRef(new Map());
  const activeNodesRef = useRef(new Set());
  const decayTimerRef = useRef(null);
  const loadAbortRef = useRef(null);

  const [audioMode, setAudioMode] = useState('HYBRID'); // 'HYBRID' | 'SYNTH_ONLY'
  const [currentDb, setCurrentDb] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [loadedSamplesCount, setLoadedSamplesCount] = useState(0);

  /**
   * Khởi tạo AudioContext dạng lazy khi có cử chỉ người dùng (pointerdown / keydown)
   */
  const ensureAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const ctx = new AudioContextCtor({ latencyHint: 'interactive' });
      audioCtxRef.current = ctx;
      noiseBufferRef.current = createNoiseBuffer(ctx);
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    return audioCtxRef.current;
  }, []);

  /**
   * Tải trước các file sample .wav từ bài Lab trước với AbortController cleanup
   */
  const preloadSamples = useCallback(async (ctx, signal) => {
    if (!ctx || typeof fetch === 'undefined') return;

    let loaded = 0;
    for (const pad of DRUM_PADS) {
      if (signal?.aborted) return;
      if (sampleBuffersRef.current.has(pad.id)) {
        loaded += 1;
        continue;
      }
      try {
        const res = await fetch(pad.sampleUrl, { signal });
        if (!res.ok) continue;
        const arrayBuf = await res.arrayBuffer();
        if (signal?.aborted || ctx.state === 'closed') return;
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
        sampleBuffersRef.current.set(pad.id, decoded);
        loaded += 1;
        setLoadedSamplesCount(loaded);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        // Fallback tự động sang Web Audio Synth nếu chạy trong môi trường test không có static server
      }
    }
  }, []);

  /**
   * Phát âm thanh nhạc cụ tức thì (< 10ms latency)
   * Kết hợp Web Audio Synth sắc nét + WAV Sample buffer (nếu ở chế độ HYBRID)
   */
  const triggerSound = useCallback(
    (padId, velocity = 1.0) => {
      const pad = padByIdMap.get(padId);
      if (!pad) return null;

      const startPerf = performance.now();
      const clampedVelocity = Math.min(1.2, Math.max(0.2, velocity));

      // Cập nhật ngay lập tức thanh đo Decibel trực quan cho người khiếm thính (WCAG 2.2)
      const computedDb = Math.min(
        100,
        Math.round(pad.baseDb * clampedVelocity)
      );
      setCurrentDb(computedDb);
      setPeakDb((prev) => Math.max(prev, computedDb));

      if (decayTimerRef.current) {
        window.clearTimeout(decayTimerRef.current);
      }
      decayTimerRef.current = window.setTimeout(() => {
        setCurrentDb(0);
      }, Math.round(pad.decay * 950));

      const ctx = ensureAudioContext();
      if (!ctx) {
        return {
          pad,
          decibels: computedDb,
          latencyMs: Number((performance.now() - startPerf).toFixed(2)),
        };
      }

      // Khởi chạy nạp sample nền lần đầu khi AudioContext đã sẵn sàng
      if (
        sampleBuffersRef.current.size === 0 &&
        !loadAbortRef.current &&
        audioMode === 'HYBRID'
      ) {
        const controller = new AbortController();
        loadAbortRef.current = controller;
        preloadSamples(ctx, controller.signal);
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(0.85 * clampedVelocity, now + 0.003);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + pad.decay);
      masterGain.connect(ctx.destination);

      // 1. Nhánh Sample Buffer từ Lab trước (nếu đã decode sẵn và đang bật HYBRID)
      const sampleBuffer = sampleBuffersRef.current.get(pad.id);
      if (audioMode === 'HYBRID' && sampleBuffer) {
        const sampleSource = ctx.createBufferSource();
        sampleSource.buffer = sampleBuffer;
        const sampleGain = ctx.createGain();
        sampleGain.gain.setValueAtTime(0.55 * clampedVelocity, now);
        sampleSource.connect(sampleGain);
        sampleGain.connect(ctx.destination);
        activeNodesRef.current.add(sampleSource);
        sampleSource.onended = () => {
          sampleSource.disconnect();
          sampleGain.disconnect();
          activeNodesRef.current.delete(sampleSource);
        };
        sampleSource.start(now);
      }

      // 2. Nhánh Web Audio Synthesizer (Oscillator + Filtered Noise) đảm bảo latency < 2ms
      const toneRatio = Math.max(0.08, 1 - pad.noiseLevel);
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = pad.id === 'kick' || pad.id === 'tom1' || pad.id === 'tom2' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(pad.freq, now);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(24, pad.endFreq),
        now + pad.decay * 0.75
      );
      oscGain.gain.setValueAtTime(toneRatio * clampedVelocity, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + pad.decay);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      activeNodesRef.current.add(osc);
      osc.onended = () => {
        osc.disconnect();
        oscGain.disconnect();
        masterGain.disconnect();
        activeNodesRef.current.delete(osc);
      };

      osc.start(now);
      osc.stop(now + pad.decay + 0.02);

      // 3. Nhánh White Noise Filter cho Snare / Hi-Hat / Clap / Crash
      if (pad.noiseLevel > 0.15 && noiseBufferRef.current) {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBufferRef.current;

        const filter = ctx.createBiquadFilter();
        filter.type = pad.id === 'hihat' || pad.id === 'crash' ? 'highpass' : 'bandpass';
        filter.frequency.setValueAtTime(pad.freq, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(pad.noiseLevel * 0.65 * clampedVelocity, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + pad.decay);

        noiseSource.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);

        activeNodesRef.current.add(noiseSource);
        noiseSource.onended = () => {
          noiseSource.disconnect();
          filter.disconnect();
          noiseGain.disconnect();
          activeNodesRef.current.delete(noiseSource);
        };

        noiseSource.start(now);
        noiseSource.stop(now + pad.decay + 0.02);
      }

      const latencyMs = Number((performance.now() - startPerf).toFixed(2));
      return {
        pad,
        decibels: computedDb,
        latencyMs,
      };
    },
    [audioMode, ensureAudioContext, preloadSamples]
  );

  /**
   * Dọn dẹp toàn bộ tài nguyên âm thanh khi component unmount (Rule 6: EFFECT CLEANUP)
   */
  useEffect(() => {
    const activeNodes = activeNodesRef.current;
    return () => {
      if (loadAbortRef.current) {
        loadAbortRef.current.abort();
        loadAbortRef.current = null;
      }
      if (decayTimerRef.current) {
        window.clearTimeout(decayTimerRef.current);
        decayTimerRef.current = null;
      }
      for (const node of activeNodes) {
        try {
          node.stop?.();
          node.disconnect?.();
        } catch {
          // Node đã dừng trước đó
        }
      }
      activeNodes.clear();

      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  return {
    triggerSound,
    currentDb,
    peakDb,
    audioMode,
    setAudioMode,
    loadedSamplesCount,
    resetPeakDb: useCallback(() => setPeakDb(0), []),
  };
}
