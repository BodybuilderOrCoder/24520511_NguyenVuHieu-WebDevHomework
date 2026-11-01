# TASK DECOMPOSITION — LAB 3 / EXERCISE 3

**Exercise:** KRAFTON PUBG Vietnam Series (PVS) Live Match Telemetry  
**Course:** Web Application Development — Lab 3: Production React 19  
**Primary reference:** Lab 3, **slides 22–23** (In-Class Sprint 3, 120–155 minutes)  
**Related references:** Slide 24 (live defense), slide 25 (AI failure audit), slide 8 (project rules)  
**Scope:** Exercise 3 only; do not implement Exercise 1, Exercise 2, or the homeworks here.  
**Status:** Not started  

---

## 1. Objective & definition of done

Build a fault-tolerant React 19 component named **`PubgMatchTelemetry`** to display *simulated* PUBG Vietnam squad telemetry. It must:

- Support three squads: **Cerberus Esports (CES)**, **The Expendables (TE)**, **Genius Esports (GE)**.
- Model UI explicitly as **`IDLE | LOADING | SUCCESS | ERROR`**, without competing loading/error booleans.
- Load squad telemetry asynchronously and simulate **35% packet loss** (as the slide specifies).
- On squad changes or component unmount, **abort the previous in-flight request** and avoid showing stale squad data.
- Display a **220px pulsing Blue-Zone skeleton** during loading, designed to avoid layout shift.
- Render network failures inside an accessible **`<section role="alert">`** with a working retry button; **no `window.alert()`**.
- Pass the Slow 3G, rapid-switching, keyboard and React cleanup tests below.
- Produce **two scoped Git commits** using the exact exercise-specific messages from slide 23.

**Important:** This is a **simulated telemetry exercise**, *not* a requirement to connect to a real KRAFTON API. The slide names `fetchKraftonPubgTelemetry()` but does **not** provide its implementation or any API endpoint. Build a local mock service unless an instructor-provided service is available.

## 2. Data contract (from slide 22)

```js
export const PUBG_VN_SQUADS = [
  {
    id: 'ces', name: 'Cerberus Esports', map: 'Erangel', phase: 'Phase 6',
    alive: 4, kills: 14, wwcdProb: '68%', status: 'In Safe Zone',
  },
  {
    id: 'te', name: 'The Expendables', map: 'Miramar', phase: 'Phase 7',
    alive: 4, kills: 18, wwcdProb: '82%', status: 'Holding High Ground',
  },
  {
    id: 'ge', name: 'Genius Esports', map: 'Taego', phase: 'Phase 5',
    alive: 3, kills: 9, wwcdProb: '41%', status: 'Rotating Blue Zone',
  },
];
```

**Component contract (slide 23):**

```jsx
<PubgMatchTelemetry squadId="te" />
```

**State contract:**

```js
const [view, setView] = useState({
  status: 'IDLE', // 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'
  data: null,
  error: null,
});
const [retryTick, setRetryTick] = useState(0);
```

**Suggested separation of concerns (implementation plan, not prescribed by slides):**

```text
src/
  components/
    PubgMatchTelemetry.jsx     # state machine, UI, effect lifecycle
    PubgMatchTelemetry.module.css  # 220px skeleton and layout
  data/
    pubgSquads.js              # 3 mock records from slide 22
  services/
    pubgTelemetry.js           # abortable simulated request, 35% failure
```

Keep the existing project structure if it already has a sensible alternative. If a squad selector is outside the telemetry component, the parent owns `squadId` and passes it down; if the selector lives in the same component, maintain the selected ID there. **Do not duplicate the selected squad state in both places.**

## 3. Work breakdown structure (WBS)

> Update each checkbox only after its acceptance criteria and tests pass. Keep unfinished tasks unchecked.

