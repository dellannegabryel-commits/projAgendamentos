'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

import { Button, Card, Stepper } from '@/components/ui';
import { FormField } from '@/components/forms/FormField';
import { CategoryCard } from '@/components/scheduling/CategoryCard';
import { ProfessionalCard } from '@/components/scheduling/ProfessionalCard';
import { TimeSlotButton } from '@/components/scheduling/TimeSlotButton';
import { SuccessScreen } from '@/components/scheduling/SuccessScreen';
import { Skeleton, ListSkeleton } from '@/components/feedback/Skeleton';
import { api } from '@/lib/api';
import type { Category, Professional, TimeSlot } from '@/lib/api';

import 'react-day-picker/style.css';

const phoneMask = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const schema = z.object({
  clientName: z.string().min(1, 'Precisamos do seu nome para continuar'),
  clientPhone: z.string()
    .min(14, 'Informe um telefone com DDD válido')
    .max(15, 'Telefone inválido'),
  categoryId: z.string().min(1, 'Selecione um serviço'),
  professionalId: z.string().min(1, 'Selecione um profissional'),
  date: z.string().min(1, 'Selecione uma data'),
  time: z.string().min(1, 'Selecione um horário'),
});

type FormData = z.infer<typeof schema>;

const steps = [
  { id: 1, label: 'Seus dados' },
  { id: 2, label: 'Escolha o serviço' },
  { id: 3, label: 'Escolha o profissional' },
  { id: 4, label: 'Escolha um horário' },
  { id: 5, label: 'Confirmar' },
];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function AgendamentoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [loadingCategories, setLoadingCategories] = useState(true);

  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: '',
      clientPhone: '',
      categoryId: '',
      professionalId: '',
      date: '',
      time: '',
    },
  });

  const values = watch();

  useEffect(() => {
    api.categories.list()
      .then(setCategories)
      .catch(() => toast.error('Erro ao carregar categorias'))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (values.categoryId) {
      api.professionals.getByCategory(values.categoryId)
        .then(setProfessionals)
        .catch(() => toast.error('Erro ao carregar profissionais'));
    }
  }, [values.categoryId]);

  useEffect(() => {
    if (values.professionalId) {
      api.availabilities.getByProfessional(values.professionalId)
        .then(data => {
          const days = Array.from(new Set(data.map(a => a.dayOfWeek)));
          setAvailableDays(days);
        })
        .catch(() => toast.error('Erro ao carregar disponibilidades'));
    }
  }, [values.professionalId]);

  useEffect(() => {
    if (values.professionalId && values.date) {
      setLoadingSlots(true);
      api.availabilities.getSlots(values.professionalId, values.date)
        .then(setTimeSlots)
        .catch(() => toast.error('Erro ao carregar horários'))
        .finally(() => setLoadingSlots(false));
    }
  }, [values.professionalId, values.date]);

  const goToStep = useCallback((step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  }, [currentStep]);

  const handleNext = async () => {
    const fields: (keyof FormData)[] = [
      'clientName', 'clientPhone', 'categoryId', 'professionalId', 'date', 'time',
    ];

    if (currentStep === 1) {
      const valid = await trigger(['clientName', 'clientPhone']);
      if (!valid) return;
    }
    if (currentStep === 2) {
      const valid = await trigger('categoryId');
      if (!valid) return;
    }
    if (currentStep === 3) {
      const valid = await trigger('professionalId');
      if (!valid) return;
    }
    if (currentStep === 4) {
      const valid = await trigger(['date', 'time']);
      if (!valid) return;
    }

    goToStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.appointments.create({
        professionalId: values.professionalId,
        clientName: values.clientName,
        clientPhone: values.clientPhone,
        date: `${values.date}T${values.time}:00`,
      });
      setSuccess(true);
      toast.success('Agendamento confirmado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar agendamento');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const cat = categories.find(c => c.id === values.categoryId);
    const prof = professionals.find(p => p.id === values.professionalId);
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 flex items-center justify-center p-4">
        <SuccessScreen
          clientName={values.clientName}
          date={new Date(`${values.date}T${values.time}:00`)}
          professional={prof!}
          category={cat!}
          onNewBooking={() => window.location.reload()}
        />
      </div>
    );
  }

  const disabledDays = [
    { before: addDays(new Date(), 1) },
    ...Array.from({ length: 7 }, (_, i) => i).filter(d => !availableDays.includes(d)).map(d => ({ dayOfWeek: d })),
  ];

  const availableSlots = timeSlots.filter(s => s.available);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
            Agende seu horário
          </h1>
          <p className="text-zinc-500 mt-1.5 text-sm">
            Escolha o serviço, profissional e horário ideal para você
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 md:p-8">
          <Stepper steps={steps} currentStep={currentStep} />

          <div className="mt-8 min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-zinc-900">Seus dados</h2>
                    <FormField label="Nome completo" error={errors.clientName?.message} required>
                      <input
                        {...register('clientName')}
                        placeholder="Como prefere ser chamado?"
                        className="w-full h-12 px-4 rounded-2xl border-2 border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                        autoFocus
                      />
                    </FormField>
                    <FormField label="WhatsApp" error={errors.clientPhone?.message} required>
                      <input
                        {...register('clientPhone')}
                        placeholder="(63) 99999-9999"
                        inputMode="numeric"
                        value={values.clientPhone}
                        onChange={e => setValue('clientPhone', phoneMask(e.target.value), { shouldValidate: true })}
                        className="w-full h-12 px-4 rounded-2xl border-2 border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 hover:border-zinc-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none"
                      />
                    </FormField>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-900">Escolha o serviço</h2>
                    <p className="text-sm text-zinc-500 -mt-2">
                      Selecione o tipo de serviço que você deseja
                    </p>
                    {loadingCategories ? (
                      <ListSkeleton rows={3} />
                    ) : categories.length === 0 ? (
                      <p className="text-center text-zinc-400 py-8">Nenhum serviço disponível</p>
                    ) : (
                      <div className="space-y-3">
                        {categories.map((cat) => (
                          <CategoryCard
                            key={cat.id}
                            category={cat}
                            selected={values.categoryId === cat.id}
                            onClick={() => {
                              setValue('categoryId', cat.id, { shouldValidate: true });
                              setValue('professionalId', '', { shouldValidate: true });
                              setValue('date', '', { shouldValidate: true });
                              setValue('time', '', { shouldValidate: true });
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-zinc-900">Escolha o profissional</h2>
                    <p className="text-sm text-zinc-500 -mt-2">
                      Selecione quem você prefere atender você
                    </p>
                    {professionals.length === 0 ? (
                      <p className="text-center text-zinc-400 py-8">Nenhum profissional disponível para este serviço</p>
                    ) : (
                      <div className="space-y-3">
                        {professionals.map((prof) => (
                          <ProfessionalCard
                            key={prof.id}
                            professional={prof}
                            selected={values.professionalId === prof.id}
                            onClick={() => {
                              setValue('professionalId', prof.id, { shouldValidate: true });
                              setValue('date', '', { shouldValidate: true });
                              setValue('time', '', { shouldValidate: true });
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-zinc-900">Escolha um horário</h2>

                    <div className="bg-zinc-50 rounded-2xl p-4">
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setValue('date', format(date, 'yyyy-MM-dd'), { shouldValidate: true });
                            setValue('time', '', { shouldValidate: true });
                          }
                        }}
                        disabled={disabledDays}
                        locale={ptBR}
                        startMonth={new Date()}
                        endMonth={addDays(new Date(), 60)}
                        className="!m-0"
                      />
                    </div>

                    {values.date && (
                      <div>
                        <p className="text-sm font-medium text-zinc-700 mb-3">
                          Horários disponíveis
                        </p>
                        {loadingSlots ? (
                          <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className="h-12 rounded-xl bg-zinc-100 animate-pulse" />
                            ))}
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <TimeSlotButton
                                key={slot.time}
                                time={slot.time}
                                available={slot.available}
                                selected={values.time === slot.time}
                                onClick={() => setValue('time', slot.time, { shouldValidate: true })}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-zinc-400 py-6 text-sm">
                            Nenhum horário disponível para esta data.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-zinc-900">Confirme o agendamento</h2>
                    <p className="text-sm text-zinc-500 -mt-2">
                      Revise as informações antes de confirmar
                    </p>
                    <div className="bg-zinc-50 rounded-2xl p-5 space-y-4">
                      {[
                        { label: 'Nome', value: values.clientName },
                        { label: 'WhatsApp', value: values.clientPhone },
                        { label: 'Serviço', value: categories.find(c => c.id === values.categoryId)?.name },
                        { label: 'Profissional', value: professionals.find(p => p.id === values.professionalId)?.name },
                        { label: 'Data', value: values.date && format(new Date(values.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) },
                        { label: 'Horário', value: values.time },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-sm text-zinc-500">{item.label}</span>
                          <span className="text-sm font-medium text-zinc-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-zinc-100">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => goToStep(currentStep - 1)}
                className="flex-1"
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                Voltar
              </Button>
            )}
            {currentStep < 5 ? (
              <Button onClick={handleNext} className="flex-1 md:flex-none">
                Continuar
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={submitting}
                className="flex-1"
                size="lg"
              >
                Confirmar Agendamento
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
