TASK DECOMPOSITION — LAB 3 / EXERCISE 2
Exercise: Interactive Scientist & Pioneer Directory
Course: Web Application Development — Lab 3: Production React 19
Reference: Lab 3 slides 18–19 (In-Class Sprint 2, 75–120 minutes)
Scope: Exercise 2 only. Exercise 1 and Exercise 3 are out of scope.
Status: Completed — EX2-01 to EX2-12 (user-confirmed, 2026-11-01)
1. Objective
Transform the provided static smartPeople dataset into an interactive React 19 directory that supports:
1. Case-insensitive search by scientist name.
2. Numeric minimum-IQ filtering.
3. Sorting by IQ or age using immutable .toSorted().
4. Deleting entries and restoring the initial dataset.
5. Accessible input labels and a live result-count announcement.
Architectural principles: React functional components; useState for independent state only; useId for accessible form IDs; stable entity IDs as list keys; derived filtering/sorting calculated during render. Do not use useEffect for filtering or sorting.
2. Required data contract
Use the source dataset below. IQ values are exercise sample data, not scientifically verified historical IQ measurements.
export const SMART_PEOPLE = [
  { id: 'sp-1', name: 'Johann Goethe', age: 82, iq: 210 },
  { id: 'sp-2', name: 'Albert Einstein', age: 76, iq: 205 },
  { id: 'sp-3', name: 'Leonardo da Vinci', age: 67, iq: 180 },
  { id: 'sp-4', name: 'Isaac Newton', age: 84, iq: 190 },
  { id: 'sp-5', name: 'James Maxwell', age: 48, iq: 190 },
  { id: 'sp-6', name: 'William Sidis', age: 46, iq: 200 },
];
Proposed component interface:
type Scientist = {
  id: string;
  name: string;
  age: number;
  iq: number;
};

type ScientistDirectoryProps = {
  initialData?: Scientist[];
};
Note: TypeScript definitions are an optional planning contract. The slide's reference implementation uses ScientistDirectory.jsx (JSX); do not convert the assignment to TypeScript unless the existing project requires it.

3. Work breakdown structure (WBS)
Task ID	Work item	Deliverable / acceptance criteria	Status
EX2-01	Inspect project structure and existing React setup	Locate the Lab 3 Exercise 2 folder; ensure React 19/Vite project runs; avoid changing Exercise 1	[x]
EX2-02	Normalize source dataset	SMART_PEOPLE has six records, each with unique stable id, name, age, iq	[x]
EX2-03	Define component state	people, query, minIq, sortBy are independent useState values; default minIq = 160, sortBy = 'iq-desc'	[x]
EX2-04	Render semantic directory	Functional component with section, form, result status and keyed list; initial entries render correctly	[x]
EX2-05	Implement case-insensitive search	Search trims query and normalizes case; clearing query restores matching entries	[x]
EX2-06	Implement minimum-IQ filter	Numeric input uses valueAsNumber and a Number.isNaN fallback; combined search + IQ filtering works	[x]
EX2-07	Implement sorting	Select/control changes IQ-desc or age-asc sorting; uses .toSorted() and never mutates source/state arrays	[x]
EX2-08	Add delete action	Delete by stable id using setPeople(prev => prev.filter(...)); no direct mutation	[x]
EX2-09	Add reset action	Restores all six records from the original dataset; document whether filters also reset (see decision below)	[x]
EX2-10	Accessibility audit	Labels linked using useId()/`htmlFor`; result count exposed through <output role="status" aria-live="polite">; keyboard controls work	[x]
EX2-11	DevTools & UI testing	Functional test matrix passes; no Console errors or React key warnings; Profiler checked	[x]
EX2-12	Git history & live-defense preparation	Exactly scoped commits aligned with the three mandatory milestones; can explain derived state, immutability, and IDs	[x]


Implementation decision (not specified by slide): Prefer Reset Data to restore only the six deleted records, retaining current search/filter/sort selections. If the teacher expects a full reset, update both the implementation and acceptance test consistently.

