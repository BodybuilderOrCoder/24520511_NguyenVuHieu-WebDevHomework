import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler } from 'react';
import { describe, expect, it, vi } from 'vitest';
import SimpleForm from '../form/SimpleForm.jsx';

function setup() {
  const user = userEvent.setup();
  const utils = render(<SimpleForm />);
  return { user, ...utils };
}

describe('WBS 1.3.3 — SimpleForm (derived validation, no useEffect)', () => {
  it('shows no errors before the user interacts', () => {
    setup();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error immediately on the same keystroke (no waitFor)', async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText('Email'), 'ada@');
    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');

    await user.type(screen.getByLabelText('Email'), 'example.com');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('blocks submit while errors exist, reveals all errors and focuses the first invalid field', async () => {
    const { user, container } = setup();
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(container.querySelector('.json-inspector')).not.toBeInTheDocument();
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('renders ShowData with one pair per field after a valid submit', async () => {
    const { user, container } = setup();
    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText(/age/i), '36');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    const inspector = container.querySelector('.json-inspector');
    expect(inspector).toBeInTheDocument();
    expect(inspector.querySelectorAll('dt')).toHaveLength(3);
    expect(inspector.querySelectorAll('dd')).toHaveLength(3);
    expect(inspector).toHaveTextContent('ada@example.com');
  });

  it('commits exactly one render pass per keystroke (Profiler)', async () => {
    const user = userEvent.setup();
    const onRender = vi.fn();
    render(
      <Profiler id="form" onRender={onRender}>
        <SimpleForm />
      </Profiler>
    );
    const input = screen.getByLabelText('Name');
    await user.click(input);
    onRender.mockClear();

    await user.keyboard('A');
    expect(onRender).toHaveBeenCalledTimes(1);

    await user.keyboard('da');
    expect(onRender).toHaveBeenCalledTimes(3);
  });

  it('contains no useEffect in the form engine source', () => {
    for (const file of ['SimpleForm.jsx', 'InputField.jsx', 'FormContext.js', 'validateForm.js']) {
      const source = readFileSync(resolve('src/form', file), 'utf8');
      expect(source, file).not.toMatch(/useEffect/);
    }
  });
});
