import { useState } from 'react';
import { FormContext } from './FormContext.js';
import InputField from './InputField.jsx';
import ShowData from './ShowData.jsx';
import { validateForm } from './validateForm.js';
import './form.css';

const INITIAL_VALUES = { name: '', email: '', age: '' };
const FIELD_ORDER = Object.keys(INITIAL_VALUES);

export default function SimpleForm({ initialValues = INITIAL_VALUES }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  // Derived during render — one render pass per keystroke, no effect, no extra state.
  const errors = validateForm(values);
  const isValid = Object.keys(errors).length === 0;
  const visibleErrors = Object.fromEntries(
    Object.entries(errors).filter(([field]) => submitAttempted || touched[field])
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
    setSubmitted(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!isValid) {
      // Focus/scroll happens only on submit — never on every keystroke.
      const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
      event.currentTarget.elements.namedItem(firstInvalid)?.focus();
      return;
    }

    setSubmitted({ ...values, age: values.age === '' ? 'not provided' : Number(values.age) });
  }

  return (
    <FormContext.Provider value={{ values, errors: visibleErrors, handleChange }}>
      <form className="simple-form" noValidate onSubmit={handleSubmit}>
        <InputField label="Name" name="name" autoComplete="name" required />
        <InputField label="Email" name="email" type="email" autoComplete="email" required />
        <InputField label="Age (optional, 18+)" name="age" inputMode="numeric" />
        <button type="submit">Submit</button>
      </form>
      {submitted && <ShowData data={submitted} />}
    </FormContext.Provider>
  );
}
