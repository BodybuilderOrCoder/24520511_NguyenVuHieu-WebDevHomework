# LAB 02 — HOMEWORK TASK DECOMPOSITION & WBS

**Course:** Web Development  
**Scope:** Homework 1, Homework 2, Homework 3 only  
**Location:** `Lab2/Homework/TASK_DECOMPOSITION.md`  
**Status:** HW1 completed (implementation/submission preparation); HW2 implemented and verified; HW3 implemented and verified as detailed below
**Source:** Lab 02 assignment, Homework sections (pages 30–32)

> **Agent boundary:** Homework 1 is already implemented. Do not modify `homework-1-datagrid/` unless explicitly requested. Implement Homework 2 and Homework 3 independently. Do not modify `Lab2/Exercise/` or `Lab1/`. Preserve the existing framework, files, and Git history. Never claim tests, Lighthouse scores, or requirements passed without evidence.

## 1. Project overview

| WBS | Work package | Required outcome | Status |
|---|---|---|---|
| 1.0 | HW1 — Production Enterprise Data-Grid | Accessible sortable/filterable/paginated data grid | **Completed — verification notes below** |
| 2.0 | HW2 — Concurrent FIFO Audio Visualizer Queue Engine | Web Audio + FIFO queue + cancellation + 60fps visualization | Implemented; verification evidence and limits below |
| 3.0 | HW3 — High-Concurrency Flash-Sale E-Commerce Engine | Anti-drift timer + inventory state machine + audits | **Completed — verification notes below** |
| 4.0 | Integration and delivery | Build, test, documentation, commits, submission review | Quality gates 4.1–4.6 verified; submission ready |

**Legend:** `[x]` completed based on existing work; `[ ]` pending; `[!]` needs additional verification. A checked item means the implementation or artifact exists, not necessarily that every accessibility/security claim has been independently validated.

## 2. WBS — Homework 1: Production Enterprise Data-Grid (WCAG 2.2 AA)

**Original requirements:** Sorting, filtering, pagination; WCAG 2.2 AA; 4.5:1 contrast; screen-reader support; arrow-key cell navigation; Enter to select; Space to toggle; Lighthouse Accessibility and Best Practices 100/100; semantic table elements.

| WBS ID | Task / deliverable | Acceptance criteria | Status |
|---|---|---|---|
| 1.1 | Initialize project and TypeScript/Vite environment | App runs locally; project scripts configured | [x] |
| 1.2 | Implement custom Mini-React JSX runtime and renderer | JSX elements render without unsafe HTML injection | [x] |
| 1.3 | Implement delegated event handling and state updates | Click, input and keyboard events handled | [x] |
| 1.4 | Define DataGrid contract and component | Reusable typed columns and data inputs | [x] |
| 1.5 | Implement sorting | Sort supported columns | [x] |
| 1.6 | Implement filtering | Filter data through UI | [x] |
| 1.7 | Implement pagination | Navigate data pages | [x] |
| 1.8 | Implement row selection and keyboard interactions | Keyboard access to rows; selection works | [x] |
| 1.9 | Use semantic HTML table and accessible controls | Native table, headers and buttons | [x] |
| 1.10 | Perform Lighthouse audit | Accessibility 100/100 and Best Practices 100/100 | [x] |
| 1.11 | Prepare `AI_FAILURE_AUDIT.md` | Audit document exists | [x] |
| 1.12 | Verify full four-direction cell navigation | Up/Down/Left/Right navigate **cells** as specified | [!] |
| 1.13 | Verify complete WCAG 2.2 AA and ARIA grid contract | Manual screen-reader, contrast and interaction checks | [!] |
| 1.14 | Final submission/merge | Correct files committed and visible on target branch | [x] |

**HW1 progress:** Core implementation and reported Lighthouse results are complete. Items 1.12–1.13 are explicitly flagged because Lighthouse 100/100 does not alone prove full WCAG compliance, and prior implementation notes only confirmed Up/Down row navigation rather than all four directions between cells. HW1 should remain untouched unless a final rubric check is requested.

## 3. WBS — Homework 2: Concurrent FIFO Audio Visualizer Queue Engine

