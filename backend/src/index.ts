import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import healthRoutes from './routes/health.routes.js';
import { loadEnv, getAppConfig } from './config/index.js';
import { logger, requestLogger, logError } from './shared/logger/index.js';
import { AppError } from './shared/errors/index.js';
import { ZodError } from 'zod';
import { prisma } from './repositories/prisma.js';

dotenv.config();
loadEnv();

const app = express();
const config = getAppConfig();

app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? false, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);
app.use('/health', healthRoutes);
app.use('/api', routes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: err.errors,
      },
    });
    return;
  }

  logError(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
    },
  });
});

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  logger.error({ err }, 'listen failed');
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    prisma.$disconnect();
    logger.info('Server closed');
  });
});

export default app;