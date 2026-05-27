'use client';

import { clsx } from 'clsx';

interface TimeSlotButtonProps {
  time: string;
  available: boolean;
  selected: boolean;
  onClick: () => void;
}

export function TimeSlotButton({ time, available, selected, onClick }: TimeSlotButtonProps) {
  return (
    <button
      type="button"
      onClick={available ? onClick : undefined}
      disabled={!available}
      className={clsx(
        'h-12 rounded-xl text-sm font-medium transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-primary-500/10',
        selected && 'bg-primary-500 text-white shadow-sm shadow-primary-500/20 ring-2 ring-primary-500',
        !selected && available && 'bg-white border-2 border-zinc-200 text-zinc-700 hover:border-primary-300 hover:text-primary-600',
        !available && 'bg-zinc-50 text-zinc-300 cursor-not-allowed line-through'
      )}
    >
      {time}
    </button>
  );
}
