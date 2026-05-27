import { Router } from 'express';
import categoryRoutes from './category.routes.js';
import professionalRoutes from './professional.routes.js';
import availabilityRoutes from './availability.routes.js';
import appointmentRoutes from './appointment.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/professionals', professionalRoutes);
router.use('/availabilities', availabilityRoutes);
router.use('/appointments', appointmentRoutes);

export default router;