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
      res.status(200).end();
      return;
    }

    // 确保URL正确格式化
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + req.url;
    }
    
    // 确保路径以 / 开头
    if (req.url && !req.url.startsWith('/')) {
      req.url = '/' + req.url;
    }
    
    console.log('Processing request:', {
      method: req.method,
      url: req.url,
      originalUrl: req.url,
      headers: req.headers
    });
    
    // 调用Express应用
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 