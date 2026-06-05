import { z, ZodTypeAny } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: z.object({ error: z.object({ code: z.string(), message: z.string() }) }) } },
});

const rateLimitResponse = {
  description: 'Muitas requisições',
  content: { 'application/json': { schema: z.object({ error: z.object({ code: z.literal('RATE_LIMIT'), message: z.string() }) }) } },
};

export function registerAuthPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/auth/status',
    summary: 'Verifica se existe admin cadastrado',
    description: 'Usado pelo frontend para decidir entre tela de login e tela de setup inicial.',
    tags: ['Auth'],
    responses: {
      200: {
        description: 'Status retornado',
        content: { 'application/json': { schema: z.object({ hasAdmin: z.boolean() }) } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/setup',
    summary: 'Cria o primeiro administrador (setup inicial)',
    description: 'Falha com 409 se já existe um admin cadastrado. Após usar, este endpoint se torna indisponível.',
    tags: ['Auth'],
    request: {
      body: {
        content: { 'application/json': { schema: z.object({
          name: z.string().min(1).max(100),
          email: z.string().email(),
          password: z.string().min(8).max(100),
        }) } },
        required: true,
      },
    },
    responses: {
      201: {
        description: 'Admin criado',
        content: { 'application/json': { schema: z.object({
          admin: z.object({ id: z.string().uuid(), name: z.string(), email: z.string().email() }),
          token: z.string(),
        }) } },
      },
      409: errorResponse('Setup já foi concluído ou email em uso'),
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    summary: 'Autentica um administrador',
    tags: ['Auth'],
    request: {
      body: {
        content: { 'application/json': { schema: z.object({
          email: z.string().email(),
          password: z.string().min(1),
        }) } },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'Login bem-sucedido',
        content: { 'application/json': { schema: z.object({
          admin: z.object({ id: z.string().uuid(), name: z.string(), email: z.string().email() }),
          token: z.string(),
        }) } },
      },
      401: errorResponse('Credenciais inválidas'),
      429: rateLimitResponse,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/auth/me',
    summary: 'Retorna o admin autenticado',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Admin autenticado',
        content: { 'application/json': { schema: z.object({ id: z.string().uuid(), name: z.string(), email: z.string().email() }) } },
      },
      401: errorResponse('Token ausente ou inválido'),
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/forgot-password',
    summary: 'Solicita redefinição de senha',
    description: 'Sempre retorna 200, mesmo se o email não existir (anti-enumeração). O token é logado no console do backend em ambientes sem SMTP.',
    tags: ['Auth'],
    request: {
      body: {
        content: { 'application/json': { schema: z.object({ email: z.string().email() }) } },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'Solicitação registrada',
        content: { 'application/json': { schema: z.object({ sent: z.literal(true) }) } },
      },
      429: rateLimitResponse,
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/auth/reset-password',
    summary: 'Redefine a senha com token',
    tags: ['Auth'],
    request: {
      body: {
        content: { 'application/json': { schema: z.object({
          token: z.string(),
          password: z.string().min(8).max(100),
        }) } },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'Senha redefinida',
        content: { 'application/json': { schema: z.object({ reset: z.literal(true) }) } },
      },
      400: errorResponse('Token inválido ou expirado'),
      429: rateLimitResponse,
    },
  });
}
