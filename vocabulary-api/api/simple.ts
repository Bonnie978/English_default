// 部署触发时间: 2024-12-19 22:45:00
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 检查是否是stats请求
  if (req.url?.includes('stats') || req.query.type === 'stats') {
    // 检查认证头
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请登录'
      });
    }

    // 返回模拟统计数据
    return res.status(200).json({
      success: true,
      stats: {
        totalWordsLearned: 25,
        masteredWords: 18,
        streakDays: 5,
        totalExercises: 42,
        masteryRate: 72
      },
      debug: {
        message: '使用模拟数据',
        timestamp: new Date().toISOString()
      }
    });
  }

  // 默认简单响应
  res.status(200).json({
    message: 'Simple API endpoint is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    environment: process.env.NODE_ENV || 'development'
  });
} 