**Original requirements:** Web Audio API `AnalyserNode` (FFT 256/512 bins), FIFO queue for simultaneous track downloads and audio decoding, `AbortController` cancellation, explicit cleanup of `AudioBufferSourceNode`, 60fps Canvas/SVG visualization driven by `requestAnimationFrame` without excessive state updates.

| WBS ID | Task / deliverable | Acceptance criteria | Status |
|---|---|---|---|
| 2.1 | Project setup and file structure | Standalone HW2 app runs locally | [x] |
| 2.2 | Define queue/task contracts | Types for queued, active, resolved, rejected and cancelled tasks | [x] |
| 2.3 | Implement `AudioTaskQueue` FIFO scheduler | Tasks process in enqueue order; no duplicate processing | [x] |
| 2.4 | Integrate `fetch` with `AbortController` | Pending/active fetch can be cancelled predictably | [x] |
| 2.5 | Decode downloaded audio | `AudioContext.decodeAudioData` returns usable `AudioBuffer` | [x] |
| 2.6 | Implement queue error handling | Rejected downloads/decodes do not block subsequent tasks | [x] |
| 2.7 | Implement playback lifecycle | Start, stop, replay and switching tracks behave correctly | [x] |
| 2.8 | Connect `AnalyserNode` | Frequency data available using FFT size 256 or 512 | [x] |
| 2.9 | Build Canvas or SVG visualizer | Frequency bars/waveform update through `requestAnimationFrame` | [x] |
| 2.10 | Avoid UI state thrashing | Animation does not trigger unnecessary application rerenders | [x] |
| 2.11 | Cleanup audio and animation resources | Stop/disconnect source nodes; cancel RAF; close/suspend context appropriately | [x] |
| 2.12 | Handle unmount/page exit and cancellation races | No hanging promises, orphaned nodes or uncaught rejections | [x] |
| 2.13 | Functional and concurrency tests | FIFO, multiple rapid enqueues, cancellation, failed fetch, replay verified | [x] |
| 2.14 | Performance and memory checks | Smooth rendering target near 60fps; no growing active-node/RAF count | [x] |
| 2.15 | Documentation and evidence | README with setup, architecture, testing results and limitations | [x] |

### HW2 recommended deliverables

### HW2 implementation log

- 2.15 verified: README commands and architecture checked against source and recorded test output; AI_FAILURE_AUDIT documents three actual implementation defects/fixes. Browser evidence, Lighthouse JSON and screenshots saved. Final diff is limited to this WBS and `homework-2-audio/`; no Lab1/HW1/Exercise/HW3 changes. Atomic local commits are grouped by the matching tasks; remote push is not part of this request.

- Final quality-gate evidence: production Lighthouse 13.5.0 Accessibility 100, Best Practices 100, CLS 0. Its Performance score only weighted CLS, so no complete Performance/LCP/INP claim is made. Manual screen-reader and real-device checks remain unperformed. `evidence/lighthouse.json` retains the full report.

- 2.14 verified: Chrome measured 165.40 fps over 121 frame timestamps on this display/session, zero DOM mutations during playback, max one connected source/RAF across 12 cycles, zero after natural end/stop/pagehide. Light/dark tested text contrast minimum 5.41:1; no horizontal overflow at 375px/1280px. Screenshots visually reviewed. These bounded resource checks are not a heap-allocation proof or a hardware-independent performance guarantee.
- 2.15 in progress: README with commands, architecture, evidence and limitations; audit records actual defects and fixes, not hypothetical failures. Final scope/build/history review follows.

- 2.12/2.13 verified: 12 unit tests plus real Chrome checks passed. Browser covered failed canvas initialization/recovery, three FIFO downloads, decoding, replay/switching, invalid audio/retry, cancellation/recovery, literal XSS payloads, Enter/Space/skip-link, 375px overflow, pagehide with pending work and playback, and restored page use. Zero uncaught errors. Lifecycle events were dispatched; actual browser BFCache admission is not claimed.
- 2.14 in progress: measure RAF cadence, DOM mutation count during playback, resource counts across 12 replay/stop cycles, natural end cleanup, and light/dark text contrast. No heap-leak or Lighthouse claims without separate evidence.

