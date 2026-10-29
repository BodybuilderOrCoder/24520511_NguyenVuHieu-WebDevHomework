# LAB 02 — HOMEWORK TASK DECOMPOSITION & WBS

**Course:** Web Development  
**Scope:** Homework 1, Homework 2, Homework 3 only  
**Location:** `Lab2/Homework/TASK_DECOMPOSITION.md`  
**Status:** HW1 completed (implementation/submission preparation); HW2 and HW3 pending  
**Source:** Lab 02 assignment, Homework sections (pages 30–32)

> **Agent boundary:** Homework 1 is already implemented. Do not modify `homework-1-datagrid/` unless explicitly requested. Implement Homework 2 and Homework 3 independently. Do not modify `Lab2/Exercise/` or `Lab1/`. Preserve the existing framework, files, and Git history. Never claim tests, Lighthouse scores, or requirements passed without evidence.

## 1. Project overview

| WBS | Work package | Required outcome | Status |
|---|---|---|---|
| 1.0 | HW1 — Production Enterprise Data-Grid | Accessible sortable/filterable/paginated data grid | **Completed — verification notes below** |
| 2.0 | HW2 — Concurrent FIFO Audio Visualizer Queue Engine | Web Audio + FIFO queue + cancellation + 60fps visualization | Not started |
| 3.0 | HW3 — High-Concurrency Flash-Sale E-Commerce Engine | Anti-drift timer + inventory state machine + audits | Not started |
| 4.0 | Integration and delivery | Build, test, documentation, commits, submission review | Pending for HW2/HW3 |

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
| 1.14 | Final submission/merge | Correct files committed and visible on target branch | [ ] |

**HW1 progress:** Core implementation and reported Lighthouse results are complete. Items 1.12–1.13 are explicitly flagged because Lighthouse 100/100 does not alone prove full WCAG compliance, and prior implementation notes only confirmed Up/Down row navigation rather than all four directions between cells. HW1 should remain untouched unless a final rubric check is requested.

## 3. WBS — Homework 2: Concurrent FIFO Audio Visualizer Queue Engine

**Original requirements:** Web Audio API `AnalyserNode` (FFT 256/512 bins), FIFO queue for simultaneous track downloads and audio decoding, `AbortController` cancellation, explicit cleanup of `AudioBufferSourceNode`, 60fps Canvas/SVG visualization driven by `requestAnimationFrame` without excessive state updates.

| WBS ID | Task / deliverable | Acceptance criteria | Status |
|---|---|---|---|
| 2.1 | Project setup and file structure | Standalone HW2 app runs locally | [ ] |
| 2.2 | Define queue/task contracts | Types for queued, active, resolved, rejected and cancelled tasks | [ ] |
| 2.3 | Implement `AudioTaskQueue` FIFO scheduler | Tasks process in enqueue order; no duplicate processing | [ ] |
| 2.4 | Integrate `fetch` with `AbortController` | Pending/active fetch can be cancelled predictably | [ ] |
| 2.5 | Decode downloaded audio | `AudioContext.decodeAudioData` returns usable `AudioBuffer` | [ ] |
| 2.6 | Implement queue error handling | Rejected downloads/decodes do not block subsequent tasks | [ ] |
| 2.7 | Implement playback lifecycle | Start, stop, replay and switching tracks behave correctly | [ ] |
| 2.8 | Connect `AnalyserNode` | Frequency data available using FFT size 256 or 512 | [ ] |
| 2.9 | Build Canvas or SVG visualizer | Frequency bars/waveform update through `requestAnimationFrame` | [ ] |
| 2.10 | Avoid UI state thrashing | Animation does not trigger unnecessary application rerenders | [ ] |
| 2.11 | Cleanup audio and animation resources | Stop/disconnect source nodes; cancel RAF; close/suspend context appropriately | [ ] |
| 2.12 | Handle unmount/page exit and cancellation races | No hanging promises, orphaned nodes or uncaught rejections | [ ] |
| 2.13 | Functional and concurrency tests | FIFO, multiple rapid enqueues, cancellation, failed fetch, replay verified | [ ] |
| 2.14 | Performance and memory checks | Smooth rendering target near 60fps; no growing active-node/RAF count | [ ] |
| 2.15 | Documentation and evidence | README with setup, architecture, testing results and limitations | [ ] |

### HW2 recommended deliverables

