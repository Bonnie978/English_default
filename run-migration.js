#!/usr/bin/env node

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './vocabulary-api/.env' });

async function runMigration() {
  console.log('🚀 开始执行 Supabase 数据库迁移...\n');
  
  // 检查环境变量
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 缺少 Supabase 环境变量');
    console.log('请确保 vocabulary-api/.env 文件包含：');
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
    const migrationSQL = fs.readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8');
    console.log('📄 迁移文件读取成功');
    
    // 将 SQL 分割成单独的语句
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 准备执行 ${statements.length} 个 SQL 语句...\n`);
    
    // 逐个执行 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ 执行语句 ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // 如果是 "already exists" 错误，我们可以忽略
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key') ||
                error.message.includes('relation') && error.message.includes('already exists')) {
              console.log(`⚠️  跳过（已存在）: ${error.message.substring(0, 100)}...`);
            } else {
              console.error(`❌ 语句 ${i + 1} 执行失败:`, error.message);
            }
          } else {
            console.log(`✅ 语句 ${i + 1} 执行成功`);
          }
        } catch (err) {
          console.error(`❌ 语句 ${i + 1} 执行异常:`, err.message);
        }
      }
    }
    
    console.log('\n🎉 数据库迁移完成！');
    
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
    
    console.log('\n✨ 迁移验证完成！');
    console.log('\n下一步：');
    console.log('1. 测试连接：cd vocabulary-api && npm run test:supabase');
    console.log('2. 启动应用：');
    console.log('   前端：cd vocabulary-app && npm start');
    console.log('   后端：cd vocabulary-api && npm run dev');
    
  } catch (error) {
    console.error('❌ 迁移过程中出现错误:', error.message);
    console.log('\n🔧 手动迁移方法：');
    console.log('1. 访问 Supabase Dashboard');
    console.log('2. 进入 SQL Editor');
    console.log('3. 复制并执行 supabase/migrations/001_initial_schema.sql 中的内容');
  }
}

runMigration(); 