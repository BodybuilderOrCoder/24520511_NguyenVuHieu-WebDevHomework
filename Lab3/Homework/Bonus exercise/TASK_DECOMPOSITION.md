# TASK DECOMPOSITION & WBS — Bonus Exercise: 'Hẹn Hò Nhưng Không Yêu' State Machine

* **Course / Lab:** Lab 3 — Production React 19, Fiber Hooks & Concurrent UI (UIT - VNUHCM)
* **Domain Concept:** Inspired by Wendy Thảo's hit song *"Hẹn Hò Nhưng Không Yêu"* — eliminating impossible boolean states ("Situationship Boolean Soup") using a deterministic Finite State Machine (FSM), asymmetric effort calculation, and leak-free Ghosting cleanup.
* **Quality Targets:** Strict 4-state FSM (`FRIENDS | DATING_NO_LOVE | OFFICIAL_LOVE | GHOSTED_EXIT`), pure derived Red-Flag & Asymmetric Effort scoring (`Em cố trăm lần < Ai đó một phần`), `AbortController` + `setTimeout` ghosting timer cleanup, React 19 `useId()` form bindings, Zero `<div>`-soup, and `375px–1440px` responsive stability.
* **Execution Workflow (Contract-First 4-Stage Loop):**
  1. **Vertical Slice (WBS):** Break the Situationship Analyzer into independent, verifiable increments.
  2. **Contract Definition:** Lock FSM transitions, asymmetric effort weights, and component signatures prior to AI prompting.
  3. **Atomic Generation:** Generate constrained code under `project-rules.md`.
  4. **DevTools & Lifecycle Verification:** Verify zero memory leaks on unmount/phase transition and single-pass derived rendering before each atomic Git commit.

---

## 1. Work Breakdown Structure (WBS) & Git Commit Mapping

| WBS Phase | Task ID | Vertical Slice | Primary Deliverables | Atomic Git Commit Message |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | `BONUS-01` | Deterministic Relationship FSM & Asymmetric Effort Engine | `relationshipFsm.js`, `effortReducer.js` | `feat(bonus): model HenHoKhongYeu finite state machine and effort weights` |
| **Phase 2** | `BONUS-02` | Pure Derived Red-Flag Meter & Effort Comparison UI | `SituationshipAnalyzer.jsx`, `SituationshipAnalyzer.module.css` | `feat(bonus): add derived red-flag meter and accessible signal controls` |
| **Phase 3** | `BONUS-03` | 'Seen Không Rep' Ghosting Timer & `AbortController` Cleanup | `useGhostingTimer.js` | `feat(bonus): implement leak-free ghosting timer and memory exit cleanup` |
| **Phase 4** | `BONUS-04` | DevTools Memory/Render Audit & 375px Responsive Polish | `SituationshipAnalyzer.module.css` | `test(bonus): verify strictmode cleanup, aria-live alerts and 375px layout` |

---

## 2. Domain, State Machine & Component Contracts (Stage 2 Gate)

Define and lock these contracts before generating implementation code:

```javascript
// 1. Relationship Finite State Machine (FSM) Contract (relationshipFsm.js)
// BANNED: Boolean Soup (`isDating && !isLoved && !hasTitle`)
// ALLOWED: Mutually exclusive RelationshipPhase states:
export type RelationshipPhase =
  | 'FRIENDS'          // Baseline state
  | 'DATING_NO_LOVE'   // 'Hẹn hò nhưng không yêu' (High Red-Flag risk)
  | 'OFFICIAL_LOVE'    // Verified mutual commitment
  | 'GHOSTED_EXIT';    // Self-respect exit & memory unmounted

// 2. Asymmetric Effort Signal Contract ('Em cố 100 lần < Ai đó 1 phần')
export interface EffortSignal {
  readonly id: string;
  readonly actor: 'EM' | 'AI_DO';
  readonly label: string;      // e.g., 'Chờ tin nhắn cả đêm' vs 'Seen thả tim'
  readonly steps: number;      // e.g., 100 vs 1
  readonly weight: number;     // 0.1 for 'EM' vs 50.0 for 'AI_DO'
}

// 3. Derived Analyzer Metrics (Computed purely during render — ZERO useEffect!)
export interface DerivedCompatibility {
  readonly emImpactScore: number;      // sum(steps * 0.1)
  readonly rivalImpactScore: number;   // sum(steps * 50.0)
  readonly isRedFlag: boolean;         // phase === 'DATING_NO_LOVE' && emImpactScore < rivalImpactScore
  readonly diagnosticMessage: string;
}

// 4. Ghosting Timer Hook Contract (useGhostingTimer.js)
export function useGhostingTimer(
  phase: RelationshipPhase,
  lastPingTick: number,
  timeoutMs: number, // Default: 5000ms ('Seen không rep')
  onGhostTimeout: () => void
): {
  secondsRemaining: number;
}
```

