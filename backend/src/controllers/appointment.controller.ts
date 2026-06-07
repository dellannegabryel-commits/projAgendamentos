import { AppointmentService } from '../services/index.js';
import { AppointmentStatus } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export class AppointmentController {
  private service = new AppointmentService();

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const querySchema = z.object({
        status: z.nativeEnum(AppointmentStatus).optional(),
        professionalId: z.string().uuid().optional(),
        dateFrom: z.string().refine(d => !isNaN(new Date(d).getTime()), 'Data inicial inválida').optional(),
        dateTo: z.string().refine(d => !isNaN(new Date(d).getTime()), 'Data final inválida').optional(),
        page: z.coerce.number().int().min(1).optional(),
        pageSize: z.coerce.number().int().min(1).max(100).optional(),
        sortBy: z.enum(['date', 'createdAt', 'status']).optional(),
        order: z.enum(['asc', 'desc']).optional(),
      });
      const filters = querySchema.parse(req.query);

      const result = await this.service.findAll(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await this.service.findById(req.params.id);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await this.service.create(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await this.service.confirm(req.params.id);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await this.service.cancel(req.params.id);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}