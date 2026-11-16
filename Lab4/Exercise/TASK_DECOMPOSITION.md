# TASK_DECOMPOSITION.md — Lab 4: Multi-Route SPA Architecture

> **Course:** UIT – VNUHCM · Smart Software System Team (S3T)
> **Lab:** Lab 4 — Multi-Route SPA, Context Form Engine & Full-Stack React 19
> **Scope:** In-class exercises — Ex 1.1, 1.2, 1.2.1, 1.2.2 (Sprint 1) · Ex 1.3 (Sprint 2) · Ex 1.7.1 (Sprint 3)
> **Timebox:** 155 minutes (Block 1 → Block 4)
> **Stack:** React 19 · React Router v7 · Vite · Express · Vitest + React Testing Library · Supertest

---

## 0. Working Rules (from `project-rules.md`)

### 0.1 Strict 4-Stage Contract-First Loop — applies to EVERY task

| Stage | What to do | Output |
|---|---|---|
| **[1] Contract** | Define props / API / route / response shape | Spec written in the task's "Contract" section |
| **[2] Fail Test** | Write a failing automated test (RED) | `*.test.jsx` / `*.test.js` |
| **[3] Implement** | Write the minimal code that makes the test pass (GREEN) | Component / hook / route |
| **[4] Refactor** | Clean up the code while keeping tests green | Clean code, zero warnings |

### 0.2 Atomic Git Commits

- Each commit covers **one isolated scope** and uses Conventional Commits: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`.
- Each sprint must include its required number of commits (listed per sprint).
- **Never commit secrets**: commit only `.env.example`; `.env` stays in `.gitignore`.

### 0.3 Definition of Done (global)

- [x] All tests pass (`npm test`)
- [x] Zero warnings/errors in the DevTools Console
- [x] No deprecated APIs: `<Switch>`, `<Redirect>`, `exact`, `activeClassName`, `component={...}`, `defaultProps`, `@material-ui/core`, `react-media`, `typeface-roboto`
- [x] No `useEffect` used for form validation
- [x] Any faulty AI-generated code is logged in `AI_FAILURE_AUDIT.md`

---

## 1. Work Breakdown Structure (WBS)

### 1.1 WBS Hierarchy

```
1.0  Lab 4 — Multi-Route SPA Architecture
│
├── 1.1  Project Setup & Planning                       (Block 1 · 0–40m)
│   ├── 1.1.1  Scaffold Vite + React 19 client and Express server
│   ├── 1.1.2  Install modern dependencies
│   ├── 1.1.3  Configure test tooling
│   └── 1.1.4  Governance documents
│       ├── 1.1.4.1  project-rules.md
│       ├── 1.1.4.2  TASK_DECOMPOSITION.md
│       ├── 1.1.4.3  .env.example + .gitignore
│       └── 1.1.4.4  AI_FAILURE_AUDIT.md (template)
│
├── 1.2  Sprint 1 — Router Migration & Master-Detail    (Block 2 · 40–75m)
│   ├── 1.2.1  Ex 1.2   Declarative syntax update (<Switch> → <Routes>)
│   ├── 1.2.2  Ex 1.2.1 Nested layout, <Outlet />, active NavLink
│   ├── 1.2.3  Ex 1.2.2 Master-detail view
│   │   ├── 1.2.3.1  PeopleLayout.jsx (sidebar + Outlet)
│   │   ├── 1.2.3.2  PersonDetail.jsx (useParams + find + 404)
│   │   └── 1.2.3.3  Responsive CSS Grid layout
│   ├── 1.2.4  Ex 1.1   Code-splitting with React.lazy + <Suspense> + Skeleton
│   └── 1.2.5  Sprint 1 verification & commits
│
├── 1.3  Sprint 2 — Context-Driven Form Engine          (Block 3 · 75–120m)
│   ├── 1.3.1  Ex 1.3   Audit of the 5-useEffect validation anti-pattern
│   ├── 1.3.2  FormContext.js + useFormContext
│   ├── 1.3.3  SimpleForm.jsx + validateForm (derived validation)
│   ├── 1.3.4  InputField.jsx (useId, aria-invalid, aria-describedby)
│   ├── 1.3.5  ShowData.jsx (semantic <dl> inspector)
│   └── 1.3.6  Sprint 2 verification & commits
│
└── 1.4  Sprint 3 — Full-Stack Hook & Express REST API  (Block 4 · 120–155m)
    ├── 1.4.1  Express server: CORS + GET /api/messages/:forum
    ├── 1.4.2  POST /api/messages/:forum + payload validation
    ├── 1.4.3  useForumMessages.js (AbortController)
    ├── 1.4.4  Live channel switcher UI
    ├── 1.4.5  Network (Slow 3G) & error-log verification
    └── 1.4.6  Sprint 3 verification & commits
