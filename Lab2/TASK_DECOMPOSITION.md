# Lab 02 – Task Decomposition

# Work Breakdown Structure (WBS)

## 1.0 Lab 02 – Modern React Architecture, Virtual DOM & State Machines

The Work Breakdown Structure (WBS) organizes Lab 02 into three main exercises, with each exercise decomposed into implementation, verification, and documentation deliverables.

### 1.1 Exercise 1 – Mini-React VNode & Mounting Engine

| WBS ID | Work Package | Deliverable |
|---|---|---|
| 1.1.1 | Project setup | Exercise 1 folder and HTML entry point |
| 1.1.2 | Virtual Text Node Factory | `createTextElement()` |
| 1.1.3 | Virtual Element Factory | `createElement()` |
| 1.1.4 | Type Guards | Input validation and unsupported child handling |
| 1.1.5 | DOM Mounting Engine | Recursive `renderToDOM()` |
| 1.1.6 | Event Handling | Click handler support |
| 1.1.7 | Security Verification | XSS-resistant text rendering |
| 1.1.8 | Testing and DevTools Audit | Factory tests, DOM inspection, event verification |
| 1.1.9 | Git Milestones | Atomic factory and renderer commits |

### 1.2 Exercise 2 – Reactive State Machine & Delegation Hub

| WBS ID | Work Package | Deliverable |
|---|---|---|
| 1.2.1 | Project setup | Exercise 2 folder and module structure |
| 1.2.2 | State Storage Engine | `stateStore`, `resetCursor()` |
| 1.2.3 | Reactive Hook | Custom `useState()` |
| 1.2.4 | Rendering Dispatcher | `renderApp()` and scheduled updates |
| 1.2.5 | Root Event Delegation | Root click listener and handler registry |
| 1.2.6 | Delegated DOM Renderer | `renderDelegatedDOM()` |
| 1.2.7 | Task Manager UI | Add, complete, undo, and delete tasks |
| 1.2.8 | Dynamic Filtering | ALL, ACTIVE, COMPLETED |
| 1.2.9 | Verification | State updates, DOM structure, event delegation |
| 1.2.10 | Documentation and Git | README, verification report, atomic commits |

### 1.3 Exercise 3 – Resilient State Machine & Skeleton Loader

| WBS ID | Work Package | Deliverable |
|---|---|---|
| 1.3.1 | Project setup | Exercise 3 folder and module structure |
| 1.3.2 | Finite State Machine | IDLE, LOADING, SUCCESS, ERROR |
| 1.3.3 | Asynchronous Data Operation | Promise-based mock data fetching |
| 1.3.4 | Skeleton Loader | Animated CSS placeholders |
| 1.3.5 | Success View | Render retrieved data |
| 1.3.6 | Error Handling | Human-readable error message |
| 1.3.7 | Retry Mechanism | Retry Connection button |
| 1.3.8 | Race Condition Protection | Latest-request validation |
| 1.3.9 | Verification | State transition and stale-response tests |
| 1.3.10 | Documentation and Git | README, checklist, required commit |

## WBS Hierarchy

```text
1.0 Lab 02
│
├── 1.1 Exercise 1 – Mini-React Engine
│   ├── 1.1.1 Project Setup
│   ├── 1.1.2 Text Node Factory
│   ├── 1.1.3 Element Factory
│   ├── 1.1.4 Type Guards
│   ├── 1.1.5 DOM Renderer
│   ├── 1.1.6 Event Handling
│   ├── 1.1.7 Security Verification
│   ├── 1.1.8 Testing & Audit
│   └── 1.1.9 Git Milestones
│
├── 1.2 Exercise 2 – Reactive State Machine
│   ├── 1.2.1 Project Setup
│   ├── 1.2.2 State Storage
│   ├── 1.2.3 Custom useState
│   ├── 1.2.4 Reactive Dispatcher
│   ├── 1.2.5 Event Delegation
│   ├── 1.2.6 Delegated Renderer
│   ├── 1.2.7 Task Manager
│   ├── 1.2.8 Dynamic Filtering
│   ├── 1.2.9 Verification
│   └── 1.2.10 Documentation & Git
│
└── 1.3 Exercise 3 – Resilient State Machine
    ├── 1.3.1 Project Setup
    ├── 1.3.2 Finite State Machine
    ├── 1.3.3 Async Data Operation
    ├── 1.3.4 Skeleton Loader
    ├── 1.3.5 Success View
    ├── 1.3.6 Error Handling
    ├── 1.3.7 Retry Mechanism
    ├── 1.3.8 Race Protection
    ├── 1.3.9 Verification
    
    └── 1.3.10 Documentation & Git
```

