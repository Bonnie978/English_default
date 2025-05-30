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

    const authHeader = req.headers.authorization;
    let userId = null;
    
    // 尝试获取用户ID，如果没有认证信息则为访客模式
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, jwtSecret);
        userId = decoded.userId;
      } catch (jwtError) {
        console.log('JWT验证失败，使用访客模式:', jwtError.message);
        // 不返回错误，继续访客模式
      }
    }

    if (userId) {
      // 登录用户：返回真实统计数据
      const { data: learningRecords, error: recordsError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (recordsError) {
        console.error('获取学习记录错误:', recordsError);
        // 如果数据库查询失败，返回默认数据
        return res.status(200).json({
          success: true,
          stats: {
            totalWordsLearned: 0,
            masteredWords: 0,
            reviewingWords: 0,
            learningWords: 0,
            streakDays: 0,
            totalExercises: 0,
            masteryRate: 0
          },
          isGuest: false,
          debug: {
            message: '数据库查询失败，返回默认数据',
            error: recordsError.message
          }
        });
      }

      // 计算真实统计数据
      const records = learningRecords || [];
      const totalWords = records.length;
      const masteredWords = records.filter(r => r.mastery_level >= 4).length;
      const reviewingWords = records.filter(r => r.mastery_level >= 2 && r.mastery_level < 4).length;
      const learningWords = records.filter(r => r.mastery_level < 2).length;

      // 获取学习会话来计算练习次数
      const { data: sessions, error: sessionsError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', userId);

      const totalExercises = sessions ? sessions.length : 0;
      
      // 计算连续学习天数（简化版）
      const streakDays = totalWords > 0 ? Math.min(totalWords, 7) : 0;

      return res.status(200).json({
        success: true,
        stats: {
          totalWordsLearned: totalWords,
          masteredWords,
          reviewingWords,
          learningWords,
          streakDays,
          totalExercises,
          masteryRate: totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0
        },
        isGuest: false
      });
    } else {
      // 访客模式：返回示例统计数据
      return res.status(200).json({
        success: true,
        stats: {
          totalWordsLearned: 0,
          masteredWords: 0,
          reviewingWords: 0,
          learningWords: 0,
          streakDays: 0,
          totalExercises: 0,
          masteryRate: 0
        },
        isGuest: true,
        message: '访客模式：请登录查看真实学习数据'
      });
    }

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