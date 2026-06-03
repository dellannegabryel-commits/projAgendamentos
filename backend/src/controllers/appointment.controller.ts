import { AppointmentService } from '../services/index.js';
import { AppointmentStatus } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export class AppointmentController {
  private service = new AppointmentService();

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, professionalId, dateFrom, dateTo } = req.query;
      
      const filters = {
        status: status as AppointmentStatus | undefined,
        professionalId: professionalId as string | undefined,
        dateFrom: dateFrom as string | undefined,
        dateTo: dateTo as string | undefined
      };
      
      const appointments = await this.service.findAll(filters);
      res.json(appointments);
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