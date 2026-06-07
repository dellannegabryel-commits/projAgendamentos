import { z } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export function registerHealthPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/health',
    summary: 'Healthcheck geral (db + evolution + uptime)',
    tags: ['Health'],
    responses: {
      200: {
        description: 'Status da aplicação',
        content: { 'application/json': { schema: z.object({
          status: z.enum(['ok', 'degraded', 'down']),
          uptime: z.number(),
          timestamp: z.string().datetime(),
          services: z.object({
            database: z.enum(['up', 'down']),
            evolution: z.enum(['up', 'down', 'unknown']),
          }),
        }) } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/health/database',
    summary: 'Healthcheck do banco de dados',
    tags: ['Health'],
    responses: {
      200: { description: 'DB OK', content: { 'application/json': { schema: z.object({ status: z.string(), latency: z.number() }) } } },
      503: { description: 'DB indisponível' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/health/evolution',
    summary: 'Healthcheck da Evolution API (WhatsApp)',
    tags: ['Health'],
    responses: {
      200: { description: 'Evolution OK', content: { 'application/json': { schema: z.object({ status: z.string() }) } } },
      503: { description: 'Evolution indisponível' },
    },
  });
}
