import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormContext, useFormContext } from '../form/FormContext.js';

function Reader() {
  const { values } = useFormContext();
  return <output>{values.name}</output>;
}

describe('WBS 1.3.2 — FormContext + useFormContext', () => {
  it('lets a child inside the Provider read values', () => {
    render(
      <FormContext.Provider value={{ values: { name: 'Grace' }, errors: {}, handleChange: () => {} }}>
        <Reader />
      </FormContext.Provider>
    );
    expect(screen.getByRole('status')).toHaveTextContent('Grace');
  });

  it('throws a clear error when used outside the Provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Reader />)).toThrow(/useFormContext must be used inside <SimpleForm>/);
    spy.mockRestore();
  });
});
