import { ProfessionalService } from '../services/index.js';
import { Request, Response, NextFunction } from 'express';

export class ProfessionalController {
  private service = new ProfessionalService();

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const professionals = await this.service.findAll();
      res.json(professionals);
    } catch (error) {
      next(error);
    }
  }

  async findByCategoryId(req: Request, res: Response, next: NextFunction) {
    try {
      const professionals = await this.service.findByCategoryId(req.params.categoryId);
      res.json(professionals);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const professional = await this.service.findById(req.params.id);
      res.json(professional);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const professional = await this.service.create(req.body);
      res.status(201).json(professional);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const professional = await this.service.update(req.params.id, req.body);
      res.json(professional);
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