```

### 1.2 WBS Dictionary

| WBS ID | Work Package | Deliverable | Est. | Depends on | Status |
|---|---|---|---|---|---|
| **1.1** | **Project Setup & Planning** | Runnable repo skeleton + governance docs | **40m** | — | ☑ |
| 1.1.1 | Scaffold projects | `client/` (Vite + React 19), `server/` (Express) | 5m | — | ☑ |
| 1.1.2 | Install dependencies | `react-router`, `express`, `cors` | 5m | 1.1.1 | ☑ |
| 1.1.3 | Configure test tooling | Vitest, RTL, jest-dom, jsdom, Supertest configured | 10m | 1.1.2 | ☑ |
| 1.1.4.1 | Project rules | `project-rules.md` | 5m | — | ☑ |
| 1.1.4.2 | Task decomposition | `TASK_DECOMPOSITION.md` (this file) | 10m | — | ☑ |
| 1.1.4.3 | Env template | `.env.example`, `.gitignore` | 3m | 1.1.1 | ☑ |
| 1.1.4.4 | AI audit template | `AI_FAILURE_AUDIT.md` | 2m | — | ☑ |
| **1.2** | **Sprint 1 — Router** | Multi-route master-detail directory | **35m** | 1.1 | ☑ |
| 1.2.1 | Ex 1.2 — Routes migration | `App.jsx` using `<Routes>` + `element` | 5m | 1.1.3 | ☑ |
| 1.2.2 | Ex 1.2.1 — Nested layout | `Layout.jsx` with `<Outlet />` + `NavLink` | 5m | 1.2.1 | ☑ |
| 1.2.3.1 | PeopleLayout | `PeopleLayout.jsx` + tests | 7m | 1.2.2 | ☑ |
| 1.2.3.2 | PersonDetail | `PersonDetail.jsx` + tests | 7m | 1.2.3.1 | ☑ |
| 1.2.3.3 | Grid layout | `people.css` | 3m | 1.2.3.1 | ☑ |
| 1.2.4 | Ex 1.1 — Lazy loading | `Skeleton.jsx`, lazy route | 5m | 1.2.3.2 | ☑ |
| 1.2.5 | Verification & commits | 2 atomic commits, DevTools clean | 3m | 1.2.1–1.2.4 | ◐ verified · commits pending |
| **1.3** | **Sprint 2 — Form Engine** | Synchronous context form + inspector | **45m** | 1.1 | ☑ |
| 1.3.1 | Ex 1.3 — Anti-pattern audit | Audit table (section 4) | 5m | — | ☑ |
| 1.3.2 | FormContext | `FormContext.js` + test | 7m | 1.1.3 | ☑ |
| 1.3.3 | SimpleForm | `SimpleForm.jsx`, `validateForm.js` + tests | 12m | 1.3.2 | ☑ |
| 1.3.4 | InputField | `InputField.jsx` + tests | 10m | 1.3.2 | ☑ |
| 1.3.5 | ShowData | `ShowData.jsx` + test | 7m | 1.3.3 | ☑ |
| 1.3.6 | Verification & commits | 3 atomic commits, Profiler check | 4m | 1.3.2–1.3.5 | ◐ verified · commits pending |
| **1.4** | **Sprint 3 — Full-Stack** | Working client ↔ API data flow | **35m** | 1.1 | ☑ |
| 1.4.1 | GET endpoint + CORS | `app.js`, `server.js` + Supertest | 7m | 1.1.3 | ☑ |
| 1.4.2 | POST endpoint + validation | POST route + tests | 7m | 1.4.1 | ☑ |
| 1.4.3 | Custom hook | `useForumMessages.js` + tests | 10m | 1.4.1 | ☑ |
| 1.4.4 | Channel switcher | `ChannelSwitcher.jsx` | 5m | 1.4.3 | ☑ |
| 1.4.5 | Network verification | `docs/sprint3-network.png`, `docs/sprint3-error-log.md` | 4m | 1.4.4 | ☑ |
| 1.4.6 | Verification & commits | Atomic commits | 2m | 1.4.1–1.4.5 | ◐ verified · commits pending |

### 1.3 Timeline

| Block | Time | WBS | Exercise | Required commits |
|---|---|---|---|---|
| Block 1 | 0–40m | 1.1 | Setup & WBS decomposition | 3 (`init:`, `docs:` ×2) |
| Block 2 | 40–75m | 1.2 | Ex 1.1, 1.2, 1.2.1, 1.2.2 | **2** |
| Block 3 | 75–120m | 1.3 | Ex 1.3 | **3** |
| Block 4 | 120–155m | 1.4 | Ex 1.7.1 | 5 (suggested) |

---

## 2. Block 1 — Project Setup & Planning (WBS 1.1 · 0–40m)

| WBS ID | Task | Details |
|---|---|---|
| 1.1.1 | Scaffold | `npm create vite@latest client -- --template react`; create `server/` with `npm init -y` |
| 1.1.2 | Dependencies | Client: `react-router`. Server: `express`, `cors`. **Do not** install `react-router-dom@5`, `@material-ui/core`, `react-media`, `typeface-roboto` |
| 1.1.3 | Test tooling | Client: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`. Server: `vitest` (or `jest`) + `supertest` |
| 1.1.4.1 | `project-rules.md` | 4-stage loop, commit conventions, lint rules, banned APIs list |
| 1.1.4.2 | `TASK_DECOMPOSITION.md` | This file |
| 1.1.4.3 | `.env.example` | `PORT=3001`, `CLIENT_ORIGIN=http://localhost:5173`, `MONGODB_URI=` (empty) |
| 1.1.4.4 | `AI_FAILURE_AUDIT.md` | Template: Prompt · AI output · Failure · How detected · Fix & verification |

