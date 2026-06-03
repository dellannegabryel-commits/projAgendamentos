import { Admin } from '@prisma/client';
import { prisma } from './prisma.js';

export class AdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { email },
    });
  }

  async create(data: Omit<Admin, 'id' | 'createdAt'>): Promise<Admin> {
    return prisma.admin.create({
      data,
    });
  }

  async findById(id: string): Promise<Admin | null> {
    return prisma.admin.findUnique({
      where: { id },
    });
  }
}