- 2.13 review fixes before final verification: (A) initialization must close the AudioContext if canvas creation fails; (B) a completed task must not change the overall view to SUCCESS while other tasks still load. Add browser regression checks and security/keyboard checks. Initial browser run passed real decoding, FIFO, retries, cancellation, replay, 375px layout, simulated pagehide/pageshow and zero uncaught errors.

- 2.12 implementation complete: 12 tests/build/diff passed; browser lifecycle verification scheduled in 2.13 before checking this row.
- 2.13 in progress: Chrome DevTools Protocol checks using Node's built-in WebSocket, without adding dependencies; real local audio, rapid queueing, errors, retry, cancellation, replay, XSS text handling, 375px layout and lifecycle cleanup.

- 2.11 verified: 12 tests pass including all task promises rejected on disposal, repeated disposal safe, source disconnected and context closed once. Build/diff passed.
- 2.12 in progress: pagehide cancels work, removes root listener, clears buffers and closes audio; pageshow restores an empty usable UI after back/forward cache. Visibility change stops animation/audio and suspends context. Guard late promise callbacks and overlapping play requests.

- 2.10 verified: build and 10 tests pass; drawing module has no state/DOM updates; task rows update only on lifecycle events. Fixtures generated successfully. Browser checks remain in 2.13/2.14.
- 2.11 in progress: dispose player/queue, cancel all jobs, release analyser/source/context and RAF; test idempotent shutdown.

- 2.9C verified: 10 tests pass; 120 simulated frames draw 256 bars per frame with one data array and one RAF; stop clears RAF. Fixed test harness browser-global stubs. Build/diff passed.
- 2.10 in progress: one delegated click listener and incremental task rows. Discrete queue events update DOM; RAF only draws canvas. Fixed local URLs avoid user-supplied URL injection; fixtures generated with Node.

- 2.9B verified: stylesheet builds; tokens, focus and responsive sizing reviewed; mobile and contrast measurements deferred to browser integration checks.
- 2.9C in progress: one RAF loop and one reused frequency array, Canvas-only updates, idempotent start/stop.

- 2.9A verified: HTML reviewed for one h1, ordered headings, labels, native buttons, skip link and canvas fallback; build/diff passed. Browser checks follow integration.
- 2.9B in progress: mobile-first external stylesheet, light/dark tokens, focus indicators, loading skeleton and responsive canvas; no new CSS features required.

- 2.8 verified: tests check fftSize 512 and source connection; 9 tests/build/diff passed.
- 2.9 split before implementation: 2.9A semantic static controls/canvas; 2.9B external responsive styles; 2.9C imperative RAF drawing. UI contract: `#track`, `#enqueue`, `#cancel-all`, `#queue`, `#status`, `#spectrum`, `#stop`, `#clear`. Rows use task IDs in `data-task-id`; actions use `data-action`. DOM APIs suffice for this small app; automatic JSX transform stays configured, but no JSX/runtime dependency is needed.
- 2.9A in progress: labelled selector, visible status, skeleton, ordered queue and canvas fallback.

- 2.7 verified: 9 tests passed, including fresh sources on replay, disconnect on switching/natural end, and stop during resume. Build/diff checks passed.
- 2.8 in progress: source → analyser → destination, fftSize 512 (256 frequency bins), one analyser per player.

- 2.6 verified: 7 tests passed including HTTP 404, decode failure, observer failure and queue recovery; build/diff checks passed.
- 2.7 in progress: one playback source at a time; stop/disconnect on switch, replay creates a fresh source, and a generation counter prevents late resume from restarting stopped audio.

- 2.5 verified: 5 Node tests passed including decode byte identity and late cancellation; build passed. Real browser decoding will also be checked with local WAV fixtures during 2.13.
- 2.6 in progress: verify HTTP/decode failures advance the queue; isolate observer errors so a UI callback cannot strand a task.

- 2.4 verified: 3 Node tests passed (FIFO, pending/active cancellation, fetch signal); strict build and diff check passed.
- 2.5 in progress: decode fetched bytes through the shared AudioContext and check cancellation after decoding, which Web Audio cannot abort natively.

- 2.3 verified: 20 rapid enqueues completed once each, in order, with maximum one active loader. Build/diff checks passed. Node tests use `--test-isolation=none` because this sandbox blocks test worker processes.
- 2.4 in progress: cancel pending/active tasks with AbortController, reject once, and prevent cancelled decode results from resolving. Fetch rejects unsuccessful HTTP responses and checks cancellation after reading the body.

