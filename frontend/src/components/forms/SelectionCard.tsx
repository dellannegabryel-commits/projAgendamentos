'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SelectionCard({ selected, onClick, children, disabled, className }: SelectionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={clsx(
        'relative w-full text-left rounded-2xl border-2 p-4 transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-primary-500/10',
        selected
          ? 'border-primary-500 bg-primary-50/50 shadow-sm'
          : 'border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      {children}
    </motion.button>
  );
}
