import { prisma } from './prisma.js';
import { Availability, Prisma } from '@prisma/client';

export class AvailabilityRepository {
  async findAll(): Promise<Availability[]> {
    return prisma.availability.findMany({
      where: { isActive: true },
      include: { professional: true },
      orderBy: [ { dayOfWeek: 'asc' }, { startTime: 'asc' } ]
    });
  }
  async findByProfessionalId(professionalId: string): Promise<Availability[]> {
    return prisma.availability.findMany({
      where: { professionalId, isActive: true },
      orderBy: [ { dayOfWeek: 'asc' }, { startTime: 'asc' } ]
    });
  }

  async findById(id: string): Promise<Availability | null> {
    return prisma.availability.findUnique({ where: { id } });
  }

  async create(data: Prisma.AvailabilityCreateInput): Promise<Availability> {
    return prisma.availability.create({ data });
  }

  async update(id: string, data: Prisma.AvailabilityUpdateInput): Promise<Availability> {
    return prisma.availability.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Availability> {
    return prisma.availability.update({
      where: { id },
      data: { isActive: false }
    });
  }
}