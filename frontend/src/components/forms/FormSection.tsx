'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        {description && (
          <p className="text-sm text-zinc-500 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
