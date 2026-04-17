import { AppointmentService } from '../services/index.js';
import { AppointmentStatus } from '@prisma/client';
import { Request, Response } from 'express';

export class AppointmentController {
  private service = new AppointmentService();

  async findAll(req: Request, res: Response) {
    const { status, professionalId, dateFrom, dateTo } = req.query;
    
    const filters = {
      status: status as AppointmentStatus | undefined,
      professionalId: professionalId as string | undefined,
      dateFrom: dateFrom as string | undefined,
      dateTo: dateTo as string | undefined
    };
    
    const appointments = await this.service.findAll(filters);
    res.json(appointments);
  }

  async findById(req: Request, res: Response) {
    const appointment = await this.service.findById(req.params.id);
    res.json(appointment);
  }

  async create(req: Request, res: Response) {
    try {
      const appointment = await this.service.create(req.body);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async confirm(req: Request, res: Response) {
    try {
      const appointment = await this.service.confirm(req.params.id);
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const appointment = await this.service.cancel(req.params.id);
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}