import { Router } from 'express';
import { 
  generateExercise, 
  submitExerciseAnswer, 
  getWrongAnswers,
  markWrongAsReviewed
} from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要身份验证
router.use(authenticate);

// 生成练习题
router.post('/generate', generateExercise);

// 提交答案
router.post('/:exerciseId/submit', submitExerciseAnswer);

// 获取错题列表
router.get('/wrong-answers', getWrongAnswers);

// 标记错题为已复习
router.post('/wrong-answers/:wrongAnswerId/review', markWrongAsReviewed);

export default router; 