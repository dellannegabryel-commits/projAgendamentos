import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.getStatus();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async setup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.setup(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Não autenticado' }
        });
        return;
      }
      const admin = await this.authService.getMe(user.id);
      res.json(admin);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.requestPasswordReset(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.authService.resetPassword(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
