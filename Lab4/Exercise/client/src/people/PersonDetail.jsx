import { useParams } from 'react-router';

export default function PersonDetail({ people = [] }) {
  const { id } = useParams();
  // Route params are always strings — normalise the data side so numeric ids still match.
  const person = people.find((p) => String(p.id) === id);

  if (!person) {
    return (
      <article className="person-card">
        <div role="alert" className="not-found">
          404: Person Not Found
        </div>
      </article>
    );
  }

  const headingId = `person-${person.id}`;

  return (
    <article className="person-card" aria-labelledby={headingId}>
      <h2 id={headingId}>{person.name}</h2>
      <dl className="person-details">
        <dt>Name</dt>
        <dd>{person.name}</dd>
        <dt>Role</dt>
        <dd>{person.role}</dd>
        {person.field && (
          <>
            <dt>Field</dt>
            <dd>{person.field}</dd>
          </>
        )}
        {person.born && (
          <>
            <dt>Born</dt>
            <dd>{person.born}</dd>
          </>
        )}
      </dl>
      {person.bio && <p className="person-bio">{person.bio}</p>}
    </article>
  );
}
