import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { AdminRepository } from '../repositories/admin.repository.js';
import { getAppConfig } from '../config/index.js';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '../shared/errors/index.js';
import { logger } from '../shared/logger/index.js';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const setupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(100),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(100),
});

const PASSWORD_RESET_EXPIRES_MS = 60 * 60 * 1000;

export class AuthService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async getStatus() {
    const count = await this.adminRepository.count();
    return { hasAdmin: count > 0 };
  }

  async setup(data: unknown) {
    const parsed = setupSchema.parse(data);
    const count = await this.adminRepository.count();

    if (count > 0) {
      throw new ConflictError(
        'Setup já foi concluído. Use a tela de login.',
        'SETUP_ALREADY_DONE'
      );
    }

    const existing = await this.adminRepository.findByEmail(parsed.email);
    if (existing) {
      throw new ConflictError('E-mail já está em uso', 'EMAIL_IN_USE');
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);
    const admin = await this.adminRepository.create({
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
    });

    const config = getAppConfig();
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    logger.info({ adminId: admin.id }, 'Initial admin created via setup');

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      token,
    };
  }

  async login(data: unknown) {
    const { email, password } = loginSchema.parse(data);

    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const config = getAppConfig();
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      token,
    };
  }

  async getMe(id: string) {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundError('Admin não encontrado');
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    };
  }

  async requestPasswordReset(data: unknown) {
    const { email } = forgotPasswordSchema.parse(data);

    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      return { sent: true };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS);

    await this.adminRepository.updatePasswordReset(admin.id, hashedToken, expires);

    const resetLink = `(interno) Use o token: ${rawToken}`;
    logger.info(
      {
        adminId: admin.id,
        email: admin.email,
        token: rawToken,
        expires: expires.toISOString(),
        resetLink,
      },
      'Password reset requested'
    );

    return { sent: true };
  }

  async resetPassword(data: unknown) {
    const parsed = resetPasswordSchema.parse(data);

    const hashedToken = crypto
      .createHash('sha256')
      .update(parsed.token)
      .digest('hex');

    const admin = await this.adminRepository.findByResetToken(hashedToken);
    if (!admin) {
      throw new AppError(
        'Token inválido ou expirado',
        'INVALID_RESET_TOKEN',
        400
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);
    await this.adminRepository.updatePassword(admin.id, hashedPassword);

    logger.info({ adminId: admin.id }, 'Password reset successfully');

    return { reset: true };
  }
}
