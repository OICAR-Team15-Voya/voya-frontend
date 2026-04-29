import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...rest }: Props) {
  const inputId = id || rest.name;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...rest}
        className={`w-full bg-transparent border-b py-2 text-[var(--color-ink)] focus:outline-none transition-colors ${
          error
            ? 'border-[var(--color-danger)]'
            : 'border-[var(--color-rule-strong)] focus:border-[var(--color-gold)]'
        } ${className}`}
      />
      {error && (
        <p className="text-xs text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}