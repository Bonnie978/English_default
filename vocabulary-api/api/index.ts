import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';

// Vercel Serverless Function Handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  // 不移除 /api 前缀，因为Express路由现在包含它
  // 确保路径以 / 开头
  if (req.url && !req.url.startsWith('/')) {
    req.url = '/' + req.url;
  }
  
  return app(req, res);
} 