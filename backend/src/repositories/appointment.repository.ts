import { prisma } from './prisma.js';
import { Appointment, Prisma, AppointmentStatus } from '@prisma/client';

export class AppointmentRepository {
  async findAll(filters?: { status?: AppointmentStatus; professionalId?: string; dateFrom?: Date; dateTo?: Date }): Promise<Appointment[]> {
    const where: Prisma.AppointmentWhereInput = {};
    
    if (filters?.status) where.status = filters.status;
    if (filters?.professionalId) where.professionalId = filters.professionalId;
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters?.dateFrom) where.date.gte = filters.dateFrom;
      if (filters?.dateTo) where.date.lte = filters.dateTo;
    }

    return prisma.appointment.findMany({
      where,
      include: { professional: { include: { category: true } } },
      orderBy: { date: 'asc' }
    });
  }

  async findById(id: string): Promise<Appointment | null> {
    return prisma.appointment.findUnique({
      where: { id },
      include: { professional: { include: { category: true } } }
    });
  }

  async findByProfessionalAndDate(professionalId: string, date: Date): Promise<Appointment | null> {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    return prisma.appointment.findFirst({
      where: {
        professionalId,
        date: { gte: dateStart, lte: dateEnd },
        status: { not: AppointmentStatus.CANCELLED }
      }
    });
  }

  async create(data: Prisma.AppointmentCreateInput): Promise<Appointment> {
    return prisma.appointment.create({ data });
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return prisma.appointment.update({
      where: { id },
      data: { status }
    });
  }
}