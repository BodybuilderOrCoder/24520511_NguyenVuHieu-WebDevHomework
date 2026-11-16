import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App.jsx';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('WBS 1.2.1 — Ex 1.2 declarative <Routes>', () => {
  it('renders Home content at "/"', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: /home/i })).toBeInTheDocument();
  });

  it('renders About content at "/about"', () => {
    renderAt('/about');
    expect(screen.getByRole('heading', { level: 1, name: /about/i })).toBeInTheDocument();
  });

  it('renders a not-found page for unknown URLs', () => {
    renderAt('/does-not-exist');
    expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument();
  });
});

describe('WBS 1.2.2 — Ex 1.2.1 nested layout + active NavLink', () => {
  it('marks the About link active at "/about" and not Home', () => {
    renderAt('/about');
    const nav = screen.getByRole('navigation', { name: /main/i });
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveClass('active');
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveClass('active');
  });

  it.each(['/', '/about', '/form', '/forum'])('renders the nav on child route %s', (path) => {
    renderAt(path);
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  });
});
