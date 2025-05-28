import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 检查认证
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请登录'
      });
    }

    // 验证JWT token
    const token = authHeader.split(' ')[1];
    let userId;
    
    try {
      const decoded = jwt.verify(token, jwtSecret);
      userId = decoded.userId;
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: '令牌无效或已过期'
      });
    }

    // 从Supabase获取用户学习记录
    const { data: learningRecords, error: recordsError } = await supabase
      .from('learning_records')
      .select('*')
      .eq('user_id', userId);

    if (recordsError) {
      console.error('获取学习记录错误:', recordsError);
      // 如果数据库查询失败，返回默认数据而不是错误
      return res.status(200).json({
        success: true,
        stats: {
          totalWordsLearned: 0,
          masteredWords: 0,
          streakDays: 0,
          totalExercises: 0,
          masteryRate: 0
        },
        debug: {
          message: '数据库查询失败，返回默认数据',
          error: recordsError.message
        }
      });
    }

    // 计算统计数据
    const records = learningRecords || [];
    const totalWords = records.length;
    const masteredWords = records.filter(r => r.mastery_level >= 4).length;
    const reviewingWords = records.filter(r => r.mastery_level >= 2 && r.mastery_level < 4).length;
    const learningWords = records.filter(r => r.mastery_level < 2).length;

    // 获取练习记录来计算总练习次数
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId);

    const totalExercises = exercises ? exercises.length : 0;

    // 计算连续学习天数（简化版）
    const streakDays = totalWords > 0 ? Math.min(totalWords, 7) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalWordsLearned: totalWords,
        masteredWords,
        reviewingWords,
        learningWords,
        streakDays,
        totalExercises,
        masteryRate: totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0
      }
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
      debug: {
        error: error.message
      }
    });
  }
} 