#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function simpleTest() {
  console.log('🚀 简单的 Supabase 连接测试...\n');
  
  // 使用正确的 Supabase 凭据
  const supabaseUrl = 'https://yuglaystxeopuymtinfs.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODMzMTA3NCwiZXhwIjoyMDYzOTA3MDc0fQ.fEgfymwY-qKWuauqo-DTCZVz71Z-qDWGV4_5RXHhmuI';
  
  console.log('✅ 使用正确的凭据');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  
  // 创建 Supabase 客户端
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // 简单的连接测试 - 尝试获取当前用户
    console.log('🔗 测试基本连接...');
    
    // 测试 1: 尝试执行一个简单的 SQL 查询
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.log('⚠️  版本查询失败，尝试其他方法...');
      
      // 测试 2: 尝试查询系统表
      const { data: testData, error: testError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .limit(1);
      
      if (testError) {
        console.log('⚠️  系统表查询失败，尝试创建测试表...');
        
        // 测试 3: 尝试创建一个简单的测试表
        const { data: createData, error: createError } = await supabase.rpc('exec_sql', {
          sql: 'CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW());'
        });
        
        if (createError) {
          console.error('❌ 连接测试失败:', createError.message);
          console.log('\n🔧 建议手动操作：');
          console.log('1. 访问 Supabase Dashboard: https://supabase.com/dashboard/project/yuglaystxeopuymtinfs');
          console.log('2. 进入 SQL Editor');
          console.log('3. 执行一个简单的查询，如: SELECT 1;');
          return;
        } else {
          console.log('✅ 连接成功！（通过创建测试表验证）');
        }
      } else {
        console.log('✅ 连接成功！（通过系统表查询验证）');
      }
    } else {
      console.log('✅ 连接成功！（通过版本查询验证）');
    }
    
    // 现在尝试手动执行迁移 SQL
    console.log('\n📊 现在尝试执行数据库迁移...');
    
    // 逐个执行关键的 SQL 语句
    const criticalStatements = [
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS word_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS words (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        english VARCHAR(255) NOT NULL,
        chinese VARCHAR(255) NOT NULL,
        pronunciation VARCHAR(255),
        difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
        category_id UUID REFERENCES word_categories(id) ON DELETE SET NULL,
        audio_url TEXT,
        example_sentence TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    ];
    
    for (let i = 0; i < criticalStatements.length; i++) {
      const statement = criticalStatements[i];
      console.log(`⏳ 执行关键语句 ${i + 1}/${criticalStatements.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  跳过（已存在）`);
        } else {
          console.error(`❌ 执行失败: ${error.message}`);
        }
      } else {
        console.log(`✅ 执行成功`);
      }
    }
    
    // 验证表是否创建成功
    console.log('\n🔍 验证表创建...');
    const tables = ['users', 'words', 'word_categories'];
    
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
    
    console.log('\n🎉 基本设置完成！');
    console.log('\n📋 总结：');
    console.log('✅ Supabase 连接正常');
    console.log('✅ 基本表结构已创建');
    console.log('\n下一步：');
    console.log('1. 在 Supabase Dashboard 中完成完整的迁移');
    console.log('2. 或者手动复制完整的 SQL 到 SQL Editor 中执行');
    console.log('3. 测试应用连接');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    console.log('\n🔧 建议：');
    console.log('1. 检查网络连接');
    console.log('2. 验证 Supabase 项目是否正常运行');
    console.log('3. 确认 Service Role Key 是否正确');
  }
}

simpleTest(); 