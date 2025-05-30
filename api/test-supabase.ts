import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 从环境变量获取Supabase配置
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Missing Supabase configuration',
        message: 'SUPABASE_URL or SUPABASE_ANON_KEY not found in environment variables'
      });
    }

    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 测试连接 - 尝试查询一个简单的表
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(500).json({
        error: 'Supabase connection failed',
        message: error.message,
        details: error
      });
    }

    res.status(200).json({
      message: 'Supabase connection successful!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      supabaseUrl: supabaseUrl,
      connectionTest: 'passed'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 