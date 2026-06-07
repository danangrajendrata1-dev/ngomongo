import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className = '', children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={`field field--select ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  );
});
