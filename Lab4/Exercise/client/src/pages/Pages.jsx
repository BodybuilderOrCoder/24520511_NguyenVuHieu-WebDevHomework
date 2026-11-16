import { Link } from 'react-router';

export function Home() {
  return (
    <main className="page-main">
      <h1>Home</h1>
      <p>Multi-route SPA built with React 19 and React Router v7.</p>
      <ul className="feature-list">
        <li>
          <Link to="/people">People</Link> — master-detail directory with lazy-loaded dossiers.
        </li>
        <li>
          <Link to="/form">Form</Link> — context-driven form validated during render.
        </li>
        <li>
          <Link to="/forum">Forum</Link> — live channels backed by an Express REST API.
        </li>
      </ul>
    </main>
  );
}

export function About() {
  return (
    <main className="page-main">
      <h1>About</h1>
      <p>UIT Lab 4 — nested layouts, a context form engine and a full-stack Express API.</p>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="page-main">
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to Home</Link>
      </p>
    </main>
  );
}

export function PageShell({ title, children }) {
  return (
    <main className="page-main">
      <h1>{title}</h1>
      {children}
    </main>
  );
}

export function PeopleIndex() {
  return <p className="people-hint">Select a person from the sidebar to open their dossier.</p>;
}
