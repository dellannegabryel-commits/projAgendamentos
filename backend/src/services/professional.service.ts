import { ProfessionalRepository } from '../repositories/index.js';
import { NotFoundError } from '../shared/errors/index.js';
import { z } from 'zod';

const professionalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string()
    .transform(s => s.replace(/\D/g, ''))
    .pipe(z.string().regex(/^\d{10,11}$/, 'Telefone inválido')),
  categoryIds: z.array(z.string().uuid('ID da categoria inválido')).min(1, 'Selecione ao menos uma categoria'),
  address: z.string().optional().default(''),
  photoUrl: z.string().url('URL da foto inválida').optional().or(z.literal(''))
});

export type CreateProfessionalInput = z.input<typeof professionalSchema>;
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
      photoUrl: parsed.photoUrl || null,
      categories: {
        create: parsed.categoryIds.map(id => ({ categoryId: id }))
      }
    });
  }

  async update(id: string, data: UpdateProfessionalInput) {
    await this.findById(id);
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone.replace(/\D/g, '');
    if (data.address !== undefined) updateData.address = data.address;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl || null;
    if (data.categoryIds !== undefined) {
      updateData.categories = {
        deleteMany: {},
        create: data.categoryIds.map(id => ({ categoryId: id }))
      };
    }
    return this.repository.update(id, updateData);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }
}
