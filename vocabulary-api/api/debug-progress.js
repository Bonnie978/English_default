import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET;

export default async function handler(req, res) {
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const debugInfo = {
      environment: {
        supabaseUrl: supabaseUrl ? '已设置' : '未设置',
        supabaseKey: supabaseKey ? '已设置' : '未设置', 
        jwtSecret: jwtSecret ? '已设置' : '未设置',
        nodeEnv: process.env.NODE_ENV
      },
      request: {
        method: req.method,
        userId: req.query.userId,
        hasAuthHeader: !!req.headers.authorization,
        bodyKeys: req.body ? Object.keys(req.body) : []
      }
    };

    // 测试Supabase连接
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // 测试连接 - 尝试查询现有表
        const tableTests = {};
        
        try {
          const { data, error } = await supabase.from('words').select('id').limit(1);
          tableTests.words = error ? `错误: ${error.message}` : '正常';
        } catch (e) {
          tableTests.words = `异常: ${e.message}`;
        }
        
        try {
          const { data, error } = await supabase.from('user_progress').select('id').limit(1);
          tableTests.user_progress = error ? `错误: ${error.message}` : '正常';
        } catch (e) {
          tableTests.user_progress = `异常: ${e.message}`;
        }
        
        try {
          const { data, error } = await supabase.from('learning_sessions').select('id').limit(1);
          tableTests.learning_sessions = error ? `错误: ${error.message}` : '正常';
        } catch (e) {
          tableTests.learning_sessions = `异常: ${e.message}`;
        }

        // 🔥 新增：测试数据库写操作权限
        const writeTests = {};
        const testUserId = req.query.userId || 'test-user-id';
        
        // 测试learning_sessions写入
        if (req.query.testWrite === 'true') {
          try {
            const testSessionId = `${testUserId}_debug_${Date.now()}`;
            const { error: sessionError } = await supabase
              .from('learning_sessions')
              .insert({
                id: testSessionId,
                user_id: testUserId,
                session_type: 'debug_test',
                words_studied: 1,
                correct_answers: 1,
                accuracy: 1.0,
                duration_minutes: 1,
                started_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              });
            
            writeTests.learning_sessions_insert = sessionError ? 
              `失败: ${sessionError.message}` : '成功';
              
            // 如果插入成功，立即删除测试数据
            if (!sessionError) {
              await supabase.from('learning_sessions').delete().eq('id', testSessionId);
            }
          } catch (e) {
            writeTests.learning_sessions_insert = `异常: ${e.message}`;
          }

          // 测试user_progress写入
          try {
            // 先获取一个words的ID用于测试
            const { data: wordData } = await supabase.from('words').select('id').limit(1);
            if (wordData && wordData[0]) {
              const testWordId = wordData[0].id;
              const testProgressId = `test-progress-${Date.now()}`;
              
              const { error: progressError } = await supabase
                .from('user_progress')
                .insert({
                  id: testProgressId,
                  user_id: testUserId,
                  word_id: testWordId,
                  correct_count: 1,
                  incorrect_count: 0,
                  mastery_level: 1,
                  last_studied: new Date().toISOString(),
                  study_streak: 1,
                  is_difficult: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              writeTests.user_progress_insert = progressError ? 
                `失败: ${progressError.message}` : '成功';
                
              // 如果插入成功，立即删除测试数据
              if (!progressError) {
                await supabase.from('user_progress').delete().eq('id', testProgressId);
              }
            } else {
              writeTests.user_progress_insert = '跳过: 没有可用的word_id';
            }
          } catch (e) {
            writeTests.user_progress_insert = `异常: ${e.message}`;
          }
        }
        
        debugInfo.database = {
          connection: '成功',
          tables: tableTests,
          ...(req.query.testWrite === 'true' && { writeTests })
        };
      } catch (error) {
        debugInfo.database = {
          connection: '失败',
          error: error.message
        };
      }
    } else {
      debugInfo.database = {
        connection: '跳过',
        reason: '缺少环境变量'
      };
    }

    // JWT测试
    if (req.headers.authorization && jwtSecret) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        debugInfo.jwt = {
          valid: true,
          userId: decoded.userId || decoded.sub,
          decoded: decoded
        };
      } catch (error) {
        debugInfo.jwt = {
          valid: false,
          error: error.message
        };
      }
    } else {
      debugInfo.jwt = {
        status: '未测试',
        reason: '缺少authorization header或JWT secret'
      };
    }

    return res.status(200).json({
      success: true,
      debug: debugInfo,
      timestamp: new Date().toISOString(),
      tips: req.query.testWrite !== 'true' ? 
        '添加 ?testWrite=true 参数来测试数据库写入权限' : 
        '数据库写入测试完成'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 