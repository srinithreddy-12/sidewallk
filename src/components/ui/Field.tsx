import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}

/** A labelled form field wrapper. Knows nothing about what it contains. */
export function Field({ label, htmlFor, children, hint }: FieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </div>
  );
}
