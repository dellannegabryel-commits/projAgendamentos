import { prisma } from './prisma.js';
import { Appointment, Prisma, AppointmentStatus } from '@prisma/client';

export interface FindAllFilters {
  status?: AppointmentStatus;
  professionalId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: 'date' | 'createdAt' | 'status';
  order?: 'asc' | 'desc';
}

export interface PaginatedAppointments {
  data: Appointment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const appointmentInclude = {
  professional: {
    include: { categories: { include: { category: true } } }
  }
} satisfies Prisma.AppointmentInclude;

export class AppointmentRepository {
  async findAll(filters?: FindAllFilters): Promise<PaginatedAppointments> {
    const where: Prisma.AppointmentWhereInput = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.professionalId) where.professionalId = filters.professionalId;
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters?.dateFrom) where.date.gte = filters.dateFrom;
      if (filters?.dateTo) where.date.lte = filters.dateTo;
    }

    const page = Math.max(1, filters?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters?.pageSize ?? 50));
    const sortBy = filters?.sortBy ?? 'date';
    const order = filters?.order ?? 'asc';

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: appointmentInclude,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string): Promise<Appointment | null> {
    return prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude
    });
  }

  async findByProfessionalAndDate(professionalId: string, date: Date): Promise<Appointment | null> {
    return prisma.appointment.findFirst({
      where: {
        professionalId,
        date: date,
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

  async updateStatusWhere(where: { id: string; status: AppointmentStatus }, newStatus: AppointmentStatus): Promise<number> {
    const result = await prisma.appointment.updateMany({
      where: { id: where.id, status: where.status },
      data: { status: newStatus }
    });
    return result.count;
  }

  async delete(id: string): Promise<void> {
    await prisma.appointment.delete({ where: { id } });
  }
}
