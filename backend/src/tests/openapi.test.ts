import { describe, it, expect, vi } from 'vitest';
import { generateOpenApiDocument } from '../docs/openapi.js';

describe('OpenAPI document', () => {
  it('deve gerar documento OpenAPI 3.0 válido', () => {
    const doc = generateOpenApiDocument();

    expect(doc.openapi).toBe('3.0.3');
    expect(doc.info.title).toBe('Agenda Fácil API');
    expect(doc.info.version).toBe('1.0.0');
  });

  it('deve documentar todos os endpoints principais', () => {
    const doc = generateOpenApiDocument();
    const paths = Object.keys(doc.paths);

    const expectedPaths = [
      '/auth/status',
      '/auth/setup',
      '/auth/login',
      '/auth/me',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/categories',
      '/categories/{id}',
      '/professionals',
      '/professionals/category/{categoryId}',
      '/professionals/{id}',
      '/availabilities',
      '/availabilities/professional/{professionalId}',
      '/availabilities/slots',
      '/availabilities/{id}',
      '/appointments',
      '/appointments/{id}',
      '/appointments/{id}/confirm',
      '/appointments/{id}/cancel',
      '/health',
      '/health/database',
      '/health/evolution',
    ];

    for (const expected of expectedPaths) {
      expect(paths, `Path ${expected} deve existir`).toContain(expected);
    }
  });

  it('deve ter o security scheme bearerAuth registrado', () => {
    const doc = generateOpenApiDocument();
    const components = doc.components?.securitySchemes as Record<string, unknown> | undefined;
    expect(components).toBeDefined();
    expect(components?.bearerAuth).toBeDefined();
  });

  it('deve agrupar paths em tags', () => {
    const doc = generateOpenApiDocument();
    const tags = new Set<string>();
    for (const pathItem of Object.values(doc.paths)) {
      for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
        const op = (pathItem as any)[method];
        if (op?.tags) {
          for (const t of op.tags) tags.add(t);
        }
      }
    }
    expect(tags.has('Auth')).toBe(true);
    expect(tags.has('Categories')).toBe(true);
    expect(tags.has('Professionals')).toBe(true);
    expect(tags.has('Availabilities')).toBe(true);
    expect(tags.has('Appointments')).toBe(true);
    expect(tags.has('Health')).toBe(true);
  });
});
