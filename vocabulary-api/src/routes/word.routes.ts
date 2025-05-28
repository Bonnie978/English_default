import { Router } from 'express';
import { getWords, getUserLearningRecord, updateWordMastery, getLearningStats } from '../controllers/word.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 获取单词列表 - 不需要认证
router.get('/', getWords);

// 需要身份验证的路由
router.use(authenticate);

// 获取学习统计信息
router.get('/stats', getLearningStats);

// 获取用户学习记录
router.get('/learning-record', getUserLearningRecord);

// 更新单词掌握状态
router.post('/:wordId/mastery', updateWordMastery);

export default router; 