## WBS Completion Criteria

Each work package is considered completed when its implementation is available, the relevant functional tests have passed, and the associated changes have been committed to Git.

The WBS describes deliverables and scope. Detailed implementation order and completion status are tracked separately in the Task Breakdown sections.

## Exercise 1: Building Mini-React VNode & Mounting Engine

**Estimated Duration:** 35 minutes

**Technology:** HTML5, Vanilla JavaScript (ES6 Modules), Browser DOM API

### 1. Objective

Implement a simplified React-like virtual node creation and DOM mounting engine from scratch.

The engine must support:

- Virtual node creation.
- Text node creation.
- Conversion from virtual nodes into real DOM elements.
- Semantic HTML elements.
- Safe text rendering.
- Basic event handling.
- Verification through browser DevTools.

### 2. Functional Requirements

**FR-01: Virtual Node Factory**

Implement `createElement(type, props, ...children)`.

The function must produce a JavaScript object representing an element and its children.

**FR-02: Text Node Factory**

Implement `createTextElement(text)`.

The function must create a virtual representation of a text node.

**FR-03: DOM Mounting Engine**

Implement `renderToDOM(vnode)`.

The function must recursively convert a virtual node tree into real DOM nodes.

**FR-04: Semantic HTML**

The rendered structure must preserve semantic tags such as `main`, `header`, `section`, `h1`, `p`, and `button`.

Avoid unnecessary wrapper elements.

**FR-05: Event Handling**

Support event properties such as `onClick` by attaching DOM event listeners.

**FR-06: Security**

User-provided text must be rendered safely.

Do not use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, or `eval`.

Use `document.createElement()`, `document.createTextNode()`, and safe DOM APIs.

**FR-07: Type Guards**

Validate virtual node types and handle unsupported input explicitly.

### 3. Task Breakdown

| Task ID | Task | Expected Output | Status |
|---|---|---|---|
| T01 | Create project structure | Lab2 and exercise-1 directories | Not Started |
| T02 | Implement `createTextElement()` | Text VNode factory | Not Started |
| T03 | Implement `createElement()` | Element VNode factory | Not Started |
| T04 | Implement type guards | Input validation | Not Started |
| T05 | Implement `renderToDOM()` | DOM mounting engine | Not Started |
| T06 | Implement event handling | Functional button click | Not Started |
| T07 | Create test runner | Browser verification | Not Started |
| T08 | Verify XSS resistance | Malicious text rendered safely | Not Started |
| T09 | Perform DevTools audit | DOM matches VNode tree | Not Started |
| T10 | Review Git history | Atomic commits | Not Started |

### 4. Implementation Plan

**Phase 1 – Virtual Node Factory**

- Implement `createTextElement()`.
- Implement `createElement()`.
- Handle nested children.
- Verify the VNode structure.

Commit:

`feat(core): implement createElement factory`

**Phase 2 – DOM Mounting Engine**

- Implement `renderToDOM()`.
- Create semantic DOM elements.
- Render text nodes.
- Attach event listeners.
- Mount the application to `#app`.

Commit:

`feat(core): implement renderToDOM`

**Phase 3 – Verification**

- Run the provided test scenario.
- Verify semantic HTML output.
- Check text rendering against XSS payloads.
- Inspect the DOM using Chrome DevTools.
- Record actual test results.

### 5. Security Checklist

- [ ] No unsafe HTML string injection
- [ ] No use of `innerHTML`
- [ ] Text nodes rendered using `document.createTextNode()`
- [ ] Event handlers attached using `addEventListener()`
- [ ] Unsupported node types handled explicitly
- [ ] XSS test payload displayed as plain text

### 6. Acceptance Criteria

Exercise 1 is complete when:

1. The VNode factory produces the expected tree.
2. The mounting engine renders the VNode tree successfully.
3. Semantic tags are preserved.
4. The button click event works.
5. The malicious HTML payload is displayed as text.
6. Browser DevTools shows the expected DOM structure.
7. The required two implementation commits exist.

### 7. Constraints

- Vanilla JavaScript only.
- No React, Vue, Angular, or other frameworks.
- No unnecessary wrapper elements.
- No unsafe HTML injection APIs.
- Maintain readable, modular code.
- Follow the Git commit structure specified in the exercise.

## Task Completion

- [x] T01 Create project structure
- [x] T02 Implement createTextElement()
- [x] T03 Implement createElement()
- [x] T04 Implement type guards
- [x] T05 Implement renderToDOM()
- [x] T06 Implement event handling
- [x] T07 Create test runner
- [x] T08 Verify XSS resistance
- [x] T09 DevTools audit
- [x] T10 Review Git history

