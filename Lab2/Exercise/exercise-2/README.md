# Exercise 2 – Reactive State Machine & Delegation Hub

## 1. Overview

This exercise implements a simplified reactive state management engine inspired by React Hooks, using Vanilla JavaScript and the Browser DOM API.

The application demonstrates unidirectional data flow, state-driven rendering, root event delegation, and dynamic task filtering.

**Technology Stack:**
- HTML5
- CSS3
- JavaScript ES6 Modules
- Browser DOM API
- Git

No external frontend framework is required.

## 2. Objectives

The main objectives are:

1. Implement a custom state store and hook cursor.
2. Develop a simplified `useState()` hook.
3. Automatically re-render the application after state updates.
4. Implement root-level event delegation.
5. Build a reactive Task Manager.
6. Verify functionality, DOM structure, and event handling.

## 3. Project Structure

```text
exercise-2/
├── index.html
├── app.js
├── reactive-engine.js
├── event-delegation.js
├── delegated-renderer.js
├── checkpoint2.html
├── checkpoint2-verify.js
└── README.md
```

## 4. System Architecture

The application follows a unidirectional data flow:

```text
User Interaction
       |
       v
Root Event Delegation
       |
       v
Event Handler
       |
       v
setState()
       |
       v
State Store Update
       |
       v
Reactive Dispatcher
       |
       v
Component Re-execution
       |
       v
Virtual DOM Creation
       |
       v
DOM Rendering
```

### 4.1 State Store

The state engine uses an array called `stateStore` to preserve state values between renders.

A cursor tracks the order in which hooks are called.

Before each render, `resetCursor()` resets the cursor to zero without deleting existing state values.

### 4.2 Custom useState

The `useState()` function returns two values:

```javascript
const [state, setState] = useState(initialValue);
```

- `state`: the current state value.
- `setState`: a function that updates state and schedules a new render.

The setter supports direct assignments and functional updates.

### 4.3 Reactive Rendering

When state changes, `scheduleRender()` schedules an update using `queueMicrotask()`.

The engine then executes the component again, generates a new Virtual DOM tree, and replaces the previous DOM subtree.

This implementation uses full subtree replacement rather than React's reconciliation algorithm.

### 4.4 Root Event Delegation

The application uses a root-level click listener instead of attaching individual click listeners to child buttons.

Handlers are registered in a `WeakMap`, and click events are dispatched through event bubbling.

A `WeakSet` prevents duplicate root listener registration.

### 4.5 Security

The renderer uses safe DOM APIs:

- `document.createElement()`
- `document.createTextNode()`
- `element.setAttribute()`
- `root.replaceChildren()`

It does not use `innerHTML` to render untrusted text.

The renderer also restricts supported tags and attributes.

## 5. Task Manager Features

The application supports:

- Adding new tasks.
- Marking tasks as completed.
- Reverting completed tasks to active.
- Deleting tasks.
- Filtering tasks by ALL, ACTIVE, and COMPLETED.
- Automatically updating the task count.

All interactions update application state and trigger reactive rendering.

## 6. Verification

The verification process covers:

| Test | Expected Result |
|---|---|
| Initial rendering | Application renders successfully |
| Add Task | Task count increases |
| Complete Task | Task status changes |
| Undo | Task returns to active |
| Delete Task | Task is removed |
| ALL filter | All tasks are displayed |
| ACTIVE filter | Only incomplete tasks are displayed |
| COMPLETED filter | Only completed tasks are displayed |
| Reactive state update | UI changes without refreshing |
| Event delegation | Click handling is managed at the root |
| DOM audit | No unexpected wrapper nodes |

Record actual test results after running the application.

## 7. Git Milestones

The exercise follows the required atomic commit structure:

```text
feat(state): implement stateStore and resetCursor engine
feat(state): implement reactive useState dispatcher
feat(events): attach root event delegation listener
feat(ui): assemble reactive todo application
```

An additional test commit documents verification work.

## 8. Limitations

This engine is intended for educational purposes and is not a complete React implementation.

Current limitations include:

- No Virtual DOM diffing algorithm.
- Full DOM subtree replacement on updates.
- No effect hooks or lifecycle management.
- State hooks depend on a consistent call order.
- The state store is shared within one engine instance.
- No persistence after page reload.

## 9. Conclusion

This exercise demonstrates how a simplified reactive UI system can be implemented using JavaScript closures, state storage, scheduled rendering, and event delegation.

It provides a practical foundation for understanding React's state management and rendering concepts.