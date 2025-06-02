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
    
    // 查询表结构信息
    const tableSchemas = {};
    
    // 查询user_progress表结构
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = 'user_progress' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
      
      if (error) {
        // 尝试另一种方法
        const { data: userData, error: userError } = await supabase
          .from('user_progress')
          .select('*')
          .limit(1);
        
        tableSchemas.user_progress = userError ? 
          `查询失败: ${userError.message}` : 
          Object.keys(userData?.[0] || {});
      } else {
        tableSchemas.user_progress = data;
      }
    } catch (e) {
      tableSchemas.user_progress = `异常: ${e.message}`;
    }

    // 查询learning_sessions表结构
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = 'learning_sessions' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
      
      if (error) {
        // 尝试另一种方法
        const { data: sessionData, error: sessionError } = await supabase
          .from('learning_sessions')
          .select('*')
          .limit(1);
        
        tableSchemas.learning_sessions = sessionError ? 
          `查询失败: ${sessionError.message}` : 
          Object.keys(sessionData?.[0] || {});
      } else {
        tableSchemas.learning_sessions = data;
      }
    } catch (e) {
      tableSchemas.learning_sessions = `异常: ${e.message}`;
    }

    // 查询words表结构（用于参考）
    try {
      const { data: wordsData, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .limit(1);
      
      tableSchemas.words = wordsError ? 
        `查询失败: ${wordsError.message}` : 
        Object.keys(wordsData?.[0] || {});
    } catch (e) {
      tableSchemas.words = `异常: ${e.message}`;
    }

    // 尝试查询实际数据样本
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