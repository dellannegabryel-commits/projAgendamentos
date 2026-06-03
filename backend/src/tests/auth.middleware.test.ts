import { describe, it, expect, vi } from 'vitest';
import { authMiddleware } from '../middlewares/auth.middleware.js';

vi.mock('../config/index.js', () => ({
  loadEnv: vi.fn(),
  getEnv: vi.fn(),
  getAppConfig: vi.fn(() => ({
    jwtSecret: 'test-secret-key',
  })),
  getDatabaseConfig: vi.fn(),
  getEvolutionConfig: vi.fn(),
}));

function createMockReqRes(authHeader?: string) {
  const req: any = {
    headers: authHeader ? { authorization: authHeader } : {},
  };
  const res: any = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
  };
  const next = vi.fn();
  return { req, res, next };
}

describe('authMiddleware', () => {
  it('deve rejeitar requisição sem token', () => {
    const { req, res, next } = createMockReqRes();
    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('deve rejeitar token inválido', () => {
    const { req, res, next } = createMockReqRes('Bearer invalid-token');
    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('deve aceitar token válido', async () => {
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign({ id: '1', email: 'admin@test.com' }, 'test-secret-key');

    const { req, res, next } = createMockReqRes(`Bearer ${token}`);
    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeTruthy();
  });
});