---

## 3. Detailed Sub-Tasks & Definition of Done (DoD)

### Phase 1: Deterministic Relationship FSM & Asymmetric Effort Engine (`BONUS-01`)
* **`BONUS-01.1` (Ban Boolean Soup):** Replace contradictory boolean flags (`isDating`, `isLoved`) with a single `phase` state governed by explicit transition guards (`FRIENDS` $\rightarrow$ `DATING_NO_LOVE` $\rightarrow$ `OFFICIAL_LOVE` | `GHOSTED_EXIT`).
* **`BONUS-01.2` (Immutable Effort Log):** Maintain `signals` (`EffortSignal[]`) in `useState`. Appending a new effort action must use immutable spread `[...prev, { id: crypto.randomUUID(), ... }]`.
* **`BONUS-01.3` (Asymmetric Weight Constants):** Define explicit multiplier constants (`EM_EFFORT_WEIGHT = 0.1`, `RIVAL_EFFORT_WEIGHT = 50.0`) to model *"Em cố trăm lần chẳng bằng ai đó một phần"*.
* **DoD:** Impossible state combinations are structurally unrepresentable; state updates follow strict immutability.

### Phase 2: Pure Derived Red-Flag Meter & Accessible Signal Controls (`BONUS-02`)
* **`BONUS-02.1` (Zero-`useEffect` Derived Metrics):** Calculate `emImpactScore`, `rivalImpactScore`, and `isRedFlag` directly during render. Using `useEffect` to synchronize `isRedFlag` state is strictly banned.
* **`BONUS-02.2` (Semantic Landmarks & Zero `<div>`-Soup):** Build `SituationshipAnalyzer.jsx` using `<article>`, `<header>`, `<dl>/<dt>/<dd>` for score comparisons, `<meter>` for emotional ROI, and `<ul>/<li>` for the immutable effort log.
* **`BONUS-02.3` (WCAG 2.2 AA & `useId()` Forms):** Bind all custom effort inputs/selectors with React 19 `useId()` and `<label htmlFor={id}>`. Announce Red-Flag transitions via `<output role="status" aria-live="polite">`.
* **DoD:** Zero `<div>` tags in `SituationshipAnalyzer.jsx`; screen readers immediately announce Red-Flag warnings when `isRedFlag` flips to `true`.

### Phase 3: 'Seen Không Rep' Ghosting Timer & `AbortController` Cleanup (`BONUS-03`)
* **`BONUS-03.1` (Auto-Exit Countdown Effect):** When `phase === 'DATING_NO_LOVE'`, start a 5-second (`5000ms`) reply window in `useEffect` waiting for reciprocation (`lastPingTick`). If unreciprocated, automatically transition to `'GHOSTED_EXIT'`.
* **`BONUS-03.2` (Abortable Ping Simulation):** When sending a message ping, attach an `AbortController` to any simulated async typing/read-receipt check. Switching focus to `'AI_DO'` or clicking **"Dừng Lại (Unbind & Free Memory)"** immediately aborts pending promises.
* **`BONUS-03.3` (Deterministic Cleanup):** Return `() => { window.clearTimeout(timerId); controller.abort(); }` from `useEffect` so zero dangling timers fire after transitioning to `'GHOSTED_EXIT'` or unmounting.
* **DoD:** Clicking **"Unbind & Free Memory"** at `t = 2.5s` cancels the pending timeout cleanly with zero console state-update warnings in React `<StrictMode>`.

### Phase 4: DevTools Audit & 375px Responsive Polish (`BONUS-04`)
* **`BONUS-04.1` (Profiler Single-Pass Verification):** Verify in React DevTools Profiler that dispatching an effort signal triggers **1 single render pass** (no cascading `useEffect` re-renders).
* **`BONUS-04.2` (375px Mobile Layout):** Style `SituationshipAnalyzer.module.css` with CSS Custom Properties, responsive grid stacking at `375px`, and $\ge 44\times 44\text{px}$ touch targets for all action buttons.
* **DoD:** Clean `375px` mobile layout with zero horizontal overflow, 100 Lighthouse Accessibility score, and 2–4 atomic Git commits ready for live defense.