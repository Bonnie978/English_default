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
        
        debugInfo.database = {
          connection: '成功',
          tables: tableTests
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