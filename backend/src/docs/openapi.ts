import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registerAuthPaths } from './paths/auth.paths.js';
import { registerCategoryPaths } from './paths/category.paths.js';
import { registerProfessionalPaths } from './paths/professional.paths.js';
import { registerAvailabilityPaths } from './paths/availability.paths.js';
import { registerAppointmentPaths } from './paths/appointment.paths.js';
import { registerHealthPaths } from './paths/health.paths.js';
import { registerCommonSchemas } from './schemas.js';

export const registry = new OpenAPIRegistry();

registerCommonSchemas(registry);
registerAuthPaths(registry);
registerCategoryPaths(registry);
registerProfessionalPaths(registry);
registerAvailabilityPaths(registry);
registerAppointmentPaths(registry);
registerHealthPaths(registry);

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Token JWT obtido via /api/auth/login',
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Agenda Fácil API',
      version: '1.0.0',
      description: 'API REST do sistema de agendamento online com integração WhatsApp (Evolution API).',
      contact: { name: 'Agenda Fácil' },
    },
    servers: [
      { url: '/api', description: 'Servidor atual' },
      { url: 'http://localhost:3001/api', description: 'Desenvolvimento local' },
    ],
  });
}
