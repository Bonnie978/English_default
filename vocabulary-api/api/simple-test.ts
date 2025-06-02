import { VercelRequest, VercelResponse } from '@vercel/node';

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

    // 简单的测试响应，不依赖任何外部服务
    return res.status(200).json({
      success: true,
      message: 'Simple test endpoint working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      vercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Simple test error:', error);
    return res.status(500).json({ 
      error: 'Simple test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 