import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentService } from '../services/appointment.service.js';
import { AppointmentStatus } from '@prisma/client';
import axios from 'axios';

vi.mock('axios');
vi.mock('../config/index.js', () => ({
  getEvolutionConfig: () => ({
    apiUrl: 'http://localhost:8080',
    instanceName: 'test-instance',
    apiKey: 'test-api-key',
  }),
}));

const mockAppointmentRepo = vi.hoisted(() => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  findByProfessionalAndDate: vi.fn(),
  create: vi.fn(),
  updateStatus: vi.fn(),
  updateStatusWhere: vi.fn(),
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

vi.mock('../repositories/index.js', () => ({
  AppointmentRepository: function() { return mockAppointmentRepo; },
  ProfessionalRepository: function() { return mockProfessionalRepo; },
  AvailabilityRepository: function() { return mockAvailabilityRepo; },
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

describe('AppointmentService - WhatsApp Integration', () => {
  let service: AppointmentService;
  const mockedAxios = vi.mocked(axios);
  const futureDate = new Date('2027-01-15T14:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AppointmentService();
  });

  describe('create - WhatsApp message', () => {
    const validInput = {
      professionalId: '00000000-0000-0000-0000-000000000001',
      clientName: 'Maria Silva',
      clientPhone: '11999999999',
      date: '2027-01-15T14:00:00.000Z',
    };

    it('deve enviar WhatsApp de confirmação de recebimento ao criar agendamento', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });
      
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
        status: AppointmentStatus.PENDING,
      });
      mockProfessionalRepo.findById.mockResolvedValue({ 
        name: 'Dr. João', 
        address: 'Rua das Flores, 123' 
      });

      await service.create(validInput);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/message/sendText/test-instance',
        expect.objectContaining({
          number: '5511999999999',
          text: expect.stringContaining('Maria Silva'),
        }),
        expect.any(Object)
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          text: expect.stringContaining('Dr. João'),
        }),
        expect.any(Object)
      );
    });

    it('deve criar agendamento mesmo quando WhatsApp falhar', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Evolution API offline'));
      
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
        status: AppointmentStatus.PENDING,
      });
      mockProfessionalRepo.findById.mockResolvedValue({ 
        name: 'Dr. João', 
        address: 'Rua das Flores, 123' 
      });

      const result = await service.create(validInput);
      
      expect(result.status).toBe(AppointmentStatus.PENDING);
      expect(result.id).toBe('1');
    });
  });

  describe('confirm - WhatsApp message', () => {
    it('deve enviar WhatsApp de confirmação ao confirmar agendamento', async () => {
      const appointment = {
        id: '1',
        professionalId: '00000000-0000-0000-0000-000000000001',
        status: AppointmentStatus.PENDING,
        date: futureDate,
        clientName: 'Pedro Santos',
        clientPhone: '21988887777',
      };

      mockAppointmentRepo.findById.mockResolvedValue({ 
        ...appointment, 
        status: AppointmentStatus.CONFIRMED 
      });
      mockAppointmentRepo.updateStatusWhere.mockResolvedValue(1);
      mockProfessionalRepo.findById.mockResolvedValue({ 
        name: 'Dra. Ana', 
        address: 'Av. Brasil, 456' 
      });
      mockedAxios.post.mockResolvedValue({ data: {} });

      await service.confirm('1');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/message/sendText/test-instance',
        expect.objectContaining({
          number: '5521988887777',
          text: expect.stringContaining('CONFIRMADO'),
        }),
        expect.any(Object)
      );
    });

    it('deve confirmar agendamento mesmo quando WhatsApp falhar', async () => {
      const appointment = {
        id: '1',
        professionalId: '00000000-0000-0000-0000-000000000001',
        status: AppointmentStatus.PENDING,
        date: futureDate,
        clientName: 'Pedro Santos',
        clientPhone: '21988887777',
      };

      mockAppointmentRepo.findById.mockResolvedValue({ 
        ...appointment, 
        status: AppointmentStatus.CONFIRMED 
      });
      mockAppointmentRepo.updateStatusWhere.mockResolvedValue(1);
      mockProfessionalRepo.findById.mockResolvedValue({ 
        name: 'Dra. Ana', 
        address: 'Av. Brasil, 456' 
      });
      mockedAxios.post.mockRejectedValue(new Error('Evolution API offline'));

      const result = await service.confirm('1');
      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    });
  });

  describe('cancel - WhatsApp message', () => {
    it('deve enviar WhatsApp de cancelamento ao cancelar agendamento', async () => {
      const appointment = {
        id: '1',
        professionalId: '00000000-0000-0000-0000-000000000001',
        status: AppointmentStatus.PENDING,
        date: futureDate,
        clientName: 'Lucia Costa',
        clientPhone: '31977776666',
      };

      mockAppointmentRepo.findById
        .mockResolvedValueOnce(appointment)
        .mockResolvedValueOnce({ ...appointment, status: AppointmentStatus.CANCELLED });
      mockAppointmentRepo.updateStatusWhere.mockResolvedValue(1);
      mockProfessionalRepo.findById.mockResolvedValue({ 
        name: 'Dr. Carlos', 
        address: 'Rua Minas, 789' 
      });
      mockedAxios.post.mockResolvedValue({ data: {} });

      await service.cancel('1');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/message/sendText/test-instance',
        expect.objectContaining({
          number: '5531977776666',
          text: expect.stringContaining('CANCELADO'),
        }),
        expect.any(Object)
      );
    });

    it('deve cancelar agendamento mesmo quando WhatsApp falhar', async () => {
      const appointment = {
        id: '1',
        professionalId: '00000000-0000-0000-0000-000000000001',
        status: AppointmentStatus.PENDING,
        date: futureDate,
        clientName: 'Lucia Costa',
        clientPhone: '31977776666',
      };

      mockAppointmentRepo.findById
        .mockResolvedValueOnce(appointment)
        .mockResolvedValueOnce({ ...appointment, status: AppointmentStatus.CANCELLED });
      mockAppointmentRepo.updateStatusWhere.mockResolvedValue(1);
      mockProfessionalRepo.findById.mockResolvedValue({ 
        name: 'Dr. Carlos', 
        address: 'Rua Minas, 789' 
      });
      mockedAxios.post.mockRejectedValue(new Error('Evolution API offline'));

      const result = await service.cancel('1');
      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });
  });

  describe('phone formatting in WhatsApp', () => {
    it('deve formatar corretamente telefone celular para WhatsApp', async () => {
      const validInput = {
        professionalId: '00000000-0000-0000-0000-000000000001',
        clientName: 'Teste',
        clientPhone: '11999887766',
        date: '2027-01-15T14:00:00.000Z',
      };

      mockAvailabilityRepo.findByProfessionalId.mockResolvedValue([
        { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
      ]);
      mockAppointmentRepo.findByProfessionalAndDate.mockResolvedValue(null);
      mockAppointmentRepo.create.mockResolvedValue({
        id: '1',
        ...validInput,
        date: new Date(validInput.date),
        status: AppointmentStatus.PENDING,
      });
      mockProfessionalRepo.findById.mockResolvedValue({ name: 'Dr. Teste', address: 'Rua Teste' });
      mockedAxios.post.mockResolvedValue({ data: {} });

      await service.create(validInput);

      const call = mockedAxios.post.mock.calls[0];
      expect(call[1]).toEqual(
        expect.objectContaining({ number: '5511999887766' })
      );
    });

    it('deve formatar corretamente telefone fixo para WhatsApp', async () => {
      const validInput = {
        professionalId: '00000000-0000-0000-0000-000000000001',
        clientName: 'Teste',
        clientPhone: '1134567890',
        date: '2027-01-15T14:00:00.000Z',
      };

      mockAvailabilityRepo.findByProfessionalId.mockResolvedValue([
        { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
      ]);
      mockAppointmentRepo.findByProfessionalAndDate.mockResolvedValue(null);
      mockAppointmentRepo.create.mockResolvedValue({
        id: '1',
        ...validInput,
        date: new Date(validInput.date),
        status: AppointmentStatus.PENDING,
      });
      mockProfessionalRepo.findById.mockResolvedValue({ name: 'Dr. Teste', address: 'Rua Teste' });
      mockedAxios.post.mockResolvedValue({ data: {} });

      await service.create(validInput);

      const call = mockedAxios.post.mock.calls[0];
      expect(call[1]).toEqual(
        expect.objectContaining({ number: '551134567890' })
      );
    });
  });

  describe('error logging', () => {
    it('deve logar erro quando WhatsApp de criação falhar', async () => {
      const { logger } = await import('../shared/logger/index.js');
      
      mockedAxios.post.mockRejectedValue(new Error('API Error'));
      
      mockAvailabilityRepo.findByProfessionalId.mockResolvedValue([
        { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
      ]);
      mockAppointmentRepo.findByProfessionalAndDate.mockResolvedValue(null);
      mockAppointmentRepo.create.mockResolvedValue({
        id: '1',
        professionalId: '00000000-0000-0000-0000-000000000001',
        clientName: 'Teste',
        clientPhone: '11999999999',
        date: futureDate,
        status: AppointmentStatus.PENDING,
      });
      mockProfessionalRepo.findById.mockResolvedValue({ name: 'Dr. Teste', address: 'Rua Teste' });

      await service.create({
        professionalId: '00000000-0000-0000-0000-000000000001',
        clientName: 'Teste',
        clientPhone: '11999999999',
        date: '2027-01-15T14:00:00.000Z',
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ err: expect.any(Error) }),
        'Erro ao enviar WhatsApp de criação'
      );
    });
  });
});
