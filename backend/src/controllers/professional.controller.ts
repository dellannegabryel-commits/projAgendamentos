import { ProfessionalService } from '../services/index.js';
import { Request, Response } from 'express';

export class ProfessionalController {
  private service = new ProfessionalService();

  async findAll(req: Request, res: Response) {
    const professionals = await this.service.findAll();
    res.json(professionals);
  }

  async findByCategoryId(req: Request, res: Response) {
    const professionals = await this.service.findByCategoryId(req.params.categoryId);
    res.json(professionals);
  }

  async findById(req: Request, res: Response) {
    const professional = await this.service.findById(req.params.id);
    res.json(professional);
  }

  async create(req: Request, res: Response) {
    const professional = await this.service.create(req.body);
    res.status(201).json(professional);
  }

  async update(req: Request, res: Response) {
    const professional = await this.service.update(req.params.id, req.body);
    res.json(professional);
  }

  async delete(req: Request, res: Response) {
    await this.service.delete(req.params.id);
    res.status(204).send();
  }
}