**Commits:**
```
init: scaffold lab 4 multi-route SPA
docs: define contract spec in project-rules.md
docs: add task decomposition and env template
```

---

## 3. Block 2 — Sprint 1: Router Migration & Master-Detail (WBS 1.2 · 40–75m)

> **Sprint goal:** Responsive Master-Detail Directory & Case Dossier Router using React Router v7 `<Outlet />` and `useParams()`.

### WBS 1.2.1 — Ex 1.2: Declarative Syntax Update

**[1] Contract**
- `<Switch>` → `<Routes>`
- `component={X}` / `render={...}` → `element={<X />}`
- Remove the `exact` prop (v7 matches exactly by default)
- Import from `'react-router'`

**[2] Fail Test** — `App.test.jsx`
- [x] Render `<App />` inside `MemoryRouter initialEntries={['/']}` → `Home` content is visible
- [x] `initialEntries={['/about']}` → `About` content is visible

**[3] Implement** — `App.jsx` with `<Routes>` + `<Route element>`

**[4] Refactor** — `grep -rE "Switch|exact|component=" src/` returns nothing

### WBS 1.2.2 — Ex 1.2.1: Nested Layout + Active NavLink

**[1] Contract**
- `<Route path="/" element={<Layout />}>` contains child routes `index` and `about`
- `Layout` renders `<nav>` + `<Outlet />`
- `NavLink className={({ isActive }) => isActive ? 'active' : ''}` (replaces `activeClassName`)

**[2] Fail Test**
- [x] At `/about`, the "About" link has class `active`; "Home" does not
- [x] The nav is rendered on every child route

**[3] Implement** — `Layout.jsx`

**[4] Refactor** — Move `Layout` to its own file, remove dead code

### WBS 1.2.3 — Ex 1.2.2: Master-Detail View

**[1] Contract**

| Item | Spec |
|---|---|
| Routes | `/people` → `PeopleLayout`; child `:id` → `PersonDetail` |
| `PeopleLayout({ people })` | `<div className="people-frame">` → `<nav className="sidebar">` (map `NavLink to={/people/${p.id}}`, class `active-link` / `link`) + `<main className="content-area"><Outlet /></main>` |
| `PersonDetail({ people })` | `const { id } = useParams()`; `people.find(p => p.id === id)`; not found → `<div role="alert">404: Person Not Found</div>` |
| Detail markup | `<dl className="person-details">` with `<dt>Name</dt><dd>…</dd>`, `<dt>Role</dt><dd>…</dd>` |
| CSS | `.people-frame { display: grid; grid-template-columns: minmax(280px, 1fr) 2fr; }` + `@media` single-column on mobile |

