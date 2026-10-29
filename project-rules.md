# Project Rules (Agent Context)

Course: Web Application Development, UIT (VNU-HCM). Source: Lab 1 and Lab 2 slides.
Parse this file before proposing any code change. If a request conflicts with a rule here, say so and ask before proceeding.

## 0. Scope

- Lab 1 stack (HW1-HW3 of Lab 1): vanilla HTML5, modern CSS, ES6+ JS. No frameworks, no CDN scripts.
- Lab 2 stack (Mini-React, state machines, HW1-HW3 of Lab 2): JS/TS with a modern bundler (Vite/esbuild) and the automatic JSX transform.
- Do not mix stacks. If the current task does not say which lab it belongs to, ask.

## 1. Workflow: anti-monolithic AI usage

1. Functional slicing: split the task into isolated sub-tasks.
2. Contract first: define interfaces, data attributes, and schemas before any implementation.
3. Atomic generation: work on exactly ONE sub-task at a time. Never handle more than one sub-task in a single step.
4. Independent verification: check output with tests, DevTools, and `git diff` before moving on.

Rules:
- Before writing code, add or update the sub-task in `TASK_DECOMPOSITION.md` (WBS, IDs like T-01, T-02A).
- Never produce a whole assignment in one shot. Never mix concerns in one change (HTML + CSS, CSS + JS).
- Do not add libraries or dependencies that were not approved. Ask first.
- Never claim code works without stating how it was verified.

## 2. Git

- One logical change per commit. Conventional Commits: `type(scope): message`.
- Types in use: `feat`, `fix`, `docs`, `perf`, `refactor`, `test`, `chore`.
- Banned: a commit adding 100+ lines across multiple files without a matching sub-task. Banned: commits that combine HTML+CSS or CSS+JS.
- Examples: `docs(spec): define component contracts & WBS table`, `feat(html): semantic landmark tree`, `feat(css): tokens & reset`, `feat(js): dark mode engine`, `feat(core): implement createElement factory`.
- Minimum commits per deliverable: Lab 1 portfolio >= 6, Lab 1 HW1 >= 4, Lab 1 HW3 >= 5, Lab 2 HW3 >= 8.
- Be ready to explain any line in the Git history.

## 3. HTML and accessibility

- Semantic elements only (`header`, `nav`, `main`, `section`, `article`, `footer`, `button`, `table`). Zero `<div>` where a semantic element exists ("div-soup" banned).
- Boilerplate: `<!DOCTYPE html>`, `<html lang="en">`, `<meta charset="UTF-8">`, viewport meta. Remove the `X-UA-Compatible` meta.
- Exactly one `<h1>` per page. Do not skip heading levels; use CSS for sizing.
- Every `<input>` has a visible `<label for>`. Do not rely on placeholders. Use `aria-describedby` for hints.
- Provide a skip-link to `#main-content`. Keyboard: full Tab + Enter flow, no focus traps.
- Images: descriptive `alt`, explicit `width` and `height` (prevents CLS), `loading="lazy"` where appropriate.
- Tables: `<caption>`, `<thead>`, `<tbody>`, `<th scope="col|row">`. No `border`, `cellpadding`, `align` attributes.
- Forms: native validation (`required`, `pattern`, `min`, `max`, `minlength`); only GET and POST natively. Use `<dialog>` + `showModal()` for modals.
- Use `<del>` or `<s>`, never `<strike>`.
- WCAG 2.2 AA: contrast >= 4.5:1.

## 4. CSS

