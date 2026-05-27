'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button, Card, Input, Select, Modal } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { api, Availability, Professional } from '@/lib/api';

const DIAS_SEMANA = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
];

export default function AvailabilitiesPage() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [formData, setFormData] = useState({ professionalId: '', dayOfWeek: '1', startTime: '09:00', endTime: '18:00', isActive: true });

  const loadData = async () => {
    try {
      const [availData, profData] = await Promise.all([api.availabilities.list(), api.professionals.list()]);
      setAvailabilities(availData);
      setProfessionals(profData);
    } catch {
      toast.error('Erro ao carregar dados');
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenModal = (availability?: Availability) => {
    if (availability) {
      setEditingAvailability(availability);
      setFormData({
        professionalId: availability.professionalId,
        dayOfWeek: String(availability.dayOfWeek),
        startTime: availability.startTime,
        endTime: availability.endTime,
        isActive: availability.isActive,
      });
    } else {
      setEditingAvailability(null);
      setFormData({ professionalId: '', dayOfWeek: '1', startTime: '09:00', endTime: '18:00', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingAvailability(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.professionalId) { toast.error('Selecione um profissional'); return; }
    const payload = { ...formData, dayOfWeek: Number(formData.dayOfWeek) };
    setLoading(true);
    try {
      if (editingAvailability) {
        await api.availabilities.update(editingAvailability.id, payload);
        toast.success('Horário atualizado');
      } else {
        await api.availabilities.create(payload);
        toast.success('Horário criado');
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar horário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;
    try {
      await api.availabilities.delete(id);
      toast.success('Horário excluído');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    }
  };

  const getDiaNome = (dia: number) => DIAS_SEMANA.find(d => d.value === String(dia))?.label || 'Desconhecido';

  return (
    <div>
      <PageHeader
        title="Horários de Atendimento"
        description="Defina os dias e horários disponíveis de cada profissional"
        action={
          <Button onClick={() => handleOpenModal()} icon={<Plus className="h-4 w-4" />}>
            Novo Horário
          </Button>
        }
      />

      {availabilities.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum horário cadastrado"
            description="Adicione horários de atendimento para os profissionais."
            action={
              <Button onClick={() => handleOpenModal()} icon={<Plus className="h-4 w-4" />}>
                Adicionar Horário
              </Button>
            }
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Profissional', 'Dia da Semana', 'Horário', 'Ações'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {availabilities.map((avail) => (
                  <tr key={avail.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{avail.professional?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-900">{getDiaNome(avail.dayOfWeek)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-500">{avail.startTime} - {avail.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(avail)} icon={<Pencil className="h-4 w-4" />}>Editar</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(avail.id)} icon={<Trash2 className="h-4 w-4" />}>Excluir</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAvailability ? 'Editar Horário' : 'Novo Horário'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Profissional"
            placeholder="Selecione um profissional"
            value={formData.professionalId}
            onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
            options={professionals.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Select
            label="Dia da Semana"
            placeholder="Selecione o dia"
            value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
            options={DIAS_SEMANA}
          />
          <div className="flex gap-4">
            <Input label="Início" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
            <Input label="Fim" type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" loading={loading}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