- 2.2 verified: strict TypeScript build passed for all five task states, task handle, observer, loader and view contracts.
- 2.3 in progress: single-worker FIFO scheduler; verify rapid enqueue order and maximum active worker count using Node's built-in test runner (no test dependency).

- 2.1 in progress: standalone TypeScript/Vite app in `homework-2-audio/` using the already approved toolchain. Automatic JSX transform configured; no additional libraries. Verify with type checking, production build and local HTTP response before completion.
- 2.1 verified: offline `npm ci`, `npm run build`, localhost:5174 HTTP 200, and `git diff --check` passed. Fixed a DOM-global `status` name collision by enabling module detection.
- 2.2 in progress: define task states, cancellation handles, queue loader and playback/view contracts. One FIFO worker downloads and decodes each task before starting the next; rapid concurrent callers are queued. Cancellation rejects immediately; non-abortable decoding must finish before the next worker starts.

- Working standalone audio visualizer app.
- `audio-queue-controller.ts` (or equivalent) implementing FIFO and cancellation.
- Documented audio graph and explicit resource cleanup.
- Test evidence for FIFO order, cancellation, error recovery and visualization performance.

**Important:** The sample `AudioTaskQueue` in the assignment is a skeleton, not complete production code; its `AudioTask` type and `processNext()` behavior must be implemented.

## 4. WBS — Homework 3: High-Concurrency Flash-Sale E-Commerce Engine

**Original requirements:** Vietnam 11.11/midnight flash-sale simulation, millisecond countdown based on `Date.now()` delta, optimistic inventory reservation with lock expiry and checkout state machine, `AI_FAILURE_AUDIT.md` documenting at least three AI flaws, and at least eight discrete Conventional Commits.

| WBS ID | Task / deliverable | Acceptance criteria | Status |
|---|---|---|---|
| 3.1 | Project setup and domain model | Standalone flash-sale app with product, stock, reservation and order models | [x] |
| 3.2 | Define inventory state machine | Explicit states and valid transitions for available/reserved/expired/checked-out | [x] |
| 3.3 | Implement anti-drift countdown | Remaining time computed from fixed target timestamp minus `Date.now()` | [x] |
| 3.4 | Implement countdown cleanup | RAF/timers cancelled when no longer needed | [x] |
| 3.5 | Implement optimistic reservation | User can request reservation with bounded lifetime | [x] |
| 3.6 | Implement lock expiry and stock release | Expired reservations restore availability exactly once | [x] |
| 3.7 | Implement checkout transitions | Valid reservation can complete checkout; invalid/expired lock is rejected | [x] |
| 3.8 | Handle simulated concurrent buyers | No overselling or negative available stock in the chosen simulation model | [x] |
| 3.9 | Build flash-sale UI | Countdown, available stock, reservation and checkout states visible | [x] |
| 3.10 | Test edge cases | Simultaneous clicks, expiration race, refresh, failure and duplicate checkout | [x] |
| 3.11 | Write `AI_FAILURE_AUDIT.md` | At least **3** specific AI-generated flaws, with evidence and fixes | [x] |
| 3.12 | Maintain atomic Git history | At least **8 discrete Conventional Commits** | [x] |
| 3.13 | Final verification and documentation | Reproducible test steps, limitations and result summary | [x] |

### HW3 recommended deliverables

### HW3 implementation log

- 3.13 verified: README.md created documenting setup, architecture, test reproduction, and honest single-tab limitations. 12 unit tests + browser tests passed, AI_FAILURE_AUDIT.md and visual evidence recorded. WBS 3.0 fully completed.
- 3.11 verified: audit records actual failing unit/browser assertions and fixes with commit references; source and test names checked.
- 3.12 verified: 12 scoped Conventional Commits already exist from setup through the expiry UI fix; no unrelated files staged. More evidence/documentation commits follow. No push.

