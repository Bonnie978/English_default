#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testAndMigrate() {
  console.log('🚀 使用正确的 URL 测试 Supabase 连接并执行迁移...\n');
  
  // 使用正确的 Supabase 凭据
  const supabaseUrl = 'https://yuglaystxeopuymtinfs.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODMzMTA3NCwiZXhwIjoyMDYzOTA3MDc0fQ.fEgfymwY-qKWuauqo-DTCZVz71Z-qDWGV4_5RXHhmuI';
  
  console.log('✅ 使用正确的凭据');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  
  // 创建 Supabase 客户端
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
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
    
    console.log('✅ Supabase 连接成功！');
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../../supabase/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 迁移文件读取成功');
    
    // 检查表是否已存在
    console.log('\n🔍 检查现有表...');
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (!tablesError && existingTables) {
      const tableNames = existingTables.map(t => t.table_name);
      console.log('现有表:', tableNames);
      
      const requiredTables = ['users', 'words', 'word_categories', 'user_progress', 'learning_sessions'];
      const missingTables = requiredTables.filter(table => !tableNames.includes(table));
      
      if (missingTables.length === 0) {
        console.log('✅ 所有必需的表都已存在！');
      } else {
        console.log(`⚠️  缺少表: ${missingTables.join(', ')}`);
        console.log('需要执行迁移...');
      }
    }
    
    // 执行迁移（分步执行）
    console.log('\n📊 执行数据库迁移...');
    
    // 将 SQL 分割成单独的语句
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`准备执行 ${statements.length} 个 SQL 语句...\n`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ 执行语句 ${i + 1}/${statements.length}...`);
          
          // 直接使用 SQL 查询
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key') ||
                error.message.includes('relation') && error.message.includes('already exists')) {
              console.log(`⚠️  跳过（已存在）`);
              skipCount++;
            } else {
              console.error(`❌ 执行失败: ${error.message.substring(0, 100)}...`);
              errorCount++;
            }
          } else {
            console.log(`✅ 执行成功`);
            successCount++;
          }
        } catch (err) {
          console.error(`❌ 执行异常: ${err.message.substring(0, 100)}...`);
          errorCount++;
        }
      }
    }
    
    console.log(`\n📊 迁移统计:`);
    console.log(`✅ 成功: ${successCount}`);
    console.log(`⚠️  跳过: ${skipCount}`);
    console.log(`❌ 错误: ${errorCount}`);
    
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
    console.log('1. 更新环境变量文件（如果需要）');
    console.log('2. 测试连接：npm run test:supabase');
    console.log('3. 启动应用：');
    console.log('   前端：cd ../vocabulary-app && npm start');
    console.log('   后端：npm run dev');
    
  } catch (error) {
    console.error('❌ 过程中出现错误:', error.message);
    console.log('\n🔧 如果自动迁移失败，请手动执行：');
    console.log('1. 访问 Supabase Dashboard: https://supabase.com/dashboard/project/yuglaystxeopuymtinfs');
    console.log('2. 进入 SQL Editor');
    console.log('3. 复制并执行 supabase/migrations/001_initial_schema.sql 中的内容');
  }
}

testAndMigrate(); 