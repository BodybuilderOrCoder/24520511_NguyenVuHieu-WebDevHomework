# TASK DECOMPOSITION & WBS — Homework 2: 88-Key Polyphonic Piano & Concurrent FIFO Sequencer

* **Course / Lab:** Lab 3 — Production React 19, Fiber Hooks & Concurrent UI (UIT - VNUHCM)
* **Architectural Continuity:** Bridges Lab 2 `memo()` (`shallowEqual`) & Lab 2 `AudioTaskQueue` (FIFO Queue) into Production React 19.
* **Quality Targets:** Algorithmic 88-key generation ($A0$ to $C8$, MIDI `21`–`108`), strict `React.memo` single-key render isolation, 8-voice polyphony with FIFO voice stealing, click-free ADSR gain ramping, `AbortController`-cancellable sequence replay, Zero `<div>`-soup, and WCAG 2.2 AA compliance.
* **Overall Status:** Completed `HW2-01` → `HW2-05` (Verified Lighthouse Accessibility = 100/100, Best Practices = 100/100, Single-Key Render Isolation = 1/88 DOM mutations, 8-Voice FIFO Stealing verified).
* **Execution Workflow (Contract-First 4-Stage Loop):**
  1. **Vertical Slice (WBS):** Break features into independent, verifiable increments.
  2. **Contract Definition:** Lock data structures, Web Audio pool invariants, and component signatures prior to AI prompting.
  3. **Atomic Generation:** Generate constrained code under `project-rules.md`.
  4. **DevTools & Profiler Verification:** Verify single-key render isolation in React DevTools Profiler and leak-free audio teardown before each atomic Git commit.

---

## 1. Work Breakdown Structure (WBS) & Git Commit Mapping

| WBS Phase | Task ID | Vertical Slice | Primary Deliverables | Atomic Git Commit Message | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | `HW2-01` | Algorithmic 88-Key Scale Generator ($A0 \rightarrow C8$) | `pianoScale.js` | `feat(hw2): implement algorithmic 88-key MIDI frequency generator` | `[x]` |
| **Phase 2** | `HW2-02` | 8-Voice Polyphonic Synth & FIFO Voice Stealing | `PolyphonicSynth.js`, `usePolyphonicAudio.js` | `feat(hw2): build 8-voice polyphonic Web Audio engine with FIFO stealing` | `[x]` |
| **Phase 3** | `HW2-03` | Memoized 88-Key UI (`React.memo`) & Pointer/Keyboard Input | `GrandPiano88.jsx`, `PianoKey.jsx`, `GrandPiano88.module.css` | `feat(hw2): render memoized 88-key keyboard with render isolation` | `[x]` |
| **Phase 4** | `HW2-04` | Concurrent FIFO Melody Recorder & Abortable Sequencer | `useFifoSequencer.js`, `SequencerControls.jsx` | `feat(hw2): add FIFO melody recorder and abortable variable-speed replay` | `[x]` |
| **Phase 5** | `HW2-05` | Profiler Render Audit, Memory Leak Check & AI Failure Audit | `AI_FAILURE_AUDIT.md`, `evidence/` | `test(hw2): verify React.memo isolation, audio cleanup and A11y` | `[x]` |

---

## 2. Component, Engine & Hook Contracts (Stage 2 Gate)

Define and lock these contracts before generating implementation code:

```javascript
// 1. Algorithmic 88-Key Descriptor Contract (pianoScale.js)
// MIDI 21 (A0) through MIDI 108 (C8) -> 52 white keys + 36 black keys = 88 keys
// Formula: freqHz = 440 * Math.pow(2, (midi - 69) / 12)
export const PianoKeyDescriptor = {
  midi: 60,               // Integer [21..108]
  noteName: 'C4',         // Scientific pitch notation
  freqHz: 261.625565,     // Equal-temperament frequency in Hz
  isBlack: false,         // Derived from pitch class (C#, D#, F#, G#, A#)
  whiteKeyIndex: 23,      // Used for responsive CSS Grid column placement
};

// 2. Polyphonic Voice Pool Invariant Contract (PolyphonicSynth.js)
export interface VoiceNode {
  readonly osc: OscillatorNode;
  readonly gain: GainNode;
}
// Invariant: activeVoices is an ES6 Map<number, VoiceNode> (preserves FIFO insertion order).
// When activeVoices.size >= 8 and a new MIDI note arrives:
// Evict oldestMidi = activeVoices.keys().next().value with a 40ms exponential gain ramp!

// 3. Memoized PianoKey Props Contract (PianoKey.jsx)
// CRITICAL: Callbacks (onNoteOn, onNoteOff) MUST have stable references (useCallback)
// so React.memo prevents all 88 keys from re-rendering when 1 key changes state.
export function PianoKey({
  midi,
  noteName,
  isBlack,
  isPressed,      // Boolean: ONLY true for currently active MIDI notes
  onNoteOn,       // (midi: number) => void (stable reference)
  onNoteOff,      // (midi: number) => void (stable reference)
}) {}

// 4. FIFO Sequencer Event Contract (useFifoSequencer.js)
export interface RecordedNoteEvent {
  readonly id: string;
  readonly midi: number;
  readonly freqHz: number;
  readonly deltaMs: number;    // Relative delay from previous note
  readonly durationMs: number; // Hold duration
}
```

---

## 3. Detailed Sub-Tasks & Definition of Done (DoD)

