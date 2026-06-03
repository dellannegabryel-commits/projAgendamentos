import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvailabilityService } from '../services/availability.service.js';
import { Prisma } from '@prisma/client';

const mockAvailabilityRepo = vi.hoisted(() => ({
  findAll: vi.fn(),
  findByProfessionalId: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

const mockAppointmentRepo = vi.hoisted(() => ({
  findAll: vi.fn(),
}));

vi.mock('../repositories/index.js', () => ({
  AvailabilityRepository: function() { return mockAvailabilityRepo; },
  AppointmentRepository: function() { return mockAppointmentRepo; },
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

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  const professionalId = '00000000-0000-0000-0000-000000000001';
  const validInput = {
    professionalId,
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '18:00',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AvailabilityService();
  });

  describe('create', () => {
    it('deve criar availability válida', async () => {
      mockAvailabilityRepo.create.mockResolvedValue({
        id: '1',
        ...validInput,
        isActive: true,
      });

      const result = await service.create(validInput);
      expect(result.id).toBe('1');
      expect(mockAvailabilityRepo.create).toHaveBeenCalledOnce();
    });

    it('deve rejeitar duplicata ativa (P2002 -> ConflictError)', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: 'test' }
      );
      mockAvailabilityRepo.create.mockRejectedValue(p2002);

      await expect(service.create(validInput)).rejects.toThrow(/horário com este início/);
    });

    it('deve propagar erros que não são P2002', async () => {
      const other = new Error('Conexão perdida');
      mockAvailabilityRepo.create.mockRejectedValue(other);

      await expect(service.create(validInput)).rejects.toThrow('Conexão perdida');
    });
  });

  describe('update', () => {
    it('deve atualizar availability válida', async () => {
      mockAvailabilityRepo.update.mockResolvedValue({
        id: '1',
        ...validInput,
        isActive: true,
      });

      const result = await service.update('1', { startTime: '10:00', endTime: '19:00' });
      expect(result.id).toBe('1');
    });

    it('deve rejeitar update que colide com slot ativo (P2002 -> ConflictError)', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: 'test' }
      );
      mockAvailabilityRepo.update.mockRejectedValue(p2002);

      await expect(
        service.update('1', { professionalId, dayOfWeek: 2, startTime: '08:00', endTime: '12:00' })
      ).rejects.toThrow(/horário com este início/);
    });
  });
});
