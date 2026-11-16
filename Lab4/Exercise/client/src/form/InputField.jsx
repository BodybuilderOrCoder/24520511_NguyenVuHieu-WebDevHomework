import { useId } from 'react';
import { useFormContext } from './FormContext.js';

export default function InputField({ label, name, type = 'text', ...props }) {
  const { values, errors, handleChange } = useFormContext();
  const id = useId();
  const errorId = `${id}-error`;
  const error = errors[name];

  return (
    <p className="field">
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        name={name}
        type={type}
        value={values[name] ?? ''}
        onChange={handleChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} role="alert" className="field-error">
          {error}
        </span>
      )}
    </p>
  );
}
