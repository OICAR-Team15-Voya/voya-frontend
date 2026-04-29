import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'gold' | 'outline' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  gold: 'bg-[var(--color-gold)] hover:bg-[var(--color-gold-soft)] text-[var(--color-canvas)]',
  outline: 'border border-[var(--color-rule-strong)] hover:border-[var(--color-gold)] text-[var(--color-ink)]',
  ghost: 'text-[var(--color-ink)] hover:bg-[var(--color-surface)]',
  danger: 'bg-[var(--color-danger)] hover:opacity-90 text-white',
};

export function Button({ variant = 'gold', className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}