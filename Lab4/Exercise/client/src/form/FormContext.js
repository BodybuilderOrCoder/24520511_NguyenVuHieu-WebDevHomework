import { createContext, useContext } from 'react';

/** @typedef {{ values: Record<string, string>, errors: Record<string, string>, handleChange: (e: Event) => void }} FormContextValue */

/** @type {import('react').Context<FormContextValue | null>} */
export const FormContext = createContext(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === null) {
    throw new Error('useFormContext must be used inside <SimpleForm> (FormContext.Provider).');
  }
  return context;
}
