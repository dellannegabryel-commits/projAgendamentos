import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

const router = Router();
const controller = new AuthController();

router.post('/login', loginLimiter, controller.login.bind(controller));
router.get('/me', authMiddleware, controller.me.bind(controller));

export default router;
