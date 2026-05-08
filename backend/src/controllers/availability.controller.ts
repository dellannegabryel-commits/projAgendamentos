import { AvailabilityService } from '../services/index.js';
import { Request, Response } from 'express';

export class AvailabilityController {
  private service = new AvailabilityService();

  async findAll(req: Request, res: Response) {
    const availabilities = await this.service.findAll();
    res.json(availabilities);
  }

  async findByProfessionalId(req: Request, res: Response) {
    const availabilities = await this.service.findByProfessionalId(req.params.professionalId);
    res.json(availabilities);
  }

  async getAvailableSlots(req: Request, res: Response) {
    const { professionalId, date } = req.query;
    
    if (!professionalId || !date) {
      return res.status(400).json({ error: 'professionalId e date são obrigatórios' });
    }
    
    const slots = await this.service.getAvailableSlots(
      professionalId as string,
      new Date(date as string)
    );
    res.json(slots);
  }

  async create(req: Request, res: Response) {
    const availability = await this.service.create(req.body);
    res.status(201).json(availability);
  }

  async update(req: Request, res: Response) {
    const availability = await this.service.update(req.params.id, req.body);
    res.json(availability);
  }

  async delete(req: Request, res: Response) {
    await this.service.delete(req.params.id);
    res.status(204).send();
  }
}