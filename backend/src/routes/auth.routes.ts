import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { loginLimiter, passwordResetLimiter } from '../middlewares/rateLimiter.js';

const router = Router();
const controller = new AuthController();

router.get('/status', controller.status.bind(controller));
router.post('/setup', controller.setup.bind(controller));
router.post('/login', loginLimiter, controller.login.bind(controller));
router.get('/me', authMiddleware, controller.me.bind(controller));
router.post('/forgot-password', passwordResetLimiter, controller.forgotPassword.bind(controller));
router.post('/reset-password', passwordResetLimiter, controller.resetPassword.bind(controller));

export default router;