**[2] Fail Test** — `PeopleLayout.test.jsx`, `PersonDetail.test.jsx`
- [x] Sidebar renders N `NavLink`s from the `people` array
- [x] At `/people/2`, the link for id=2 has class `active-link`
- [x] At `/people/2`, `<dd>` elements show the correct name/role
- [x] At `/people/999`, `getByRole('alert')` contains "404"
- [x] Details are rendered with `<dl>/<dt>/<dd>` (`getByRole('term')` / `getByRole('definition')`)

**[3] Implement** — `PeopleLayout.jsx`, `PersonDetail.jsx`, `people.data.js`, `people.css`

**[4] Refactor**
- Compare IDs of the same type (string vs string) to avoid `===` mismatches between number and string
- Use native CSS Grid + `@media` (no `react-media`)
- Use default parameters instead of `defaultProps`: `function PersonDetail({ people = [] })`

### WBS 1.2.4 — Ex 1.1: Code-Splitting & Suspense

**[1] Contract**
- `const PersonDetail = React.lazy(() => import('./PersonDetail'))`
- Wrap the route in `<Suspense fallback={<Skeleton />}>`
- `Skeleton` matches the dimensions of `PersonDetail` → **CLS = 0**
- `Skeleton` has `aria-busy="true"` and `aria-live="polite"`

**[2] Fail Test**
- [x] First render shows a skeleton with `aria-busy="true"`
- [x] `await findByText(<name>)` → real content replaces the skeleton

**[3] Implement** — `Skeleton.jsx`, update router

**[4] Refactor** — Network tab: confirm a separate JS chunk is loaded for `PersonDetail`

### WBS 1.2.5 — Sprint 1 Verification

- [x] DevTools Console: **0 warnings**
- [x] `/people/:id` parses correctly; a page refresh still shows the right person
- [x] An invalid ID shows the 404 boundary without crashing
- [x] CLS = 0 during lazy load — measured with a `layout-shift` PerformanceObserver under Slow 3G (skeleton 352px = card 352px); Lighthouse report not run

**Required commits (2):**
```
feat: router layout          # 1.2.1 + 1.2.2 + PeopleLayout
feat: detail route handling  # PersonDetail + 404 + lazy/Suspense
```
*(Optionally add a `test:` commit before each `feat:` to show the Fail Test stage.)*

---

## 4. Block 3 — Sprint 2: Context-Driven Form Engine (WBS 1.3 · 75–120m)

> **Sprint goal:** A multi-field form validated **synchronously during the render pass**, **with no `useEffect`**, showing `<ShowData />` on a valid submit.

### WBS 1.3.1 — Ex 1.3: Legacy Anti-Pattern Audit

| # | Legacy effect | Problem | Replacement |
|---|---|---|---|
| 1 | `syncToParent()` in InputField | Redundant re-renders | State lives in `SimpleForm`; InputField is a controlled component |
| 2 | `validateField()` | Runs after render → one cycle late | `const errors = validateForm(values)` during render |
| 3 | `calcFormValidity()` | Redundant state | `const isValid = Object.keys(errors).length === 0` |
| 4 | `syncErrorsToChild()` | Circular dependency → *Maximum update depth exceeded* | Read `errors` from context |
| 5 | `autoScrollToError()` | Runs on every keystroke | Handle only inside the `onSubmit` handler |

**Result:** 5 re-renders per keystroke → **1 render pass per keystroke**.

### WBS 1.3.2 — FormContext.js

**[1] Contract**
- `export const FormContext = createContext(null)`
- `export const useFormContext = () => useContext(FormContext)`
- Value: `{ values, errors, handleChange }`

**[2] Fail Test**
- [x] A child calling `useFormContext()` inside the Provider can read `values`

**[3] Implement** → **[4] Refactor** (optionally throw a clear error when used outside the Provider)

### WBS 1.3.3 — SimpleForm.jsx

**[1] Contract**
- `const [values, setValues] = useState(initial)`
- `const errors = validateForm(values)` — **derived, not state**
- `validateForm` is a **pure function** (unit-testable in isolation)
- Minimum rules: `name` required; `email` valid format; `age` numeric ≥ 18 (optional)

**[2] Fail Test**
- [x] `validateForm({ name: '' })` returns `{ name: '...' }` (unit test)
- [x] Typing invalid input shows the error **immediately** (no `waitFor` needed)
- [x] Submit is blocked while errors exist
- [x] `grep useEffect SimpleForm.jsx InputField.jsx` returns nothing

