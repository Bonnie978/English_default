import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';

// Vercel Serverless Function Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 设置CORS头部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 根路径返回API信息
    return res.status(200).json({
      message: 'Vocabulary Learning API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/api/auth/*',
        words: '/api/words/*',
        exercises: '/api/exercises/*',
        test: '/api/simple',
        supabase: '/api/test-supabase'
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export function rootHandler(req: VercelRequest, res: VercelResponse) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 根路径返回API信息
  return res.status(200).json({
    message: 'Vocabulary Learning API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth/*',
      words: '/api/words/*',
      exercises: '/api/exercises/*',
      test: '/api/simple',
      supabase: '/api/test-supabase'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
} 