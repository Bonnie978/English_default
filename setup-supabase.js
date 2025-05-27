#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Supabase 集成设置向导');
console.log('=====================================\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupSupabase() {
  try {
    console.log('请按照以下步骤设置 Supabase：\n');
    
    console.log('1. 访问 https://supabase.com 并创建账户');
    console.log('2. 创建新项目');
    console.log('3. 获取项目凭据\n');
    
    const supabaseUrl = await question('请输入您的 Supabase 项目 URL: ');
    const supabaseAnonKey = await question('请输入您的 Supabase Anon Key: ');
    const supabaseServiceKey = await question('请输入您的 Supabase Service Role Key: ');
    
    // 创建前端环境变量文件
    const frontendEnv = `# Supabase Configuration
REACT_APP_SUPABASE_URL=${supabaseUrl}
REACT_APP_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Optional: Development settings
REACT_APP_ENVIRONMENT=development
`;

    // 创建后端环境变量文件
    const backendEnv = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# MongoDB Configuration (保留原有配置)
MONGODB_URI=mongodb://localhost:27017/vocabulary-app
JWT_SECRET=your-jwt-secret-key

# Server Configuration
PORT=5000
NODE_ENV=development
`;

    // 写入环境变量文件
    fs.writeFileSync(path.join('vocabulary-app', '.env'), frontendEnv);
    fs.writeFileSync(path.join('vocabulary-api', '.env'), backendEnv);
    
    console.log('\n✅ 环境变量文件已创建！');
    console.log('   - vocabulary-app/.env');
    console.log('   - vocabulary-api/.env\n');
    
    const runMigration = await question('是否现在运行数据库迁移？(y/n): ');
    
    if (runMigration.toLowerCase() === 'y') {
      console.log('\n📊 运行数据库迁移...');
      console.log('请在 Supabase Dashboard 的 SQL Editor 中执行以下文件：');
      console.log('   - supabase/migrations/001_initial_schema.sql\n');
      
      console.log('或者您可以复制以下 SQL 并在 Supabase Dashboard 中执行：\n');
      
      try {
        const migrationSQL = fs.readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8');
        console.log('='.repeat(50));
        console.log(migrationSQL);
        console.log('='.repeat(50));
      } catch (error) {
        console.log('❌ 无法读取迁移文件，请手动在 Supabase Dashboard 中执行 supabase/migrations/001_initial_schema.sql');
      }
    }
    
    console.log('\n🎉 Supabase 设置完成！');
    console.log('\n下一步：');
    console.log('1. 在 Supabase Dashboard 中执行数据库迁移（如果还没有执行）');
    console.log('2. 测试连接：');
    console.log('   cd vocabulary-api && npm run test:supabase');
    console.log('3. 启动应用：');
    console.log('   前端：cd vocabulary-app && npm start');
    console.log('   后端：cd vocabulary-api && npm run dev');
    
  } catch (error) {
    console.error('❌ 设置过程中出现错误：', error.message);
  } finally {
    rl.close();
  }
}

setupSupabase(); 