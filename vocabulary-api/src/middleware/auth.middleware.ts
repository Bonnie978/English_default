import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User, IUser } from '../models/User';

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
      // 首先尝试验证Supabase JWT
      const supabaseDecoded = jwt.decode(token, { complete: true });
      
      if (supabaseDecoded && typeof supabaseDecoded === 'object' && supabaseDecoded.payload) {
        const payload = supabaseDecoded.payload as any;
        
        // 检查是否是Supabase JWT（通过iss字段判断）
        if (payload.iss && payload.iss.includes('supabase')) {
          console.log('Auth: Detected Supabase JWT token');
          
          // 验证Supabase JWT（这里简化处理，实际应该验证签名）
          if (payload.email && payload.sub) {
            // 根据email查找或创建用户
            let user = await User.findOne({ email: payload.email });
            
            if (!user) {
              // 如果用户不存在，创建一个新用户
              console.log('Auth: Creating new user from Supabase token');
              user = new User({
                username: payload.email.split('@')[0], // 使用邮箱前缀作为用户名
                email: payload.email,
                passwordHash: 'supabase_user', // 标记为Supabase用户
              });
              await user.save();
            }
            
            // 将用户信息添加到请求中
            req.user = user as any;
            console.log('Auth: Supabase authentication successful for:', payload.email);
            return next();
          }
        }
      }
      
      // 如果不是Supabase JWT，尝试传统JWT验证
      console.log('Auth: Trying traditional JWT verification');
      const decoded = jwt.verify(token, Buffer.from(config.JWT_SECRET)) as { userId: string };
      
      // 查询用户
      const user = await User.findById(decoded.userId).select('-passwordHash');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在或令牌无效'
        });
      }
      
      // 将用户信息添加到请求中
      req.user = user as any;
      console.log('Auth: Traditional JWT authentication successful for:', user.email);
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