import mongoose from 'mongoose';
import { config } from './env';

// 连接MongoDB
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('🔌 MongoDB connected successfully');
    
    // 处理连接错误
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    // 断开连接时
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Trying to reconnect...');
    });
    
    // 程序终止时关闭连接
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    process.exit(1);
  }
};

// 导出Redis URL
export const REDIS_URL = config.REDIS_URL; 