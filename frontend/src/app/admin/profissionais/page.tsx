'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button, Card, Input, Select, Modal } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { FormField } from '@/components/forms/FormField';
import { api, Professional, Category } from '@/lib/api';

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', categoryId: '' });

  const loadData = async () => {
    try {
      const [profData, catData] = await Promise.all([api.professionals.list(), api.categories.list()]);
      setProfessionals(profData);
      setCategories(catData);
    } catch {
      toast.error('Erro ao carregar dados');
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenModal = (professional?: Professional) => {
    if (professional) {
      setEditingProfessional(professional);
      setFormData({ name: professional.name, phone: professional.phone, address: professional.address, categoryId: professional.categoryId });
    } else {
      setEditingProfessional(null);
      setFormData({ name: '', phone: '', address: '', categoryId: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProfessional(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) { toast.error('Selecione uma categoria'); return; }
    setLoading(true);
    try {
      if (editingProfessional) {
        await api.professionals.update(editingProfessional.id, formData);
        toast.success('Profissional atualizado');
      } else {
        await api.professionals.create(formData);
        toast.success('Profissional criado');
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar profissional');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return;
    try {
      await api.professionals.delete(id);
      toast.success('Profissional excluído');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    }
  };

  return (
    <div>
      <PageHeader
        title="Profissionais"
        description="Gerencie os profissionais que realizam os serviços"
        action={
          <Button onClick={() => handleOpenModal()} icon={<Plus className="h-4 w-4" />}>
            Novo Profissional
          </Button>
        }
      />

      {professionals.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum profissional"
            description="Adicione profissionais para começar a receber agendamentos."
            action={
              <Button onClick={() => handleOpenModal()} icon={<Plus className="h-4 w-4" />}>
                Adicionar Profissional
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
                  {['Nome', 'Contato/Endereço', 'Categoria', 'Ações'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {professionals.map((professional) => (
                  <tr key={professional.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{professional.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-900">{professional.phone}</div>
                      <div className="text-xs text-zinc-500">{professional.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-500">{professional.category?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(professional)} icon={<Pencil className="h-4 w-4" />}>Editar</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(professional.id)} icon={<Trash2 className="h-4 w-4" />}>Excluir</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nome" required>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Nome completo" />
          </FormField>
          <FormField label="Telefone" required>
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required placeholder="(63) 99999-9999" />
          </FormField>
          <FormField label="Endereço" required>
            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required placeholder="Rua, número, bairro" />
          </FormField>
          <Select
            label="Categoria"
            placeholder="Selecione uma categoria"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" loading={loading}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
