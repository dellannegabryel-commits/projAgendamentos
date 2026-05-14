'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Trash2, XCircle, CheckCircle } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { api } from '@/lib/api';
import type { Appointment } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

const filters = [
  { value: 'ALL' as const, label: 'Todos' },
  { value: 'PENDING' as const, label: 'Pendentes' },
  { value: 'CONFIRMED' as const, label: 'Confirmados' },
  { value: 'CANCELLED' as const, label: 'Cancelados' },
];

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadAppointments = async () => {
    try {
      const status = filter === 'ALL' ? undefined : filter;
      const data = await api.appointments.list({ status });
      setAppointments(data);
    } catch {
      toast.error('Erro ao carregar agendamentos');
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const handleConfirm = async (id: string) => {
    setLoading(true);
    setActionId(id);
    try {
      await api.appointments.confirm(id);
      toast.success('Agendamento confirmado com sucesso!');
      await loadAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao confirmar');
    } finally {
      setLoading(false);
      setActionId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar?')) return;
    setLoading(true);
    setActionId(id);
    try {
      await api.appointments.cancel(id);
      toast.success('Agendamento cancelado');
      await loadAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cancelar');
    } finally {
      setLoading(false);
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    setLoading(true);
    setActionId(id);
    try {
      await api.appointments.delete(id);
      toast.success('Agendamento excluído');
      await loadAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    } finally {
      setLoading(false);
      setActionId(null);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pendente</Badge>;
      case 'CONFIRMED':
        return <Badge variant="success">Confirmado</Badge>;
      case 'CANCELLED':
        return <Badge variant="error">Cancelado</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Agendamentos"
        description="Gerencie todos os agendamentos do sistema"
        action={
          <Button onClick={loadAppointments} variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />}>
            Atualizar
          </Button>
        }
      />

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              filter === f.value
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum agendamento encontrado"
            description="Nenhum agendamento corresponde ao filtro selecionado."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Cliente', 'Profissional', 'Data/Hora', 'Status', 'Ações'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{appointment.clientName}</div>
                      <div className="text-sm text-zinc-500">{appointment.clientPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-900">{appointment.professional.name}</div>
                      <div className="text-xs text-zinc-500">{appointment.professional.category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-900">
                        {format(new Date(appointment.date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="text-sm text-zinc-500">
                        {format(new Date(appointment.date), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(appointment.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        {appointment.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleConfirm(appointment.id)}
                              loading={actionId === appointment.id && loading}
                              icon={<CheckCircle className="h-4 w-4" />}
                            >
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancel(appointment.id)}
                              loading={actionId === appointment.id && loading}
                              icon={<XCircle className="h-4 w-4" />}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        {appointment.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancel(appointment.id)}
                            loading={actionId === appointment.id && loading}
                            icon={<XCircle className="h-4 w-4" />}
                          >
                            Cancelar
                          </Button>
                        )}
                        {appointment.status === 'CANCELLED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(appointment.id)}
                            loading={actionId === appointment.id && loading}
                            icon={<Trash2 className="h-4 w-4" />}
                          >
                            Excluir
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
