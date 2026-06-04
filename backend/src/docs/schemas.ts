import { z } from 'zod';
import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export function registerCommonSchemas(registry: OpenAPIRegistry) {
  registry.register('Error', z.object({
    error: z.object({
      code: z.string().openapi({ example: 'NOT_FOUND' }),
      message: z.string().openapi({ example: 'Recurso não encontrado' }),
    }),
  }).openapi('Error'));

  registry.register('ValidationError', z.object({
    error: z.object({
      code: z.literal('VALIDATION_ERROR'),
      message: z.string(),
      details: z.array(z.object({
        code: z.string(),
        path: z.array(z.union([z.string(), z.number()])),
        message: z.string(),
      })),
    }),
  }).openapi('ValidationError'));

  registry.register('RateLimitError', z.object({
    error: z.object({
      code: z.literal('RATE_LIMIT'),
      message: z.string(),
    }),
  }).openapi('RateLimitError'));

  registry.register('Category', z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable().optional(),
    isActive: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).openapi('Category'));

  registry.register('Professional', z.object({
    id: z.string().uuid(),
    name: z.string(),
    phone: z.string().openapi({ example: '11999999999' }),
    categoryId: z.string().uuid(),
    category: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }).passthrough(),
    address: z.string(),
    isActive: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).openapi('Professional'));

  registry.register('Availability', z.object({
    id: z.string().uuid(),
    professionalId: z.string().uuid(),
    dayOfWeek: z.number().int().min(0).max(6).openapi({ example: 1, description: '0=Domingo, 6=Sábado' }),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).openapi({ example: '08:00' }),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).openapi({ example: '18:00' }),
    isActive: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).openapi('Availability'));

  registry.register('TimeSlot', z.object({
    time: z.string().openapi({ example: '14:00' }),
    available: z.boolean(),
  }).openapi('TimeSlot'));

  registry.register('Appointment', z.object({
    id: z.string().uuid(),
    professionalId: z.string().uuid(),
    professional: z.object({
      id: z.string().uuid(),
      name: z.string(),
      phone: z.string(),
      category: z.object({
        id: z.string().uuid(),
        name: z.string(),
      }).passthrough(),
    }).passthrough(),
    clientName: z.string(),
    clientPhone: z.string(),
    date: z.string().datetime(),
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).openapi('Appointment'));

  registry.register('PaginatedAppointments', z.object({
    data: z.array(z.object({}).passthrough()),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    totalPages: z.number().int(),
  }).openapi('PaginatedAppointments'));

  registry.register('Admin', z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
  }).openapi('Admin'));

  registry.register('HealthStatus', z.object({
    status: z.enum(['ok', 'degraded', 'down']),
    uptime: z.number().openapi({ description: 'Uptime em segundos' }),
    timestamp: z.string().datetime(),
    services: z.object({
      database: z.enum(['up', 'down']),
      evolution: z.enum(['up', 'down', 'unknown']),
    }),
  }).openapi('HealthStatus'));
}