**[3] Implement** → **[4] Refactor**

### WBS 1.3.4 — InputField.jsx

**[1] Contract**
- `const id = useId(); const errorId = \`${id}-error\``
- `<label htmlFor={id}>`
- `<input id={id} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} {...props} />`
- Error: `<span id={errorId} role="alert">`

**[2] Fail Test**
- [x] `getByLabelText('Email')` finds the input (label binding works)
- [x] With an error: `aria-invalid="true"` and `aria-describedby` points to the error element
- [x] When valid: no `aria-describedby`

**[3] Implement** → **[4] Refactor** — make sure `{...props}` is spread onto `<input>`

### WBS 1.3.5 — ShowData.jsx

**[1] Contract**
- Takes `data` (object) → renders `<dl className="json-inspector">`
- Each pair: `<div key={key} className="data-row"><dt>{key}</dt><dd>{String(val)}</dd></div>`
- Shown only after a valid submit (no raw `JSON.stringify` dump)

**[2] Fail Test**
- [x] Before submit: no `.json-inspector`
- [x] After a valid submit: exactly one `<dt>/<dd>` pair per field

**[3] Implement** → **[4] Refactor**

### WBS 1.3.6 — Sprint 2 Verification

- [x] **1 commit per keystroke** — asserted with React `<Profiler onRender>` in `SimpleForm.test.jsx` (React DevTools UI check still recommended for the demo)
- [x] No `useEffect` in the form engine
- [ ] Screen reader announces labels and error messages — label/`aria-describedby`/`role="alert"` wiring verified by tests; **manual NVDA/Narrator check not done yet**
- [x] Console: 0 warnings

**Required commits (3):**
```
feat: form context              # FormContext + SimpleForm + validateForm
feat: input field validation    # InputField useId + aria-*
feat: inspector output          # ShowData
```

---

## 5. Block 4 — Sprint 3: Full-Stack Custom Hook & Express REST API (WBS 1.4 · 120–155m)

> **Sprint goal:** Full-stack data fetching across channels `nasa`, `esports-tribunal`, `notNasa`; in-flight requests are cancelled with `AbortController` on rapid channel switches.

### WBS 1.4.1 — Express Server: CORS + GET

**[1] Contract**

| Method | Route | Response |
|---|---|---|
| `GET` | `/api/messages/:forum` | `200` + `Message[]` |

- `app.use(cors({ origin: process.env.CLIENT_ORIGIN }))` (default `http://localhost:5173`)
- `app.use(express.json())`
- `Message = { id: string, author: string, text: string, timestamp: string }`
- In-memory seed data for all 3 forums

**[2] Fail Test** — `server.test.js` (Supertest)
- [x] `GET /api/messages/nasa` → `200`, body is an array
- [x] Response includes the correct `Access-Control-Allow-Origin` header

**[3] Implement** → **[4] Refactor** — export `app` separately from `app.listen` so it can be tested

### WBS 1.4.2 — POST + Payload Validation

**[1] Contract**

| Method | Route | Body | Response |
|---|---|---|---|
| `POST` | `/api/messages/:forum` | `{ author, text }` | `201` + new message · `400` `{ error: 'Missing required fields' }` |

- `id: crypto.randomUUID()`, `timestamp: new Date()`
- Pick only allowed fields (`author`, `text`) — do not spread the whole `req.body`

**[2] Fail Test**
- [x] Missing `text` or `author` → `400`
- [x] Valid body → `201` with a UUID `id`
- [x] After POST, a GET on the same forum includes the new message

**[3] Implement** → **[4] Refactor** — also validate types (`typeof === 'string'`, trim, max length)

### WBS 1.4.3 — useForumMessages.js

**[1] Contract**
- Signature: `useForumMessages(forumId) → { data, loading, error, postMessage, refetch }`
- Inside `useEffect([forumId])`: create `new AbortController()`, call `fetch(url, { signal })`
- `try / catch / finally` each guarded with `if (!controller.signal.aborted)`
- Ignore `AbortError` (no logging)
- Cleanup: `return () => controller.abort()`
- ~~`setLoading(true)` whenever `forumId` changes~~ → **revised (see AI-01):** `loading` is *derived* from a result tagged `{ forumId, version }`, so no setState runs synchronously in the effect body (`react(set-state-in-effect)`) and `finally` is no longer needed
- `postMessage(payload)` → POST, then refetch (or optimistic update)

