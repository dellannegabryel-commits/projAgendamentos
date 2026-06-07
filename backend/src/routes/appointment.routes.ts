import { Router } from 'express';
import { AppointmentController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { appointmentLimiter } from '../middlewares/rateLimiter.js';

const router = Router();
const controller = new AppointmentController();

router.get('/', authMiddleware, controller.findAll.bind(controller));
router.get('/:id', authMiddleware, controller.findById.bind(controller));
router.post('/', appointmentLimiter, controller.create.bind(controller));
router.patch('/:id/confirm', authMiddleware, controller.confirm.bind(controller));
router.patch('/:id/cancel', authMiddleware, controller.cancel.bind(controller));
router.delete('/:id', authMiddleware, controller.delete.bind(controller));

export default router;