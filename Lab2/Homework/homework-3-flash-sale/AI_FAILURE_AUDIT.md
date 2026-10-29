# AI Failure Audit — Homework 3

The following defects occurred in code generated during this implementation. They were reproduced before correction. Tests and source diffs provide the evidence.

## 1. Whitespace bypassed the per-buyer reservation limit

- **Generated behavior:** `reserve()` checked `buyerId.trim()` for emptiness but looked up and stored the original ID. `you` and ` you ` could therefore reserve two units as distinct buyers.
- **Diagnosis:** source/diff review found inconsistent normalization. The new test `whitespace cannot bypass one reservation per buyer` failed with `Missing expected exception` before the fix (10/12 tests passed at that point).
- **Fix:** normalize once into `normalizedId`, then use it consistently for lookup, stored buyer identity and map keys.
- **Verification:** `npm test` passes the regression and the 1,000-buyer stock-conservation test.
- **Commit:** `135a5de`.

## 2. Invalid countdown timestamps silently produced NaN

- **Generated behavior:** `Math.max(0, deadline - now)` accepted NaN/Infinity. NaN could reach the view, and the `remaining > 0` condition would stop scheduling rather than explain the invalid contract.
- **Diagnosis:** code review of the reusable timer's input contract; the new `invalid timestamps fail explicitly instead of producing NaN timer output` test failed with `Missing expected exception`.
- **Fix:** validate finite timestamps in `remainingMs()` and validate the deadline before scheduling the first RAF in `startCountdown()`.
- **Verification:** the regression now passes alongside simulated delayed frames, exact expiry, repeated cleanup and cleanup within the tick callback.
- **Commit:** `135a5de`.

## 3. Expired stock retained a misleading success message

- **Generated behavior:** RAF expiry updated stock and the table, but kept the earlier SUCCESS view and its “held successfully” status. Inventory was correct while feedback was stale.
- **Diagnosis:** Chrome DevTools Protocol test advanced `Date.now()` beyond the hold deadline. The stock returned, but the assertion failed with `'SUCCESS' !== 'ERROR'`.
- **Fix:** when expiry changes the current user's hold to EXPIRED, update the view with an explicit expiry message before rendering. Available stock and controls still come from the engine snapshot.
- **Verification:** `node scripts/browser-check.mjs` now passes the expiry-status assertion as well as expiry during checkout, failed checkout/retry and reset during a pending request.
- **Commit:** `b7c0a87`.

## Scope of evidence

- Browser tests use test-only clock offsets to simulate delayed frames and deadline races. The app itself always uses `Date.now()` and absolute deadlines.
- Error rendering is tested with `<script>alert(1)</script>` and `<img onerror=alert(1)>`. Both remain literal text with no child HTML elements.
- The inventory owner is one browser tab. These tests do not establish distributed locking, real payment safety or multi-user server correctness.
