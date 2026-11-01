
import { useId, useState } from 'react';
import { SMART_PEOPLE } from '../data/smartPeople';

export default function ScientistDirectory({
  initialData = SMART_PEOPLE,
}) {
  const [people] = useState(initialData);
  const [query, setQuery] = useState('');
  const [minIqInput, setMinIqInput] = useState('160');

  const minIq = minIqInput === '' ? 0 : Number(minIqInput);
  const [sortBy, setSortBy] = useState('iq-desc');

  const searchId = useId();
  const minIqId = useId();
  const sortId = useId();

  // Derived data: no additional state or useEffect
  const normalizedQuery = query.trim().toLowerCase();

  const visiblePeople = people
    .filter(
      (p) =>
        p.name.toLowerCase().includes(normalizedQuery) &&
        p.iq >= minIq
    )
    .toSorted((a, b) =>
      sortBy === 'iq-desc'
        ? b.iq - a.iq
        : a.age - b.age
    );

  return (
    <main>
      <section aria-labelledby="directory-title">
        <header>
          <h1 id="directory-title">
            Scientist & Pioneer Directory
          </h1>
        </header>

        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor={searchId}>
            Search scientists:
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a scientist's name"
          />

          <label htmlFor={minIqId}>
            Minimum IQ:
          </label>
          <input
            id={minIqId}
            type="number"
            min="0"
            step="1"
            value={minIqInput}
            onChange={(e) => {
              const value = e.currentTarget.value;

              if (value === '' || /^\d+$/.test(value)) {
                setMinIqInput(value);
              }
            }}
           />
          

          <label htmlFor={sortId}>
            Sort by:
          </label>
          <select
            id={sortId}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="iq-desc">
              IQ: High to Low
            </option>
            <option value="age-asc">
              Age: Low to High
            </option>
          </select>
        </form>

        <output role="status" aria-live="polite">
          Showing {visiblePeople.length} of {people.length} scientists
        </output>

        <ul>
          {visiblePeople.map((p) => (
            <li key={p.id}>
              <article>
                <h2>{p.name}</h2>
                <dl>
                  <dt>Age</dt>
                  <dd>{p.age}</dd>
                  <dt>IQ</dt>
                  <dd>{p.iq}</dd>
                </dl>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
