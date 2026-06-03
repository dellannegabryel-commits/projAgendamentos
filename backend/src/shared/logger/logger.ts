import pino from 'pino';
import { getEnv } from '../../config/index.js';

let _logger: pino.Logger | null = null;

function createLogger(): pino.Logger {
  const env = getEnv();
  return pino({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: env.NODE_ENV === 'development'
      ? { target: 'pino/file', options: { destination: 1 } }
      : undefined,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  });
}

export function getLogger(): pino.Logger {
  if (!_logger) {
    _logger = createLogger();
  }
  return _logger;
}

export const logger = new Proxy({} as pino.Logger, {
  get: (_, prop) => {
    const l = getLogger();
    return (l as any)[prop];
  },
});
