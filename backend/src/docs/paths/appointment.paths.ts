import { z } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: z.object({ error: z.object({ code: z.string(), message: z.string() }) }) } },
});

export function registerAppointmentPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/appointments',
    summary: 'Lista agendamentos (paginado)',
    tags: ['Appointments'],
    security: [{ bearerAuth: [] }],
    request: {
      query: z.object({
        status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
        professionalId: z.string().uuid().optional(),
        dateFrom: z.string().datetime().optional(),
        dateTo: z.string().datetime().optional(),
        page: z.coerce.number().int().min(1).optional(),
        pageSize: z.coerce.number().int().min(1).max(100).optional(),
        sortBy: z.enum(['date', 'createdAt', 'status']).optional(),
        order: z.enum(['asc', 'desc']).optional(),
      }),
    },
    responses: {
      200: {
        description: 'Lista paginada',
        content: { 'application/json': { schema: z.object({
          data: z.array(z.any()),
          total: z.number().int(),
          page: z.number().int(),
          pageSize: z.number().int(),
          totalPages: z.number().int(),
        }) } },
      },
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/appointments/{id}',
    summary: 'Busca agendamento por ID',
    tags: ['Appointments'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { description: 'Agendamento encontrado', content: { 'application/json': { schema: z.any() } } },
      404: errorResponse('Agendamento não encontrado'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/appointments',
    summary: 'Cria um agendamento (público, rate-limited)',
    description: 'Endpoint público usado pelo wizard de booking. Envia WhatsApp ao cliente após criar.',
    tags: ['Appointments'],
    request: {
      body: {
        content: { 'application/json': { schema: z.object({
          professionalId: z.string().uuid(),
          clientName: z.string().min(1).max(100),
          clientPhone: z.string().openapi({ example: '11999999999', description: '10 ou 11 dígitos (com ou sem máscara)' }),
          date: z.string().datetime().openapi({ example: '2027-01-15T14:00:00-03:00', description: 'ISO 8601 com fuso horário' }),
        }) } },
        required: true,
      },
    },
    responses: {
      201: { description: 'Agendamento criado', content: { 'application/json': { schema: z.any() } } },
      400: errorResponse('Dados inválidos ou horário fora da disponibilidade'),
      409: errorResponse('Horário já está agendado'),
      429: errorResponse('Muitas requisições'),
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/appointments/{id}/confirm',
    summary: 'Confirma um agendamento pendente',
    tags: ['Appointments'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { description: 'Agendamento confirmado', content: { 'application/json': { schema: z.any() } } },
      400: errorResponse('Apenas pendentes podem ser confirmados'),
      404: errorResponse('Agendamento não encontrado'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/appointments/{id}/cancel',
    summary: 'Cancela um agendamento',
    tags: ['Appointments'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { description: 'Agendamento cancelado', content: { 'application/json': { schema: z.any() } } },
      400: errorResponse('Agendamento já cancelado'),
      404: errorResponse('Agendamento não encontrado'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/appointments/{id}',
    summary: 'Remove (hard delete) um agendamento cancelado',
    tags: ['Appointments'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      204: { description: 'Agendamento removido' },
      400: errorResponse('Apenas cancelados podem ser excluídos'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });
}
