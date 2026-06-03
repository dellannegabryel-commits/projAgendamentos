import { AvailabilityService } from '../services/index.js';
import { Request, Response, NextFunction } from 'express';

export class AvailabilityController {
  private service = new AvailabilityService();

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const availabilities = await this.service.findAll();
      res.json(availabilities);
    } catch (error) {
      next(error);
    }
  }

  async findByProfessionalId(req: Request, res: Response, next: NextFunction) {
    try {
      const availabilities = await this.service.findByProfessionalId(req.params.professionalId);
      res.json(availabilities);
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId, date } = req.query;
      
      if (!professionalId || !date) {
        res.status(400).json({
          error: { code: 'MISSING_PARAMS', message: 'professionalId e date são obrigatórios' }
        });
        return;
      }
      
      const slots = await this.service.getAvailableSlots(
        professionalId as string,
        new Date(date as string)
      );
      res.json(slots);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const availability = await this.service.create(req.body);
      res.status(201).json(availability);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const availability = await this.service.update(req.params.id, req.body);
      res.json(availability);
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