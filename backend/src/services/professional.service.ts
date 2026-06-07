import { ProfessionalRepository } from '../repositories/index.js';
import { NotFoundError } from '../shared/errors/index.js';
import { z } from 'zod';

const professionalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string()
    .transform(s => s.replace(/\D/g, ''))
    .pipe(z.string().regex(/^\d{10,11}$/, 'Telefone inválido')),
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
    if (!professional) throw new NotFoundError('Profissional não encontrado');
    return professional;
  }

  async create(data: CreateProfessionalInput) {
    const parsed = professionalSchema.parse(data);
    return this.repository.create({
      name: parsed.name,
      phone: parsed.phone,
      address: parsed.address,
      category: { connect: { id: parsed.categoryId } }
    });
  }

  async update(id: string, data: UpdateProfessionalInput) {
    await this.findById(id);
    const updateData: Record<string, unknown> = { ...data };
    if (data.categoryId) {
      updateData.category = { connect: { id: data.categoryId } };
      delete updateData.categoryId;
    }
    return this.repository.update(id, updateData);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }
}