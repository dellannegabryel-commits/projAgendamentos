import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login.bind(controller));
router.get('/me', authMiddleware, controller.me.bind(controller));

export default router;
