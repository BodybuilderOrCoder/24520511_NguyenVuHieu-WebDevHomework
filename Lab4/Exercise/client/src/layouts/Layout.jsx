import { NavLink, Outlet } from 'react-router';

const navClass = ({ isActive }) => (isActive ? 'active' : '');

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/people', label: 'People' },
  { to: '/form', label: 'Form' },
  { to: '/forum', label: 'Forum' },
];

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <p className="brand">Lab 4 SPA</p>
        <nav aria-label="Main">
          <ul className="nav-list">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={navClass}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <section id="main-content" className="page" tabIndex={-1}>
        <Outlet />
      </section>
    </>
  );
}
