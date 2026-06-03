import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getAppConfig } from '../config/index.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
     res.status(401).json({ error: 'Token não fornecido' });
     return;
  }

  const [, token] = authHeader.split(' ');

  try {
    const config = getAppConfig();
    const decoded = jwt.verify(token, config.jwtSecret);
    (req as any).user = decoded;
    next();
  } catch (err) {
     res.status(401).json({ error: 'Token inválido' });
     return;
  }
};
