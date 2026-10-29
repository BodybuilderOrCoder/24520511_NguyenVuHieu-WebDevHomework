# Homework 2 — FIFO Audio Visualizer

A small TypeScript/Web Audio app with FIFO downloads and decoding, cancellable tasks, independent playback, and a Canvas frequency spectrum.

## Run

Requires Node.js 24+ (tests use built-in TypeScript stripping) and npm.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Do not open `index.html` using `file://`.

```sh
npm test
npm run build
npm run preview
```

Only the existing approved TypeScript and Vite development dependencies are used. No runtime libraries. Automatic JSX transformation is configured; this small app uses semantic HTML and DOM APIs directly, so no React runtime is necessary. HW1, Lab1 and the exercise projects are not imported or modified.

## Use

1. Choose a tone and select **Add to queue** several times. Rows appear immediately in FIFO order.
2. Cancel an individual pending/active task, or cancel all pending downloads.
3. Select **Play / replay** on a resolved row. Selecting another row stops the previous source. **Stop playback** stops sound and animation.
4. Use the missing/invalid audio demos to check errors; **Retry** adds a new task at the end of the queue.
5. **Clear finished tasks** releases retained buffers and removes completed rows. The UI allows at most 20 retained tasks. Clearing a playing task does not interrupt its current source; Stop or natural completion releases it.

Three quiet, eight-second PCM tones are included. Regenerate them with `node scripts/generate-tones.mjs`. These are locally generated assets, not third-party music. Playback needs a user gesture. Hiding the page stops playback; returning does not autoplay.

## Structure and behavior

| File | Responsibility |
|---|---|
| `src/contracts.ts` | Task states, handles, snapshots and view-state types |
| `src/audio-queue-controller.ts` | One FIFO worker; cancellation and error recovery |
| `src/audio-loader.ts` | Fetch with AbortSignal, HTTP check, decode and late-cancellation check |
| `src/audio-player.ts` | Fresh source on every play, switching, stopping and disposal |
| `src/visualizer.ts` | Reused frequency array and one Canvas RAF loop |
| `src/main.ts` | Explicit IDLE/LOADING/SUCCESS/ERROR state, incremental rows, delegated clicks and page cleanup |

Concurrent enqueue calls are accepted immediately, but **downloads and decoding are serialized in enqueue order**, matching the assignment's single-processing-worker skeleton. Playback is separate, so a track can play while later tasks load. This is not a parallel-download pool or an autoplay playlist.

Audio graph: `AudioBufferSourceNode → AnalyserNode → destination`. FFT size is 512, producing 256 frequency bins. Each play creates a new source because Web Audio sources are single-use. Stop, switch and natural completion disconnect it. The player generation counter prevents a pending `resume()` from restarting audio after Stop.

Each task owns an AbortController. Cancelling a queued task removes it; cancelling an active task immediately rejects its result and aborts fetch. Web Audio decoding cannot be aborted: its late result is discarded and the worker waits for it to finish before starting another task. A failed task does not block the next one. Callers must handle `TaskHandle.result` rejections; the UI always does.

Animation reads the analyser into one reused array and draws directly onto Canvas. It never updates application state or queue DOM. Stop cancels RAF. Page exit disposes the queue, closes the context, clears buffers and removes the root listener. A back/forward-cache restoration starts with an empty usable queue. Visibility changes stop playback and suspend the context.

## Verification — 29 October 2026

- `npm test`: **12/12 passed**, covering 20 rapid enqueues, FIFO ordering, one active worker, cancellation during fetch/decode, failed download/decode recovery, observer errors, replay/switch/end, disposal and RAF ownership.
- `npm run build`: strict TypeScript and Vite production build passed.
- `node scripts/browser-check.mjs`: real Chrome decoding, drawing, retry, cancellation/recovery, keyboard Enter/Space and skip link, safe literal XSS error text, initialization failure cleanup, and page lifecycle checks passed. The script requires the dev server at `127.0.0.1:5174` and a separate Chrome with remote debugging on port 9333. It uses Node WebSocket/CDP and installs nothing.
- Browser resource counts: maximum **one connected source and one pending RAF**, including 12 replay/stop cycles; zero after stop, natural end and page exit. **Zero DOM mutations** during the animation sample.
- Local headless frame samples: approximately **165 fps**, 121 timestamps per run. Animation follows the display; this is not a fixed 60fps guarantee on other devices.
- No horizontal overflow at **375px and 1280px**. Light/dark text contrast tested at **5.41:1 or higher** for the measured token combinations. Desktop/mobile screenshots were visually reviewed.
- Production Lighthouse: **100 Accessibility, 100 Best Practices, CLS 0**. Full report: `evidence/lighthouse.json`. The audit used the already cached Chrome DevTools MCP Lighthouse runner against `http://127.0.0.1:5175/`; no dependency was added to this project. Its Performance score only weighted CLS; LCP/TBT/INP were not measured, so the reported Performance 100 is not treated as a complete performance audit.

Evidence: [browser results](evidence/browser-results.json), [mobile screenshot](evidence/mobile.png), [desktop screenshot](evidence/desktop.png), [AI failure audit](AI_FAILURE_AUDIT.md).

To reproduce the browser check, launch a separate local Chrome instance (not your personal profile) with `--headless=new --remote-debugging-port=9333 --user-data-dir=<temporary-profile>`, start `npm run dev -- --port 5174`, then run the script. It adds a test-only 100ms fetch delay to make pending cancellation observable. Screenshots/results are overwritten by each successful run.

## Limits

- The bounded source/RAF checks are not a heap-snapshot proof of zero memory leaks. Manual screen-reader testing and real mobile hardware testing remain unperformed.
- Pagehide/pageshow were dispatched in the browser test; actual browser BFCache eligibility was not established.
- Lighthouse audits the initial page. It does not prove every interactive state. LCP and field INP remain unverified.
- Missing-file requests may return Vite's SPA fallback and therefore produce a decode error instead of HTTP 404. HTTP failure handling is independently covered by the loader test.
- URLs are an explicit local allowlist. Arbitrary remote URLs, CORS configuration, streaming, persistent queues and parallel download limits are outside this assignment implementation.
- Browser-check code is test tooling; the application imports none of it. No publishing or remote push is performed.
