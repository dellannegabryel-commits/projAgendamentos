'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Category, Professional } from '@/lib/api';

interface SuccessScreenProps {
  clientName: string;
  date: Date;
  professional: Professional;
  category: Category;
  onNewBooking: () => void;
}

export function SuccessScreen({ clientName, date, professional, category, onNewBooking }: SuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center max-w-md mx-auto py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Agendamento Confirmado!</h2>
        <p className="text-zinc-500 mb-8">
          Seu horário foi reservado com sucesso.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-50 rounded-2xl p-6 space-y-4 text-left"
      >
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-zinc-500">Cliente</p>
            <p className="font-medium text-zinc-900">{clientName}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-zinc-500">Profissional</p>
            <p className="font-medium text-zinc-900">{professional.name}</p>
            <p className="text-sm text-zinc-500">{category.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-zinc-500">Data</p>
            <p className="font-medium text-zinc-900">
              {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-zinc-500">Horário</p>
            <p className="font-medium text-zinc-900">{format(date, 'HH:mm')}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Button onClick={onNewBooking} size="xl" className="w-full">
          <ArrowRight className="h-5 w-5" />
          Fazer Novo Agendamento
        </Button>
      </motion.div>
    </motion.div>
  );
}
