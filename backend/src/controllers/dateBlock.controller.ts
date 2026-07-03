import { DateBlockService } from '../services/index.js';
import { Request, Response, NextFunction } from 'express';

export class DateBlockController {
  private service = new DateBlockService();

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const blocks = await this.service.findAll();
      res.json(blocks);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const block = await this.service.create(req.body);
      res.status(201).json(block);
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
