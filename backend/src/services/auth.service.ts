import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminRepository } from '../repositories/admin.repository.js';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class AuthService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async login(data: unknown) {
    const { email, password } = loginSchema.parse(data);

    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) {
      throw new Error('Credenciais inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'fallback-secret-key-change-me',
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
      throw new Error('Admin não encontrado');
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    };
  }
}
