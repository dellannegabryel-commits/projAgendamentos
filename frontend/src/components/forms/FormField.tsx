'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function FormField({ label, error, children, required, className }: FormFieldProps) {
  return (
    <div className={clsx('space-y-1.5', className)}>
      <label className="block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-500 animate-in">{error}</p>
      )}
    </div>
  );
}
