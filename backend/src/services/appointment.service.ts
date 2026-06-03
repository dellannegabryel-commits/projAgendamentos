import { AppointmentRepository, ProfessionalRepository, AvailabilityRepository } from '../repositories/index.js';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { WhatsAppService } from './whatsapp.service.js';
import { NotFoundError, ConflictError, AppError } from '../shared/errors/index.js';
import { logger } from '../shared/logger/index.js';
import { getDayOfWeekInBRT, formatTimeInBRT, formatDateInBRT } from '../shared/timezone/index.js';
import { z } from 'zod';

const isoDateTime = z.string()
  .refine(
    s => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/.test(s),
    'Data deve estar no formato ISO 8601 com fuso horário (ex: 2026-12-15T10:00:00-03:00 ou 2026-12-15T13:00:00.000Z)'
  )
  .transform(s => new Date(s))
  .refine(d => !isNaN(d.getTime()), 'Data inválida');

const appointmentSchema = z.object({
  professionalId: z.string().uuid('ID do profissional inválido'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  clientPhone: z.string()
    .transform(s => s.replace(/\D/g, ''))
    .pipe(z.string().regex(/^\d{10,11}$/, 'Telefone inválido')),
  date: isoDateTime
});

export type CreateAppointmentInput = z.input<typeof appointmentSchema>;

export class AppointmentService {
  private appointmentRepo = new AppointmentRepository();
  private professionalRepo = new ProfessionalRepository();
  private availabilityRepo = new AvailabilityRepository();
  private whatsAppService = new WhatsAppService();

  async findAll(filters?: { status?: AppointmentStatus; professionalId?: string; dateFrom?: string; dateTo?: string }) {
    const parsedFilters = filters ? {
      status: filters.status,
      professionalId: filters.professionalId,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
    } : undefined;
    
    return this.appointmentRepo.findAll(parsedFilters);
  }

  async findById(id: string) {
    const appointment = await this.appointmentRepo.findById(id);
    if (!appointment) throw new NotFoundError('Agendamento não encontrado');
    return appointment;
  }

  async create(data: CreateAppointmentInput) {
    const parsed = appointmentSchema.parse(data);
    const now = new Date();

    if (parsed.date < now) {
      throw new AppError('A data do agendamento deve ser no futuro', 'PAST_DATE');
    }

    const dayOfWeek = getDayOfWeekInBRT(parsed.date);
    const timeStr = formatTimeInBRT(parsed.date);

    const availabilities = await this.availabilityRepo.findByProfessionalId(parsed.professionalId);
    const dayAvailabilities = availabilities.filter(a => a.dayOfWeek === dayOfWeek);

    if (dayAvailabilities.length === 0) {
      throw new AppError('Profissional não disponível neste dia', 'NO_AVAILABILITY');
    }

    const isWithinAvailability = dayAvailabilities.some(a => {
      return timeStr >= a.startTime && timeStr < a.endTime;
    });

    if (!isWithinAvailability) {
      throw new AppError('Horário fora da disponibilidade do profissional', 'INVALID_TIME');
    }
    
    const existing = await this.appointmentRepo.findByProfessionalAndDate(
      parsed.professionalId,
      parsed.date
    );
    
    if (existing) {
      throw new ConflictError('Horário já está agendado', 'SLOT_UNAVAILABLE');
    }

    try {
      return await this.appointmentRepo.create({
        professional: { connect: { id: parsed.professionalId } },
        clientName: parsed.clientName,
        clientPhone: parsed.clientPhone,
        date: parsed.date,
        status: AppointmentStatus.PENDING
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('Horário já está agendado', 'SLOT_UNAVAILABLE');
      }
      throw err;
    }
  }

  async confirm(id: string) {
    const count = await this.appointmentRepo.updateStatusWhere(
      { id, status: AppointmentStatus.PENDING },
      AppointmentStatus.CONFIRMED
    );

    if (count === 0) {
      const appointment = await this.findById(id);
      if (appointment.status !== AppointmentStatus.PENDING) {
        throw new AppError('Apenas agendamentos pendentes podem ser confirmados', 'INVALID_STATUS');
      }
      throw new NotFoundError('Agendamento não encontrado');
    }

    const appointment = await this.findById(id);
    const professional = await this.professionalRepo.findById(appointment.professionalId);
    await this.sendConfirmationMessage(appointment, professional!);
    return appointment;
  }

  async cancel(id: string) {
    const appointment = await this.findById(id);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new AppError('Agendamento já está cancelado', 'ALREADY_CANCELLED');
    }

    const count = await this.appointmentRepo.updateStatusWhere(
      { id, status: appointment.status },
      AppointmentStatus.CANCELLED
    );

    if (count === 0) {
      throw new AppError('Agendamento já foi modificado por outro usuário', 'CONCURRENT_MODIFICATION');
    }

    const updated = await this.findById(id);
    const professional = await this.professionalRepo.findById(updated.professionalId);
    await this.sendCancellationMessage(updated, professional!);
    return updated;
  }

  async delete(id: string) {
    const appointment = await this.findById(id);

    if (appointment.status !== AppointmentStatus.CANCELLED) {
      throw new AppError('Apenas agendamentos cancelados podem ser excluídos', 'INVALID_STATUS');
    }

    await this.appointmentRepo.delete(id);
  }

  private async sendConfirmationMessage(appointment: any, professional: any) {
    const date = new Date(appointment.date);
    const formattedDate = formatDateInBRT(date);
    const formattedTime = formatTimeInBRT(date);

    const message = `Olá ${appointment.clientName}, seu agendamento com ${professional.name} foi CONFIRMADO!
📅 Data: ${formattedDate}
🕒 Hora: ${formattedTime}
Local: ${professional.address}`;

    try {
      await this.whatsAppService.sendText({
        number: appointment.clientPhone,
        text: message
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro ao enviar WhatsApp');
    }
  }

  private async sendCancellationMessage(appointment: any, professional: any) {
    const date = new Date(appointment.date);
    const formattedDate = formatDateInBRT(date);
    const formattedTime = formatTimeInBRT(date);

    const message = `Olá ${appointment.clientName}, seu agendamento com ${professional.name} foi CANCELADO.
📅 Data: ${formattedDate}
🕒 Hora: ${formattedTime}
Qualquer dúvida, entre em contato conosco.`;

    try {
      await this.whatsAppService.sendText({
        number: appointment.clientPhone,
        text: message
      });
    } catch (error) {
      logger.error({ err: error }, 'Erro ao enviar WhatsApp de cancelamento');
    }
  }
}