**[2] Fail Test** (mocked `fetch`)
- [x] On mount: `loading=true`, then `data` is populated and `loading=false`
- [x] Rapid switch A → B: request A is aborted, final `data` belongs to B (no race condition)
- [x] Unmount during fetch → no state-update warning

**[3] Implement** → **[4] Refactor** — replace any `didCancel` boolean flag with `AbortController`; derive `loading` (oxlint 0 warnings)

### WBS 1.4.4 — Channel Switcher UI

- [x] Buttons/tabs for `nasa`, `esports-tribunal`, `notNasa`
- [x] Messages rendered in a `<dl>` using `<React.Fragment key={msg.id}>` with `<dt>{author}</dt><dd>{text}</dd>`
- [x] Message form calls `postMessage`
- [x] Loading/error states use `aria-live="polite"`

### WBS 1.4.5 — Network & Error-Log Verification

- [x] Chrome DevTools → Network → **Slow 3G**
- [x] Switch channels rapidly → old requests show as **(canceled)**
- [x] Network capture → `docs/sprint3-network.png` (rendered from CDP `requestfailed` events, not a DevTools-panel screenshot)
- [x] Stop the server → UI shows an error without crashing → save log to `docs/sprint3-error-log.md`

### WBS 1.4.6 — Sprint 3 Verification

- [x] 0 unhandled promise rejections
- [x] Stale requests cancelled on channel switch
- [x] POST with missing fields → 400; valid → 201
- [x] No hardcoded secrets; config via `process.env`

**Suggested commits:**
```
feat: express messages api with cors
feat: post payload validation with randomUUID
feat: useForumMessages hook with abort controller
feat: live channel switcher
docs: full-stack error log verification
```

---

## 6. Expected Repository Structure

```
repository-root/
├── project-rules.md
├── TASK_DECOMPOSITION.md
├── AI_FAILURE_AUDIT.md
├── .env.example
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx               # createRoot + <BrowserRouter>
│   │   ├── layouts/Layout.jsx
│   │   ├── pages/Pages.jsx        # Home, About, NotFound, PageShell
│   │   ├── people/
│   │   │   ├── PeopleLayout.jsx
│   │   │   ├── PersonDetail.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── people.data.js
│   │   │   └── people.css
│   │   ├── form/
│   │   │   ├── FormContext.js
│   │   │   ├── SimpleForm.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── ShowData.jsx
│   │   │   ├── validateForm.js
│   │   │   └── form.css
│   │   ├── forum/
│   │   │   ├── useForumMessages.js
│   │   │   ├── ChannelSwitcher.jsx
│   │   │   ├── MessageForm.jsx
│   │   │   └── forum.css
│   │   └── __tests__/             # 11 files · 51 tests
│   └── scripts/
│       ├── vitest.mjs             # Windows drive-letter workaround (AI-02)
│       └── verify-lab4.mjs        # headless-Chrome E2E evidence
├── server/
│   ├── app.js                 # createApp() — testable, no listen()
│   ├── seed.js                # in-memory seed for 3 forums
│   ├── server.js              # app.listen(PORT)
│   └── __tests__/server.test.js   # 17 Supertest tests
└── docs/
    ├── sprint3-network.png
    ├── sprint3-error-log.md
    ├── sprint3-forum-slow3g.png · sprint3-api-down.png
    ├── sprint1-person-detail.png · sprint2-form.png · mobile-375px-people.png
    └── verification.json      # 19/19 browser checks
```

---

## 7. Progress Tracker

| WBS | Phase | Work packages | Tests | Commits | DevTools check | Done |
|---|---|---|---|---|---|---|
| 1.1 | Setup & Planning | 7/7 | — | 0/3 | — | ◐ commits pending |
| 1.2 | Sprint 1 — Router | 7/7 | 17/17 | 0/2 | ☑ (headless Chrome) | ◐ commits pending |
| 1.3 | Sprint 2 — Form Engine | 6/6 | 21/21 | 0/3 | ☑ (`<Profiler>` test) | ◐ commits pending |
| 1.4 | Sprint 3 — Full-Stack | 6/6 | 13/13 client + 17/17 server | 0/5 | ☑ (Slow 3G, API-down) | ◐ commits pending |

**Last verified 2026-11-16:** `client: npm test` 51/51 · `server: npm test` 17/17 · `npm run lint` 0 warnings · `npm run build` OK (separate `PersonDetail-*.js` chunk) · `npm run verify` 19/19.
