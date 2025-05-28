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

    // 获取单词列表（限制20个）
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('*')
      .limit(20);

    if (wordsError) {
      console.error('获取单词列表错误:', wordsError);
      return res.status(200).json({
        success: true,
        words: [],
        progress: { learned: 0, total: 0 },
        debug: {
          message: '数据库查询失败，返回空列表',
          error: wordsError.message
        }
      });
    }

    // 获取用户的学习记录
    const { data: learningRecords, error: recordsError } = await supabase
      .from('learning_records')
      .select('*')
      .eq('user_id', userId);

    const records = learningRecords || [];
    const learnedCount = records.filter(r => r.mastery_level >= 2).length;

    // 转换单词格式以匹配前端期望的格式
    const formattedWords = (words || []).map(word => ({
      id: word.id,
      spelling: word.english || word.word,
      pronunciation: word.pronunciation || '',
      partOfSpeech: 'noun', // 默认值
      definitions: [word.chinese || word.definition || ''],
      examples: [word.example_sentence || ''],
      mastered: records.some(r => r.word_id === word.id && r.mastery_level >= 4)
    }));

    res.status(200).json({
      success: true,
      words: formattedWords,
      progress: {
        learned: learnedCount,
        total: formattedWords.length
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