import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormContext } from '../form/FormContext.js';
import InputField from '../form/InputField.jsx';

function renderField(errors = {}, fieldProps = {}) {
  return render(
    <FormContext.Provider
      value={{ values: { email: 'x' }, errors, handleChange: () => {} }}
    >
      <InputField label="Email" name="email" type="email" {...fieldProps} />
    </FormContext.Provider>
  );
}

describe('WBS 1.3.4 — InputField (useId + aria-*)', () => {
  it('binds the visible label to the input', () => {
    renderField();
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('is controlled by the context value', () => {
    renderField();
    expect(screen.getByLabelText('Email')).toHaveValue('x');
  });

  it('links an error with aria-invalid + aria-describedby', () => {
    renderField({ email: 'Enter a valid email address.' });
    const input = screen.getByLabelText('Email');
    const alert = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', alert.id);
    expect(input).toHaveAccessibleDescription('Enter a valid email address.');
  });

  it('has no aria-describedby and no alert when valid', () => {
    renderField();
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('spreads extra props onto <input>', () => {
    renderField({}, { autoComplete: 'email', required: true });
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toBeRequired();
  });

  it('generates unique ids for two fields with the same label', () => {
    render(
      <FormContext.Provider value={{ values: {}, errors: {}, handleChange: () => {} }}>
        <InputField label="Name" name="a" />
        <InputField label="Name" name="b" />
      </FormContext.Provider>
    );
    const [first, second] = screen.getAllByLabelText('Name');
    expect(first.id).not.toBe(second.id);
  });
});
