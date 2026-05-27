import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.authService.login(req.body);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
         res.status(400).json({ error: 'Dados inválidos', details: error.errors });
         return;
      }
      res.status(401).json({ error: error.message || 'Erro na autenticação' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      // O middleware de auth vai injetar o req.user
      const user = (req as any).user;
      if (!user) {
         res.status(401).json({ error: 'Não autenticado' });
         return;
      }
      const admin = await this.authService.getMe(user.id);
      res.json(admin);
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Erro ao buscar dados do usuário' });
    }
  }
}
