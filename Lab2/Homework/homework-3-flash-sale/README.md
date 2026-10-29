# Homework 3 — High-Concurrency Flash-Sale E-Commerce Engine

A lightweight TypeScript application simulating a Vietnam 11.11 / midnight flash sale, featuring an anti-drift countdown timer, an optimistic inventory reservation state machine with lock expiry, simulated concurrency handling, and an AI failure mode audit.

## Run

Requires Node.js 24+ (tests use built-in TypeScript stripping) and npm.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite (typically `http://127.0.0.1:5173/` or `http://127.0.0.1:5176/`). Do not open `index.html` via `file://`.

```sh
npm test
npm run build
npm run preview
```

Only approved TypeScript and Vite development dependencies are used. No runtime libraries or external frameworks. The application uses semantic HTML, standard DOM APIs, and CSS tokens directly. HW1, HW2, Lab1, and exercises are completely isolated and untouched.

## Use

1. **Pre-sale countdown:** The page loads in an `UPCOMING` phase with a 5-second countdown to the sale start. Reservation controls are disabled until the sale opens.
2. **Flash-sale opening:** Once the sale is `OPEN` (90-second duration), the user can select **Giữ hàng ngay** (Reserve now) to acquire an optimistic inventory hold.
3. **Optimistic hold & expiry:** Each hold lasts for 15 seconds (or until sale end, whichever comes first). A dedicated hold countdown timer tracks the remaining time. If not checked out before expiry, the lock expires automatically and stock is restored to availability.
4. **Checkout & retry:** Select **Thanh toán mô phỏng** to initiate checkout. It simulates an 800ms network request with an `AbortController`. You can check **Giả lập lần thanh toán tiếp theo thất bại** to test payment failures; failed payments preserve unexpired holds so the user can retry.
5. **Simulated concurrent buyers:** Select **Giả lập 20 người mua** to trigger 20 simultaneous buyer reservations against the remaining stock. Available units are awarded strictly without overselling, and all holds are tracked in the real-time reservation table.
6. **Reset / new session:** Select **Bắt đầu phiên mới** to cancel active timers/requests and reset the simulation.

## Structure and behavior

| File | Responsibility |
|---|---|
| `src/contracts.ts` | Domain contracts, sale configurations, reservation states, and inventory snapshot types |
| `src/countdown.ts` | Anti-drift countdown timer based on `Date.now()` delta and `requestAnimationFrame` lifecycle |
| `src/inventory.ts` | Inventory manager and state machine (`AVAILABLE`, `RESERVED`, `CHECKING_OUT`, `CHECKED_OUT`, `EXPIRED`, `RELEASED`) |
| `src/simulate-buyers.ts` | Microtask concurrency simulation for multiple buyer reservation requests |
| `src/delay.ts` | Abortable delay helper for simulated asynchronous checkout latency |
| `src/main.ts` | Delegated UI event controller, live inventory updates, error handling, and page lifecycle management |
| `src/styles.css` | Accessible, responsive layout with light and dark mode design tokens |

### Anti-drift timer architecture

Standard `setInterval` or `setTimeout` mechanisms drift significantly due to event-loop lag, microtask queues, and background tab throttling. The timer in `src/countdown.ts` computes the exact remaining time on every frame:
$$\text{remaining} = \max(0, \text{deadline} - \text{Date.now}())$$
It schedules frames using `requestAnimationFrame`, validates finite timestamps before scheduling, and provides an idempotent cleanup function (`cancelAnimationFrame`) to prevent memory leaks or orphan RAF loops.

### Inventory state machine & concurrency invariants

The engine enforces strict state transitions:
- `AVAILABLE` → `RESERVED` → `CHECKING_OUT` → `CHECKED_OUT` (terminal)
- `RESERVED` / `CHECKING_OUT` → `EXPIRED` (when `now >= expiresAt`)
- `RESERVED` → `RELEASED` (manual user cancellation)
- Failed checkout reverts `CHECKING_OUT` → `RESERVED` if the reservation timestamp has not expired.

The inventory maintains the strict invariant at all times:
$$\text{available} + \text{held} + \text{sold} = \text{totalStock}$$
Expired reservations restore available units exactly once. Stock release and snapshots are derived synchronously from the internal reservation map, preventing race conditions or double-restocking.

## Verification — 29 October 2026

- `npm test`: **12/12 tests passed** (75.7ms), covering:
  - 1,000 simultaneous callers cannot oversell five units.
  - Finite timestamp validation preventing NaN outputs.
  - RAF cleanup, including cancellation within tick callbacks and after tab throttling.
  - Single-buyer identity normalization preventing whitespace bypass.
  - Single-submit idempotent checkout and sold inventory preservation.
  - Failure retry vs. exact-boundary deadline expiry.
  - Synchronous stock reduction, duplicate hold prevention, and state transition immutability.
- `npm run build`: Strict TypeScript typechecking (`tsc`) and Vite production bundle succeeded with zero errors or warnings.
- `node scripts/browser-check.mjs`: Automated Chrome DevTools Protocol (CDP) test verified:
  - Real browser reservation, hold expiry notification, checkout failure and retry, reset during pending requests, and reload.
  - Page lifecycle events (`pagehide`/`pageshow`) cleanup.
  - Zero XSS vulnerabilities (error text rendered literally with no child script/DOM nodes).
  - Maximum **1 active RAF loop** at any time.
  - Responsive layout: zero horizontal overflow at 375px mobile viewport (`scrollWidth: 360px` <= `375px`).
  - Text contrast: measured at **5.79:1 or higher** across light and dark modes (exceeding WCAG 2.2 AA 4.5:1 requirement).
- `AI_FAILURE_AUDIT.md`: Fully documented 3 real AI-generated defects with diagnosis, regression tests, fixes, and Git commit hashes.
- Git history: **12 discrete Conventional Commits** covering individual incremental steps (requirement: >= 8 commits).

Evidence: [browser results](evidence/browser-results.json), [mobile screenshot](evidence/mobile.png), [desktop screenshot](evidence/desktop.png), [AI failure audit](AI_FAILURE_AUDIT.md).

## Limits

- **Single-tab simulation:** The inventory owner is a synchronous JavaScript class in one browser tab. Microtask concurrency (`Promise.allSettled`) proves intra-process locking correctness, but does **not** replace server-side distributed atomic transactions (e.g., Redis distributed lock, PostgreSQL `SELECT FOR UPDATE`) across multiple distinct physical clients.
- **Volatile storage:** Refreshing the browser or clicking reset starts a fresh simulation session; there is no persistent database backend or real payment gateway integration.
- **Clock manipulation:** Automated browser expiry tests use local test-time offsets to verify boundary behavior deterministically without waiting real-world seconds. The production application strictly relies on system `Date.now()`.
