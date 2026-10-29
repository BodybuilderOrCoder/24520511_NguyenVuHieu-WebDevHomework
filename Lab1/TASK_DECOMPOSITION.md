# Task Decomposition

## Project
Lab 1 - Modern Web Development & AI-Assisted Engineering

## Technology Constraints
- Semantic HTML5
- Modern CSS
- Vanilla JavaScript ES6+
- No jQuery
- No Bootstrap
- No Tailwind CSS
- No external CDN
- Mobile-first design
- Minimum supported viewport: 375px

## Tasks

### T-01 Semantic HTML
- Build the semantic landmark structure.
- Use header, nav, main, section, and footer appropriately.
- Include an accessible skip link.
- Avoid unnecessary div elements.

### T-02 CSS Foundation
- Implement CSS custom properties.
- Implement box-sizing reset.
- Establish typography and spacing tokens.

### T-03 Responsive Layout
- Build responsive layouts using CSS Grid and Flexbox.
- Ensure the page works at 375px without horizontal scrolling.

### T-04 JavaScript
- Implement JavaScript functionality using Vanilla JS and ES6+.
- Use querySelector/querySelectorAll and classList where appropriate.

### T-05 Accessibility and Quality
- Verify keyboard navigation.
- Verify semantic landmarks.
- Check responsive behavior.
- Check console errors.
- Check for XSS risks and unsafe innerHTML usage.


## T-01 Semantic HTML Contract

### Landmark hierarchy

The page must contain:

- Header
- Navigation
- Main
- Section
- Footer

### Accessibility requirements

- Include a skip link pointing to #main.
- Use exactly one h1.
- Do not skip heading levels.
- Use semantic elements instead of unnecessary div elements.
- All form inputs must have visible labels.

### Acceptance Criteria

- Semantic landmark structure is present.
- Skip link works.
- Exactly one h1 exists.
- No unnecessary div elements are used.
- Chrome DevTools Accessibility panel shows the expected landmark tree.

## Exercise 3 - Resilient Component

### State Machine

- Loading: show loading skeleton while data is being fetched.
- Live Data: show the fetched data when the request succeeds.
- Empty: show an empty state when the request succeeds but returns no data.
- Error: show an error message and Retry button when the request fails.
- Retry: allow the user to retry the failed request.

### Acceptance Criteria

- The component has explicit loading, live, empty, and error states.
- The Retry button triggers the data request again.
- The UI must not remain stuck in the loading state.
- No unescaped innerHTML is used.
- No console errors.

## Homework 2 – Drum Kit Engine

### Project Objective

Build an interactive drum kit using Vanilla JavaScript, semantic HTML5, and modern CSS. The application must support mouse interaction, keyboard controls, polyphonic audio playback, and timestamped beat recording.

### Technology Constraints

- HTML5, CSS3, Vanilla JavaScript ES6+
- No external frameworks or libraries
- No inline JavaScript event handlers
- No unescaped `innerHTML`
- Mobile-first responsive design

### HW2-T01 – HTML Sound Contract

- Define interactive drum pads using HTML buttons.
- Each drum pad must contain `data-key` and `data-sound` attributes.
- Keep audio file paths separate from JavaScript logic.
- Use accessible labels for drum pads.

**Acceptance Criteria:** Each drum pad has a valid key binding and sound path.

### HW2-T02 – Polyphonic Audio Engine

- Implement an independent `playSound()` function.
- Support overlapping audio playback.
- Handle audio playback failures gracefully.
- Keep audio playback logic separate from event listeners.

**Acceptance Criteria:** Multiple drum sounds can play without stopping each other.

### HW2-T03 – Keyboard Event Handling

- Use the standard `keydown` event.
- Use `event.key` instead of deprecated `keyCode`.
- Ignore repeated keydown events using `event.repeat`.
- Support both mouse clicks and keyboard input.

**Acceptance Criteria:** Drum pads respond correctly to keyboard and mouse interaction.

### HW2-T04 – FIFO Beat Recorder

- Record drum events with timestamps.
- Preserve event order using a FIFO queue.
- Allow users to start, stop, and replay recordings.
- Prevent overlapping playback sessions.

**Acceptance Criteria:** Recorded beats replay in their original order with approximately the same timing.

## Homework 3 – Resilient Event Hub

### Objective

Build a responsive event landing page featuring a drift-free countdown timer, a registration form state machine, and secure input handling.

### Technology Constraints

- Semantic HTML5
- Modern CSS3
- Vanilla JavaScript ES6+
- No external frameworks or CDNs
- Mobile-first responsive layout (375px)
- No unsafe innerHTML or inline event handlers

### HW3-T01 – Countdown Engine

**Contract:**
- Store the event deadline as a UTC ISO 8601 timestamp.
- Calculate remaining time from the difference between the deadline and the current time.
- Display days, hours, minutes, and seconds.
- Stop updating when the countdown reaches zero.

**Acceptance Criteria:**
- The timer does not accumulate interval drift.
- The deadline is interpreted consistently across time zones.
- No negative countdown values are displayed.

### HW3-T02 – Registration Form State Machine

**States:**
- Idle
- Submitting
- Success
- Error

**Acceptance Criteria:**
- The UI reflects the current state.
- Submission transitions are explicitly controlled.
- Success and error feedback are accessible.

### HW3-T03 – Security and Double-Submit Prevention

**Acceptance Criteria:**
- Repeated submissions are blocked while submitting.
- User input is validated.
- User-provided text is rendered safely.
- No unescaped innerHTML is used.

### HW3-T04 – Verification

- Test countdown expiration and time zone handling.
- Test all form states.
- Test rapid double-click submissions.
- Test potentially malicious input.
- Test keyboard navigation and 375px responsiveness.

### HW3-T05 – AI Failure Audit

Create `AI_FAILURE_AUDIT.md` documenting three genuine AI-induced defects discovered during implementation.

For each defect, include:
1. Defect description.
2. Diagnostic method and evidence.
3. Refactored solution.
4. Verification result.

Do not invent defects or test results.

### Git Requirements

- Minimum five atomic commits.
- Separate implementation slices.
- Inspect Git diffs before committing.
- Avoid monolithic AI-generated changes.