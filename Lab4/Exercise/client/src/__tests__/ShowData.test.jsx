import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ShowData from '../form/ShowData.jsx';

describe('WBS 1.3.5 — ShowData inspector', () => {
  it('renders one <dt>/<dd> pair per key inside a .json-inspector <dl>', () => {
    const data = { name: 'Ada', email: 'ada@example.com', age: 36 };
    const { container } = render(<ShowData data={data} />);

    expect(container.querySelector('dl.json-inspector')).toBeInTheDocument();
    expect(screen.getAllByRole('term').map((dt) => dt.textContent)).toEqual(['name', 'email', 'age']);
    expect(screen.getAllByRole('definition').map((dd) => dd.textContent)).toEqual([
      'Ada',
      'ada@example.com',
      '36',
    ]);
  });

  it('renders user text as text, not HTML', () => {
    render(<ShowData data={{ name: '<img src=x onerror=alert(1)>' }} />);
    expect(screen.getByRole('definition')).toHaveTextContent('<img src=x onerror=alert(1)>');
    expect(document.querySelector('img')).toBeNull();
  });
});
