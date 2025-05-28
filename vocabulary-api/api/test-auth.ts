import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/env';

export default async function handler(req: Request, res: Response) {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 获取授权头
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请提供有效的Bearer token',
        debug: {
          authHeader: authHeader ? 'present' : 'missing',
          headers: Object.keys(req.headers)
        }
      });
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    try {
      // 验证JWT令牌
      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
      
      return res.status(200).json({
        success: true,
        message: '认证成功',
        userId: decoded.userId,
        debug: {
          tokenLength: token.length,
          jwtSecret: config.JWT_SECRET ? 'configured' : 'missing'
        }
      });
      
    } catch (jwtError: any) {
      return res.status(401).json({
        success: false,
        message: '令牌无效或已过期',
        debug: {
          jwtError: jwtError.message,
          tokenLength: token.length
        }
      });
    }
    
  } catch (error: any) {
    console.error('Auth test error:', error);
    return res.status(500).json({
      success: false,
      message: '认证测试过程中发生错误',
      debug: {
        error: error.message,
        stack: error.stack
      }
    });
  }
} 