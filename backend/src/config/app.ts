import { getEnv } from './env.js';

export function getAppConfig() {
  const env = getEnv();

  return {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
    jwtSecret: env.JWT_SECRET,
  };
}
