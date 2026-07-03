import { prisma } from './prisma.js';
import { Prisma } from '@prisma/client';

export class DateBlockRepository {
  async findAll() {
    return prisma.dateBlock.findMany({
      include: { professional: true },
      orderBy: [{ professionalId: 'asc' }, { date: 'asc' }]
    });
  }

  async findByProfessionalId(professionalId: string) {
    return prisma.dateBlock.findMany({
      where: { professionalId }
    });
  }

  async findOverlapping(professionalId: string, date: Date) {
    return prisma.dateBlock.findFirst({
      where: { professionalId, date }
    });
  }

  async create(data: Prisma.DateBlockCreateInput) {
    return prisma.dateBlock.create({
      data,
      include: { professional: true }
    });
  }

  async delete(id: string) {
    return prisma.dateBlock.delete({ where: { id } });
  }
}
