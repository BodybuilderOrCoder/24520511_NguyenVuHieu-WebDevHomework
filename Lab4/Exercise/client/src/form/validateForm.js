const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Pure validator — derived during render, never stored in state.
 * @param {{ name?: string, email?: string, age?: string }} values
 * @returns {Partial<Record<'name' | 'email' | 'age', string>>}
 */
export function validateForm(values) {
  const errors = {};
  const name = (values.name ?? '').trim();
  const email = (values.email ?? '').trim();
  const age = (values.age ?? '').trim();

  if (!name) {
    errors.name = 'Name is required.';
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (age !== '') {
    const ageNumber = Number(age);
    if (!Number.isFinite(ageNumber)) {
      errors.age = 'Age must be a number.';
    } else if (ageNumber < 18) {
      errors.age = 'You must be at least 18.';
    }
  }

  return errors;
}
