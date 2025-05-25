import mongoose from 'mongoose';
import { connectMongoDB } from '../src/config/database';
import { User } from '../src/models/User';

// 创建测试用户
const createTestUser = async () => {
  try {
    // 连接数据库
    await connectMongoDB();
    
    // 先删除可能存在的测试用户
    await User.deleteOne({ email: 'test@example.com' });
    console.log('已删除旧的测试用户（如果存在）');
    
    // 创建测试用户
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: '123456' // 中间件会自动加密
    });
    
    await testUser.save();
    
    console.log('测试用户创建成功！');
    console.log('邮箱: test@example.com');
    console.log('密码: 123456');
    console.log('用户ID:', testUser._id);
    
    // 验证密码是否正确加密
    const isPasswordValid = await testUser.comparePassword('123456');
    console.log('密码验证结果:', isPasswordValid);
    
    // 断开连接
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
    
    process.exit(0);
  } catch (error) {
    console.error('创建测试用户错误:', error);
    process.exit(1);
  }
};

// 执行创建
createTestUser(); 