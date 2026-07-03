'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button, Card, Input, Select, Modal } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { FormField } from '@/components/forms/FormField';
import { api, Professional, Category } from '@/lib/api';
import { maskPhone } from '@/lib/phone';

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', categoryIds: [] as string[], photoUrl: '' });

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
      setFormData({
        name: professional.name,
        phone: professional.phone,
        address: professional.address,
        categoryIds: professional.categories.map(c => c.category.id),
        photoUrl: professional.photoUrl || '',
      });
    } else {
      setEditingProfessional(null);
      setFormData({ name: '', phone: '', address: '', categoryIds: [], photoUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProfessional(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categoryIds.length === 0) { toast.error('Selecione ao menos uma categoria'); return; }
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        categoryIds: formData.categoryIds,
        photoUrl: formData.photoUrl || undefined,
      };
      if (editingProfessional) {
        await api.professionals.update(editingProfessional.id, payload);
        toast.success('Profissional atualizado');
      } else {
        await api.professionals.create(payload);
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
                      <div className="text-sm text-zinc-500">
                        {professional.categories?.map(c => c.category.name).join(', ') || 'N/A'}
                      </div>
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
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })} required placeholder="(63) 99999-9999" inputMode="numeric" />
          </FormField>
          <FormField label="Endereço" required>
            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required placeholder="Rua, número, bairro" />
          </FormField>
          <FormField label="Categorias (selecione uma ou mais)" required>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 hover:border-zinc-300 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, categoryIds: [...formData.categoryIds, cat.id] });
                      } else {
                        setFormData({ ...formData, categoryIds: formData.categoryIds.filter(id => id !== cat.id) });
                      }
                    }}
                    className="h-4 w-4 accent-primary-500"
                  />
                  <div className="text-sm">
                    <span className="font-medium text-zinc-900">{cat.name}</span>
                    <span className="text-zinc-400 ml-2">({cat.duration} min)</span>
                  </div>
                </label>
              ))}
            </div>
          </FormField>
          <FormField label="URL da Foto (opcional)">
            <Input value={formData.photoUrl} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })} placeholder="https://exemplo.com/foto.jpg" />
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
