const express = require('express');
const cors = require('cors');
const path = require('path');

// 设置环境变量
process.env.DEEPSEEK_API_KEY = 'sk-a6844d61ab0542abb744366ddafc3668';
process.env.NODE_ENV = 'development';

console.log('🔑 DeepSeek API Key已配置:', process.env.DEEPSEEK_API_KEY ? '✅' : '❌');

// 导入我们的API函数
const summaryDaily = require('./api/summary-daily');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    deepseekConfigured: !!process.env.DEEPSEEK_API_KEY
  });
});

// 今日总结API端点
app.post('/api/summary/daily', summaryDaily);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 测试服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 今日总结API: http://localhost:${PORT}/api/summary/daily`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/hello`);
  console.log(`🤖 DeepSeek API: ${process.env.DEEPSEEK_API_KEY ? '已配置' : '未配置'}`);
});

module.exports = app; 