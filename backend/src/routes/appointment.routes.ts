import { Router } from 'express';
import { AppointmentController } from '../controllers/index.js';

const router = Router();
const controller = new AppointmentController();

router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', controller.create.bind(controller));
router.patch('/:id/confirm', controller.confirm.bind(controller));
router.patch('/:id/cancel', controller.cancel.bind(controller));

export default router;