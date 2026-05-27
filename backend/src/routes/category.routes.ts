import { Router } from 'express';
import { CategoryController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new CategoryController();

router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', authMiddleware, controller.create.bind(controller));
router.put('/:id', authMiddleware, controller.update.bind(controller));
router.delete('/:id', authMiddleware, controller.delete.bind(controller));

export default router;