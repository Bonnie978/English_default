import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { supabase } from '../config/supabase';

// 移除了接口扩展定义，因为它已在types/index.d.ts中定义

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 获取授权头
    const authHeader = req.headers.authorization;
    
    // 检查是否有授权头
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请登录'
      });
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    try {
      // 验证JWT令牌
      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
      
      // 从Supabase查询用户
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, email, is_admin')
        .eq('id', decoded.userId)
        .single();
      
      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在或令牌无效'
        });
      }
      
      // 将用户信息添加到请求中
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.is_admin ? 'admin' : 'user'
      };
      
      console.log('Auth: Authentication successful for:', user.email);
      next();
      
    } catch (jwtError) {
      console.error('Auth: JWT verification failed:', jwtError);
      return res.status(401).json({
        success: false,
        message: '令牌无效或已过期'
      });
    }
    
  } catch (error) {
    console.error('Auth: Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: '认证过程中发生错误'
    });
  }
}; 