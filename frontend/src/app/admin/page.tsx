'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Trash2, XCircle, CheckCircle, Search, Users, Clock } from 'lucide-react';
import { Button, Card, Badge, Input } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { api } from '@/lib/api';
import type { Appointment } from '@/lib/api';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type FilterStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

const filters = [
  { value: 'ALL' as const, label: 'Todos' },
  { value: 'PENDING' as const, label: 'Pendentes' },
  { value: 'CONFIRMED' as const, label: 'Confirmados' },
  { value: 'CANCELLED' as const, label: 'Cancelados' },
];

const statusColors = {
  PENDING: { variant: 'warning' as const, label: 'Pendente' },
  CONFIRMED: { variant: 'success' as const, label: 'Confirmado' },
  CANCELLED: { variant: 'error' as const, label: 'Cancelado' },
} as const;

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionalsCount, setProfessionalsCount] = useState(0);
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadAppointments = async () => {
    try {
      const status = filter === 'ALL' ? undefined : filter;
      const data = await Promise.all([
        api.appointments.list({ status }),
        api.professionals.list(),
      ]);
      setAppointments(data[0]);
      setProfessionalsCount(data[1].length);
    } catch {
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAppointments();
  }, [filter]);

  const kpis = useMemo(() => {
    const today = new Date();
    const todayStart = startOfDay(today).toISOString();
    const todayEnd = endOfDay(today).toISOString();

    const confirmedToday = appointments.filter(
      (a) => a.status === 'CONFIRMED' && a.date >= todayStart && a.date <= todayEnd
    );
    const pending = appointments.filter((a) => a.status === 'PENDING');
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED');

    return { confirmedToday: confirmedToday.length, pending: pending.length, cancelled: cancelled.length, professionals: professionalsCount };
  }, [appointments, professionalsCount]);

  const filteredAppointments = useMemo(() => {
    if (!search.trim()) return appointments;
    const q = search.toLowerCase();
    return appointments.filter(
      (a) =>
        a.clientName.toLowerCase().includes(q) ||
        a.clientPhone.includes(q) ||
        a.professional.name.toLowerCase().includes(q)
    );
  }, [appointments, search]);

  const handleConfirm = async (id: string) => {
    setActionId(id);
    try {
      await api.appointments.confirm(id);
      toast.success('Agendamento confirmado com sucesso!');
      await loadAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao confirmar');
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar?')) return;
    setActionId(id);
    try {
      await api.appointments.cancel(id);
      toast.success('Agendamento cancelado');
      await loadAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cancelar');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    setActionId(id);
    try {
      await api.appointments.delete(id);
      toast.success('Agendamento excluído');
      await loadAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    } finally {
      setActionId(null);
    }
  };

  const kpiCards = [
    { label: 'Pendentes', value: kpis.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Confirmados Hoje', value: kpis.confirmedToday, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Cancelados', value: kpis.cancelled, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Profissionais', value: kpis.professionals, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral dos agendamentos do sistema"
        action={
          <Button onClick={loadAppointments} variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />}>
            Atualizar
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <CardSkeleton />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {kpiCards.map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">{kpi.label}</p>
                    <p className="text-2xl font-bold text-zinc-900">{kpi.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mb-6">
            <div className="p-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Buscar por cliente, telefone ou profissional..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-0 bg-transparent"
                />
              </div>
            </div>
          </Card>

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
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title="Nenhum resultado para a busca"
                description={`Nenhum agendamento encontrado para "${search}".`}
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
                    {filteredAppointments.map((appointment) => {
                      const statusConfig = statusColors[appointment.status];
                      return (
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
                          <td className="px-6 py-4">
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-end">
                              {appointment.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleConfirm(appointment.id)}
                                    loading={actionId === appointment.id}
                                    icon={<CheckCircle className="h-4 w-4" />}
                                  >
                                    Confirmar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCancel(appointment.id)}
                                    loading={actionId === appointment.id}
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
                                  loading={actionId === appointment.id}
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
                                  loading={actionId === appointment.id}
                                  icon={<Trash2 className="h-4 w-4" />}
                                >
                                  Excluir
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