### Phase 1: Algorithmic 88-Key Generator (`HW2-01`)
* `[x]` **`HW2-01.1` (Ban Hardcoded Markup):** Write a pure deterministic generator function `generate88Keys()` in `src/homeworks/GrandPiano88/utils/pianoScale.js` iterating `midi` from `21` (`A0`) to `108` (`C8`). Hardcoding 88 `<button>` elements is strictly forbidden.
* `[x]` **`HW2-01.2` (Equal Temperament Math):** Compute exact frequencies via $f = 440 \times 2^{(\text{midi} - 69) / 12}$ and derive `isBlack` from `[1, 3, 6, 8, 10].includes(midi % 12)`.
* `[x]` **`HW2-01.3` (O(1) Lookup Index):** Export `PIANO_KEYS_88` (frozen array) and `KEY_BY_MIDI` (`Map<number, PianoKeyDescriptor>`).
* **DoD:** Unit assertion confirms `PIANO_KEYS_88.length === 88`, `whiteKeys.length === 52`, `blackKeys.length === 36`, and `KEY_BY_MIDI.get(69).freqHz === 440`.

### Phase 2: 8-Voice Polyphonic Web Audio Engine (`HW2-02`)
* `[x]` **`HW2-02.1` (FIFO Voice Pool):** Implement `PolyphonicSynth` in `src/homeworks/GrandPiano88/audio/PolyphonicSynth.js` backed by an ES6 `Map` (`maxVoices = 8`).
* `[x]` **`HW2-02.2` (FIFO Voice Stealing):** On `noteOn(midi, freqHz)`, if `this.voices.size >= 8`, extract `this.voices.keys().next().value` (the oldest active voice) and call `this.noteOff(oldestMidi)` before starting the new oscillator.
* `[x]` **`HW2-02.3` (Click-Free ADSR Release):** In `noteOff(midi)`, ramp gain smoothly via `gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)` prior to calling `osc.stop()` and `osc.disconnect()` to prevent speaker popping artifacts.
* `[x]` **`HW2-02.4` (Lifecycle Hook Wrapper):** Expose `usePolyphonicAudio()` hook that initializes `AudioContext` lazily on first user gesture and closes/disconnects all active nodes inside a `useEffect` unmount cleanup.
* **DoD:** Playing a 9-note cluster cleanly steals the 1st note without audio clipping; unmounting in React `<StrictMode>` leaves zero active oscillators.

### Phase 3: Memoized 88-Key Keyboard & Render Isolation (`HW2-03`)
* `[x]` **`HW2-03.1` (Single-Key Render Isolation):** Wrap `PianoKey.jsx` in `React.memo`. Maintain `activeMidis` (`Set<number>`) in `GrandPiano88.jsx` and pass primitive `isPressed={activeMidis.has(key.midi)}`.
* `[x]` **`HW2-03.2` (Stable Event Handlers):** Wrap `handleNoteOn` and `handleNoteOff` in `useCallback` with stable dependencies so `React.memo` shallow comparison succeeds for the 87 untouched keys.
* `[x]` **`HW2-03.3` (Semantic & Accessible Keys):** Render each key as `<button type="button" aria-pressed={isPressed} aria-label={`${noteName}`}>` inside a semantic `<section aria-label="88-Key Concert Grand Piano">` with horizontal scroll container (`overflow-x: auto`) for `375px` mobile viewports.
* **DoD:** React DevTools Profiler ("Highlight updates when components render") proves pressing 1 key highlights **only 1 `PianoKey`**, never all 88.

### Phase 4: Concurrent FIFO Sequencer & Abortable Replay (`HW2-04`)
* `[x]` **`HW2-04.1` (FIFO Recording Queue):** Record `{ id, midi, freqHz, deltaMs, durationMs }` into an immutable array queue using `performance.now()` monotonic timestamps while recording is active.
* `[x]` **`HW2-04.2` (Variable-Speed Async Replay):** Implement `playSequence(events, playbackRate, signal)` supporting `0.5x`, `1.0x`, and `2.0x` speeds using abortable promise delays (`deltaMs / playbackRate`).
* `[x]` **`HW2-04.3` (Deterministic `AbortController` Cancellation):** Bind an `AbortController` inside `useEffect` / playback runner. Clicking **"Stop Sequence"**, starting a new recording, or unmounting the component immediately calls `controller.abort()` and silences all voices (`synth.panicStop()`).
* `[x]` **`HW2-04.4` (Accessible Controls):** Pair speed selector (`<select>`) and transport buttons with `useId()` labels and announce sequencer state (`IDLE | RECORDING | PLAYING`) via `<output role="status" aria-live="polite">`.
* **DoD:** Clicking "Stop" mid-melody halts scheduled notes within 1 frame with zero dangling `setTimeout` callbacks or unhandled promise rejections.

### Phase 5: DevTools Verification & AI Failure Audit (`HW2-05`)
* `[x]` **`HW2-05.1` (Profiler Flamegraph Check):** Record a 5-second chord session in React DevTools Profiler; verify commit duration stays `< 4ms` and untouched keys show `"Did not render"`.
* `[x]` **`HW2-05.2` (Accessibility & Responsive Check):** Verify `375px` viewport usability (scrollable octave viewport with visible focus rings) and 100 Lighthouse Accessibility score (`evidence/lighthouse-testing.png`, `evidence/lighthouse.html`, `evidence/lighthouse.json`).
* `[x]` **`HW2-05.3` (AI Failure Audit Documentation):** Log at least 3 HW2-specific AI hallucinations in `AI_FAILURE_AUDIT.md` (inline arrow functions breaking `React.memo`, accessing `ref.current` during render violating `react(refs)`, and missing `AbortController` during async sequence playback).
* **DoD:** Repository has clean atomic commits for HW2 and is ready for live defense mutations (e.g., changing max polyphony from 8 to 4 voices or adding an octave transpose control in 180 seconds).
