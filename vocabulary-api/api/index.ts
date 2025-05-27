import express from 'express';
import cors from 'cors';

const app = express();

// 中间件
app.use(express.json());
app.use(cors({
  origin: true, // 暂时允许所有origin
  credentials: true
}));

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Vocabulary App API',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 模拟words/stats API
app.get('/words/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalWordsLearned: 0,
      masteredWords: 0,
      streakDays: 0,
      totalExercises: 0
    }
  });
});

// 错误处理
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app; 