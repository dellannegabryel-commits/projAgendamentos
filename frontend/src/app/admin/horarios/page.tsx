'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input, Select, Modal } from '@/components/ui';
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

  const [formData, setFormData] = useState({
    professionalId: '',
    dayOfWeek: '1',
    startTime: '09:00',
    endTime: '18:00',
    isActive: true
  });

  const loadData = async () => {
    try {
      const [availData, profData] = await Promise.all([
        api.availabilities.list(),
        api.professionals.list()
      ]);
      setAvailabilities(availData);
      setProfessionals(profData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      setFormData({
        professionalId: '',
        dayOfWeek: '1',
        startTime: '09:00',
        endTime: '18:00',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAvailability(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.professionalId) {
      alert('Selecione um profissional');
      return;
    }
    
    const payload = {
      ...formData,
      dayOfWeek: Number(formData.dayOfWeek)
    };
    
    setLoading(true);
    try {
      if (editingAvailability) {
        await api.availabilities.update(editingAvailability.id, payload);
      } else {
        await api.availabilities.create(payload);
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar horário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;
    try {
      await api.availabilities.delete(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    }
  };

  const getDiaNome = (dia: number) => {
    return DIAS_SEMANA.find(d => d.value === String(dia))?.label || 'Desconhecido';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Horários de Atendimento</h1>
        <Button onClick={() => handleOpenModal()} variant="primary" size="sm">
          Novo Horário
        </Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Profissional
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Dia da Semana
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Horário
                </th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {availabilities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum horário encontrado.
                  </td>
                </tr>
              ) : (
                availabilities.map((avail) => (
                  <tr key={avail.id} className="hover:bg-zinc-50">
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
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(avail)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(avail.id)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAvailability ? 'Editar Horário' : 'Novo Horário'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Profissional"
            value={formData.professionalId}
            onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
            options={professionals.map((p) => ({ value: p.id, label: p.name }))}
            required
          />
          <Select
            label="Dia da Semana"
            value={formData.dayOfWeek}
            onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
            options={DIAS_SEMANA}
            required
          />
          <div className="flex gap-4">
            <Input
              label="Hora de Início"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
            <Input
              label="Hora de Fim"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