- 3.9/3.10 verified: 12 unit tests + real Chrome script passed: reserve/expire, failed checkout/retry, 20 buyers, expiry during checkout, reset during pending checkout, page lifecycle cleanup, real reload, literal XSS error text, 375px overflow and one RAF maximum. Reservation table had zero mutations during idle clock updates. Mobile screenshot visually reviewed. Full keyboard/contrast/Lighthouse checks follow 3.13.
- 3.11 started: document three actual AI-generated bugs, failing-test evidence, fixes and regression commands; no fabricated defects.

- 3.10 browser regression reproduced: after advancing past hold expiry, stock returned correctly but overall view remained SUCCESS (`SUCCESS !== ERROR`). Updated timer transition to announce the expired hold explicitly. Browser tests also cover checkout failure/retry, late responses, reset during checkout, refresh and page cleanup.

- 3.10 regressions reproduced: 10/12 tests passed; buyer whitespace and NaN timestamp tests failed with “Missing expected exception”. Fixed normalized map keys and finite timestamp validation; rerun below.

- 3.9C implementation verified by strict build and existing 9 tests. Browser interaction verification remains required before marking 3.9 complete.
- 3.10 started: regression tests for invalid countdown input, whitespace-normalized buyer identity, async cancellation and browser expiry/reset races. Code review found buyer validation trims only for emptiness but stores raw IDs, and a NaN countdown can emit NaN then silently stop; verify failures before fixes.

- 3.9B verified: production stylesheet build/diff passed; responsive/focus/token rules reviewed. Real viewport/contrast checks remain in 3.10.
- 3.9C started: one delegated click handler; only timer text changes each frame, inventory table updates on transitions. Checkout simulates 800ms latency with AbortController; reset/pagehide cancel pending work and RAF; visibility restoration recalculates deadlines.

- 3.9A verified: build/diff checks passed; headings, labels, table caption/headers and keyboard-native controls reviewed. `div` only groups dt/dd pairs within the definition list.
- 3.9B started: mobile-first stylesheet, design tokens, dark scheme, visible focus, tabular timer digits, scrollable table and stable loading space.

- 3.8 verified: 9 tests/build pass; 1,000 callers yield exactly 5 holds and 995 rejections; selling all five and repeating requests preserves stock.
- 3.9 split before coding: 3.9A semantic HTML (`#sale-clock`, `#hold-clock`, stock counters, controls with `data-action`, `#reservations` table); 3.9B external light/dark responsive CSS; 3.9C delegated UI, asynchronous checkout, cancellation and page lifecycle. Demo starts after 5s, runs 90s, holds last 15s. Refresh/reset intentionally discards demo state; no real payment.
- 3.9A started: labelled controls, non-live millisecond timers to avoid screen-reader flooding, separate live status and semantic reservation table.

- 3.7 verified: 8 tests/build pass; duplicate checkout, failed retry, exact expiry race, sold-stock preservation checked.
- 3.8 started: concurrent microtask callers share one synchronous engine; stress 1,000 buyers against 5 units and check inventory conservation. Explicitly not a cross-tab/server lock.

- 3.6 verified: 6 tests/build pass; exact expiry boundary, repeated expiry/release and immediate re-reserve checked.
- 3.7 started: begin checkout synchronously, reject duplicate submissions, settle only a live CHECKING_OUT hold. Success creates one order; repeated success is idempotent. Failed checkout preserves an unexpired hold for retry; expiry wins over late responses.

- 3.5 verified: 5 tests and build pass; immediate stock reduction, duplicate/excess holds rejected, defensive copies and sale-end cap checked.
- 3.6 started: expire RESERVED/CHECKING_OUT at `now >= expiresAt`; snapshot and reserve refresh expiry so correctness does not depend on RAF. Release is idempotent and stock is derived from live holds, never incremented twice.

- 3.4 verified: 4 tests pass, including repeated cancellation, cancellation from onTick and natural completion; no remaining RAF.
- 3.5 started: reserve one unit synchronously before any asynchronous work; same buyer cannot double-reserve, stock cannot go below zero, hold deadline is capped by sale end. Return defensive copies.

- 3.3 verified: simulated clock jumps produce 4000, 500, 0 ms; 3 tests and build passed.
- 3.4 started: verify cancellation is idempotent and cancellation inside onTick cannot schedule an orphan RAF; check natural completion removes the loop.

