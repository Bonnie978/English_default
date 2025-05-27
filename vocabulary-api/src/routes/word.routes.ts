import { Router } from 'express';
import { getDailyWords, markWordAsMastered, getLearningStats } from '../controllers/word.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 获取学习统计信息 - 临时不需要认证，用于测试
router.get('/stats', getLearningStats);

// 其他路由需要身份验证
router.use(authenticate);

// 获取每日单词
router.get('/daily', getDailyWords);

// 标记单词为已掌握/未掌握
router.post('/:wordId/mastered', markWordAsMastered);

export default router; 