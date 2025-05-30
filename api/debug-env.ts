import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return res.status(200).json({
      success: true,
      message: 'Environment debug endpoint working!',
      environment: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Debug env error:', error);
    return res.status(500).json({
      success: false,
      message: '调试过程中发生错误',
      error: error.message,
      stack: error.stack
    });
  }
} 