import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { connectMongoDB } from './config/database';
import { connectRedis } from './config/redis';
import logger from './config/logger';
import { globalErrorHandler } from './utils/errorHandler';
import authRoutes from './routes/auth.routes';
import wordRoutes from './routes/word.routes';
import exerciseRoutes from './routes/exercise.routes';

// 初始化Express应用
const app = express();

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS配置
app.use(cors({
  origin: 'http://localhost:3000', // 明确指定前端地址
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// 连接数据库
(async () => {
  try {
    await connectMongoDB();
    await connectRedis();
  } catch (error) {
    logger.error('数据库连接失败', error);
    process.exit(1);
  }
})();

console.log('🚀 Server starting without database connection (using mock data)...');

// 路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Vocabulary App API' });
});

// 添加API路由
app.use('/api/auth', authRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/exercises', exerciseRoutes);

// 处理未找到的路由
app.all('*', (req, res, next) => {
  const err = new Error(`找不到URL: ${req.originalUrl}`) as any;
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

// 全局错误处理中间件
app.use(globalErrorHandler);

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常! 正在关闭服务...');
  logger.error(err.name, err.message);
  logger.error(err.stack);
  process.exit(1);
});

// 处理未处理的promise拒绝
process.on('unhandledRejection', (err: any) => {
  logger.error('未处理的Promise拒绝! 正在关闭服务...');
  logger.error(err.name, err.message);
  logger.error(err.stack);
  process.exit(1);
});

// 启动服务器
const PORT = process.env.PORT || config.PORT;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${config.NODE_ENV} mode`);
  logger.info(`🌐 CORS enabled for: http://localhost:3000`);
}); 