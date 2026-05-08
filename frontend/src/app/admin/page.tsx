'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Badge } from '@/components/ui';
import { api } from '@/lib/api';
import { Appointment } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

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
    } catch (err) {
      console.error(err);
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
      await loadAppointments();
    } catch (err: any) {
      alert(err.message || 'Erro ao confirmar');
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
      await loadAppointments();
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar');
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
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Agendamentos</h1>
        <Button onClick={loadAppointments} variant="outline" size="sm">
          Atualizar
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {status === 'ALL' ? 'Todos' : status === 'PENDING' ? 'Pendentes' : status === 'CONFIRMED' ? 'Confirmados' : 'Cancelados'}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-zinc-500">Nenhum agendamento encontrado.</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                    Profissional
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                    Data/Hora
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-zinc-50">
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
                            >
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancel(appointment.id)}
                              loading={actionId === appointment.id && loading}
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
                          >
                            Cancelar
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