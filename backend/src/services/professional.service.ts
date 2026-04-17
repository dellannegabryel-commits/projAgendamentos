import { ProfessionalRepository } from '../repositories/index.js';
import { z } from 'zod';

const professionalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  categoryId: z.string().uuid('ID da categoria inválido'),
  address: z.string().optional().default('')
});

export type CreateProfessionalInput = z.infer<typeof professionalSchema>;
export type UpdateProfessionalInput = Partial<CreateProfessionalInput>;

export class ProfessionalService {
  private repository = new ProfessionalRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findByCategoryId(categoryId: string) {
    return this.repository.findByCategoryId(categoryId);
  }

  async findById(id: string) {
    const professional = await this.repository.findById(id);
    if (!professional) throw new Error('Profissional não encontrado');
    return professional;
  }

  async create(data: CreateProfessionalInput) {
    const parsed = professionalSchema.parse(data);
    return this.repository.create(parsed);
  }

  async update(id: string, data: UpdateProfessionalInput) {
    await this.findById(id);
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }
}