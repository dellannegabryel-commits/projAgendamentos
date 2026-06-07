import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import healthRoutes from './routes/health.routes.js';
import docsRoutes from './docs/docs.routes.js';
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

const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()).filter(Boolean) ?? [];

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...allowedOrigins],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: config.isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}));

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);
app.use('/health', healthRoutes);
app.use('/api/docs', docsRoutes);
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
