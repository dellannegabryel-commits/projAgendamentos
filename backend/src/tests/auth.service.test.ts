import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdminRepo = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
}));

vi.mock('../repositories/admin.repository.js', () => ({
  AdminRepository: function() { return mockAdminRepo; },
}));

vi.mock('../config/index.js', () => ({
  loadEnv: vi.fn(),
  getEnv: vi.fn(() => ({
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-secret-key',
    WHATSAPP_API_URL: 'http://localhost:8080',
    WHATSAPP_INSTANCE_NAME: 'test',
    WHATSAPP_API_KEY: 'test-key',
    DEFAULT_ADMIN_EMAIL: 'admin@test.com',
    DEFAULT_ADMIN_PASSWORD: 'test',
  })),
  getAppConfig: vi.fn(() => ({
    port: 3000,
    nodeEnv: 'test',
    isProduction: false,
    isDevelopment: true,
    jwtSecret: 'test-secret-key',
  })),
  getDatabaseConfig: vi.fn(),
  getEvolutionConfig: vi.fn(),
}));

import { AuthService } from '../services/auth.service.js';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
  });

  describe('login', () => {
    it('deve autenticar com credenciais válidas', async () => {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('correct-password', 10);

      mockAdminRepo.findByEmail.mockResolvedValue({
        id: '1',
        name: 'Admin',
        email: 'admin@test.com',
        password: hashedPassword,
      });

      const result = await service.login({
        email: 'admin@test.com',
        password: 'correct-password',
      });

      expect(result.admin.email).toBe('admin@test.com');
      expect(result.token).toBeTruthy();
    });

    it('deve rejeitar email inexistente', async () => {
      mockAdminRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@test.com', password: 'pass' })
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('deve rejeitar senha incorreta', async () => {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('correct-password', 10);

      mockAdminRepo.findByEmail.mockResolvedValue({
        id: '1',
        email: 'admin@test.com',
        password: hashedPassword,
      });

      await expect(
        service.login({ email: 'admin@test.com', password: 'wrong-password' })
      ).rejects.toThrow('Credenciais inválidas');
    });

    it('deve rejeitar dados inválidos (email ausente)', async () => {
      await expect(
        service.login({ password: 'pass' })
      ).rejects.toThrow();
    });
  });

  describe('getMe', () => {
    it('deve retornar admin por id', async () => {
      mockAdminRepo.findById.mockResolvedValue({
        id: '1',
        name: 'Admin',
        email: 'admin@test.com',
      });

      const result = await service.getMe('1');
      expect(result.email).toBe('admin@test.com');
    });

    it('deve rejeitar id inexistente', async () => {
      mockAdminRepo.findById.mockResolvedValue(null);
      await expect(service.getMe('999')).rejects.toThrow('Admin não encontrado');
    });
  });
});
