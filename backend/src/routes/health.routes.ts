import { Router, Request, Response, NextFunction } from 'express';
import { getUptime, checkDatabase, checkEvolution } from '../services/health.service.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [db, evolution] = await Promise.all([checkDatabase(), checkEvolution()]);
    const evolutionOk = evolution;
    const dbOk = db;

    res.status(dbOk ? 200 : 503).json({
      status: dbOk ? 'ok' : 'degraded',
      database: dbOk ? 'connected' : 'disconnected',
      evolution: evolutionOk ? 'connected' : 'disconnected',
      uptime: getUptime(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/database', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = await checkDatabase();
    if (!db) {
      res.status(503).json({ status: 'error', database: 'disconnected' });
      return;
    }
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

router.get('/evolution', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evolution = await checkEvolution();
    if (!evolution) {
      res.status(503).json({ status: 'error', evolution: 'disconnected' });
      return;
    }
    res.json({ status: 'ok', evolution: 'connected' });
  } catch (error) {
    next(error);
  }
});

export default router;
