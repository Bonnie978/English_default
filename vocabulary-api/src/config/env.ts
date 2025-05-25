import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export const config = {
  // 服务器配置
  PORT: process.env.PORT || 3001,  // 后端在3001端口
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/vocabulary-app',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT配置
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // AI服务配置
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  DEEPSEEK_API_URL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
  
  // 跨域配置 - 前端在3000端口
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
}; 