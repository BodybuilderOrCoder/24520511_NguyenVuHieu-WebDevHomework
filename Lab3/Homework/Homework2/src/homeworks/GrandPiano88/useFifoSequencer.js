import { useCallback, useEffect, useRef, useState } from 'react';
import { KEY_BY_MIDI } from './utils/pianoScale.js';

/**
 * Hàm delay bất đồng bộ có gắn `AbortSignal` để hủy ngay lập tức trong 1 frame
 * @param {number} ms
 * @param {AbortSignal} signal
 */
function abortableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Sequence aborted', 'AbortError'));
      return;
    }
    const timerId = window.setTimeout(resolve, Math.max(0, ms));
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timerId);
        reject(new DOMException('Sequence aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

/**
 * Custom Hook quản lý hàng đợi thu âm giai điệu FIFO (`RecordedNoteEvent[]`)
 * và phát lại đa tốc độ (`0.5x`, `1.0x`, `2.0x`) có thể hủy tức thì qua `AbortController`.
 */
export function useFifoSequencer({ onTriggerNoteOn, onTriggerNoteOff, onPanicStop }) {
  const [sequencerState, setSequencerState] = useState('IDLE'); // 'IDLE' | 'RECORDING' | 'PLAYING'
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [eventsQueue, setEventsQueue] = useState([]);
  const [activeReplayIndex, setActiveReplayIndex] = useState(-1);

  const isRecordingRef = useRef(false);
  const lastEventPerfRef = useRef(0);
  const activeHoldStartRef = useRef(new Map());
  const eventSeqIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  const stopSequence = useCallback(() => {
    isRecordingRef.current = false;
    activeHoldStartRef.current.clear();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    onPanicStop?.();
    setActiveReplayIndex(-1);
    setSequencerState('IDLE');
  }, [onPanicStop]);

  const startRecording = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    onPanicStop?.();

    isRecordingRef.current = true;
    lastEventPerfRef.current = performance.now();
    activeHoldStartRef.current.clear();
    setEventsQueue([]);
    setActiveReplayIndex(-1);
    setSequencerState('RECORDING');
  }, [onPanicStop]);

  const recordNoteOn = useCallback((midi) => {
    if (!isRecordingRef.current) return;
    const keyDesc = KEY_BY_MIDI.get(midi);
    if (!keyDesc) return;

    const now = performance.now();
    const deltaMs = Math.max(0, Math.round(now - lastEventPerfRef.current));
    lastEventPerfRef.current = now;

    eventSeqIdRef.current += 1;
    const eventId = `seq-${eventSeqIdRef.current}-m${midi}`;
    activeHoldStartRef.current.set(midi, { id: eventId, startPerf: now });

    const newEvent = Object.freeze({
      id: eventId,
      midi,
      noteName: keyDesc.noteName,
      freqHz: keyDesc.freqHz,
      deltaMs,
      durationMs: 220, // Mặc định 220ms, sẽ cập nhật chính xác khi nhả phím (recordNoteOff)
    });

    setEventsQueue((prev) => [...prev, newEvent]);
  }, []);

  const recordNoteOff = useCallback((midi) => {
    if (!isRecordingRef.current) return;
    const holdInfo = activeHoldStartRef.current.get(midi);
    if (!holdInfo) return;

    activeHoldStartRef.current.delete(midi);
    const durationMs = Math.min(
      2500,
      Math.max(80, Math.round(performance.now() - holdInfo.startPerf))
    );

    setEventsQueue((prev) =>
      prev.map((item) =>
        item.id === holdInfo.id
          ? Object.freeze({ ...item, durationMs })
          : item
      )
    );
  }, []);

  const playSequence = useCallback(
    async (customEvents = null) => {
      const targetQueue = customEvents || eventsQueue;
      if (targetQueue.length === 0) return;

      isRecordingRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const { signal } = controller;

      setSequencerState('PLAYING');
      setActiveReplayIndex(0);

      try {
        for (let idx = 0; idx < targetQueue.length; idx += 1) {
          const noteEvent = targetQueue[idx];
          if (signal.aborted) break;

          setActiveReplayIndex(idx);
          const scaledDeltaMs = noteEvent.deltaMs / playbackRate;
          if (scaledDeltaMs > 0) {
            await abortableDelay(scaledDeltaMs, signal);
          }
          if (signal.aborted) break;

          onTriggerNoteOn(noteEvent.midi);

          const scaledHoldMs = Math.max(60, noteEvent.durationMs / playbackRate);
          abortableDelay(scaledHoldMs, signal)
            .then(() => {
              if (!signal.aborted) {
                onTriggerNoteOff(noteEvent.midi);
              }
            })
            .catch(() => {});
        }

        // Chờ nốt cuối cùng ngân xong trước khi chuyển về IDLE
        const lastNote = targetQueue.at(-1);
        if (lastNote && !signal.aborted) {
          await abortableDelay((lastNote.durationMs + 60) / playbackRate, signal);
        }
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error(err);
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
          onPanicStop?.();
          setActiveReplayIndex(-1);
          setSequencerState('IDLE');
        }
      }
    },
    [eventsQueue, onPanicStop, onTriggerNoteOff, onTriggerNoteOn, playbackRate]
  );

  const loadDemoMelody = useCallback(() => {
    stopSequence();
    const demoNotes = [
      { midi: 60, deltaMs: 0, durationMs: 220 },   // C4
      { midi: 64, deltaMs: 240, durationMs: 220 }, // E4
      { midi: 67, deltaMs: 240, durationMs: 220 }, // G4
      { midi: 72, deltaMs: 240, durationMs: 360 }, // C5
    ];
    const built = demoNotes.map((item, index) => {
      const desc = KEY_BY_MIDI.get(item.midi);
      return Object.freeze({
        id: `demo-${index}-${item.midi}`,
        midi: item.midi,
        noteName: desc.noteName,
        freqHz: desc.freqHz,
        deltaMs: item.deltaMs,
        durationMs: item.durationMs,
      });
    });
    setEventsQueue(built);
  }, [stopSequence]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    sequencerState,
    playbackRate,
    setPlaybackRate,
    eventsQueue,
    activeReplayIndex,
    startRecording,
    stopSequence,
    playSequence,
    recordNoteOn,
    recordNoteOff,
    loadDemoMelody,
  };
}
