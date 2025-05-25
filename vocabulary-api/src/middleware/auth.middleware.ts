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
    
    // 验证令牌
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
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '令牌无效或已过期'
    });
  }
}; 