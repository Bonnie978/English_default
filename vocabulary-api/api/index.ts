import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';

// Vercel Serverless Function Handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  // 添加 /api 前缀，因为 Express 路由期望完整路径
  // Vercel 重写后传入的是 /words/stats，但 Express 期望 /api/words/stats
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  
  // 确保路径以 / 开头
  if (req.url && !req.url.startsWith('/')) {
    req.url = '/' + req.url;
  }
  
  return app(req, res);
} 