import { Router } from 'express';
import { 
  createExercise, 
  getUserExercises, 
  recordWrongAnswer,
  getUserWrongAnswers
} from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有路由都需要身份验证
router.use(authenticate);

// 创建练习
router.post('/', createExercise);

// 获取用户练习历史
router.get('/', getUserExercises);

// 记录错误答案
router.post('/wrong-answers', recordWrongAnswer);

// 获取用户错误答案
router.get('/wrong-answers', getUserWrongAnswers);

export default router; 