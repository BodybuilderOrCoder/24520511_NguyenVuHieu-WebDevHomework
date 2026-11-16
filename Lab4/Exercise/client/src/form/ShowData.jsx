export default function ShowData({ data = {} }) {
  return (
    <section className="inspector" aria-labelledby="inspector-title">
      <h2 id="inspector-title">Submitted data</h2>
      <dl className="json-inspector">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="data-row">
            <dt>{key}</dt>
            <dd>{String(val)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
