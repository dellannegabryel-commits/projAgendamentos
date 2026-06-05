import { z } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: z.object({ error: z.object({ code: z.string(), message: z.string() }) }) } },
});

export function registerProfessionalPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/professionals',
    summary: 'Lista todos os profissionais',
    tags: ['Professionals'],
    responses: {
      200: { description: 'Lista de profissionais', content: { 'application/json': { schema: z.array(z.any()) } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/professionals/category/{categoryId}',
    summary: 'Lista profissionais por categoria',
    tags: ['Professionals'],
    request: { params: z.object({ categoryId: z.string().uuid() }) },
    responses: {
      200: { description: 'Lista de profissionais', content: { 'application/json': { schema: z.array(z.any()) } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/professionals/{id}',
    summary: 'Busca profissional por ID',
    tags: ['Professionals'],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { description: 'Profissional encontrado', content: { 'application/json': { schema: z.any() } } },
      404: errorResponse('Profissional não encontrado'),
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/professionals',
    summary: 'Cria um profissional',
    tags: ['Professionals'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: z.object({
          name: z.string().min(1).max(100),
          phone: z.string().openapi({ example: '11999999999', description: '10 ou 11 dígitos (com ou sem máscara)' }),
          categoryId: z.string().uuid(),
          address: z.string().optional().default(''),
        }) } },
        required: true,
      },
    },
    responses: {
      201: { description: 'Profissional criado', content: { 'application/json': { schema: z.any() } } },
      400: errorResponse('Dados inválidos'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/professionals/{id}',
    summary: 'Atualiza um profissional',
    tags: ['Professionals'],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { 'application/json': { schema: z.object({
          name: z.string().min(1).max(100).optional(),
          phone: z.string().optional(),
          categoryId: z.string().uuid().optional(),
          address: z.string().optional(),
        }) } },
        required: true,
      },
    },
    responses: {
      200: { description: 'Profissional atualizado', content: { 'application/json': { schema: z.any() } } },
      404: errorResponse('Profissional não encontrado'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/professionals/{id}',
    summary: 'Remove um profissional',
    tags: ['Professionals'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      204: { description: 'Profissional removido' },
      404: errorResponse('Profissional não encontrado'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });
}