Completion notes (2026-11-01): The user reports all 12 tasks completed, 13/13 functional/DevTools tests passed, accessibility audit 7/7 passed, and Git/live-defense checklist completed. The original acceptance matrix below assumes six SMART_PEOPLE records. An optional personal test record (IQ 300) was also added during development; keep it separate or remove it for exact six-record test expectations (TC-01, TC-04, TC-05, TC-09). The numeric-input implementation was revised to store editable input text in minIqInput and derive a number, instead of the initially planned valueAsNumber + NaN fallback, to support clearing and editing without unwanted resets. The checked boxes record user-reported verification; they are not an independent inspection of the local repository.
4. Three mandatory Git milestones
These commit messages follow slide 18.
Milestone 1 — Dataset and stable IDs
Tasks: EX2-01 → EX2-04
- [x] Verify React 19/Vite project runs.
- [x] Define SMART_PEOPLE with six unique IDs.
- [x] Create the ScientistDirectory functional component and render the initial list.
- [x] Use key={p.id}, not array indices or names.
- [x] Confirm initial data appears and no React key warnings occur.
git add .
git commit -m "feat(ex2): normalize smartPeople schema with stable IDs"
Before committing: inspect git diff --staged and ensure the commit contains only this milestone's changes; git add . is appropriate only if the directory contains no unrelated changes.
Milestone 2 — Search, IQ filter, sorting
Tasks: EX2-05 → EX2-07
- [x] Search is case-insensitive and whitespace-trimmed.
- [x] Minimum IQ is numeric (no string coercion bugs).
- [x] Both filters work together.
- [x] Sorting toggles between documented IQ/age options.
- [x] Pipeline uses pure .filter(...).toSorted(...) on each render.
- [x] No useEffect synchronizes filtered/sorted arrays into redundant state.
git add .
git commit -m "feat(ex2): add search, IQ filter & toSorted"
Milestone 3 — Delete, reset, live status
Tasks: EX2-08 → EX2-12
- [x] Delete a scientist using id and immutable .filter().
- [x] Reset restores original six entries.
- [x] <output role="status" aria-live="polite"> updates with visible result count.
- [x] Inputs have visible <label> elements paired with useId().
- [x] Keyboard actions and 375px viewport are usable.
- [x] Run the verification checklist before final commit.
git add .
git commit -m "feat(ex2): add delete/reset & live status"
Scope reminder: The slide explicitly asks for three atomic commits for Exercise 2. If a checkpoint fails, fix it before committing rather than creating unrelated features.

5. State and derived-data contract
Only independent values belong in React state:
const [people, setPeople] = useState(initialData);
const [query, setQuery] = useState('');
const [minIq, setMinIq] = useState(160);
const [sortBy, setSortBy] = useState('iq-desc');

const visiblePeople = people
  .filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()) &&
    p.iq >= minIq
  )
  .toSorted((a, b) =>
    sortBy === 'iq-desc' ? b.iq - a.iq : a.age - b.age
  );
Forbidden patterns:
- const [filteredPeople, setFilteredPeople] = useState(...) followed by a syncing useEffect.
- people.sort(...), people.push(...), or direct mutation of React state.
- key={index} for list items.
- Search inputs lacking a proper visible label.
- Converting numeric input without considering NaN.
6. Test matrix
Test ID	Scenario	Expected outcome	Pass
TC-01	Launch with default query, IQ ≥ 160	Six scientists visible	[x]
TC-02	Search einstein / EINSTEIN	Albert Einstein visible in either case	[x]
TC-03	Search text with leading/trailing spaces	Same result as trimmed query	[x]
TC-04	Set minimum IQ to 200	Goethe, Einstein, Sidis remain (before any deletions)	[x]
TC-05	Set minimum IQ to 220	Zero results and live count reports zero	[x]
TC-06	Select IQ descending	Results ordered by IQ high → low	[x]
TC-07	Select age ascending	Results ordered by age low → high	[x]
TC-08	Delete a visible record	Record disappears; result count decrements	[x]
TC-09	Reset Data	Original six records return	[x]
TC-10	Navigate using keyboard	Search, numeric filter, sort, delete and reset are reachable and functional	[x]
TC-11	Inspect React Console	No errors or missing/duplicate key warnings	[x]
TC-12	Profile a search input change	No avoidable second render caused by a derived-state synchronization effect	[x]
TC-13	Resize viewport to 375px	Content remains usable with no unintended horizontal scrolling	[x]


Profiler caveat: The slide states “exactly 1 render pass” per search keystroke. In React development mode, StrictMode and profiling instrumentation may show additional render invocations. The practical target is to avoid an extra committed update from redundant useEffect-driven derived state; record the testing mode when reporting results.
7. Live defense preparation
Be ready to explain and demonstrate the following without blindly regenerating the whole component:
1. Why visiblePeople is derived rather than stored in an additional useState.
2. Why .toSorted() is safer than .sort() on a state-derived array.
3. Why keys use persistent id fields, not array indices.
4. Why valueAsNumber is appropriate for the IQ input.
5. How useId() connects <label htmlFor={id}> and <input id={id}>.
6. How prev.filter(...) makes deletion immutable.
7. How result count changes are announced by aria-live="polite".
8. How to add a Watchlist toggle and Show Watchlisted Only checkbox without useEffect (slide 24's sample live-defense challenge; preparation only, not part of the mandatory Exercise 2 implementation).
8. Definition of Done
- [x] All required search, filter, sort, delete, and reset interactions work.
- [x] Dataset IDs are stable and list rendering is keyed correctly.
- [x] React state is immutable; filtered/sorted output is purely derived.
- [x] Forms and result announcements meet the slide's accessibility requirements.
- [x] Tests pass with no console errors.
- [x] Exactly three Exercise 2 milestone commits are present with the expected messages.
- [x] Can explain the implementation and modify a small requirement live.
Source alignment: Lab 3 slides 18–19 specify the Exercise 2 task, dataset, state design, derived-state requirement, accessibility requirements, and three commit messages. Slide 24 provides a possible follow-up live-defense challenge. Optional planning details (file organization, reset semantics, test-case naming, and TypeScript interface) are explicitly identified as project-management suggestions rather than teacher-mandated requirements.