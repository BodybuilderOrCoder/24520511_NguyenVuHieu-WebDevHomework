# TASK DECOMPOSITION & WBS — Homework 3: KRAFTON x PUBG Vietnam Championship & Airdrop Arena

* **Course / Lab:** Lab 3 — Production React 19, Fiber Hooks & Concurrent UI (UIT - VNUHCM)
* **Architectural Continuity:** Bridges Lab 2 `createAntiDriftTimer` (`Date.now()` monotonic delta) & Lab 2 Virtual List / Derived State into Production React 19.
* **Quality Targets:** Zero-drift airdrop countdown with `visibilitychange` tab-wake resync, idempotent optimistic UI updates with `409 Conflict` rollback, `Intl.NumberFormat('vi-VN')` VND currency formatting, pure derived leaderboard filtering/sorting (zero `useEffect` sync), Zero `<div>`-soup, `375px–1440px` responsive stability, and a verified `AI_FAILURE_AUDIT.md` (15% rubric weight).
* **Execution Workflow (Contract-First 4-Stage Loop):**
  1. **Vertical Slice (WBS):** Decompose the KRAFTON PUBG VN Arena into independent, testable slices.
  2. **Contract Definition:** Lock domain types, state machine phases, and hook signatures prior to AI prompting.
  3. **Atomic Generation:** Generate constrained code under `project-rules.md`.
  4. **DevTools & Network Verification:** Audit background tab timer accuracy, simulated `409 Conflict` rollbacks, and React Profiler render counts before each atomic Git commit.

---

## 1. Work Breakdown Structure (WBS) & Git Commit Mapping

| WBS Phase | Task ID | Vertical Slice | Primary Deliverables | Atomic Git Commit Message |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | `HW3-01` | Domain Dataset, VND Formatter & Mock KRAFTON API | `pubgVnDataset.js`, `kraftonApi.js` | `feat(hw3): setup KRAFTON PUBG VN drops, squads and mock 409 API` |
| **Phase 2** | `HW3-02` | Zero-Drift Airdrop & Ticket Countdown Hook | `usePubgAirdropTimer.js`, `AirdropCountdown.jsx` | `feat(hw3): implement anti-drift airdrop timer with visibilitychange sync` |
| **Phase 3** | `HW3-03` | Optimistic VIP Ticket & G-Coin Crate Claim + 409 Rollback | `CrateDropCard.jsx`, `useOptimisticClaim.js` | `feat(hw3): add idempotent optimistic crate claim and 409 conflict rollback` |
| **Phase 4** | `HW3-04` | Live PUBG VN Leaderboard & Kill-Feed Derived Explorer | `PvsLeaderboard.jsx`, `KraftonPubgVnArena.jsx` | `feat(hw3): build derived PVS leaderboard with search and toSorted` |
| **Phase 5** | `HW3-05` | Forensic AI Failure Audit & Final Rubric Verification | `AI_FAILURE_AUDIT.md` | `docs(hw3): document 3 verified AI failure modes with DevTools proofs` |

---

## 2. Domain, Hook & Component Contracts (Stage 2 Gate)

Define and lock these contracts before generating implementation code:

```typescript
// 1. Airdrop Phase State Machine Contract
export type DropPhase = 'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED';

// 2. KRAFTON PUBG VN Crate & VIP Ticket Drop Contract (pubgVnDataset.js)
export interface PubgCrateDrop {
  readonly id: string;
  readonly title: string;          // e.g., 'PVS Finals VIP Pass + 5,000 G-Coin'
  readonly tier: 'VIP_PASS' | 'CONTRABAND_CRATE';
  readonly priceVnd: number;       // Formatted via Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
  readonly remainingStock: number;
  readonly dropEpochMs: number;    // Absolute target timestamp in ms
}

// 3. PUBG Vietnam Series (PVS) Squad Standing Contract
export interface PubgVnSquadStanding {
  readonly squadId: string;        // 'te' | 'ces' | 'ge' | 'roy' | 'agg'
  readonly squadName: string;      // e.g., 'The Expendables', 'Cerberus Esports'
  readonly regionTag: string;      // 'VN-SOUTH' | 'VN-NORTH'
  readonly wwcdCount: number;      // Winner Winner Chicken Dinner count
  readonly placementPts: number;
  readonly killPts: number;
  // Derived totalPoints = placementPts + killPts (computed purely during render!)
}

// 4. Anti-Drift Airdrop Timer Hook Contract (usePubgAirdropTimer.js)
export function usePubgAirdropTimer(
  targetEpochMs: number,
  serverOffsetMs?: number
): {
  remainingMs: number;
  isLive: boolean;
  formattedClock: string; // 'MM:SS.d'
}

// 5. Optimistic Claim Engine Invariant (useOptimisticClaim.js)
// Invariant 1 (Idempotency): Maintain `inFlightIds: Set<string>` to ignore duplicate clicks on the same dropId.
// Invariant 2 (Optimistic Deduction): Decrement `remainingStock` immediately upon click.
// Invariant 3 (409 Rollback): On HTTP 409 ('LOOTED_OUT'), restore exact previous stock snapshot,
// mark drop as 'LOOTED_OUT', and announce error in <section role="alert"> (NO window.alert!).
```

