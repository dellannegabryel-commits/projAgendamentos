import { Router } from 'express';
import { DateBlockController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new DateBlockController();

router.get('/', controller.findAll.bind(controller));
router.post('/', authMiddleware, controller.create.bind(controller));
router.delete('/:id', authMiddleware, controller.delete.bind(controller));

export default router;
