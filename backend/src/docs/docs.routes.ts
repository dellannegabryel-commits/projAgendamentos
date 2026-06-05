import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from './openapi.js';

const router = Router();

const openApiDocument = generateOpenApiDocument();

const swaggerOptions = {
  customSiteTitle: 'Agenda Fácil API',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
  },
};

router.use('/', swaggerUi.serveFiles(openApiDocument, swaggerOptions));
router.get('/', swaggerUi.setup(openApiDocument, swaggerOptions));

router.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(openApiDocument);
});

export default router;