---

## 3. Detailed Sub-Tasks & Definition of Done (DoD)

### Phase 1: Domain Dataset, VND Formatting & Mock KRAFTON API (`HW3-01`)
* **`HW3-01.1` (PVS Dataset):** Create `src/homeworks/KraftonPubgVnArena/data/pubgVnDataset.js` containing Vietnamese PUBG squads (*The Expendables*, *Cerberus Esports*, *Genius Esports*, *Roy Esports*, *AGG*) and timed PVS Finals VIP Ticket / Contraband G-Coin drops.
* **`HW3-01.2` (Currency Helper):** Create a pure formatter `formatVnd(amount)` using `new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
* **`HW3-01.3` (Simulated Network & 409 Conflict Endpoint):** Implement `claimDropRequest(dropId, { signal })` in `kraftonApi.js` with realistic latency (400–900ms), `AbortSignal` support, and deterministic/simulated `409 Conflict` responses when stock hits zero or race conditions occur.
* **DoD:** Data structures are strictly immutable; VND prices render cleanly (e.g., `1.500.000 ₫`).

### Phase 2: Zero-Drift Airdrop & Ticket Countdown Hook (`HW3-02`)
* **`HW3-02.1` (Monotonic Target Delta):** Implement `usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0)` computing `Math.max(0, targetEpochMs - (Date.now() + serverOffsetMs))`. Naive `setInterval(() => setSeconds(s => s - 1), 1000)` is strictly banned.
* **`HW3-02.2` (Background Tab Resync):** Register a `document.addEventListener('visibilitychange', onWake)` listener inside `useEffect` so switching away to another browser tab for 60 seconds and returning snaps the countdown immediately to true wall-clock time.
* **`HW3-02.3` (Semantic Timer Markup):** Render countdown digits inside a semantic `<time>` element with `font-variant-numeric: tabular-nums` in CSS to eliminate horizontal layout jitter.
* **DoD:** Backgrounding the tab for 30+ seconds produces `0.0s` drift upon tab reactivation; unmounting clears both the interval and `visibilitychange` listener.

### Phase 3: Optimistic VIP Ticket & G-Coin Crate Claim + 409 Rollback (`HW3-03`)
* **`HW3-03.1` (Idempotent Click Lock):** Track `pendingClaimIds` (`Set<string>`) so rapid double-clicks on "Claim VIP Pass" never dispatch duplicate requests.
* **`HW3-03.2` (Optimistic UI Update):** Immediately decrement `remainingStock` in state (`prev.map(...)`) before the network promise resolves so UI feedback is instantaneous (`< 16ms`).
* **`HW3-03.3` (Atomic 409 Conflict Rollback):** If `claimDropRequest` rejects with status `409`, roll back the optimistic stock deduction cleanly, transition the card's `DropPhase` to `'LOOTED_OUT'`, and display a non-blocking `<section role="alert">` banner.
* **DoD:** Simulated `409 Conflict` restores exact inventory count without corrupting sibling crate cards; zero `window.alert()` calls exist anywhere in the codebase.

### Phase 4: Live PUBG VN Leaderboard & Kill-Feed Derived Explorer (`HW3-04`)
* **`HW3-04.1` (Pure Derived Pipeline):** Compute `totalPoints = placementPts + killPts`, filter by squad search query / region, and sort by `totalPoints`, `wwcdCount`, or `killPts` via ES2023 `.toSorted()` **directly in the render body** (zero `useEffect` state synchronization).
* **`HW3-04.2` (Accessible Filter Controls):** Bind search `<input>` and sort `<select>` with React 19 `useId()` and `<label htmlFor={id}>`, and announce matching squad counts via `<output role="status" aria-live="polite">`.
* **`HW3-04.3` (Semantic Layout & 375px Responsiveness):** Structure `KraftonPubgVnArena.jsx` using `<main>`, `<section>`, `<article>`, `<dl>/<dt>/<dd>`, and responsive `<table>` / card stacking with zero `<div>`-soup and zero horizontal overflow at `375px`.
* **DoD:** React DevTools Profiler confirms typing in the squad search bar executes in **1 single render pass**.

### Phase 5: Forensic AI Failure Audit & Final Rubric Verification (`HW3-05`)
* **`HW3-05.1` (Document Minimum 3 AI Bugs):** Populate `AI_FAILURE_AUDIT.md` (15% of Lab 3 grade) with at least 3 genuine AI hallucinations caught during Sprints/Homeworks (e.g., naive `setInterval` countdown drift, redundant `useEffect` derived leaderboard state, or missing `AbortController` / stale closure in polling), complete with:
  1. Exact prompt used
  2. Faulty AI snippet
  3. Root-cause architectural explanation
  4. Chrome DevTools / Network / Profiler proof
  5. Verified manual fix + Git commit hash
* **`HW3-05.2` (Final Quality Gate):** Run full repository audit: `6–8+` atomic commits, 100 Lighthouse Accessibility score, zero console errors in `<StrictMode>`, and readiness for the **3-Minute Live Refactoring Defense**.
* **DoD:** All 5 grading rubric dimensions (30% Functional, 25% Live Defense, 15% WCAG/375px, 15% Modern Standards, 15% AI Audit & Git) are 100% satisfied.