import { CategoryRepository } from '../repositories/index.js';
import { NotFoundError } from '../shared/errors/index.js';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional()
});

export type CreateCategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export class CategoryService {
  private repository = new CategoryRepository();

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const category = await this.repository.findById(id);
    if (!category) throw new NotFoundError('Categoria não encontrada');
    return category;
  }

  async create(data: CreateCategoryInput) {
    const parsed = categorySchema.parse(data);
    return this.repository.create(parsed);
  }

  async update(id: string, data: UpdateCategoryInput) {
    await this.findById(id);
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }
}