'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Input, Select, Modal } from '@/components/ui';
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
      const [profData, catData] = await Promise.all([
        api.professionals.list(),
        api.categories.list()
      ]);
      setProfessionals(profData);
      setCategories(catData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (professional?: Professional) => {
    if (professional) {
      setEditingProfessional(professional);
      setFormData({
        name: professional.name,
        phone: professional.phone,
        address: professional.address,
        categoryId: professional.categoryId,
      });
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
    if (!formData.categoryId) {
      alert('Selecione uma categoria');
      return;
    }
    
    setLoading(true);
    try {
      if (editingProfessional) {
        await api.professionals.update(editingProfessional.id, formData);
      } else {
        await api.professionals.create(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar profissional');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return;
    try {
      await api.professionals.delete(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Profissionais</h1>
        <Button onClick={() => handleOpenModal()} variant="primary" size="sm">
          Novo Profissional
        </Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Nome
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Contato/Endereço
                </th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Categoria
                </th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {professionals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum profissional encontrado.
                  </td>
                </tr>
              ) : (
                professionals.map((professional) => (
                  <tr key={professional.id} className="hover:bg-zinc-50">
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
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(professional)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(professional.id)}>
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
        title={editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Telefone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Endereço"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <Select
            label="Categoria"
            placeholder="Selecione uma categoria"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
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
