import { createClient } from 'redis';
import { config } from './env';

// 创建Redis客户端
const redisClient = createClient({
  url: config.REDIS_URL
});

// 连接Redis
export const connectRedis = async (): Promise<void> => {
  try {
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    await redisClient.connect();
    console.log('🔌 Redis connected successfully');
    
    // 程序终止时关闭连接
    process.on('SIGINT', async () => {
      await redisClient.quit();
      console.log('Redis connection closed due to app termination');
    });
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
};

export { redisClient }; 