import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdminRepo = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  findByResetToken: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  updatePassword: vi.fn(),
  updatePasswordReset: vi.fn(),
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

vi.mock('../shared/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
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

  describe('getStatus', () => {
    it('deve retornar hasAdmin=false quando não há admins', async () => {
      mockAdminRepo.count.mockResolvedValue(0);
      const result = await service.getStatus();
      expect(result.hasAdmin).toBe(false);
    });

    it('deve retornar hasAdmin=true quando há admins', async () => {
      mockAdminRepo.count.mockResolvedValue(1);
      const result = await service.getStatus();
      expect(result.hasAdmin).toBe(true);
    });
  });

  describe('setup', () => {
    it('deve criar primeiro admin e retornar token', async () => {
      mockAdminRepo.count.mockResolvedValue(0);
      mockAdminRepo.findByEmail.mockResolvedValue(null);
      mockAdminRepo.create.mockResolvedValue({
        id: '1',
        name: 'Novo Admin',
        email: 'novo@test.com',
        password: 'hashed',
      });

      const result = await service.setup({
        name: 'Novo Admin',
        email: 'novo@test.com',
        password: 'senha1234',
      });

      expect(result.token).toBeTruthy();
      expect(result.admin.email).toBe('novo@test.com');
      expect(mockAdminRepo.create).toHaveBeenCalled();
    });

    it('deve falhar se já existe admin', async () => {
      mockAdminRepo.count.mockResolvedValue(1);

      await expect(
        service.setup({ name: 'X', email: 'x@x.com', password: 'senha1234' })
      ).rejects.toThrow('Setup já foi concluído');
    });

    it('deve falhar se email já está em uso', async () => {
      mockAdminRepo.count.mockResolvedValue(0);
      mockAdminRepo.findByEmail.mockResolvedValue({ id: '1', email: 'x@x.com' });

      await expect(
        service.setup({ name: 'X', email: 'x@x.com', password: 'senha1234' })
      ).rejects.toThrow('E-mail já está em uso');
    });

    it('deve rejeitar senha curta', async () => {
      await expect(
        service.setup({ name: 'X', email: 'x@x.com', password: '123' })
      ).rejects.toThrow();
    });
  });

  describe('requestPasswordReset', () => {
    it('deve retornar sent=true mesmo se email não existe (anti-enumeração)', async () => {
      mockAdminRepo.findByEmail.mockResolvedValue(null);
      const result = await service.requestPasswordReset({ email: 'inexistente@test.com' });
      expect(result.sent).toBe(true);
      expect(mockAdminRepo.updatePasswordReset).not.toHaveBeenCalled();
    });

    it('deve gerar token quando email existe', async () => {
      mockAdminRepo.findByEmail.mockResolvedValue({ id: '1', email: 'admin@test.com' });
      mockAdminRepo.updatePasswordReset.mockResolvedValue({});

      const result = await service.requestPasswordReset({ email: 'admin@test.com' });
      expect(result.sent).toBe(true);
      expect(mockAdminRepo.updatePasswordReset).toHaveBeenCalledWith(
        '1',
        expect.any(String),
        expect.any(Date)
      );
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir senha com token válido', async () => {
      const crypto = await import('node:crypto');
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      mockAdminRepo.findByResetToken.mockResolvedValue({ id: '1' });
      mockAdminRepo.updatePassword.mockResolvedValue({});

      const result = await service.resetPassword({ token: rawToken, password: 'novasenha123' });
      expect(result.reset).toBe(true);
      expect(mockAdminRepo.updatePassword).toHaveBeenCalled();
    });

    it('deve falhar com token inválido ou expirado', async () => {
      mockAdminRepo.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'invalido', password: 'novasenha123' })
      ).rejects.toThrow('Token inválido ou expirado');
    });
  });
});
