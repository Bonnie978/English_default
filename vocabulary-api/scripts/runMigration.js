#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function runMigration() {
  console.log('🚀 开始执行 Supabase 数据库迁移...\n');
  
  // 检查环境变量
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 缺少 Supabase 环境变量');
    console.log('请确保 .env 文件包含：');
    console.log('- SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  
  console.log('✅ 环境变量检查通过');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  
  // 创建 Supabase 客户端
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../../supabase/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 迁移文件读取成功');
    
    // 测试连接
    console.log('🔗 测试 Supabase 连接...');
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase 连接失败:', testError.message);
      return;
    }
    
    console.log('✅ Supabase 连接成功');
    
    // 直接使用 SQL 查询执行迁移
    console.log('📊 执行数据库迁移...\n');
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ 迁移执行失败:', error.message);
      console.log('\n🔧 手动迁移方法：');
      console.log('1. 访问 Supabase Dashboard');
      console.log('2. 进入 SQL Editor');
      console.log('3. 复制并执行以下 SQL：');
      console.log('='.repeat(50));
      console.log(migrationSQL);
      console.log('='.repeat(50));
      return;
    }
    
    console.log('✅ 迁移执行成功');
    
    // 验证表是否创建成功
    console.log('\n🔍 验证表创建...');
    const tables = ['users', 'words', 'word_categories', 'user_progress', 'learning_sessions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ 表 ${table}: ${error.message}`);
        } else {
          console.log(`✅ 表 ${table}: 创建成功`);
        }
      } catch (err) {
        console.log(`❌ 表 ${table}: ${err.message}`);
      }
    }
    
    console.log('\n🎉 数据库迁移完成！');
    console.log('\n下一步：');
    console.log('1. 测试连接：npm run test:supabase');
    console.log('2. 启动应用：');
    console.log('   前端：cd ../vocabulary-app && npm start');
    console.log('   后端：npm run dev');
    
  } catch (error) {
    console.error('❌ 迁移过程中出现错误:', error.message);
    console.log('\n🔧 手动迁移方法：');
    console.log('1. 访问 Supabase Dashboard');
    console.log('2. 进入 SQL Editor');
    console.log('3. 复制并执行 supabase/migrations/001_initial_schema.sql 中的内容');
  }
}

runMigration(); 