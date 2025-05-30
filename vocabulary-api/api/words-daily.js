import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey);

// 艾宾浩斯遗忘曲线间隔（天数）
const FORGETTING_INTERVALS = [1, 3, 7, 15, 30, 60];

// 推荐配置
const RECOMMENDATION_CONFIG = {
  NEW_WORDS_RATIO: 0.6,      // 新单词占比60%
  REVIEW_WORDS_RATIO: 0.3,   // 复习单词占比30%
  DIFFICULT_WORDS_RATIO: 0.1 // 困难单词占比10%
};

/**
 * 获取日期种子（确保每日不同）
 */
function getDailySeed() {
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
  return daysSinceEpoch;
}

/**
 * 获取用户种子（确保个性化）
 */
function getUserSeed(userId) {
  if (!userId) return 0;
  return userId.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0);
  }, 0);
}

/**
 * 基于种子的随机数生成器（确保可重现）
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 获取用户学习进度
 */
async function getUserProgress(userId) {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);
    
  if (error) {
    console.error('获取用户进度失败:', error);
    return null;
  }
  
  return data;
}

/**
 * 计算用户当前难度级别
 */
function calculateUserDifficultyLevel(progress) {
  if (!progress || progress.length === 0) return 1;
  
  // 计算平均正确率
  const totalAttempts = progress.reduce((sum, p) => sum + (p.correct_count + p.incorrect_count), 0);
  const totalCorrect = progress.reduce((sum, p) => sum + p.correct_count, 0);
  const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
  
  // 基于正确率调整难度
  if (accuracy > 0.8) return Math.min(5, Math.floor(accuracy * 5) + 1);
  if (accuracy > 0.6) return 3;
  if (accuracy > 0.4) return 2;
  return 1;
}

/**
 * 获取需要复习的单词
 */
async function getReviewWords(userId, progress) {
  if (!progress || progress.length === 0) return [];
  
  const today = new Date();
  const reviewWords = [];
  
  for (const p of progress) {
    const lastStudied = new Date(p.last_studied);
    const daysSinceStudy = Math.floor((today - lastStudied) / (1000 * 60 * 60 * 24));
    
    // 根据掌握级别确定复习间隔
    const interval = FORGETTING_INTERVALS[Math.min(p.mastery_level, FORGETTING_INTERVALS.length - 1)];
    
    if (daysSinceStudy >= interval) {
      reviewWords.push({
        word_id: p.word_id,
        priority: 1 / (daysSinceStudy - interval + 1), // 越该复习优先级越高
        mastery_level: p.mastery_level
      });
    }
  }
  
  // 按优先级排序
  return reviewWords.sort((a, b) => b.priority - a.priority);
}

/**
 * 获取困难单词（用户标记为困难或错误率高的）
 */
async function getDifficultWords(userId, progress) {
  if (!progress || progress.length === 0) return [];
  
  return progress
    .filter(p => {
      const totalAttempts = p.correct_count + p.incorrect_count;
      const accuracy = totalAttempts > 0 ? p.correct_count / totalAttempts : 1;
      return accuracy < 0.5 || p.is_difficult; // 正确率低于50%或用户标记为困难
    })
    .map(p => ({ word_id: p.word_id, accuracy: p.correct_count / (p.correct_count + p.incorrect_count) }))
    .sort((a, b) => a.accuracy - b.accuracy); // 按准确率升序
}

/**
 * 获取新单词
 */
async function getNewWords(userId, userLevel, excludeIds = []) {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .gte('difficulty_level', Math.max(1, userLevel - 1))
    .lte('difficulty_level', Math.min(5, userLevel + 1))
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .limit(1000); // 获取足够多的候选词
    
  if (error) {
    console.error('获取新单词失败:', error);
    return [];
  }
  
  return data || [];
}

/**
 * 智能推荐每日单词
 */
