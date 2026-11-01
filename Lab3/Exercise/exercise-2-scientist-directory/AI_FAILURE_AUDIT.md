# AI FAILURE AUDIT — LAB 3 / EXERCISE 2

**Project:** Interactive Scientist & Pioneer Directory (React 19 + Vite)  
**Recorded on:** 2026-11-01  
**Evidence:** Actual `npm run lint` output supplied by the developer (Oxlint: 7 warnings, 0 errors).

## Entry 01 — AI introduced unused React state declarations

### AI prompt / context
The developer asked for step-by-step implementation of EX2-03 (define state) and EX2-04 (render the initial list). The AI suggested implementing all four state hooks before the search/filter/sort/delete controls existed.

### AI-generated code (relevant excerpt)

```jsx
const [people, setPeople] = useState(initialData);
const [query, setQuery] = useState('');
const [minIq, setMinIq] = useState(160);
const [sortBy, setSortBy] = useState('iq-desc');
```

Only `people` was used to render the initial list.

### Actual issue
Running `npm run lint` invoked **Oxlint** and reported **7 `eslint(no-unused-vars)` warnings, 0 errors**. Unused identifiers: `setPeople`, `query`, `setQuery`, `minIq`, `setMinIq`, `sortBy`, `setSortBy`.

**Classification:** Verified AI-generated code-quality warning / premature state declaration. **Not a demonstrated runtime bug.** Do not present it as a functional defect or as proof of a required AI-generated runtime bug.

### Detection method / evidence

```text
> exercise-2-scientist-directory@0.0.0 lint
> oxlint

Found 7 warnings and 0 errors.
Finished in 13ms on 5 files with 104 rules using 16 threads.
```

The developer supplied the full warning log, with line references in `src/components/ScientistDirectory.jsx` (lines 8–11). No DevTools screenshot or runtime failure was supplied.

### Engineering refactor
For Milestone 1, declare only the state actually used:

```jsx
const [people] = useState(initialData);
```

In later milestones, add `query`, `minIq`, `sortBy`, and state setters when each control or action is implemented. An alternative is to implement the controls before declaring completion of the milestone; avoid suppressing the lint rule.

### Verification status
- [x] Initial warnings reproduced in developer-provided lint output.
- [ ] Run `npm run lint` after refactor and confirm 0 warnings / 0 errors.
- [ ] Run `npm run build` after refactor and confirm success.
- [ ] Attach terminal screenshot if DevTools/visual evidence is required by the instructor.

### Lesson learned
AI-generated scaffolding should be checked incrementally. Declaring anticipated React state before it is consumed can produce static-analysis warnings even when the page renders correctly. An audit should distinguish **lint warnings** from **runtime bugs** and should not claim verification that has not been performed.

---

> **Audit scope note:** This is one verified warning case, **not** three AI-generated functional bugs. Add further entries only after observing and proving real issues. If the Lab 3 submission requires three bugs with DevTools evidence, this entry alone does not satisfy that requirement.
