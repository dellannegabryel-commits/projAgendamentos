import { Admin, Prisma } from '@prisma/client';
import { prisma } from './prisma.js';

export class AdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { id },
    });
  }

  async findByResetToken(token: string): Promise<Admin | null> {
    return prisma.admin.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });
  }

  async count(): Promise<number> {
    return prisma.admin.count();
  }

  async create(data: Prisma.AdminCreateInput): Promise<Admin> {
    return prisma.admin.create({ data });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<Admin> {
    return prisma.admin.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
  }

  async updatePasswordReset(
    id: string,
    token: string,
    expires: Date
  ): Promise<Admin> {
    return prisma.admin.update({
      where: { id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });
  }
}
