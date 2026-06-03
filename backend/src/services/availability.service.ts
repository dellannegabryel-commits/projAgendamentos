import { AvailabilityRepository, AppointmentRepository } from '../repositories/index.js';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { ConflictError } from '../shared/errors/index.js';
import { getDayOfWeekInBRT, formatTimeInBRT } from '../shared/timezone/index.js';
import { z } from 'zod';

const availabilitySchema = z.object({
  professionalId: z.string().uuid('ID do profissional inválido'),
  dayOfWeek: z.number().min(0).max(6, 'Dia da semana deve ser 0-6'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário deve ser HH:MM válido'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário deve ser HH:MM válido')
}).refine(d => d.startTime < d.endTime, {
  message: 'startTime deve ser menor que endTime'
});

export type CreateAvailabilityInput = z.infer<typeof availabilitySchema>;
export type UpdateAvailabilityInput = Partial<CreateAvailabilityInput>;

export interface TimeSlot {
  time: string;
  available: boolean;
}

export class AvailabilityService {
  private availabilityRepo = new AvailabilityRepository();
  private appointmentRepo = new AppointmentRepository();

  async findAll() {
    return this.availabilityRepo.findAll();
  }

  async findByProfessionalId(professionalId: string) {
    return this.availabilityRepo.findByProfessionalId(professionalId);
  }

  async create(data: CreateAvailabilityInput) {
    const parsed = availabilitySchema.parse(data);
    try {
      return await this.availabilityRepo.create({
        dayOfWeek: parsed.dayOfWeek,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        professional: { connect: { id: parsed.professionalId } }
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError(
          'Já existe um horário com este início para este profissional neste dia',
          'DUPLICATE_AVAILABILITY'
        );
      }
      throw err;
    }
  }

  async update(id: string, data: UpdateAvailabilityInput) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.professionalId) {
      updateData.professional = { connect: { id: data.professionalId } };
      delete updateData.professionalId;
    }
    try {
      return await this.availabilityRepo.update(id, updateData);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError(
          'Já existe um horário com este início para este profissional neste dia',
          'DUPLICATE_AVAILABILITY'
        );
      }
      throw err;
    }
  }

  async delete(id: string) {
    return this.availabilityRepo.delete(id);
  }

  async getAvailableSlots(professionalId: string, date: Date) {
    const dayOfWeek = getDayOfWeekInBRT(date);
    const availabilities = await this.availabilityRepo.findByProfessionalId(professionalId);

    const dayAvailabilities = availabilities.filter(a => a.dayOfWeek === dayOfWeek);
    if (dayAvailabilities.length === 0) return [];

    const dateStart = new Date(date);
    dateStart.setUTCHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setUTCHours(23, 59, 59, 999);

    const appointments = await this.appointmentRepo.findAll({
      professionalId,
      dateFrom: dateStart,
      dateTo: dateEnd
    });

    const bookedSet = new Set(
      appointments
        .filter(a => a.status !== AppointmentStatus.CANCELLED)
        .map(a => formatTimeInBRT(a.date))
    );

    const slots: TimeSlot[] = [];

    for (const avail of dayAvailabilities) {
      const availSlots = this.generateTimeSlots(avail.startTime, avail.endTime);
      for (const slot of availSlots) {
        slots.push({
          time: slot,
          available: !bookedSet.has(slot)
        });
      }
    }

    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }

  private generateTimeSlots(start: string, end: string): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let current = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (current < endMinutes) {
      const hour = Math.floor(current / 60);
      const min = current % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      current += 30;
    }

    return slots;
  }
}