| Task ID | Atomic task | Acceptance criteria | Status |
|---|---|---|---|
| **EX3-01** | Inspect React 19 / Vite project & rules | Identify Exercise 3 folder and entry point; review `.cursorrules` / `project-rules.md` if present; dev server and build run; no unintended changes to EX1/EX2 | [ ] |
| **EX3-02** | Define dataset and types/contracts | Exactly 3 squads using slide 22 fields, stable unique `id`; explicitly distinguish simulated data from real-time API output | [ ] |
| **EX3-03** | Build abortable telemetry mock service | `fetchKraftonPubgTelemetry(squadId, { signal })` resolves squad data after a simulated delay, fails approximately 35% of attempts, rejects aborted calls with `AbortError`; no external API required | [ ] |
| **EX3-04** | Define 4-state machine | A single `view` state uses `IDLE`, `LOADING`, `SUCCESS`, `ERROR`; transitions and shape are documented; no contradictory booleans | [ ] |
| **EX3-05** | Implement request lifecycle | `useEffect` creates its own `AbortController`, calls service with `signal`, handles success/error, and returns `() => controller.abort()`; dependencies include `squadId`, `retryTick` | [ ] |
| **EX3-06** | Wire accessible squad selection | User can choose CES / TE / GE using native buttons or a labeled select; changing selection triggers new request; selected squad is visually and programmatically clear | [ ] |
| **EX3-07** | Prevent stale responses & false errors | Rapid CES → TE → GE changes cancel superseded requests; `AbortError` is ignored; only most recently selected squad can be shown | [ ] |
| **EX3-08** | Render success telemetry | SUCCESS displays correct squad name, map, phase, alive, kills, WWCD probability and status using semantic HTML; no undefined values or duplicated cards | [ ] |
| **EX3-09** | Implement 220px Blue-Zone skeleton | LOADING displays `aria-busy="true"` and 220px pulsing skeleton; container dimensions are consistent to minimize CLS; animation respects reduced motion when appropriate | [ ] |
| **EX3-10** | Implement error UI & retry | ERROR uses `<section role="alert">`, displays a helpful message and `<button type="button">Reconnect Satellite</button>`; retry increments `retryTick`; no `window.alert()` | [ ] |
| **EX3-11** | Test resilience, accessibility and DevTools | Complete test matrix; Slow 3G and rapid-switching audit; no stale UI, unhandled promises, console warnings or leaked requests; check 375px layout | [ ] |
| **EX3-12** | Git audit & live-defense preparation | Two exercise-specific commits reflect milestones; explain effect cleanup, AbortError, 4-state machine, and retry; rehearse slide 24 auto-polling challenge without implementing it by default | [ ] |

### Task dependencies

```text
EX3-01
  └── EX3-02 ──> EX3-03 ──> EX3-04 ──> EX3-05
                                         ├── EX3-06 ──> EX3-07 ──> EX3-08
                                         ├── EX3-09
                                         └── EX3-10
EX3-07 + EX3-08 + EX3-09 + EX3-10 ──> EX3-11 ──> EX3-12
```

## 4. State machine & async contract

| Current state / event | Expected next state | UI expectation |
|---|---|---|
| Initial mount / start request | `LOADING` | Show 220px skeleton |
| Request resolves for active squad | `SUCCESS` | Show that squad's telemetry |
| Simulated packet loss / non-abort error | `ERROR` | Show accessible error + retry |
| Change squad | `LOADING` | Abort prior request; request new squad |
| Click retry while in `ERROR` | `LOADING` | Increment `retryTick`, request again |
| Previous request is aborted | No user-facing `ERROR` | Ignore `AbortError`; stale response never wins |
| Component unmount | No further UI update | Abort in-flight operation and clear mock timer |

**Lifecycle invariant:** for each effect run, create one controller, pass its signal into the async service, and abort on cleanup. The mock service must actually honor the signal (both before starting and while pending); merely creating an `AbortController` without wiring it into the service does not satisfy this requirement.

**Slide reference pattern (adapt as necessary):**

```jsx
useEffect(() => {
  const controller = new AbortController();
  setView({ status: 'LOADING', data: null, error: null });

  fetchKraftonPubgTelemetry(squadId, { signal: controller.signal })
    .then((payload) => {
      if (controller.signal.aborted) return;
      setView({ status: 'SUCCESS', data: payload, error: null });
    })
    .catch((err) => {
      if (controller.signal.aborted || err?.name === 'AbortError') return;
      setView({ status: 'ERROR', data: null, error: err.message });
    });

  return () => controller.abort();
}, [squadId, retryTick]);
```

