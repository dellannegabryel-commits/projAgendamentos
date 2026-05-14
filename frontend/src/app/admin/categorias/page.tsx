'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button, Card, Input, Modal } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { api, Category } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const loadCategories = async () => {
    try {
      const data = await api.categories.list();
      setCategories(data);
    } catch {
      toast.error('Erro ao carregar categorias');
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        await api.categories.update(editingCategory.id, formData);
        toast.success('Categoria atualizada');
      } else {
        await api.categories.create(formData);
        toast.success('Categoria criada');
      }
      await loadCategories();
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.categories.delete(id);
      toast.success('Categoria excluída');
      await loadCategories();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    }
  };

  return (
    <div>
      <PageHeader
        title="Categorias"
        description="Gerencie os serviços disponíveis para agendamento"
        action={
          <Button onClick={() => handleOpenModal()} icon={<Plus className="h-4 w-4" />}>
            Nova Categoria
          </Button>
        }
      />

      {categories.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhuma categoria"
            description="Crie sua primeira categoria para começar."
            action={
              <Button onClick={() => handleOpenModal()} icon={<Plus className="h-4 w-4" />}>
                Criar Categoria
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
                  {['Nome', 'Descrição', 'Ações'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-500">{category.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(category)} icon={<Pencil className="h-4 w-4" />}>
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(category.id)} icon={<Trash2 className="h-4 w-4" />}>
                          Excluir
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Ex: Corte de Cabelo" />
          <Input label="Descrição" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Opcional" />
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit" loading={loading}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
