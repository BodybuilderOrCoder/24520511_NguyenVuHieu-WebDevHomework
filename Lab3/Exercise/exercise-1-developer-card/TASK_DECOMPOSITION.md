# TASK DECOMPOSITION: Exercise 1 - Semantic Engineer & Pro-Gamer Profile Card

## Objective

Build the `<DeveloperCard />` and `<SkillBadge />` components using React 19 and Vite, strictly enforcing the "Zero Div-Soup" mandate and ensuring a 375px responsive design.

## Work Breakdown Structure (WBS)

### Phase 1: Preparation & Contract Definition

* [ ] 1.1 Initialize `src/components/DeveloperCard.jsx` and `src/components/DeveloperCard.module.css`.

* [ ] 1.2 Define Default Props / Data Contract for `DeveloperCard` (fullName, role, avatarUrl, metrics, skills).

* [ ] 1.3 Draft Semantic HTML structure: `<article>`, `<header>`, `<hgroup>`, `<dl>`, `<ul>`. Ensure ZERO `<div>` tags are used.

### Phase 2: Component Implementation (Prep for Commit 1)

* [ ] 2.1 Write the `<SkillBadge />` component:

  * Return a semantic `<li>` tag.

  * Display the skill name and tier.

* [ ] 2.2 Build the `<DeveloperCard />` wrapper with an `<article>` tag:

  * Add the `aria-labelledby='dev-heading'` attribute.

* [ ] 2.3 Structure the Header (`<header>`):

  * Insert the avatar image (`<img>`) using an HTTPS-only origin (no HTTP), explicit `width='64'`, `height='64'`, and `alt={fullName}`.

  * Use `<hgroup>` containing an `<h2>` (with `id='dev-heading'` for the name) and a `<p>` (for the role).

* [ ] 2.4 Structure the Metrics (`<dl>`):

  * Use `Object.entries(metrics).map` to render Key-Value pairs.

  * Wrap each `<dt>` and `<dd>` pair with `<Fragment key={k}>` to avoid div-soup.

* [ ] 2.5 Structure the Skills (`<ul>`):

  * Add `aria-label='Engineered Skills'`.

  * Map through the `skills` array to render `<SkillBadge />` components, ensuring a stable `key={s.id}` is provided.

* [ ] 2.6 **SELF-CHECK:** Run `grep -n '<div' src/components/DeveloperCard.jsx` (Must yield 0 matches) and verify all media origins are HTTPS.

* [ ] 2.7 **EXECUTE COMMIT 1:** `git commit -m "feat(ex1): implement semantic DeveloperCard and SkillBadge"`

### Phase 3: Styling & Responsive Contract (Prep for Commit 2)

* [ ] 3.1 Declare CSS Custom Properties in `DeveloperCard.module.css` (replace inline styles).

* [ ] 3.2 Import styles into `DeveloperCard.jsx` and assign classes (e.g., `className={styles.card}`, `className={styles.header}`).

* [ ] 3.3 Optimize CSS for mobile (iPhone SE - 375px):

  * Ensure proper display with zero horizontal scroll.

  * Use safe flexbox/grid/margin/padding alignments.

* [ ] 3.4 **EXECUTE COMMIT 2:** `git commit -m "style(ex1): add responsive 375px CSS module"`

### Phase 4: Audit & Verification

* [ ] 4.1 Re-run the audit script (`ex1-verification-audit.sh`):

  * Verify Zero Div-Soup: `0 matches (Empty!)`

  * Verify HTTPS: `0 matches`

* [ ] 4.2 Inspect using Chrome DevTools:

  * Elements Tab -> Accessibility Tree: Verify the structure is `article -> header + dl + list`.

  * Device Toolbar: Verify the 375px viewport has zero horizontal scroll.

* [ ] 4.3 Git Log: Verify exactly 2 atomic commits matching the specifications.