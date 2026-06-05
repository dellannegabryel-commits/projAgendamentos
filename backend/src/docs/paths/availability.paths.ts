import { z } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: z.object({ error: z.object({ code: z.string(), message: z.string() }) }) } },
});

export function registerAvailabilityPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/availabilities',
    summary: 'Lista todas as disponibilidades',
    tags: ['Availabilities'],
    responses: {
      200: { description: 'Lista de disponibilidades', content: { 'application/json': { schema: z.array(z.any()) } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/availabilities/professional/{professionalId}',
    summary: 'Lista disponibilidades de um profissional',
    tags: ['Availabilities'],
    request: { params: z.object({ professionalId: z.string().uuid() }) },
    responses: {
      200: { description: 'Lista de disponibilidades', content: { 'application/json': { schema: z.array(z.any()) } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/availabilities/slots',
    summary: 'Retorna slots de horário disponíveis para uma data',
    tags: ['Availabilities'],
    request: {
      query: z.object({
        professionalId: z.string().uuid(),
        date: z.string().openapi({ example: '2027-01-15', description: 'Data no formato YYYY-MM-DD' }),
      }),
    },
    responses: {
      200: { description: 'Slots de 30min', content: { 'application/json': { schema: z.array(z.object({
        time: z.string(),
        available: z.boolean(),
      })) } } },
      400: errorResponse('Parâmetros inválidos'),
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/availabilities',
    summary: 'Cria uma disponibilidade',
    tags: ['Availabilities'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: z.object({
          professionalId: z.string().uuid(),
          dayOfWeek: z.number().int().min(0).max(6).openapi({ example: 1, description: '0=Domingo, 6=Sábado' }),
          startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).openapi({ example: '08:00' }),
          endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).openapi({ example: '18:00' }),
        }) } },
        required: true,
      },
    },
    responses: {
      201: { description: 'Disponibilidade criada', content: { 'application/json': { schema: z.any() } } },
      400: errorResponse('Dados inválidos'),
      401: errorResponse('Token ausente ou inválido'),
      409: errorResponse('Já existe disponibilidade ativa com este horário'),
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/availabilities/{id}',
    summary: 'Atualiza uma disponibilidade',
    tags: ['Availabilities'],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { 'application/json': { schema: z.object({
          professionalId: z.string().uuid().optional(),
          dayOfWeek: z.number().int().min(0).max(6).optional(),
          startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
          endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
        }) } },
        required: true,
      },
    },
    responses: {
      200: { description: 'Disponibilidade atualizada', content: { 'application/json': { schema: z.any() } } },
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/availabilities/{id}',
    summary: 'Remove uma disponibilidade',
    tags: ['Availabilities'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      204: { description: 'Disponibilidade removida' },
      401: errorResponse('Token ausente ou inválido'),
    },
  });
}
