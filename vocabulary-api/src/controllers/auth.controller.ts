import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { config } from '../config/env';

// 注册新用户
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码为必填项'
      });
    }
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已被注册'
      });
    }
    
    // 创建新用户
    const newUser = new User({
      username,
      email,
      passwordHash: password // 中间件会自动加密
    });
    
    await newUser.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: (newUser._id as mongoose.Types.ObjectId).toString() },
      Buffer.from(config.JWT_SECRET),
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      userId: newUser._id,
      token
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 用户登录
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码为必填项'
      });
    }
    
    // 查找用户
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      });
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确'
      });
    }
    
    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: (user._id as mongoose.Types.ObjectId).toString() },
      Buffer.from(config.JWT_SECRET),
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      message: '登录成功',
      userId: user._id,
      username: user.username,
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // 从数据库查询完整用户信息
    const userId = req.user._id;
    const userFromDb = await User.findById(userId);
    
    if (!userFromDb) {
      return res.status(404).json({
        success: false,
        message: '用户未找到'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        _id: userFromDb._id,
        username: userFromDb.username,
        email: userFromDb.email,
        learningStats: userFromDb.learningStats,
        settings: userFromDb.settings,
        createdAt: userFromDb.createdAt
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
}; 