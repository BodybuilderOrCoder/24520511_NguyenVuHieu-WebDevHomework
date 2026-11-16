export default function Skeleton() {
  return (
    <article
      className="person-card skeleton"
      data-testid="person-skeleton"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading person details"
    >
      <span className="skeleton-line skeleton-title" />
      <span className="skeleton-line" />
      <span className="skeleton-line" />
      <span className="skeleton-line" />
      <span className="skeleton-line" />
      <span className="skeleton-line skeleton-short" />
    </article>
  );
}
