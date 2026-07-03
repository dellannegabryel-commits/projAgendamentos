'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input, Select, Modal } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { FormField } from '@/components/forms/FormField';
import { api, DateBlock, Professional } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DateBlocksPage() {
  const [blocks, setBlocks] = useState<DateBlock[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ professionalId: '', date: '', reason: '' });

  const loadData = async () => {
    try {
      const [blockData, profData] = await Promise.all([api.dateBlocks.list(), api.professionals.list()]);
      setBlocks(blockData);
      setProfessionals(profData);
    } catch {
      toast.error('Erro ao carregar dados');
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData({ professionalId: '', date: format(tomorrow, 'yyyy-MM-dd'), reason: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.professionalId) { toast.error('Selecione um profissional'); return; }
    setLoading(true);
    try {
      await api.dateBlocks.create(formData);
      toast.success('Bloqueio criado');
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar bloqueio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este bloqueio?')) return;
    try {
      await api.dateBlocks.delete(id);
      toast.success('Bloqueio removido');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover bloqueio');
    }
  };

  return (
    <div>
      <PageHeader
        title="Bloqueios de Agenda"
        description="Bloqueie datas específicas para cada profissional (feriados, férias, etc.)"
        action={
          <Button onClick={handleOpenModal} icon={<Plus className="h-4 w-4" />}>
            Novo Bloqueio
          </Button>
        }
      />

      {blocks.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum bloqueio"
            description="Crie bloqueios para impedir agendamentos em datas específicas."
            action={
              <Button onClick={handleOpenModal} icon={<Plus className="h-4 w-4" />}>
                Criar Bloqueio
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
                  {['Profissional', 'Data', 'Motivo', 'Ações'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {blocks.map((block) => (
                  <tr key={block.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{block.professional?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-900">
                        {format(new Date(block.date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-500">{block.reason || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(block.id)} icon={<Trash2 className="h-4 w-4" />}>
                          Remover
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Novo Bloqueio">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Profissional"
            placeholder="Selecione um profissional"
            value={formData.professionalId}
            onChange={(e) => setFormData({ ...formData, professionalId: e.target.value })}
            options={professionals.map((p) => ({ value: p.id, label: p.name }))}
          />
          <FormField label="Data" required>
            <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required min={format(new Date(), 'yyyy-MM-dd')} />
          </FormField>
          <FormField label="Motivo (opcional)">
            <Input value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Ex: Feriado municipal" />
          </FormField>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" loading={loading}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
