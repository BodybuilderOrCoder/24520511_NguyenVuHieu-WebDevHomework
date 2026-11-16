import { NavLink, Outlet } from 'react-router';
import './people.css';

const linkClass = ({ isActive }) => (isActive ? 'link active-link' : 'link');

export default function PeopleLayout({ people = [] }) {
  return (
    <div className="people-frame">
      <nav className="sidebar" aria-label="People directory">
        <ul>
          {people.map((person) => (
            <li key={person.id}>
              <NavLink to={`/people/${person.id}`} className={linkClass}>
                {person.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}
