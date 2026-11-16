import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import PersonDetail from '../people/PersonDetail.jsx';

const people = [
  { id: '1', name: 'Ada Lovelace', role: 'Mathematician' },
  { id: '2', name: 'Alan Turing', role: 'Computer Scientist' },
];

function renderAt(path, list = people) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/people/:id" element={<PersonDetail people={list} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WBS 1.2.3.2 — PersonDetail (detail)', () => {
  it('shows the name and role of the person matching :id', () => {
    renderAt('/people/2');
    const values = screen.getAllByRole('definition').map((dd) => dd.textContent);
    expect(values).toContain('Alan Turing');
    expect(values).toContain('Computer Scientist');
  });

  it('uses <dl>/<dt>/<dd> semantics', () => {
    renderAt('/people/1');
    const terms = screen.getAllByRole('term').map((dt) => dt.textContent);
    expect(terms).toEqual(expect.arrayContaining(['Name', 'Role']));
    expect(screen.getAllByRole('definition').length).toBeGreaterThanOrEqual(2);
  });

  it('shows a 404 alert for an unknown id', () => {
    renderAt('/people/999');
    expect(screen.getByRole('alert')).toHaveTextContent('404: Person Not Found');
  });

  it('matches numeric ids by string (no number/string === mismatch)', () => {
    renderAt('/people/7', [{ id: 7, name: 'Numeric Id', role: 'Edge case' }]);
    expect(screen.getByRole('heading', { name: 'Numeric Id' })).toBeInTheDocument();
  });

  it('does not crash when the people prop is omitted', () => {
    render(
      <MemoryRouter initialEntries={['/people/1']}>
        <Routes>
          <Route path="/people/:id" element={<PersonDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('404');
  });
});