**Developer choice (not specified in slides):** use an artificial response delay long enough to observe LOADING and cancellation, e.g. 800–1800ms. For reliable acceptance tests, optionally add a dev-only way to force success/failure; normal operation must still use 35% simulated failure. Avoid real KRAFTON credentials/endpoints.

## 5. Two mandatory Git milestones

### Milestone 1 — 4-state telemetry & AbortController

**Tasks:** EX3-01 through EX3-08

- [ ] React 19 component and three-squad dataset exist.
- [ ] Mock telemetry works with ~35% simulated packet loss.
- [ ] `IDLE`, `LOADING`, `SUCCESS`, `ERROR` are correctly modeled.
- [ ] Squad selector changes `squadId` and triggers effect cleanup.
- [ ] In-flight request is aborted when changing squads/unmounting.
- [ ] `AbortError` never generates a visible error banner.
- [ ] SUCCESS displays the active squad's data.
- [ ] Basic runtime verification passes.

```bash
git status
git diff --check
git add <files-for-milestone-1>
git diff --cached
git commit -m "feat(ex3): implement PUBG VN 4-state telemetry & AbortController"
```

### Milestone 2 — Skeleton UI & Retry Alert

**Tasks:** EX3-09 through EX3-12

- [ ] 220px Blue-Zone skeleton renders while LOADING.
- [ ] Skeleton and final content avoid unexpected layout shift.
- [ ] ERROR uses `role="alert"`; retry reliably starts a new attempt.
- [ ] No blocking `window.alert()`.
- [ ] Keyboard, responsive, Slow 3G and rapid-switch tests pass.
- [ ] `npm run lint` and `npm run build` pass if scripts are configured.
- [ ] Git history is readable; only EX3 files are staged.

```bash
git status
git diff --check
git add <files-for-milestone-2>
git diff --cached
git commit -m "feat(ex3): add skeleton UI & retry alert"
```

> `<files-for-milestone-N>` is a placeholder: replace it with explicit file paths. Avoid `git add .` if other exercises have uncommitted changes. The **two EX3 commits** are specified by slide 23; slide 24's **6–8 commits** is a broader Lab 3 history checkpoint, not a requirement to create 6–8 commits for this single exercise.

## 6. Manual test cases (mark after executing)

| Test ID | Scenario | Expected result | Pass |
|---|---|---|---|
| EX3-T01 | Initial render with default `squadId='te'` | Starts in LOADING then renders TE on success (or ERROR on simulated loss) | [ ] |
| EX3-T02 | Select CES | CES loading request starts; successful data matches CES | [ ] |
| EX3-T03 | Select GE | Successful data matches GE, not another squad | [ ] |
| EX3-T04 | Rapid CES → TE → GE during pending requests | Earlier requests canceled, final visible SUCCESS is GE or GE-specific ERROR | [ ] |
| EX3-T05 | Force/observe packet loss | Accessible ERROR message appears without `window.alert()` | [ ] |
| EX3-T06 | Click Reconnect Satellite | `retryTick` advances, fresh LOADING starts, request can recover | [ ] |
| EX3-T07 | Abort request due to selection change | No false ERROR flash; no stale state override | [ ] |
| EX3-T08 | Unmount while request pending | Request canceled; no delayed state updates or unhandled rejection | [ ] |
| EX3-T09 | Switch selection during ERROR | Old error clears, new squad loads | [ ] |
| EX3-T10 | Slow 3G / throttled network | Skeleton remains visible during wait; no meaningful layout shift | [ ] |
| EX3-T11 | Inspect loading component | `aria-busy="true"`; skeleton 220px high; reduced-motion behavior is appropriate | [ ] |
| EX3-T12 | Keyboard-only interaction | All selector controls and retry button usable via Tab, Enter/Space as appropriate | [ ] |
| EX3-T13 | 375px responsive viewport | No horizontal overflow, clipped text or unusable controls | [ ] |
| EX3-T14 | React StrictMode dev replay | Setup/cleanup works; no phantom ERROR or leaked timers | [ ] |
| EX3-T15 | Console, lint, build | No relevant errors/warnings; lint and production build pass | [ ] |
| EX3-T16 | Git history vs WBS | Both named commits present with appropriately scoped changes | [ ] |

