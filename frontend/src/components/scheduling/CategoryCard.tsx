'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, Sparkles } from 'lucide-react';
import type { Category } from '@/lib/api';

interface CategoryCardProps {
  category: Category;
  selected: boolean;
  onClick: () => void;
}

const icons = ['Sparkles', 'Scissors', 'Palette', 'Heart', 'Star', 'Sun'];

export function CategoryCard({ category, selected, onClick }: CategoryCardProps) {
  const iconIndex = category.name.length % icons.length;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-primary-500/10',
        selected
          ? 'border-primary-500 bg-primary-50 shadow-sm shadow-primary-500/10'
          : 'border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm'
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className={clsx(
          'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
          selected ? 'bg-primary-100 text-primary-600' : 'bg-zinc-100 text-zinc-500'
        )}>
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{category.description}</p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
