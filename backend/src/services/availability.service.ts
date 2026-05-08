import { AvailabilityRepository, AppointmentRepository } from '../repositories/index.js';
import { AppointmentStatus } from '@prisma/client';
import { z } from 'zod';

const availabilitySchema = z.object({
  professionalId: z.string().uuid('ID do profissional inválido'),
  dayOfWeek: z.number().min(0).max(6, 'Dia da semana deve ser 0-6'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato deve ser HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato deve ser HH:MM')
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

  async findByProfessionalId(professionalId: string) {
    return this.availabilityRepo.findByProfessionalId(professionalId);
  }

  async create(data: CreateAvailabilityInput) {
    const parsed = availabilitySchema.parse(data);
    return this.availabilityRepo.create({
      dayOfWeek: parsed.dayOfWeek,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      professional: { connect: { id: parsed.professionalId } }
    });
  }

  async update(id: string, data: UpdateAvailabilityInput) {
    const updateData: Record<string, unknown> = { ...data };
    if (data.professionalId) {
      updateData.professional = { connect: { id: data.professionalId } };
      delete updateData.professionalId;
    }
    return this.availabilityRepo.update(id, updateData);
  }

  async delete(id: string) {
    return this.availabilityRepo.delete(id);
  }

  async getAvailableSlots(professionalId: string, date: Date) {
    const dayOfWeek = date.getDay();
    const availabilities = await this.availabilityRepo.findByProfessionalId(professionalId);
    
    const dayAvailabilities = availabilities.filter(a => a.dayOfWeek === dayOfWeek);
    if (dayAvailabilities.length === 0) return [];

    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const appointments = await this.appointmentRepo.findAll({
      professionalId,
      dateFrom: dateStart,
      dateTo: dateEnd
    });

    const bookedTimes = appointments
      .filter(a => a.status !== AppointmentStatus.CANCELLED)
      .map(a => this.formatTime(a.date));

    const slots: TimeSlot[] = [];

    for (const avail of dayAvailabilities) {
      const availSlots = this.generateTimeSlots(avail.startTime, avail.endTime);
      for (const slot of availSlots) {
        slots.push({
          time: slot,
          available: !bookedTimes.includes(slot)
        });
      }
    }

    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
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