**How to verify cancellation:** Use Chrome DevTools Network (when requests are visible) or instrument the local mock to log `started`, `aborted`, `resolved` (dev only). A `setTimeout`-based mock may not appear in the Network tab, so do not expect `(canceled)` network entries unless you actually use `fetch`.

**How to verify packet loss:** A 35% failure chance is probabilistic; do not require exactly 35 failures in 100 attempts. Use repeated sampling or a dev-only deterministic failure switch for test EX3-T05.

**How to verify CLS:** Compare dimensions of LOADING and SUCCESS content using DevTools Performance/Lighthouse. Slide 22 targets **0.00 CLS**; a fixed 220px skeleton alone does not prove CLS = 0 unless the surrounding layout remains stable.

## 7. AI failure patterns to audit

- [ ] **Missing cleanup:** `useEffect` starts async work without aborting it on changes/unmount.
- [ ] **Fake abort:** `AbortController` exists but the mock request ignores `signal`.
- [ ] **False errors:** intentional cancellation is treated as packet loss, flashing an ERROR banner.
- [ ] **Stale response race:** old CES data overwrites GE after rapid selection changes.
- [ ] **Boolean soup:** independent `isLoading`, `hasError`, `hasData` can represent impossible states.
- [ ] **Retry doesn't retry:** button changes only visual state instead of triggering a new request.
- [ ] **Unstable effect dependencies:** repeated requests caused by unstable objects/functions or missing `retryTick`/`squadId`.
- [ ] **Blocking alerts:** `window.alert()` used instead of semantic error UI.
- [ ] **Layout shift:** skeleton shorter/taller than final container, causing visible jumping.
- [ ] **Fictitious real-time feed:** mock probabilities presented as actual esports telemetry.

> Slide 25 separately requires an `AI_FAILURE_AUDIT.md` with **at least 3 documented AI-induced bugs** for the wider Lab 3 submission. Record *real observed issues, proof and fixes*; do not fabricate bugs or screenshots merely to fill the audit.

## 8. Live defense (slide 24) — preparation, not default scope

Possible mutation challenge: **“Add a 5-second auto-polling `setInterval` to `PubgMatchTelemetry` with a Pause Radar toggle and proper cleanup.”**

Be ready to explain:

1. Why `useEffect` depends on `squadId` and `retryTick`.
2. How cleanup prevents race conditions and how the mock honors `AbortSignal`.
3. Why an intentional `AbortError` must not become ERROR state.
4. Why the retry button increments `retryTick` rather than creating unmanaged requests in the click handler.
5. How to add a polling interval without stale closures, duplicate timers, or work continuing after pause/unmount.

**Do not pre-implement polling** unless explicitly requested; it appears as a *live defense mutation*, not the mandatory Exercise 3 feature set.

## 9. Completion checklist

- [ ] EX3-01 through EX3-12 completed and checked.
- [ ] All 16 manual test cases passed, with observable evidence where appropriate.
- [ ] Both mandatory Git commits exist, no unrelated changes staged.
- [ ] Can demonstrate CES → TE → GE cancellation and ERROR → Retry recovery.
- [ ] Can describe why mocked 35% packet loss is not a real KRAFTON feed.
- [ ] Ready for live-defense mutation without using AI at the desk.

---

**Source fidelity note:** Required squads, data, states, 35% simulated packet loss, 220px skeleton, abort/retry behavior, and exact commit messages come from Lab 3 slides 22–23. Testing details, proposed file structure, mock delay, deterministic failure switch and task numbering are planning additions to help implementation and verification, not extra instructor requirements.