async function getSmartDailyWords(userId, limit = 20) {
  try {
    // 1. 获取用户学习进度
    const progress = await getUserProgress(userId);
    const studiedWordIds = progress ? progress.map(p => p.word_id) : [];
    
    // 2. 计算用户难度级别
    const userLevel = calculateUserDifficultyLevel(progress);
    
    // 3. 获取各类单词
    const reviewWords = await getReviewWords(userId, progress);
    const difficultWords = await getDifficultWords(userId, progress);
    const newWords = await getNewWords(userId, userLevel, studiedWordIds);
    
    // 4. 按比例分配单词数量
    const reviewCount = Math.floor(limit * RECOMMENDATION_CONFIG.REVIEW_WORDS_RATIO);
    const difficultCount = Math.floor(limit * RECOMMENDATION_CONFIG.DIFFICULT_WORDS_RATIO);
    const newCount = limit - reviewCount - difficultCount;
    
    // 5. 基于日期和用户种子进行随机化
    const dailySeed = getDailySeed();
    const userSeed = getUserSeed(userId);
    const combinedSeed = dailySeed + userSeed;
    
    // 6. 选择单词
    const selectedWords = [];
    
    // 选择复习单词
    for (let i = 0; i < Math.min(reviewCount, reviewWords.length); i++) {
      const index = Math.floor(seededRandom(combinedSeed + i) * reviewWords.length);
      const wordId = reviewWords[index].word_id;
      const { data } = await supabase.from('words').select('*').eq('id', wordId).single();
      if (data) {
        selectedWords.push({ ...data, type: 'review', mastery_level: reviewWords[index].mastery_level });
        reviewWords.splice(index, 1);
      }
    }

    // 选择困难单词
    for (let i = 0; i < Math.min(difficultCount, difficultWords.length); i++) {
      const index = Math.floor(seededRandom(combinedSeed + reviewCount + i) * difficultWords.length);
      const wordId = difficultWords[index].word_id;
      const { data } = await supabase.from('words').select('*').eq('id', wordId).single();
      if (data) {
        selectedWords.push({ ...data, type: 'difficult', accuracy: difficultWords[index].accuracy });
        difficultWords.splice(index, 1);
      }
    }
    
    // 选择新单词
    const shuffledNewWords = [...newWords];
    for (let i = shuffledNewWords.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(combinedSeed + i) * (i + 1));
      [shuffledNewWords[i], shuffledNewWords[j]] = [shuffledNewWords[j], shuffledNewWords[i]];
    }
    
    for (let i = 0; i < Math.min(newCount, shuffledNewWords.length); i++) {
      selectedWords.push({ ...shuffledNewWords[i], type: 'new' });
    }
    
    return {
      words: selectedWords,
      stats: {
        user_level: userLevel,
        total_studied: studiedWordIds.length,
        review_count: selectedWords.filter(w => w.type === 'review').length,
        difficult_count: selectedWords.filter(w => w.type === 'difficult').length,
        new_count: selectedWords.filter(w => w.type === 'new').length
      }
    };
    
  } catch (error) {
    console.error('智能推荐失败:', error);
    throw error;
  }
}

/**
 * 访客模式的每日单词（无用户数据）
 */
async function getGuestDailyWords(limit = 20) {
  const dailySeed = getDailySeed();
  
  // 获取初级单词（难度1-3）
  const { data: words, error } = await supabase
      .from('words')
      .select('*')
    .gte('difficulty_level', 1)
    .lte('difficulty_level', 3)
    .limit(500);

  if (error) throw error;
  
  // 基于日期种子随机选择
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(dailySeed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return {
    words: shuffled.slice(0, limit).map(w => ({ ...w, type: 'guest' })),
    stats: {
      user_level: 1,
      total_studied: 0,
      new_count: limit,
      guest_mode: true
        }
  };
    }

export default async function handler(req, res) {
  // 强化CORS设置 - 确保在生产环境中生效
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24小时预检缓存
  
  // OPTIONS预检请求处理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持GET请求' });
  }

  try {
    const { userId, limit = 20 } = req.query;
    
    let result;
    if (userId && userId !== 'undefined' && userId !== 'null') {
      // 登录用户：智能推荐
      result = await getSmartDailyWords(userId, parseInt(limit));
    } else {
      // 访客模式：基础推荐
      result = await getGuestDailyWords(parseInt(limit));
    }

    res.status(200).json({
      success: true,
      data: result.words,
      stats: result.stats,
      generated_at: new Date().toISOString(),
      algorithm_version: '2.0'
    });

  } catch (error) {
    console.error('获取每日单词失败:', error);
    res.status(500).json({
      error: '获取每日单词失败',
      message: error.message 
    });
  }
} 