
"use strict";

/* ==========================================
   HW2 - DRUM KIT ENGINE
   T02: Polyphonic Audio Engine
   T03: Keyboard Controls
   T04: FIFO Beat Recorder
========================================== */

// ==========================================
// 1. DOM ELEMENTS
// ==========================================

const drumPads = document.querySelectorAll(".drum-pad");

const recordButton = document.querySelector("#record-btn");
const stopButton = document.querySelector("#stop-btn");
const playbackButton = document.querySelector("#play-btn");
const recordStatus = document.querySelector("#record-status");

// Map keyboard keys to drum pads.
const drumPadMap = new Map();

drumPads.forEach((pad) => {
    drumPadMap.set(pad.dataset.key, pad);
});

// ==========================================
// 2. RECORDER STATE
// ==========================================

let isRecording = false;
let isPlaying = false;

let recordingStartTime = 0;
let recordedBeats = [];

// ==========================================
// 3. POLYPHONIC AUDIO ENGINE
// ==========================================

function playSound(soundPath) {
    // Create a new audio instance for every hit.
    // This allows multiple sounds to overlap.
    const audio = new Audio(soundPath);

    audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
    });
}

// ==========================================
// 4. DRUM TRIGGER
// ==========================================

function triggerDrum(pad) {
    if (!pad) {
        return;
    }

    // Play the selected drum sound.
    playSound(pad.dataset.sound);

    // Record the hit when recording is active.
    if (isRecording) {
        recordedBeats.push({
            key: pad.dataset.key,
            time: performance.now() - recordingStartTime
        });
    }
}

// ==========================================
// 5. MOUSE CONTROLS
// ==========================================

drumPads.forEach((pad) => {
    pad.addEventListener("click", () => {
        triggerDrum(pad);
    });
});

// ==========================================
// 6. KEYBOARD CONTROLS
// ==========================================

document.addEventListener("keydown", (event) => {
    // Prevent repeated hits when holding a key.
    if (event.repeat) {
        return;
    }

    // Ignore typing in editable elements.
    if (
        event.target instanceof HTMLElement &&
        event.target.closest(
            "input, textarea, select, [contenteditable]"
        )
    ) {
        return;
    }

    const key = event.key.toLowerCase();
    const pad = drumPadMap.get(key);

    if (!pad) {
        return;
    }

    // Avoid triggering the same button twice
    // when it is focused and activated by keyboard.
    if (event.target === pad) {
        event.preventDefault();
    }

    triggerDrum(pad);
});

// ==========================================
// 7. START RECORDING
// ==========================================

recordButton.addEventListener("click", () => {
    if (isRecording || isPlaying) {
        return;
    }

    // Clear the previous recording.
    recordedBeats = [];

    isRecording = true;
    recordingStartTime = performance.now();

    recordButton.disabled = true;
    stopButton.disabled = false;
    playbackButton.disabled = true;

    recordStatus.textContent = "Recording...";
});

// ==========================================
// 8. STOP RECORDING
// ==========================================

stopButton.addEventListener("click", () => {
    if (!isRecording) {
        return;
    }

    isRecording = false;

    recordButton.disabled = false;
    stopButton.disabled = true;

    playbackButton.disabled = recordedBeats.length === 0;

    recordStatus.textContent =
        `Recorded ${recordedBeats.length} beats.`;
});

// ==========================================
// 9. TIMING UTILITY
// ==========================================

function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

// ==========================================
// 10. FIFO BEAT PLAYBACK
// ==========================================

playbackButton.addEventListener("click", async () => {
    if (
        isPlaying ||
        isRecording ||
        recordedBeats.length === 0
    ) {
        return;
    }

    isPlaying = true;

    recordButton.disabled = true;
    stopButton.disabled = true;
    playbackButton.disabled = true;

    recordStatus.textContent = "Playing recording...";

    try {
        // FIFO: process beats in recorded order.
        let previousTime = 0;

        for (const beat of recordedBeats) {
            // Preserve the interval between hits.
            const delay = Math.max(
                0,
                beat.time - previousTime
            );

            await wait(delay);

            const pad = drumPadMap.get(beat.key);

            if (pad) {
                // Playback should not create new records.
                playSound(pad.dataset.sound);
            }

            previousTime = beat.time;
        }
    } catch (error) {
        console.error("Playback failed:", error);
        recordStatus.textContent = "Playback failed.";
    } finally {
        isPlaying = false;

        recordButton.disabled = false;
        stopButton.disabled = true;
        playbackButton.disabled =
            recordedBeats.length === 0;

        if (recordStatus.textContent === "Playing recording...") {
            recordStatus.textContent = "Playback completed.";
        }
    }
});
