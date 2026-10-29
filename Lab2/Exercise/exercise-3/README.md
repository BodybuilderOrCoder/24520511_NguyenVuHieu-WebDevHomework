# Exercise 3 – Resilient State Machine & Skeleton Loader

## 1. Objective

Implement a resilient asynchronous data component using a finite state machine to prevent inconsistent UI states and race conditions.

## 2. Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6 Modules)
- Custom `useState` engine from Exercise 2
- Virtual DOM factory from Exercise 1

## 3. Finite State Machine

The component supports exactly four lifecycle states:

| State | Description |
|---|---|
| IDLE | Waiting for user interaction |
| LOADING | Fetching data and displaying skeleton placeholders |
| SUCCESS | Data successfully retrieved and displayed |
| ERROR | Request failed; displays an error and retry button |

Each state has a distinct data structure.

```javascript
{ status: "IDLE" }
{ status: "LOADING" }
{ status: "SUCCESS", data: [...] }
{ status: "ERROR", error: "Connection failed" }
```

## 4. State Transitions

```text
IDLE
  |
  | Load Data
  v
LOADING
  |       |
  |       | Request failure
  |       v
  |      ERROR
  |       |
  |       | Retry Connection
  |       v
  |     LOADING
  |
  | Request success
  v
SUCCESS
```

A new request may also be initiated from SUCCESS or ERROR.

## 5. Skeleton Loader

The loading interface uses CSS pulsing animations to display placeholder cards while data is being retrieved.

This provides visual feedback and prevents the interface from appearing unresponsive.

## 6. Error Handling and Retry

When an asynchronous operation fails, the component transitions to ERROR.

A human-readable error message and a Retry Connection button are displayed.

Retry initiates a new request and returns the component to LOADING.

## 7. Race Condition Prevention

Each request receives a unique incrementing request identifier.

Only the latest request is permitted to update the component state.

Responses from older requests are ignored.

## 8. Verification Checklist

- [ ] Initial IDLE state displayed
- [ ] LOADING state displays skeleton animation
- [ ] SUCCESS state displays fetched data
- [ ] ERROR state displays a readable message
- [ ] Retry Connection works
- [ ] Outdated request responses are ignored
- [ ] No JavaScript errors in DevTools

## 9. Git Milestone

Required commit:

`feat(ui): implement multi-state data component with skeleton feedback`

## 10. Limitations

- Data fetching is simulated using a Promise and a timer.
- The implementation uses JavaScript rather than TypeScript.
- The custom rendering engine replaces the complete DOM subtree.
- Request identifiers prevent stale state updates but do not cancel the underlying asynchronous operation.

## 11. Conclusion

This exercise demonstrates reliable asynchronous UI state handling through a finite state machine, skeleton loading feedback, error recovery, and stale-response protection.
