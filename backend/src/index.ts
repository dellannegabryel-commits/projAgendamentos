import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { loadEnv, getAppConfig } from './config/index.js';
import { logger, requestLogger, logError } from './shared/logger/index.js';
import { AppError } from './shared/errors/index.js';
import { ZodError } from 'zod';

dotenv.config();
loadEnv();

const app = express();
const config = getAppConfig();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
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

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

export default app;