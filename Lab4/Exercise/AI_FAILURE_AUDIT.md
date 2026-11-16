# AI FAILURE AUDIT — LAB 4 / IN-CLASS EXERCISES

**Project:** Multi-Route SPA, Context Form Engine & Full-Stack React 19 (React Router v7 · Vite · Express 5)
**Recorded on:** 2026-11-16
**AI assistant:** Claude Code (Claude Opus 5.5)
**Evidence sources:** real `oxlint`, `vitest`, Supertest and headless-Chrome output captured during development. Nothing below is reconstructed or invented; entries say explicitly when a defect was caught by review rather than reproduced at runtime.

| ID | Sprint / WBS | Category | Severity | Detected by | Status |
|---|---|---|---|---|---|
| AI-01 | S3 · 1.4.3 | Effect hygiene (setState in effect) | Medium | `oxlint` (react plugin) | ✅ Fixed & verified |
| AI-02 | Setup · 1.1.3 | Tooling / false "it works" claim | High (blocks all tests) | Re-running tests from Git Bash | ✅ Fixed & verified |
| AI-03 | S3 · 1.4.1 | CORS origin mismatch | High (blocks all API calls) | Code review → reproduced with Supertest | ✅ Fixed & verified |
| AI-04 | S1 · 1.2.3.2 / S2 · 1.3.3 | Broken AI-written tests | Low | `vitest` failures | ✅ Fixed & verified |
| AI-05 | S3 · 1.4.4 | Accessibility lint errors | Low | `oxlint` (jsx-a11y) | ✅ Fixed & verified |

---

## AI-01 — `setLoading(true)` called synchronously inside the fetch effect

### AI prompt / context
Implement WBS 1.4.3 exactly as the contract in `TASK_DECOMPOSITION.md` describes:
*"Inside `useEffect([forumId])` … `try / catch / finally` each guarded with `if (!controller.signal.aborted)` … `setLoading(true)` whenever `forumId` changes."*

### AI-generated code (relevant excerpt)

```js
useEffect(() => {
  const controller = new AbortController();
  setLoading(true);   // ← synchronous setState in the effect body
  setError(null);
  (async () => {
    try { /* fetch … setData(messages) */ }
    catch (err) { /* … */ }
    finally { if (!controller.signal.aborted) setLoading(false); }
  })();
  return () => controller.abort();
}, [forumId, version]);
```

### Actual issue
All 7 hook tests passed, so the defect was invisible to the test suite. `npx oxlint` reported:

```text
src/forum/useForumMessages.js:32:5: error react(set-state-in-effect): Calling setState synchronously
  within an effect can trigger cascading renders
src/forum/useForumMessages.js:57:16: warning react(exhaustive-effect-dependencies): Found extra effect dependencies
```

- Every channel switch caused an extra render pass (render → effect → `setLoading(true)` → render again).
- `version` was listed as a dependency but never read inside the effect — it was only used as a re-run trigger, which the linter flagged as an "extra" dependency.
- The AI followed the contract literally instead of checking it against Rule D.1 of `project-rules.md` ("derived state stays derived").

### Engineering refactor
Store **one settled result tagged with the request that produced it**, and derive `loading`:

```js
const [result, setResult] = useState({ forumId: null, version: -1, data: [], error: null });
// effect: only sets state after `await`, and only if !controller.signal.aborted
const sameForum = result.forumId === forumId;
const loading = !sameForum || result.version !== version;
return { data: sameForum ? result.data : [], loading, error: sameForum && !loading ? result.error : null, … };
```

Side benefit: the previous forum's messages can never be shown under the new channel name, because `data` is hidden whenever the tag doesn't match.

### Verification
- [x] `npx oxlint` → exit 0, no output
- [x] `useForumMessages.test.jsx` 7/7 pass, including *rapid A → B switch*, *unmount aborts*, *no stale data while loading*
- [x] Headless Chrome under Slow 3G: 4 stale requests `(canceled) net::ERR_ABORTED`, final channel `#Not NASA` (see `docs/sprint3-network.png`)

**Contract deviation recorded:** WBS 1.4.3 now says `loading` is derived and `finally` is not needed.

---

## AI-02 — Vitest "fixed" by a config change that only worked in PowerShell

### Context
The first `vitest run` from `client/` passed (17/17). The very next run failed every suite:

```text
FAIL  src/__tests__/App.test.jsx [ src/__tests__/App.test.jsx ]
TypeError: Cannot read properties of undefined (reading 'config')
 ❯ src/__tests__/App.test.jsx:14:1
 Test Files  4 failed (4)
      Tests  no tests
```

Root cause (confirmed): the editor starts Node with a lower-case drive letter (`c:\Users\…`). Vitest then loads its runner module twice (`c:` vs `C:`), so `describe` from the test file talks to a different instance than the one running the suite. Running from `/c/Users/…` → `C:\…` passed 17/17.

### AI-generated "fix"

```js
// vite.config.js
if (process.platform === 'win32' && /^[a-z]:/.test(process.cwd())) {
  process.chdir(process.cwd()[0].toUpperCase() + process.cwd().slice(1));
}
```

The AI re-ran the suite **from PowerShell**, saw `Tests 17 passed`, and treated the fix as verified.

