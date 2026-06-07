import { logger } from './logger.js';

export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error(
    {
      err: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    },
    error.message
  );
}
