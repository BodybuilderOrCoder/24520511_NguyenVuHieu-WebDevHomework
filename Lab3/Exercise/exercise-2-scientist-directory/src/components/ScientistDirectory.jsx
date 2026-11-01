
import { useState } from 'react';
import { SMART_PEOPLE } from '../data/smartPeople';

export default function ScientistDirectory({
  initialData = SMART_PEOPLE,
}) {
  const [people, setPeople] = useState(initialData);

  return (
    <main>
      <section aria-labelledby="directory-title">
        <h1 id="directory-title">
          Scientist & Pioneer Directory
        </h1>

        <p>Total scientists: {people.length}</p>

        <ul>
          {people.map((p) => (
            <li key={p.id}>
              <h2>{p.name}</h2>
              <p>Age: {p.age}</p>
              <p>IQ: {p.iq}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

