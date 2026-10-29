# AI failure audit — Homework 2

These defects were found in the implementation produced during this task. The fixes and checks below describe actual work, not hypothetical incidents.

## 1. Script-scope name collided with a DOM global

- **Generated code:** the initial `main.ts` declared `const status` without imports/exports, while the initial TypeScript configuration did not force module detection.
- **Diagnosis:** `npm run build` reported TS2451 (cannot redeclare `status`) and TS2339 (`textContent` on string). The DOM library already declares `window.status`.
- **Fix:** set `moduleDetection: "force"` in `tsconfig.json`. All app files are treated as modules; the integrated entry point also has imports.
- **Verification:** subsequent strict TypeScript/Vite builds passed.

## 2. Partial audio initialization could leak a context

- **Generated code:** `ensureAudio()` assigned a new player before creating the Canvas visualizer. If `getContext('2d')` returned null, construction threw after the context/analyser were created. A later attempt saw the non-null player and incorrectly skipped initialization.
- **Diagnosis:** source/diff review of the initialization error path found ownership had been assigned before initialization finished.
- **Fix:** wrap initialization in try/catch, dispose the partial player (or close the context), reset references, then surface the error to the user.
- **Verification:** `scripts/browser-check.mjs` temporarily makes Canvas context creation fail, checks the AudioContext is closed, restores Canvas, then successfully downloads and plays tracks.

## 3. One completed task hid the overall loading state

- **Generated code:** every resolved task unconditionally called `setView({ status: 'SUCCESS', ... })`, even after the queue had started processing another task. The global view could say SUCCESS while another row remained active.
- **Diagnosis:** source/diff review traced the completion promise callback after `processNext()` advanced the worker.
- **Fix:** derive whether any tasks remain queued/active inside `setView`; completion messages retain LOADING while pending work exists. Errors still surface explicitly, and the skeleton reflects actual pending work.
- **Verification:** strict build and the browser FIFO/loading regression check pass; the final task produces SUCCESS.

## Additional verification notes

- A test initially tried to mock browser RAF methods that do not exist in Node. The runner reported `ERR_INVALID_ARG_VALUE`; the harness now installs/removes explicit test stubs. This was a test-harness defect, not an app failure.
- Node worker-process spawning was denied in this sandbox; tests use the built-in `--test-isolation=none` option. No external test package was installed.
- Browser error-message tests pass `<script>alert(1)</script>` and `<img onerror=alert(1)>` through the real UI error path. The message remains text with zero child elements, and no uncaught exception occurs.
