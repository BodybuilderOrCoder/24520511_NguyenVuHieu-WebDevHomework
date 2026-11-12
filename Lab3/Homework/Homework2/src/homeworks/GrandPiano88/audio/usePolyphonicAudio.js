import { useCallback, useEffect, useRef, useState } from 'react';
import { KEY_BY_MIDI } from '../utils/pianoScale.js';
import { PolyphonicSynth } from './PolyphonicSynth.js';

/**
 * Custom Hook quản lý vòng đời `PolyphonicSynth` (8 giọng đa âm + FIFO Voice Stealing).
 * Đảm bảo các hàm `noteOn` và `noteOff` có tham chiếu bất biến (`useCallback` với `[]`)
 * để `React.memo` trên 88 phím `PianoKey` đạt hiệu quả cô lập render tuyệt đối.
 */
export function usePolyphonicAudio(maxVoices = 8) {
  const synthRef = useRef(null);
  if (!synthRef.current) {
    synthRef.current = new PolyphonicSynth(maxVoices);
  }

  const [activeMidis, setActiveMidis] = useState(() => new Set());
  const [lastEvictedMidi, setLastEvictedMidi] = useState(null);
  const [stolenVoicesTotal, setStolenVoicesTotal] = useState(0);

  const noteOn = useCallback((midi) => {
    const keyDesc = KEY_BY_MIDI.get(midi);
    if (!keyDesc || !synthRef.current) return null;

    const { evictedMidi } = synthRef.current.noteOn(midi, keyDesc.freqHz);

    if (evictedMidi !== null) {
      setLastEvictedMidi(evictedMidi);
      setStolenVoicesTotal(synthRef.current.stolenCount);
    }

    setActiveMidis((prev) => {
      if (prev.has(midi) && evictedMidi === null) return prev;
      const next = new Set(prev);
      if (evictedMidi !== null) {
        next.delete(evictedMidi);
      }
      next.add(midi);
      return next;
    });

    return { keyDesc, evictedMidi };
  }, []);

  const noteOff = useCallback((midi) => {
    if (!synthRef.current) return;
    synthRef.current.noteOff(midi);

    setActiveMidis((prev) => {
      if (!prev.has(midi)) return prev;
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }, []);

  const panicStopAll = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.panicStop();
    setActiveMidis((prev) => (prev.size === 0 ? prev : new Set()));
  }, []);

  useEffect(() => {
    const synthInstance = synthRef.current;
    return () => {
      synthInstance?.dispose();
    };
  }, []);

  return {
    activeMidis,
    noteOn,
    noteOff,
    panicStopAll,
    lastEvictedMidi,
    stolenVoicesTotal,
    maxVoices,
  };
}
