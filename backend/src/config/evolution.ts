import { getEnv } from './env.js';

export function getEvolutionConfig() {
  const env = getEnv();

  return {
    apiUrl: env.WHATSAPP_API_URL,
    instanceName: env.WHATSAPP_INSTANCE_NAME,
    apiKey: env.WHATSAPP_API_KEY,
  };
}
