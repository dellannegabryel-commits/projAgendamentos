import { CategoryService } from '../services/index.js';
import { Request, Response } from 'express';

export class CategoryController {
  private service = new CategoryService();

  async findAll(req: Request, res: Response) {
    const categories = await this.service.findAll();
    res.json(categories);
  }

  async findById(req: Request, res: Response) {
    const category = await this.service.findById(req.params.id);
    res.json(category);
  }

  async create(req: Request, res: Response) {
    const category = await this.service.create(req.body);
    res.status(201).json(category);
  }

  async update(req: Request, res: Response) {
    const category = await this.service.update(req.params.id, req.body);
    res.json(category);
  }

  async delete(req: Request, res: Response) {
    await this.service.delete(req.params.id);
    res.status(204).send();
  }
}