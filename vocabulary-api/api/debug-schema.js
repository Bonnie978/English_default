import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 查询表结构信息 - 使用更简单的方法
    const tableSchemas = {};
    
    // 直接查询表的columns信息
    try {
      const { data: progressColumns, error: progressError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'user_progress')
        .eq('table_schema', 'public')
        .order('ordinal_position');
      
      tableSchemas.user_progress_columns = progressError ? 
        `查询失败: ${progressError.message}` : 
        progressColumns?.map(col => `${col.column_name} (${col.data_type})`);
    } catch (e) {
      tableSchemas.user_progress_columns = `异常: ${e.message}`;
    }

    try {
      const { data: sessionColumns, error: sessionError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'learning_sessions')
        .eq('table_schema', 'public')
        .order('ordinal_position');
      
      tableSchemas.learning_sessions_columns = sessionError ? 
        `查询失败: ${sessionError.message}` : 
        sessionColumns?.map(col => `${col.column_name} (${col.data_type})`);
    } catch (e) {
      tableSchemas.learning_sessions_columns = `异常: ${e.message}`;
    }

    // 方法2: 尝试直接INSERT一个测试记录并查看错误信息
    const insertTests = {};
    
    // 测试user_progress表 - 只用最基本的字段
    try {
      const { error: progressInsertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: 'test-user',
          word_id: 'test-word',
          created_at: new Date().toISOString()
        });
      
      insertTests.user_progress_basic = progressInsertError ? 
        `失败: ${progressInsertError.message}` : '成功';
    } catch (e) {
      insertTests.user_progress_basic = `异常: ${e.message}`;
    }

    // 测试learning_sessions表 - 只用最基本的字段
    try {
      const { error: sessionInsertError } = await supabase
        .from('learning_sessions')
        .insert({
          id: `test-session-${Date.now()}`,
          user_id: 'test-user',
          created_at: new Date().toISOString()
        });
      
      insertTests.learning_sessions_basic = sessionInsertError ? 
        `失败: ${sessionInsertError.message}` : '成功';
    } catch (e) {
      insertTests.learning_sessions_basic = `异常: ${e.message}`;
    }

    // 方法3: 尝试查看已经存在的表有什么字段（通过错误信息推断）
    const fieldTests = {};
    
    // 测试user_progress是否有这些字段
    const userProgressFields = ['id', 'user_id', 'word_id', 'mastery_level', 'last_reviewed', 'review_count', 'correct_count'];
    for (const field of userProgressFields) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select(field)
          .limit(1);
        
        fieldTests[`user_progress.${field}`] = error ? 
          `不存在: ${error.message}` : '存在';
      } catch (e) {
        fieldTests[`user_progress.${field}`] = `异常: ${e.message}`;
      }
    }

    // 测试learning_sessions是否有这些字段  
    const sessionFields = ['id', 'user_id', 'session_type', 'words_studied', 'correct_answers', 'total_questions', 'duration_seconds', 'completed_at'];
    for (const field of sessionFields) {
      try {
        const { data, error } = await supabase
          .from('learning_sessions')
          .select(field)
          .limit(1);
        
        fieldTests[`learning_sessions.${field}`] = error ? 
          `不存在: ${error.message}` : '存在';
      } catch (e) {
        fieldTests[`learning_sessions.${field}`] = `异常: ${e.message}`;
      }
    }

    // 尝试查询实际数据样本（用所有可能的字段）
    const sampleData = {};
    
    try {
      const { data: progressSample } = await supabase
        .from('user_progress')
        .select('*')
        .limit(1);
      sampleData.user_progress = progressSample?.[0] || 'No data';
    } catch (e) {
      sampleData.user_progress = `Error: ${e.message}`;
    }

    try {
      const { data: sessionSample } = await supabase
        .from('learning_sessions')
        .select('*')
        .limit(1);
      sampleData.learning_sessions = sessionSample?.[0] || 'No data';
    } catch (e) {
      sampleData.learning_sessions = `Error: ${e.message}`;
    }

    return res.status(200).json({
      success: true,
      schemas: tableSchemas,
      insertTests: insertTests,
      fieldTests: fieldTests,
      sampleData: sampleData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 