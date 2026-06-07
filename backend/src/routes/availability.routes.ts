import { Router } from 'express';
import { AvailabilityController } from '../controllers/index.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new AvailabilityController();

router.get('/', controller.findAll.bind(controller));

router.get('/professional/:professionalId', controller.findByProfessionalId.bind(controller));
router.get('/slots', controller.getAvailableSlots.bind(controller));
router.post('/', authMiddleware, controller.create.bind(controller));
router.put('/:id', authMiddleware, controller.update.bind(controller));
router.delete('/:id', authMiddleware, controller.delete.bind(controller));

export default router;