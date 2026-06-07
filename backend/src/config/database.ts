import { getEnv } from './env.js';

export function getDatabaseConfig() {
  const env = getEnv();

  return {
    url: env.DATABASE_URL,
  };
}
