'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, User, Phone, MapPin } from 'lucide-react';
import type { Professional } from '@/lib/api';

interface ProfessionalCardProps {
  professional: Professional;
  selected: boolean;
  onClick: () => void;
}

export function ProfessionalCard({ professional, selected, onClick }: ProfessionalCardProps) {
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
          'w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden',
          selected ? 'bg-primary-100 text-primary-600' : 'bg-zinc-100 text-zinc-500'
        )}>
          {professional.photoUrl ? (
            <img src={professional.photoUrl} alt={professional.name} className="w-full h-full object-cover" />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="font-semibold text-zinc-900">{professional.name}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {professional.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {professional.address}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
