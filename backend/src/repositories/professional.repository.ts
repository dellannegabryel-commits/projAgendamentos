import { prisma } from './prisma.js';
import { Professional, Prisma } from '@prisma/client';

const professionalInclude = {
  categories: { include: { category: true } },
} satisfies Prisma.ProfessionalInclude;

export class ProfessionalRepository {
  async findAll() {
    return prisma.professional.findMany({
      where: { isActive: true },
      include: professionalInclude,
      orderBy: { name: 'asc' }
    });
  }

  async findByCategoryId(categoryId: string) {
    return prisma.professional.findMany({
      where: { categories: { some: { categoryId } }, isActive: true },
      include: professionalInclude,
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return prisma.professional.findFirst({
      where: { id, isActive: true },
      include: { ...professionalInclude, availabilities: true }
    });
  }

  async create(data: Prisma.ProfessionalCreateInput) {
    return prisma.professional.create({ data, include: professionalInclude });
  }

  async update(id: string, data: Prisma.ProfessionalUpdateInput) {
    return prisma.professional.update({ where: { id }, data, include: professionalInclude });
  }

  async delete(id: string) {
    return prisma.professional.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