- External stylesheet via `<link>`. No inline `style` attributes.
- Global reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`.
- Design tokens as custom properties in `:root`. Zero hardcoded hex codes in rules; colors go through variables.
- Dark mode: `@media (prefers-color-scheme: dark)` redefining tokens (or `light-dark()`).
- Flexbox for 1D, Grid for 2D. Use `gap`, not margin hacks on children.
- Responsive grid: `repeat(auto-fit, minmax(280px, 1fr))`. Mobile-first; verify 375px with zero horizontal scroll.
- Check Baseline status (Widely vs Newly Available) before using newer features.

## 5. JavaScript

- `const` by default, `let` only when reassigned. `var` and implicit globals are banned.
- Events: `keydown` + `e.key` / `e.code`. `keypress` and `e.keyCode` are banned. Check `e.repeat` to avoid audio flooding on held keys.
- No inline handlers (`onclick="..."`). Use `addEventListener` and centralized event delegation.
- Keep data out of logic: store config such as sound paths in `data-*` attributes instead of long switch-cases.
- Persist theme only via `localStorage` key `theme`.
- Timers: use `Date.now()` deltas (or UTC ISO 8601 timestamps) with `requestAnimationFrame`, never plain `setInterval` for countdowns.
- Async UI uses an explicit state machine: `IDLE | LOADING | SUCCESS | ERROR`. Include a retry action on error and a skeleton during loading.
- Clean up resources: `AbortController` for fetch, disconnect and release audio nodes, remove listeners.
- Never open pages via `file:///`. Use a local server (Live Server on `localhost:5500` or Vite).

## 6. Security

- Never assign user input to `innerHTML`. Use `textContent`, `createTextNode`, or DOM APIs. `target.replaceChildren(el)` to mount.
- Test XSS resistance with `<script>alert(1)</script>` and `<img onerror=alert(1)>` passed as child text.
- No inline event handlers. Target a strict CSP.
- Double-submit prevention and input sanitization on forms.

## 7. React / Mini-React (Lab 2)

- VNode is a plain object: `{ type, props: { ..., children: VNode[] } }`. Primitive children are wrapped as `TEXT_ELEMENT` with `nodeValue`.
- `createElement(type, props, ...children)`: `props || {}`, `flat(Infinity)`, drop `null`, `undefined`, `false`. Return new objects, no shared mutation.
- `renderToDOM(vNode)`: `createTextNode` for text, `createElement` for tags, assign props, `on*` -> `addEventListener(lowercase event)`, recurse over children.
- `useState`: external state array plus a cursor reset every render. The setter closes over its own cursor index. Accept function updaters, skip re-render when `Object.is` says unchanged.
- Rules of Hooks: top level only, never in conditions, loops, or nested functions.
- Reconciliation: different `type` -> replace; same type -> diff props and children. Keys must be stable unique IDs (`task.uuid`). Never `Math.random()` or array index.
- Event delegation hub at the root for `click`, `input`, `keydown`.
- Props flow downward and are never mutated. Components are pure functions of props and state.
- JSX: use the automatic runtime (`jsx: react-jsx`). No Babel standalone. Use Vite or esbuild.
- Optimize only after profiling. `memo`, `useMemo`, `useCallback` come after evidence, not before. Beware fresh object or array literals that defeat memo.
- Large lists: virtual windowing with `startIndex`, `endIndex`, `offsetY` (translateY), overscan buffer 2-3.
- Type contracts first (TypeScript interfaces) before implementation.

## 8. Required deliverables

- `project-rules.md` (this file, in repo root) and `TASK_DECOMPOSITION.md` (WBS, defined before prompting AI).
- `AI_FAILURE_AUDIT.md`: at least 3 AI-induced defects, each with: description, diagnostic method (git diff or DevTools), refactored fix. Worth 15%.
- Atomic Git history matching the sub-tasks.
- Live defense (60-180 s): the instructor changes one contract on the spot (for example `data-sound` -> `data-audio-src`, `className` -> `class`, add a Spacebar listener). Write code small and decoupled enough to change in one line.

## 9. Quality gates (check before saying "done")

1. Meets every stated acceptance criterion.
2. 375px viewport, no horizontal scroll.
3. Keyboard-only navigation works; WCAG 2.2 AA contrast.
4. Lighthouse clean (target 100 Accessibility and Best Practices), zero CLS (LCP <= 2.5s, INP <= 200ms, CLS <= 0.1).
5. Zero XSS hazards, zero unauthorized dependencies, no dead code, zero console errors.


> AI can generate code. Developers are responsible for proving that it is correct.
