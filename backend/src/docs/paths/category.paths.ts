import { z } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: z.object({ error: z.object({ code: z.string(), message: z.string() }) }) } },
});

export function registerCategoryPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/categories',
    summary: 'Lista todas as categorias',
    tags: ['Categories'],
    responses: {
      200: {
        description: 'Lista de categorias',
        content: { 'application/json': { schema: z.array(z.any()) } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/categories/{id}',
    summary: 'Busca categoria por ID',
    tags: ['Categories'],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { description: 'Categoria encontrada', content: { 'application/json': { schema: z.any() } } },
      404: errorResponse('Categoria não encontrada'),
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/categories',
    summary: 'Cria uma categoria',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: z.object({
          name: z.string().min(1).max(100),
          description: z.string().max(500).optional(),
        }) } },
        required: true,
      },
    },
    responses: {
      201: { description: 'Categoria criada', content: { 'application/json': { schema: z.any() } } },
      400: errorResponse('Dados inválidos'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/categories/{id}',
    summary: 'Atualiza uma categoria',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { 'application/json': { schema: z.object({
          name: z.string().min(1).max(100).optional(),
          description: z.string().max(500).optional(),
        }) } },
        required: true,
      },
    },
    responses: {
      200: { description: 'Categoria atualizada', content: { 'application/json': { schema: z.any() } } },
      404: errorResponse('Categoria não encontrada'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/categories/{id}',
    summary: 'Remove uma categoria',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      204: { description: 'Categoria removida' },
      404: errorResponse('Categoria não encontrada'),
      401: errorResponse('Token ausente ou inválido'),
    },
  });
}