- Working standalone audio visualizer app.
- `audio-queue-controller.ts` (or equivalent) implementing FIFO and cancellation.
- Documented audio graph and explicit resource cleanup.
- Test evidence for FIFO order, cancellation, error recovery and visualization performance.

**Important:** The sample `AudioTaskQueue` in the assignment is a skeleton, not complete production code; its `AudioTask` type and `processNext()` behavior must be implemented.

## 4. WBS — Homework 3: High-Concurrency Flash-Sale E-Commerce Engine

**Original requirements:** Vietnam 11.11/midnight flash-sale simulation, millisecond countdown based on `Date.now()` delta, optimistic inventory reservation with lock expiry and checkout state machine, `AI_FAILURE_AUDIT.md` documenting at least three AI flaws, and at least eight discrete Conventional Commits.

| WBS ID | Task / deliverable | Acceptance criteria | Status |
|---|---|---|---|
| 3.1 | Project setup and domain model | Standalone flash-sale app with product, stock, reservation and order models | [ ] |
| 3.2 | Define inventory state machine | Explicit states and valid transitions for available/reserved/expired/checked-out | [ ] |
| 3.3 | Implement anti-drift countdown | Remaining time computed from fixed target timestamp minus `Date.now()` | [ ] |
| 3.4 | Implement countdown cleanup | RAF/timers cancelled when no longer needed | [ ] |
| 3.5 | Implement optimistic reservation | User can request reservation with bounded lifetime | [ ] |
| 3.6 | Implement lock expiry and stock release | Expired reservations restore availability exactly once | [ ] |
| 3.7 | Implement checkout transitions | Valid reservation can complete checkout; invalid/expired lock is rejected | [ ] |
| 3.8 | Handle simulated concurrent buyers | No overselling or negative available stock in the chosen simulation model | [ ] |
| 3.9 | Build flash-sale UI | Countdown, available stock, reservation and checkout states visible | [ ] |
| 3.10 | Test edge cases | Simultaneous clicks, expiration race, refresh, failure and duplicate checkout | [ ] |
| 3.11 | Write `AI_FAILURE_AUDIT.md` | At least **3** specific AI-generated flaws, with evidence and fixes | [ ] |
| 3.12 | Maintain atomic Git history | At least **8 discrete Conventional Commits** | [ ] |
| 3.13 | Final verification and documentation | Reproducible test steps, limitations and result summary | [ ] |

### HW3 recommended deliverables

- Working flash-sale simulation with anti-drift countdown.
- Inventory/reservation finite-state machine with expiry and checkout.
- Concurrency/edge-case test evidence.
- `AI_FAILURE_AUDIT.md` containing at least three documented AI flaws.
- Git history showing at least eight Conventional Commits (e.g. `feat:`, `fix:`, `test:`, `docs:`).

**Scope clarification:** A browser-only simulation can demonstrate state transitions, but it does **not** prove server-side atomic inventory correctness across multiple real users. State this limitation in the report unless a backend with atomic reservation handling is implemented.

## 5. Integration, quality gates and delivery WBS

| WBS ID | Task | Acceptance criteria | Status |
|---|---|---|---|
| 4.1 | Keep projects isolated | HW2/HW3 code stays inside its respective folder | [ ] |
| 4.2 | Build and run verification | Each homework has working setup/build instructions | [ ] |
| 4.3 | Record actual test results | No invented scores, benchmark figures or test passes | [ ] |
| 4.4 | Review security and resource handling | Validate URL input, error paths, cleanup and race conditions | [ ] |
| 4.5 | Review documentation | README and audit artifacts reflect implemented behavior | [ ] |
| 4.6 | Review staged changes | No `.env`, IDE settings, `node_modules` or unrelated files committed | [ ] |
| 4.7 | Push and verify branch | All deliverables visible on GitHub target branch | [ ] |

## 6. Suggested repository layout

```text
Lab2/
├── Exercise/
│   ├── exercise-1/
│   ├── exercise-2/
│   ├── exercise-3/
│   └── TASK_DECOMPOSITION.md
└── Homework/
    ├── TASK_DECOMPOSITION.md   # This file
    ├── homework-1-datagrid/   # Completed: do not modify by default
    ├── homework-2-audio/      # Pending
    └── homework-3-flash-sale/ # Pending
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

**Progress summary:** HW1 implementation completed; HW1 strict accessibility/rubric verification and final submission status need confirmation. HW2 and HW3 not started.
