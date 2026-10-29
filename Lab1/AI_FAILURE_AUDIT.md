# HW3 – AI Failure Audit

## 1. Introduction

This report documents the review, testing, and refinement of AI-generated JavaScript for the TechConnect 2026 Event Hub.

The application was developed using HTML5, CSS3, and Vanilla JavaScript.

Three issues were identified during code review and functional testing. The corresponding improvements were implemented in separate Git commits.

## 2. Case 1 – Stale Registration Feedback

**Original issue:**

After successful registration, the application reset the form fields but retained the `SUCCESS` state and its message.

When the user started entering another registration, the previous success message remained visible.

**Root cause:**

The original implementation did not reset the form state when input values changed.

**Solution:**

An `input` event listener was added to reset the state to `IDLE` when the user edits the form after a `SUCCESS` or `ERROR` state.

**Verification:**

1. Submit a valid registration.
2. Wait for the success message.
3. Begin entering another registration.
4. Verify that the previous message disappears.

**Fix commit:** `47ef1eb`

## 3. Case 2 – Countdown Refresh After Tab Switching

**Original limitation:**

The countdown relied on `setInterval()` for display updates.

Browsers may throttle timer callbacks in background tabs, potentially delaying a visible refresh when the user returns.

**Root cause:**

The original implementation did not explicitly refresh the countdown when document