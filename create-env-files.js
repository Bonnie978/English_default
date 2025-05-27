#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 创建环境变量文件...\n');

// 正确的 Supabase 配置
const supabaseUrl = 'https://yuglaystxeopuymtinfs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzEwNzQsImV4cCI6MjA2MzkwNzA3NH0.DxBxpc1JpUhfeL9Ojpvwy3yHR9sh9tcXj7zRnYq8JS8';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODMzMTA3NCwiZXhwIjoyMDYzOTA3MDc0fQ.fEgfymwY-qKWuauqo-DTCZVz71Z-qDWGV4_5RXHhmuI';

// 前端环境变量文件内容
const frontendEnv = `# Supabase Configuration
REACT_APP_SUPABASE_URL=${supabaseUrl}
REACT_APP_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Optional: Development settings
REACT_APP_ENVIRONMENT=development
`;

// 后端环境变量文件内容 - 使用端口 3001
const backendEnv = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# MongoDB Configuration (保留原有配置)
MONGODB_URI=mongodb://localhost:27017/vocabulary-app
JWT_SECRET=your-jwt-secret-key

# Server Configuration - 使用 3001 端口避免冲突
PORT=3001
NODE_ENV=development
`;

try {
  // 创建前端环境变量文件
  const frontendPath = path.join('vocabulary-app', '.env');
  fs.writeFileSync(frontendPath, frontendEnv);
  console.log('✅ 前端环境变量文件已创建:', frontendPath);

  // 创建后端环境变量文件
  const backendPath = path.join('vocabulary-api', '.env');
  fs.writeFileSync(backendPath, backendEnv);
  console.log('✅ 后端环境变量文件已创建:', backendPath);

  console.log('\n📋 配置信息：');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 50)}...`);
  console.log(`🔐 Service Key: ${supabaseServiceKey.substring(0, 50)}...`);
  console.log(`🌐 后端端口: 3001 (避免与系统服务冲突)`);

  console.log('\n✅ 环境变量文件创建完成！');
  console.log('\n下一步：');
  console.log('1. 启动后端：cd vocabulary-api && npm run dev');
  console.log('2. 启动前端：cd vocabulary-app && npm start');
  console.log('3. 访问应用：http://localhost:3000');
  console.log('4. API 地址：http://localhost:3001');

} catch (error) {
  console.error('❌ 创建环境变量文件时出错:', error.message);
  console.log('\n🔧 手动创建方法：');
  console.log('1. 在 vocabulary-app 目录下创建 .env 文件');
  console.log('2. 在 vocabulary-api 目录下创建 .env 文件');
  console.log('3. 复制上面显示的配置内容');
} 