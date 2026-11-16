# UIT S3T — Lab 4 AI Governance Rules

> **Lab:** Lab 4 — Multi-Route SPA, Context Form Engine & Full-Stack React 19
> **Scope:** In-class exercises Ex 1.1, 1.2, 1.2.1, 1.2.2 (Sprint 1) · Ex 1.3 (Sprint 2) · Ex 1.7.1 (Sprint 3)
> **Companion files:** `TASK_DECOMPOSITION.md` (WBS + contracts), `AI_FAILURE_AUDIT.md` (verified AI defects)

## A. Stack

| Layer | Allowed | Banned |
|---|---|---|
| Client | React 19 · Vite · React Router **v7** (`react-router`) | `react-router-dom@5`, `@material-ui/core`, `react-media`, `typeface-roboto` |
| Server | Node 24 · Express 5 · `cors` | Hardcoded secrets, spreading `req.body` into stored records |
| Tests | Vitest · React Testing Library · jest-dom · jsdom · Supertest | Snapshot-only tests that assert nothing about behaviour |
| Lint | Oxlint (`react`, `jsx-a11y`, `oxc` plugins) | Disabling rules to hide warnings |

## B. Strict 4-Stage Contract-First Loop (every task)

1. **Contract** — write props / route / API / response shape in `TASK_DECOMPOSITION.md` first.
2. **Fail Test** — write an automated test and watch it fail (RED).
3. **Implement** — the minimal code that makes the test pass (GREEN).
4. **Refactor** — clean up while staying green; `npm run lint` must report 0 warnings.

Never generate a whole sprint in one prompt. Work on exactly one WBS package at a time.

## C. Banned legacy APIs

`<Switch>`, `<Redirect>`, `exact`, `activeClassName`, `component={...}`, `render={...}`, `withRouter`, `useHistory`,
component `defaultProps`, `class extends React.Component`, `ReactDOM.render`, `keyCode`, `window.alert`.

Use instead: `<Routes>`, `<Navigate>`, `element={<X />}`, `NavLink className={({ isActive }) => ...}`,
`useNavigate`, `useParams`, ES default parameters, `createRoot`.

## D. React rules

1. **Derived state stays derived.** Validation results, validity flags and filtered lists are computed during render. **No `useEffect` for form validation.**
2. **Effects clean up.** Every fetch in an effect owns an `AbortController`; cleanup calls `controller.abort()`. `AbortError` is never shown to the user.
3. **Accessible forms.** Each input has a visible `<label htmlFor>` with an id from `useId()`; errors are linked with `aria-invalid` + `aria-describedby` and rendered with `role="alert"`.
4. **Semantic markup.** Key/value data uses `<dl>/<dt>/<dd>`; navigation uses `<nav>`; the page has one `<main>` and one `<h1>`.
5. **Stable keys.** Keys come from entity ids (`person.id`, `msg.id`), never array indices or `Math.random()`.
6. **Type-safe comparisons.** Route params are strings — compare ids as strings (`String(p.id) === id`).
7. **Zero CLS on lazy load.** `<Suspense>` fallbacks have the same box dimensions as the content they replace.

## E. Server rules

1. Export `app` from `app.js` separately from `app.listen()` in `server.js` so Supertest can import it.
2. Config comes from `process.env` (`PORT`, `CLIENT_ORIGIN`); only `.env.example` is committed.
3. Pick allowed fields explicitly (`author`, `text`), validate type, trim and max length; reply `400 { error }` on bad input.
4. Ids come from `crypto.randomUUID()`; timestamps are ISO 8601 strings.

## F. Git

- Conventional Commits with lab scope, e.g. `feat(lab4): router layout`.
- Atomic: one WBS package (or one prescribed sprint commit) per commit. Required: Sprint 1 → 2, Sprint 2 → 3, Sprint 3 → 5 (suggested).
- Never commit `.env`, `node_modules`, `dist`.

## G. Definition of Done

- [ ] `npm test` passes in `client/` and `server/`
- [ ] `npm run lint` → 0 warnings, 0 errors; `npm run build` succeeds
- [ ] Browser Console has 0 warnings/errors
- [ ] `grep` for banned APIs returns nothing
- [ ] Every verified AI defect is logged in `AI_FAILURE_AUDIT.md` — evidence is never invented

> AI can generate code. Developers are responsible for proving that it is correct.
