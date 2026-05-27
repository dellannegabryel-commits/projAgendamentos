import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
     res.status(401).json({ error: 'Token não fornecido' });
     return;
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-change-me');
    (req as any).user = decoded;
    next();
  } catch (err) {
     res.status(401).json({ error: 'Token inválido' });
     return;
  }
};
