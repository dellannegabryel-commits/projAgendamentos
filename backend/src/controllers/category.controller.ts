import { CategoryService } from '../services/index.js';
import { Request, Response, NextFunction } from 'express';

export class CategoryController {
  private service = new CategoryService();

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await this.service.findAll();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await this.service.findById(req.params.id);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await this.service.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await this.service.update(req.params.id, req.body);
      res.json(category);
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