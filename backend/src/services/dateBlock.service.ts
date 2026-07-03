import { DateBlockRepository } from '../repositories/index.js';
import { NotFoundError, ConflictError } from '../shared/errors/index.js';
import { z } from 'zod';

const dateBlockSchema = z.object({
  professionalId: z.string().uuid('ID do profissional inválido'),
  date: z.string()
    .refine(d => /^\d{4}-\d{2}-\d{2}$/.test(d), 'Data deve estar no formato YYYY-MM-DD')
    .refine(d => !isNaN(new Date(d).getTime()), 'Data inválida'),
  reason: z.string().max(200).optional()
});

export type CreateDateBlockInput = z.input<typeof dateBlockSchema>;

export class DateBlockService {
  private repository = new DateBlockRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async create(data: CreateDateBlockInput) {
    const parsed = dateBlockSchema.parse(data);
    const date = new Date(`${parsed.date}T00:00:00Z`);

    const existing = await this.repository.findOverlapping(parsed.professionalId, date);
    if (existing) {
      throw new ConflictError('Já existe um bloqueio para este profissional nesta data', 'DUPLICATE_DATE_BLOCK');
    }

    return this.repository.create({
      professional: { connect: { id: parsed.professionalId } },
      date,
      reason: parsed.reason
    });
  }

  async delete(id: string) {
    try {
      return await this.repository.delete(id);
    } catch {
      throw new NotFoundError('Bloqueio não encontrado');
    }
  }
}
