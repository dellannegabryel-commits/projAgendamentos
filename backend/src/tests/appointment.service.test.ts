import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentService } from '../services/appointment.service.js';
import { AppointmentStatus } from '@prisma/client';

const mockAppointmentRepo = vi.hoisted(() => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  findByProfessionalAndDate: vi.fn(),
  create: vi.fn(),
  updateStatus: vi.fn(),
  delete: vi.fn(),
}));

const mockProfessionalRepo = vi.hoisted(() => ({
  findById: vi.fn(),
  findByCategoryId: vi.fn(),
  findAll: vi.fn(),
}));

const mockAvailabilityRepo = vi.hoisted(() => ({
  findByProfessionalId: vi.fn(),
  findAll: vi.fn(),
}));

const mockWhatsAppService = vi.hoisted(() => ({
  sendText: vi.fn(),
}));

vi.mock('../repositories/index.js', () => ({
  AppointmentRepository: function() { return mockAppointmentRepo; },
  ProfessionalRepository: function() { return mockProfessionalRepo; },
  AvailabilityRepository: function() { return mockAvailabilityRepo; },
}));

vi.mock('../services/whatsapp.service.js', () => ({
  WhatsAppService: function() { return mockWhatsAppService; },
}));

vi.mock('../shared/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  requestLogger: vi.fn(),
  logError: vi.fn(),
}));

describe('AppointmentService', () => {
  let service: AppointmentService;
  const futureDate = new Date('2027-01-15T14:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AppointmentService();
  });

  describe('create', () => {
    const validInput = {
      professionalId: '00000000-0000-0000-0000-000000000001',
      clientName: 'John Doe',
      clientPhone: '11999999999',
      date: '2027-01-15T14:00:00.000Z',
    };

    it('deve criar agendamento com dados válidos', async () => {
      mockAvailabilityRepo.findByProfessionalId.mockResolvedValue([
        { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
      ]);
      mockAppointmentRepo.findByProfessionalAndDate.mockResolvedValue(null);
      mockAppointmentRepo.create.mockResolvedValue({
        id: '1',
        professionalId: validInput.professionalId,
        clientName: validInput.clientName,
        clientPhone: validInput.clientPhone,
        date: new Date(validInput.date),
        status: 'PENDING',
      });

      const result = await service.create(validInput);
      expect(result.status).toBe(AppointmentStatus.PENDING);
      expect(mockAppointmentRepo.create).toHaveBeenCalledOnce();
    });

    it('deve rejeitar data no passado', async () => {
      const pastInput = { ...validInput, date: '2020-01-01T10:00:00.000Z' };
      await expect(service.create(pastInput)).rejects.toThrow('A data do agendamento deve ser no futuro');
    });

    it('deve rejeitar horário fora da disponibilidade', async () => {
      mockAvailabilityRepo.findByProfessionalId.mockResolvedValue([
        { dayOfWeek: 5, startTime: '08:00', endTime: '12:00' },
      ]);

      await expect(service.create(validInput)).rejects.toThrow('Horário fora da disponibilidade');
    });

    it('deve rejeitar dia sem disponibilidade', async () => {
      mockAvailabilityRepo.findByProfessionalId.mockResolvedValue([]);
      await expect(service.create(validInput)).rejects.toThrow('Profissional não disponível neste dia');
    });

    it('deve rejeitar horário já agendado', async () => {
      mockAvailabilityRepo.findByProfessionalId.mockResolvedValue([
        { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
      ]);
      mockAppointmentRepo.findByProfessionalAndDate.mockResolvedValue({
        id: 'existing',
        status: AppointmentStatus.PENDING,
      });

      await expect(service.create(validInput)).rejects.toThrow('Horário já está agendado');
    });
  });

  describe('confirm', () => {
    it('deve confirmar agendamento pendente', async () => {
      const appointment = {
        id: '1',
        professionalId: '00000000-0000-0000-0000-000000000001',
        status: AppointmentStatus.PENDING,
        date: futureDate,
        clientName: 'John',
        clientPhone: '11999999999',
      };

      mockAppointmentRepo.findById.mockResolvedValue(appointment);
      mockAppointmentRepo.updateStatus.mockResolvedValue({ ...appointment, status: AppointmentStatus.CONFIRMED });
      mockProfessionalRepo.findById.mockResolvedValue({ name: 'Dr. Smith', address: 'Rua A' });

      const result = await service.confirm('1');
      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('deve rejeitar confirmação de agendamento não pendente', async () => {
      mockAppointmentRepo.findById.mockResolvedValue({
        id: '1',
        status: AppointmentStatus.CONFIRMED,
      });

      await expect(service.confirm('1')).rejects.toThrow('Apenas agendamentos pendentes podem ser confirmados');
    });
  });

  describe('cancel', () => {
    it('deve cancelar agendamento pendente', async () => {
      const appointment = {
        id: '1',
        professionalId: '00000000-0000-0000-0000-000000000001',
        status: AppointmentStatus.PENDING,
        date: futureDate,
        clientName: 'John',
        clientPhone: '11999999999',
      };

      mockAppointmentRepo.findById.mockResolvedValue(appointment);
      mockAppointmentRepo.updateStatus.mockResolvedValue({ ...appointment, status: AppointmentStatus.CANCELLED });
      mockProfessionalRepo.findById.mockResolvedValue({ name: 'Dr. Smith' });

      const result = await service.cancel('1');
      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('deve rejeitar cancelamento de agendamento já cancelado', async () => {
      mockAppointmentRepo.findById.mockResolvedValue({
        id: '1',
        status: AppointmentStatus.CANCELLED,
      });

      await expect(service.cancel('1')).rejects.toThrow('Agendamento já está cancelado');
    });
  });

  describe('delete', () => {
    it('deve excluir agendamento cancelado', async () => {
      mockAppointmentRepo.findById.mockResolvedValue({
        id: '1',
        status: AppointmentStatus.CANCELLED,
      });
      mockAppointmentRepo.delete.mockResolvedValue(undefined);

      await expect(service.delete('1')).resolves.not.toThrow();
    });

    it('deve rejeitar exclusão de agendamento não cancelado', async () => {
      mockAppointmentRepo.findById.mockResolvedValue({
        id: '1',
        status: AppointmentStatus.PENDING,
      });

      await expect(service.delete('1')).rejects.toThrow('Apenas agendamentos cancelados podem ser excluídos');
    });
  });
});
