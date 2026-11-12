import { useCallback, useEffect, useRef, useState } from 'react';
import { KEY_BY_MIDI } from '../utils/pianoScale.js';
import { PolyphonicSynth } from './PolyphonicSynth.js';

/**
 * Custom Hook quản lý vòng đời `PolyphonicSynth` (8 giọng đa âm + FIFO Voice Stealing).
 * Khởi tạo synth bên ngoài render để tuân thủ React 19 Compiler `react(refs)`.
 */
export function usePolyphonicAudio(maxVoices = 8) {
  const synthRef = useRef(null);

  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new PolyphonicSynth(maxVoices);
    }
    return synthRef.current;
  }, [maxVoices]);

  const [activeMidis, setActiveMidis] = useState(() => new Set());
  const [lastEvictedMidi, setLastEvictedMidi] = useState(null);
  const [stolenVoicesTotal, setStolenVoicesTotal] = useState(0);

  const noteOn = useCallback(
    (midi) => {
      const keyDesc = KEY_BY_MIDI.get(midi);
      if (!keyDesc) return null;

      const synth = getSynth();
      const { evictedMidi } = synth.noteOn(midi, keyDesc.freqHz);

      if (evictedMidi !== null) {
        setLastEvictedMidi(evictedMidi);
        setStolenVoicesTotal(synth.stolenCount);
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
    },
    [getSynth]
  );

  const noteOff = useCallback((midi) => {
    synthRef.current?.noteOff(midi);

    setActiveMidis((prev) => {
      if (!prev.has(midi)) return prev;
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }, []);

  const panicStopAll = useCallback(() => {
    synthRef.current?.panicStop();
    setActiveMidis((prev) => (prev.size === 0 ? prev : new Set()));
  }, []);

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
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
