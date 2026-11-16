import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import PeopleLayout from '../people/PeopleLayout.jsx';

const people = [
  { id: '1', name: 'Ada Lovelace', role: 'Mathematician' },
  { id: '2', name: 'Alan Turing', role: 'Computer Scientist' },
  { id: '3', name: 'Grace Hopper', role: 'Rear Admiral' },
];

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/people" element={<PeopleLayout people={people} />}>
          <Route path=":id" element={<p>detail outlet</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('WBS 1.2.3.1 — PeopleLayout (master)', () => {
  it('renders one NavLink per person in the sidebar', () => {
    renderAt('/people');
    const sidebar = screen.getByRole('navigation', { name: /people/i });
    expect(within(sidebar).getAllByRole('link')).toHaveLength(people.length);
  });

  it('marks the link for id=2 as active-link at /people/2', () => {
    renderAt('/people/2');
    expect(screen.getByRole('link', { name: 'Alan Turing' })).toHaveClass('active-link');
    expect(screen.getByRole('link', { name: 'Ada Lovelace' })).toHaveClass('link');
    expect(screen.getByRole('link', { name: 'Ada Lovelace' })).not.toHaveClass('active-link');
  });

  it('renders child routes through <Outlet /> inside .content-area', () => {
    const { container } = renderAt('/people/2');
    expect(container.querySelector('.people-frame main.content-area')).toHaveTextContent('detail outlet');
  });
});
