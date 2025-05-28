import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { connectRedis } from './config/redis';
import logger from './config/logger';
import { globalErrorHandler } from './utils/errorHandler';
import authRoutes from './routes/auth.routes';
import wordRoutes from './routes/word.routes';
import exerciseRoutes from './routes/exercise.routes';
import supabaseRoutes from './routes/supabase';

// 初始化Express应用
const app = express();

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS配置 - 支持生产环境
const allowedOrigins = [
  'http://localhost:3000',
  'https://eapp-delta.vercel.app',
  'https://eapp-6a4uzh7dh-magics-projects-d2e379e7.vercel.app',
  'https://eapp-p2g6ndmln-magics-projects-d2e379e7.vercel.app',
  'https://eapp-b4yeapx37-magics-projects-d2e379e7.vercel.app',
  'https://english-default-qp9gio8q6-magics-projects-d2e379e7.vercel.app',
  'https://english-default-95j655ku2-magics-projects-d2e379e7.vercel.app',
  'https://english-default-91mdqifax-magics-projects-d2e379e7.vercel.app',
  'https://english-default-dl8jb1n5u-magics-projects-d2e379e7.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // 允许没有origin的请求（如移动应用）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // 暂时允许所有origin，用于调试
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// 数据库连接（简化版 - 只使用Supabase）
let redisConnected = false;
const initializeServices = async () => {
  if (!redisConnected && process.env.NODE_ENV !== 'production') {
    try {
      // 只在开发环境连接Redis（可选）
      await connectRedis();
      console.log('🔌 Redis connected (development)');
      redisConnected = true;
    } catch (error) {
      console.warn('Redis connection failed (optional):', error);
      // Redis连接失败不影响应用运行
    }
  }
};

// 在需要时初始化服务
app.use(async (req, res, next) => {
  // 只在开发环境初始化Redis
  if (process.env.NODE_ENV !== 'production') {
    await initializeServices();
  }
  next();
});

console.log('🚀 Server starting with Supabase integration...');

// 路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Vocabulary App API with Supabase',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'vocabulary-api',
    database: 'supabase',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 调试路由
app.get('/debug', (req, res) => {
  res.json({
    path: req.path,
    method: req.method,
    headers: req.headers,
    query: req.query,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API 调试路由
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'API debug endpoint working!',
    path: req.path,
    originalUrl: req.originalUrl,
    method: req.method,
    headers: req.headers,
    query: req.query,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 测试路由
app.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 添加API路由 - 添加 /api 前缀以匹配 Vercel 重写后的路径
app.use('/api/auth', authRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/supabase', supabaseRoutes);

// 处理未找到的路由
app.all('*', (req, res, next) => {
  const err = new Error(`找不到URL: ${req.originalUrl}`) as any;
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

// 全局错误处理中间件
app.use(globalErrorHandler);

// 处理未捕获的异常（仅在非生产环境）
if (process.env.NODE_ENV !== 'production') {
  process.on('uncaughtException', (err) => {
    logger.error('未捕获的异常! 正在关闭服务...');
    logger.error(err.name, err.message);
    logger.error(err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (err: any) => {
    logger.error('未处理的Promise拒绝! 正在关闭服务...');
    logger.error(err.name, err.message);
    logger.error(err.stack);
    process.exit(1);
  });
}

// 启动服务器（仅在非Vercel环境中）
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || config.PORT;
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${config.NODE_ENV} mode`);
    logger.info(`🌐 CORS enabled for multiple origins`);
  });
}

// 导出app供Vercel使用
export default app; 