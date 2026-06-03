import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url('DATABASE_URL é obrigatória'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatória'),
  WHATSAPP_API_URL: z.string().default('http://localhost:8080'),
  WHATSAPP_INSTANCE_NAME: z.string().default('main'),
  WHATSAPP_API_KEY: z.string().default(''),
  DEFAULT_ADMIN_EMAIL: z.string().email().default('admin@agendafacil.com'),
  DEFAULT_ADMIN_PASSWORD: z.string().default('admin'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function loadEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Erro na validação das variáveis de ambiente:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  _env = result.data;
  return _env;
}

export function getEnv(): Env {
  if (!_env) {
    return loadEnv();
  }
  return _env;
}
