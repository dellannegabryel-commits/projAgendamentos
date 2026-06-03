import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getAppConfig } from '../config/index.js';
import { UnauthorizedError } from '../shared/errors/index.js';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new UnauthorizedError('Token não fornecido'));
    return;
  }

  const [, token] = authHeader.split(' ');

  try {
    const config = getAppConfig();
    const decoded = jwt.verify(token, config.jwtSecret);
    (req as any).user = decoded;
    next();
  } catch (err) {
    next(new UnauthorizedError('Token inválido'));
    return;
  }
};
