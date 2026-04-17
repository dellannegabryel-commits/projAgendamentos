import { prisma } from './prisma.js';
import { Professional, Prisma } from '@prisma/client';

export class ProfessionalRepository {
  async findAll(): Promise<Professional[]> {
    return prisma.professional.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: 'asc' }
    });
  }

  async findByCategoryId(categoryId: string): Promise<Professional[]> {
    return prisma.professional.findMany({
      where: { categoryId, isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string): Promise<Professional | null> {
    return prisma.professional.findUnique({
      where: { id },
      include: { category: true, availabilities: true }
    });
  }

  async create(data: Prisma.ProfessionalCreateInput): Promise<Professional> {
    return prisma.professional.create({ data });
  }

  async update(id: string, data: Prisma.ProfessionalUpdateInput): Promise<Professional> {
    return prisma.professional.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Professional> {
    return prisma.professional.update({
      where: { id },
      data: { isActive: false }
    });
  }
}