import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkEvolution, checkDatabase, getUptime } from '../services/health.service.js';
import axios from 'axios';

vi.mock('axios');
vi.mock('../repositories/index.js', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));
vi.mock('../config/index.js', () => ({
  getEvolutionConfig: () => ({
    apiUrl: 'http://localhost:8080',
    instanceName: 'test-instance',
    apiKey: 'test-api-key',
  }),
}));

describe('HealthService', () => {
  const mockedAxios = vi.mocked(axios);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkEvolution', () => {
    it('deve retornar true quando Evolution API estiver saudavel', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { status: 'ok' } });
      
      const result = await checkEvolution();
      
      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8080/manager/health',
        expect.objectContaining({
          headers: { 'apikey': 'test-api-key' },
          timeout: 5000,
        })
      );
    });

    it('deve retornar false quando Evolution API estiver offline', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      
      const result = await checkEvolution();
      
      expect(result).toBe(false);
    });

    it('deve retornar false quando Evolution API retornar erro 500', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Internal Server Error' } },
      });
      
      const result = await checkEvolution();
      
      expect(result).toBe(false);
    });

    it('deve retornar false quando Evolution API retornar erro 401', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Unauthorized' } },
      });
      
      const result = await checkEvolution();
      
      expect(result).toBe(false);
    });

    it('deve retornar false quando Evolution API estiver lenta (timeout)', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('ECONNABORTED'));
      
      const result = await checkEvolution();
      
      expect(result).toBe(false);
    });
  });

  describe('checkDatabase', () => {
    it('deve retornar true quando banco estiver conectado', async () => {
      const { prisma } = await import('../repositories/index.js');
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }]);
      
      const result = await checkDatabase();
      
      expect(result).toBe(true);
    });

    it('deve retornar false quando banco estiver desconectado', async () => {
      const { prisma } = await import('../repositories/index.js');
      vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Connection refused'));
      
      const result = await checkDatabase();
      
      expect(result).toBe(false);
    });
  });

  describe('getUptime', () => {
    it('deve retornar tempo de atividade em segundos', () => {
      const uptime = getUptime();
      expect(uptime).toBeGreaterThanOrEqual(0);
      expect(typeof uptime).toBe('number');
    });
  });
});