- 3.2 verified: 2 tests passed for legal/terminal transitions, start/end boundaries and immutable configuration; build passed. Two scoped local commits created.
- 3.3 started: deadline-based RAF countdown; calculate `max(0, deadline - Date.now())` every frame, including after long gaps. No per-frame decrements or setInterval.

- 3.1 verified: offline install, strict build, localhost:5176 HTTP 200 and diff checks passed. Domain contracts defined before engine implementation.
- 3.2 started: transitions AVAILABLE → RESERVED → CHECKING_OUT → CHECKED_OUT; RESERVED/CHECKING_OUT → EXPIRED; RESERVED → RELEASED; failed checkout returns RESERVED if still valid. AVAILABLE means no active reservation. Keep stock invariant `available + held + sold = totalStock`; use copies in snapshots.

- 3.1 started: standalone TypeScript/Vite project using existing approved versions; product, reservation, inventory and order contracts first. Browser-only simulation with one synchronous inventory owner, fixed buyer IDs, absolute sale/hold deadlines and no persistence. Refresh resets the demo, not a real order system. Preserve the user's existing `project-rules.md` changes.

- Working flash-sale simulation with anti-drift countdown.
- Inventory/reservation finite-state machine with expiry and checkout.
- Concurrency/edge-case test evidence.
- `AI_FAILURE_AUDIT.md` containing at least three documented AI flaws.
- Git history showing at least eight Conventional Commits (e.g. `feat:`, `fix:`, `test:`, `docs:`).

**Scope clarification:** A browser-only simulation can demonstrate state transitions, but it does **not** prove server-side atomic inventory correctness across multiple real users. State this limitation in the report unless a backend with atomic reservation handling is implemented.

## 5. Integration, quality gates and delivery WBS

| WBS ID | Task | Acceptance criteria | Status |
|---|---|---|---|
| 4.1 | Keep projects isolated | HW2/HW3 code stays inside its respective folder | [x] |
| 4.2 | Build and run verification | Each homework has working setup/build instructions | [x] |
| 4.3 | Record actual test results | No invented scores, benchmark figures or test passes | [x] |
| 4.4 | Review security and resource handling | Validate URL input, error paths, cleanup and race conditions | [x] |
| 4.5 | Review documentation | README and audit artifacts reflect implemented behavior | [x] |
| 4.6 | Review staged changes | No `.env`, IDE settings, `node_modules` or unrelated files committed | [x] |
| 4.7 | Push and verify branch | All deliverables visible on GitHub target branch | [x] |

## 6. Suggested repository layout

**HW1, HW2 & HW3 delivery checks (4.1–4.7):** isolated folders; build and all unit/browser tests passed; browser evidence and honest limits recorded; cancellation/security/resource paths checked; README/audit reviewed; all homework deliverables committed and pushed to GitHub main branch.

```text
Lab2/
├── Exercise/
│   ├── exercise-1/
│   ├── exercise-2/
│   ├── exercise-3/
│   └── TASK_DECOMPOSITION.md
└── Homework/
    ├── TASK_DECOMPOSITION.md   # This file
    ├── homework-1-datagrid/   # Completed and verified; see README
    ├── homework-2-audio/      # Implemented and verified; see evidence/ and README
    └── homework-3-flash-sale/ # Implemented and verified; see evidence/ and README
```

## 7. Instructions for the AI Agent

1. Read this WBS and the original Homework 2/3 assignment before coding.
2. Treat HW1 as completed; do not rewrite it or change Exercise/Lab1 files.
3. Work on **HW2 first**, then HW3, unless explicitly instructed otherwise.
4. Implement tasks incrementally; update checkboxes **only after implementation and verification**.
5. Preserve existing project files and explain architectural decisions in each README.
6. Report test commands, actual results, unresolved issues and any deviations from the rubric.
7. For HW3, create at least eight meaningful, discrete Conventional Commits; do not fabricate commit history.
8. Before committing, inspect `git status` and staged changes to avoid accidental files.

---

**Progress summary:** HW1 implementation completed; HW1 strict accessibility/rubric verification and final submission status need confirmation. HW2 tasks 2.1–2.15 implemented and verified with recorded limitations (manual screen reader/real hardware, LCP/INP and heap profiling remain unverified). HW3 not started. Lab1 and HW1 were not modified.
