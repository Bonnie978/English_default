import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 注册路由
router.post('/register', register);

// 登录路由
router.post('/login', login);

// 获取当前用户路由(需要认证)
router.get('/me', authenticate, getCurrentUser);

export default router; 