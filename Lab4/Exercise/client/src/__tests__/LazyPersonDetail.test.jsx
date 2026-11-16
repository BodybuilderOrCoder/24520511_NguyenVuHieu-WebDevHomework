import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App.jsx';
import { people } from '../people/people.data.js';

describe('WBS 1.2.4 — Ex 1.1 React.lazy + <Suspense> skeleton', () => {
  it('shows an aria-busy skeleton first, then the real person detail', async () => {
    const person = people[1];
    render(
      <MemoryRouter initialEntries={[`/people/${person.id}`]}>
        <App />
      </MemoryRouter>
    );

    const skeleton = screen.getByTestId('person-skeleton');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-live', 'polite');

    expect(await screen.findByRole('heading', { name: person.name })).toBeInTheDocument();
    expect(screen.queryByTestId('person-skeleton')).not.toBeInTheDocument();
  });
});
