import type { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = '', children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}