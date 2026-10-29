# Homework 2 – Drum Kit Engine

## 1. Project Overview

This project implements an interactive Drum Kit Engine using HTML5, CSS3, and Vanilla JavaScript ES6+.

The application supports mouse interaction, keyboard input, polyphonic audio playback, and a FIFO-based beat recorder.

## 2. Technology Stack

- HTML5: Semantic structure and drum pad contracts.
- CSS3: Responsive layout, styling, and accessibility.
- JavaScript ES6+: Audio playback, keyboard events, and recording logic.
- Python: Generation of synthetic WAV audio samples.
- Git and GitHub: Version control and atomic commits.

No external JavaScript frameworks were used.

## 3. Implementation

### T01 – HTML Sound Contract

- Created seven interactive drum pads.
- Assigned `data-key` and `data-sound` attributes.
- Used semantic HTML buttons with accessible labels.
- Defined recording controls and a status region.

### T02 – Polyphonic Audio Engine

- Implemented the `playSound()` function.
- Created independent Audio instances for each drum hit.
- Supported overlapping sound playback.
- Handled audio playback errors.

### T03 – Keyboard Event Handling

- Implemented keyboard controls using `keydown`.
- Used `event.key` to identify the pressed key.
- Prevented repeated triggers using `event.repeat`.
- Supported both keyboard and mouse input.

### T04 – FIFO Beat Recorder

- Implemented Start Recording, Stop Recording, and Play Recording.
- Stored drum events in chronological order.
- Used `performance.now()` to capture relative timestamps.
- Replayed recorded beats using asynchronous delays.
- Prevented overlapping recording and playback sessions.

## 4. Audio Assets

Seven synthetic WAV audio samples were generated using Python:

| Key | Drum Sound | Audio File |
|---|---|---|
| A | Kick | kick.wav |
| S | Snare | snare.wav |
| D | Hi-Hat | hihat.wav |
| F | Clap | clap.wav |
| J | Tom 1 | tom1.wav |
| K | Tom 2 | tom2.wav |
| L | Crash | crash.wav |

The audio samples are stored in `hw2-drum-kit/sounds/`.

## 5. Functional Testing

| Test Case | Expected Result | Status |
|---|---|---|
| Mouse interaction | Drum pads produce sound | Passed |
| Keyboard interaction | Assigned keys trigger drum sounds | Passed |
| Polyphonic playback | Multiple drum sounds can overlap | Passed |
| Start Recording | Recording begins | Passed |
| Stop Recording | Recording stops and events are retained | Passed |
| Play Recording | Recorded beats replay in chronological order | Passed |
| Responsive desktop layout | Drum pads display in a grid | Passed |

The functional tests were performed manually in a local browser environment.

## 6. Engineering Practices

- Followed task decomposition before implementation.
- Separated HTML, CSS, and JavaScript.
- Used semantic elements and accessible controls.
- Avoided external JavaScript dependencies.
- Used Git commits to document implementation milestones.

## 7. Limitations

- Drum sounds are synthetic samples rather than professional recordings.
- Beat playback timing depends on browser scheduling.
- Recordings are stored in memory and are not preserved after page refresh.
- Additional testing on mobile devices is recommended.

## 8. Conclusion

The Drum Kit Engine implements the required interactive audio and beat recording features. The project demonstrates event-driven programming, DOM manipulation, asynchronous JavaScript, responsive web design, and version control.

## HW2 – Implementation Summary

- T01: HTML Sound Contract – Completed.
- T02: Polyphonic Audio Engine – Completed.
- T03: Keyboard Event Handling – Completed.
- T04: FIFO Beat Recorder – Completed.
- Responsive CSS – Completed.
- Audio Assets – Seven WAV files generated successfully.
- Functional Testing – Completed.
- GitHub Integration – Completed.

Detailed implementation and testing documentation is available in `HW2_REPORT.md`.