### Actual issue
PowerShell's `Set-Location` had already normalised the drive letter, so the test proved nothing. From Git Bash (lower-case `c:` cwd) the next run failed again — 9/9 suites, same error. Vitest resolves its own module paths **before** it loads `vite.config.js`, so `chdir` there is too late. The config block was dead code that falsely claimed to fix the problem.

### Engineering refactor
- Removed the `chdir` block from `vite.config.js`.
- Added `scripts/vitest.mjs` (client and server): re-launches `node_modules/vitest/vitest.mjs` with **both** the cwd and the binary path normalised to an upper-case drive letter. `npm test` → `node scripts/vitest.mjs run`.
- A first version that normalised only the cwd still failed; the bin path from `import.meta.url` also carried `c:`. Both must be normalised.

### Verification
- [x] `npm test` from Git Bash (lower-case cwd): client 51/51, server 17/17
- [x] `npx vitest run` from PowerShell: same result

**Lesson:** "It passed once" in a different shell is not verification. Reproduce the failure in the **same environment** where it occurred before claiming a fix.

---

## AI-03 — Dev server host copied from Lab 3 breaks the CORS allow-list

### Context
While scaffolding `client/package.json`, the AI copied the Lab 3 scripts:

```json
"dev": "vite --host 127.0.0.1",
"preview": "vite preview --host 127.0.0.1"
```

The API is configured with `cors({ origin: process.env.CLIENT_ORIGIN })` and `.env.example` sets `CLIENT_ORIGIN=http://localhost:5173`.

### Actual issue
Caught **by code review before the first browser run**, then reproduced with Supertest:

```text
Origin: http://127.0.0.1:5173 -> status 200 | Access-Control-Allow-Origin: http://localhost:5173
Origin: http://localhost:5173 -> status 200 | Access-Control-Allow-Origin: http://localhost:5173
```

The `cors` package answers with the fixed allowed origin. A page served from `http://127.0.0.1:5173` does not match it, so the browser would block every forum response. The UI would show *"Failed to fetch"* even though the server returned 200. `localhost` and `127.0.0.1` are different origins. Also, `vite preview` defaults to port 4173, which isn't on the allow-list either.

### Engineering refactor
- `"dev": "vite"`, `"preview": "vite preview"` (served on `localhost`)
- `vite.config.js`: `server` **and** `preview` pinned to `port: 5173, strictPort: true`, with a comment linking them to `CLIENT_ORIGIN`
- Server test `does not reflect an unknown origin` guards the allow-list

### Verification
- [x] Headless Chrome on the production build (`vite preview` → `localhost:5173`): GET and POST succeed; Console 0 errors during normal use (`docs/verification.json`)

---

## AI-04 — AI-written tests that were themselves wrong

| # | Test | AI-generated assertion | Failure | Fix |
|---|---|---|---|---|
| a | `PersonDetail.test.jsx` › numeric id | `getByRole('definition', { name: '' })` and `getByText('Numeric Id')` | Name appears in both `<h2>` and `<dd>` → `Found multiple elements with the text: Numeric Id` | Removed the meaningless `name: ''` query; assert `getByRole('heading', { name: 'Numeric Id' })` |
| b | `SimpleForm.test.jsx` › no `useEffect` | `readFileSync(new URL('../form/SimpleForm.jsx', import.meta.url))` | Under jsdom `import.meta.url` is not a `file:` URL → `ENOENT: open 'C:\src\form\SimpleForm.jsx'` | `readFileSync(resolve('src/form', file))` (cwd = `client/`) |

**Why it matters:** a red test can come from a faulty test, not faulty code. Each failure was read before the code was changed. In both cases the component was correct, and changing it to satisfy the bad test would have added a defect.

---

## AI-05 — Accessibility lint errors in the forum UI

`npx oxlint` after the first `ChannelSwitcher` / `MessageForm` implementation:

```text
src/forum/MessageForm.jsx:38:11: error jsx-a11y(autocomplete-valid): `nickname` is not a valid value for `autocomplete`.
src/forum/ChannelSwitcher.jsx:46:39: error jsx-a11y(prefer-tag-over-role): Prefer `output` over `role` attribute `status`.
```

| Before | After |
|---|---|
| `<input autoComplete="nickname">` | `<input autoComplete="name">` |
| `<p role="status" aria-live="polite">` | `<output aria-live="polite">` (implicit `role="status"`) |

**Verification:** `oxlint` exit 0; `ChannelSwitcher.test.jsx` still finds the region with `getByRole('status')` and checks `aria-live="polite"` (6/6 pass).

---

## Non-defect notes (for transparency)

- **Verification script false negative:** the first headless run reported 1 Console error. Chrome logged `400 (Bad Request)` for the script's **own deliberate** `POST { author: 'x' }` probe. This was not an app bug. The script now records that line separately as an expected entry (`docs/sprint3-error-log.md`) rather than hiding it.
- **`docs/sprint3-network.png`** is a rendering of the request log captured through the Chrome DevTools Protocol (`requestfailed` → `net::ERR_ABORTED`), **not** a screenshot of the DevTools Network panel UI. If the instructor requires the panel itself, take it manually: DevTools → Network → Slow 3G → click channels quickly.
