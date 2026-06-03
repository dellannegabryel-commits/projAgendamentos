import { AppointmentRepository, ProfessionalRepository, AvailabilityRepository } from '../repositories/index.js';
import { AppointmentStatus } from '@prisma/client';
import { WhatsAppService } from './whatsapp.service.js';
import { NotFoundError, ConflictError, AppError } from '../shared/errors/index.js';
import { logger } from '../shared/logger/index.js';
import { z } from 'zod';
import { format } from 'date-fns';

const appointmentSchema = z.object({
  professionalId: z.string().uuid('ID do profissional inválido'),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
  clientPhone: z.string().min(10, 'Telefone inválido'),
  date: z.string().transform(str => new Date(str))
});

export type CreateAppointmentInput = z.infer<typeof appointmentSchema>;

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

    if (parsed.date <= now) {
      throw new AppError('A data do agendamento deve ser no futuro', 'PAST_DATE');
    }

    const dayOfWeek = parsed.date.getUTCDay();
    const timeStr = this.formatTime(parsed.date);

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

    return this.appointmentRepo.create({
      professional: { connect: { id: parsed.professionalId } },
      clientName: parsed.clientName,
      clientPhone: parsed.clientPhone,
      date: parsed.date,
      status: AppointmentStatus.PENDING
    });
  }

  private formatTime(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  async confirm(id: string) {
    const appointment = await this.findById(id);
    
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new AppError('Apenas agendamentos pendentes podem ser confirmados', 'INVALID_STATUS');
    }

    const updated = await this.appointmentRepo.updateStatus(id, AppointmentStatus.CONFIRMED);
    
    const professional = await this.professionalRepo.findById(appointment.professionalId);
    
    await this.sendConfirmationMessage(appointment, professional!);
    
    return updated;
  }

  async cancel(id: string) {
    const appointment = await this.findById(id);
    
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new AppError('Agendamento já está cancelado', 'ALREADY_CANCELLED');
    }

    const updated = await this.appointmentRepo.updateStatus(id, AppointmentStatus.CANCELLED);

    const professional = await this.professionalRepo.findById(appointment.professionalId);

    await this.sendCancellationMessage(appointment, professional!);

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
    const formattedDate = format(date, 'dd/MM/yyyy');
    const formattedTime = format(date, 'HH:mm');
    
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
    const formattedDate = format(date, 'dd/MM/yyyy');
    const formattedTime = format(date, 'HH:mm');

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