'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, Card, Stepper } from '@/components/ui';
import { api } from '@/lib/api';
import { Category, Professional, TimeSlot } from '@/lib/api';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FormData {
  clientName: string;
  clientPhone: string;
  categoryId: string;
  professionalId: string;
  date: string;
  time: string;
}

const initialFormData: FormData = {
  clientName: '',
  clientPhone: '',
  categoryId: '',
  professionalId: '',
  date: '',
  time: '',
};

const steps = [
  { id: 1, label: 'Você' },
  { id: 2, label: 'Serviço' },
  { id: 3, label: 'Profissional' },
  { id: 4, label: 'Horário' },
  { id: 5, label: 'Confirmar' },
];

export default function AgendamentoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalAvailabilities, setProfessionalAvailabilities] = useState<number[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.categories.list().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      api.professionals.getByCategory(formData.categoryId).then(setProfessionals).catch(console.error);
    }
  }, [formData.categoryId]);

  useEffect(() => {
    if (formData.professionalId) {
      api.availabilities.getByProfessional(formData.professionalId)
        .then(data => {
          const days = Array.from(new Set(data.map(a => a.dayOfWeek)));
          setProfessionalAvailabilities(days);
        })
        .catch(console.error);
    }
  }, [formData.professionalId]);

  useEffect(() => {
    if (formData.professionalId && formData.date) {
      api.availabilities.getSlots(formData.professionalId, formData.date).then(setTimeSlots).catch(console.error);
    }
  }, [formData.professionalId, formData.date]);

  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.clientName || !formData.clientPhone) {
        setError('Preencha seu nome e telefone');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.categoryId) {
        setError('Selecione um serviço');
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.professionalId) {
        setError('Selecione um profissional');
        return;
      }
    }
    if (currentStep === 4) {
      if (!formData.date || !formData.time) {
        setError('Selecione data e horário');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.appointments.create({
        professionalId: formData.professionalId,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        date: `${formData.date}T${formData.time}:00`,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      date,
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, "EEEE, d 'de' MMMM", { locale: ptBR }),
    };
  }).filter(option => professionalAvailabilities.includes(option.date.getDay()));

  const timeOptions = timeSlots
    .filter((s) => s.available)
    .map((s) => ({ value: s.time, label: s.time }));

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">Agendamento Criado!</h1>
          <p className="text-zinc-600 mb-6">
            Seu agendamento está pendente. Você receberá uma confirmação via WhatsApp.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Fazer Novo Agendamento
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-center text-zinc-900 mb-8">
          Agendamento Online
        </h1>

        <Stepper steps={steps} currentStep={currentStep} />

        <Card className="mt-8">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Sobre você</h2>
              <Input
                label="Seu nome"
                placeholder="Digite seu nome completo"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
              <Input
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Escolha o serviço</h2>
              <Select
                label="Categoria"
                placeholder="Selecione um serviço"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData({ ...formData, categoryId: e.target.value, professionalId: '' });
                }}
              />
              {formData.categoryId && (
                <p className="text-sm text-zinc-500">
                  {categories.find((c) => c.id === formData.categoryId)?.description}
                </p>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Escolha o profissional</h2>
              <Select
                label="Profissional"
                placeholder="Selecione um profissional"
                options={professionals.map((p) => ({ value: p.id, label: p.name }))}
                value={formData.professionalId}
                onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
              />
              {formData.professionalId && (
                <p className="text-sm text-zinc-500">
                  {professionals.find((p) => p.id === formData.professionalId)?.address}
                </p>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Escolha o horário</h2>
              <Select
                label="Data"
                placeholder="Selecione uma data"
                options={dateOptions}
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value, time: '' });
                }}
              />
              {formData.date && (
                <Select
                  label="Horário"
                  placeholder="Selecione um horário"
                  options={timeOptions}
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              )}
              {timeOptions.length === 0 && formData.date && (
                <p className="text-sm text-zinc-500">Nenhum horário disponível para esta data.</p>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Confirme o agendamento</h2>
              <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nome</span>
                  <span className="text-zinc-900 font-medium">{formData.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">WhatsApp</span>
                  <span className="text-zinc-900 font-medium">{formData.clientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Serviço</span>
                  <span className="text-zinc-900 font-medium">
                    {categories.find((c) => c.id === formData.categoryId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Profissional</span>
                  <span className="text-zinc-900 font-medium">
                    {professionals.find((p) => p.id === formData.professionalId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Data</span>
                  <span className="text-zinc-900 font-medium">
                    {formData.date && format(new Date(formData.date), "dd/MM/yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Horário</span>
                  <span className="text-zinc-900 font-medium">{formData.time}</span>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

          <div className="flex gap-3 mt-6">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
            )}
            {currentStep < 5 ? (
              <Button onClick={handleNext} className="flex-1">
                Continuar
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} className="flex-1">
                Confirmar Agendamento
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}