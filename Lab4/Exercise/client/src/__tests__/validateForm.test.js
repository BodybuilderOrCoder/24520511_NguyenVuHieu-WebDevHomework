import { describe, expect, it } from 'vitest';
import { validateForm } from '../form/validateForm.js';

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', age: '36' };

describe('WBS 1.3.3 — validateForm (pure function)', () => {
  it('returns no errors for a valid record', () => {
    expect(validateForm(valid)).toEqual({});
  });

  it('requires a name', () => {
    expect(validateForm({ ...valid, name: '' })).toEqual({ name: expect.any(String) });
    expect(validateForm({ ...valid, name: '   ' })).toHaveProperty('name');
  });

  it('rejects a malformed email', () => {
    expect(validateForm({ ...valid, email: 'ada@' })).toHaveProperty('email');
    expect(validateForm({ ...valid, email: '' })).toHaveProperty('email');
  });

  it('treats age as optional but requires a number >= 18 when given', () => {
    expect(validateForm({ ...valid, age: '' })).toEqual({});
    expect(validateForm({ ...valid, age: '17' })).toHaveProperty('age');
    expect(validateForm({ ...valid, age: 'abc' })).toHaveProperty('age');
    expect(validateForm({ ...valid, age: '18' })).toEqual({});
  });

  it('does not mutate its input', () => {
    const input = Object.freeze({ ...valid, name: '' });
    expect(() => validateForm(input)).not.toThrow();
  });
});