---

# Exercise 2 – Reactive State Machine & Delegation Hub

**Estimated Duration:** 40 minutes

## Objective

Implement a simplified reactive state management engine using JavaScript closures and root event delegation.

## Task Breakdown

- [x] T01 – Create Exercise 2 project structure
- [x] T02 – Implement stateStore
- [x] T03 – Implement resetCursor()
- [x] T04 – Implement custom useState()
- [x] T05 – Implement reactive dispatcher
- [x] T06 – Implement root event delegation
- [x] T07 – Implement delegated DOM renderer
- [x] T08 – Build reactive Task Manager
- [ ] T09 – Complete Checkpoint 2 verification
- [ ] T10 – Perform DevTools event listener audit
- [ ] T11 – Review Git history and push changes

## Required Git Commits

1. `feat(state): implement stateStore and resetCursor engine`
2. `feat(state): implement reactive useState dispatcher`
3. `feat(events): attach root event delegation listener`
4. `feat(ui): assemble reactive todo application`

## Security Checklist

- [x] Avoid unsafe HTML string injection
- [x] Render text using createTextNode()
- [x] Avoid direct click listeners on child buttons
- [x] Restrict supported HTML tags and attributes
- [ ] Verify root event listener registration in DevTools

## Acceptance Criteria

- State values persist across re-renders.
- Updating state triggers a new render.
- Task Manager supports adding and updating tasks.
- Task filters update dynamically.
- Click events are handled through root delegation.
- No unnecessary wrapper elements are generated.
- Git history contains the required atomic commits.

## Final Verification

**Checkpoint Result:** Pending local verification.

**DevTools Audit:** Pending local verification.

**Git Push:** Pending.

---

# Exercise 3 – Resilient State Machine & Skeleton Loader

**Estimated Duration:** 35 minutes

## Objective

Implement robust asynchronous state handling with four exclusive UI states: IDLE, LOADING, SUCCESS, and ERROR.

## Task Breakdown

- [x] T01 – Create Exercise 3 project structure
- [x] T02 – Define finite state machine
- [x] T03 – Implement asynchronous mock data fetching
- [x] T04 – Implement skeleton loader
- [x] T05 – Implement SUCCESS data view
- [x] T06 – Implement ERROR view and Retry Connection
- [x] T07 – Implement stale request protection
- [ ] T08 – Verify all four lifecycle states
- [ ] T09 – Test race condition handling
- [ ] T10 – Commit and push changes

## Acceptance Criteria

- Exactly four supported lifecycle states.
- Animated skeleton placeholders during LOADING.
- Data rendered only after successful requests.
- Human-readable error message.
- Working Retry Connection button.
- Older asynchronous responses cannot overwrite newer results.
- No unsafe HTML injection.

## Git Milestone

`feat(ui): implement multi-state data component with skeleton feedback`

## Verification Status

Pending local testing.

---

# Homework 1 — Production Enterprise Data-Grid

## Project Scope
- Custom Mini-React, not official React.
- Sorting, filtering and pagination.
- Full keyboard navigation.
- WCAG 2.2 AA compliance.
- Lighthouse Accessibility and Best Practices: 100/100.

## Phase 0 — Requirements & Contracts
- [ ] T-00A: Define acceptance criteria.
- [ ] T-00B: Audit existing Mini-React modules.
- [ ] T-00C: Define TypeScript contracts.
- [ ] T-00D: Define JSX runtime and Vite configuration.

## Phase 1 — Mini-React Engine
- [ ] T-01A: createTextElement.
- [ ] T-01B: createElement and normalization.
- [ ] T-01C: Recursive renderToDOM.
- [ ] T-01D: Root event delegation.
- [ ] T-01E: Reactive state and rendering lifecycle.

## Phase 2 — Data-Grid Features
- [ ] T-02A: Semantic table and columns.
- [ ] T-02B: Sorting.
- [ ] T-02C: Filtering.
- [ ] T-02D: Pagination.
- [ ] T-02E: Keyboard navigation.
- [ ] T-02F: Accessibility and responsive CSS.

## Phase 3 — Verification & Delivery
- [ ] T-03A: Functional tests.
- [ ] T-03B: Security and lifecycle tests.
- [ ] T-03C: Lighthouse audit.
- [ ] T-03D: AI_FAILURE_AUDIT.md.
- [ ] T-03E: Git review and live defense.

## Working Rules
- Implement exactly one sub-task at a time.
- Define contracts before implementation.
- Verify using tests, DevTools and git diff.
- Use atomic Conventional Commits.
- Preserve all existing exercises.