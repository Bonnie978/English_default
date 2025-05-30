import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 艾宾浩斯遗忘曲线复习间隔（天数）
const REVIEW_INTERVALS = {
  0: 1,    // 完全不会：1天后复习
  1: 3,    // 初步记住：3天后复习
  2: 7,    // 基本掌握：7天后复习
  3: 15,   // 较好掌握：15天后复习
  4: 30,   // 熟练掌握：30天后复习
  5: 60    // 完全掌握：60天后复习
};

/**
 * 获取需要复习的单词
 */
async function getWordsForReview(userId, limit = 50) {
  try {
    // 获取用户所有学习进度
    const { data: progressData, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        words:word_id (
          id,
          english,
          chinese,
          pronunciation,
          difficulty_level,
          category_id,
          example_sentence
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const today = new Date();
    const reviewWords = [];

    for (const progress of progressData) {
      const lastStudied = new Date(progress.last_studied);
      const daysSinceStudy = Math.floor((today - lastStudied) / (1000 * 60 * 60 * 24));
      
      // 根据掌握级别确定复习间隔
      const requiredInterval = REVIEW_INTERVALS[progress.mastery_level] || 1;
      
      if (daysSinceStudy >= requiredInterval) {
        // 计算优先级：越该复习的优先级越高
        const priority = daysSinceStudy / requiredInterval;
        
        reviewWords.push({
          ...progress.words,
          progress: {
            mastery_level: progress.mastery_level,
            correct_count: progress.correct_count,
            incorrect_count: progress.incorrect_count,
            last_studied: progress.last_studied,
            study_streak: progress.study_streak,
            is_difficult: progress.is_difficult
          },
          review_info: {
            days_since_study: daysSinceStudy,
            required_interval: requiredInterval,
            priority: priority,
            overdue_days: daysSinceStudy - requiredInterval
          }
        });
      }
    }

    // 按优先级排序（优先级高的在前）
    reviewWords.sort((a, b) => b.review_info.priority - a.review_info.priority);

    return reviewWords.slice(0, limit);
  } catch (error) {
    console.error('获取复习单词失败:', error);
    throw error;
  }
}

/**
 * 获取用户复习统计
 */
async function getReviewStats(userId) {
  try {
    const { data: progressData, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const today = new Date();
    const stats = {
      total_words: progressData.length,
      due_today: 0,
      overdue: 0,
      upcoming_3_days: 0,
      by_level: {
        level_0: 0,
        level_1: 0,
        level_2: 0,
        level_3: 0,
        level_4: 0,
        level_5: 0
      }
    };

    for (const progress of progressData) {
      const lastStudied = new Date(progress.last_studied);
      const daysSinceStudy = Math.floor((today - lastStudied) / (1000 * 60 * 60 * 24));
      const requiredInterval = REVIEW_INTERVALS[progress.mastery_level] || 1;
      const daysUntilReview = requiredInterval - daysSinceStudy;

      // 统计各类复习需求
      if (daysUntilReview <= 0) {
        if (daysUntilReview === 0) {
          stats.due_today++;
        } else {
          stats.overdue++;
        }
      } else if (daysUntilReview <= 3) {
        stats.upcoming_3_days++;
      }

      // 按掌握级别统计
      stats.by_level[`level_${progress.mastery_level}`]++;
    }

    return stats;
  } catch (error) {
    console.error('获取复习统计失败:', error);
    throw error;
  }
}

/**
 * 生成个性化复习计划
 */
async function generateReviewPlan(userId, days = 7) {
  try {
    const { data: progressData, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const today = new Date();
    const plan = [];

    // 为接下来几天生成复习计划
    for (let i = 0; i < days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      
      const dayPlan = {
        date: targetDate.toISOString().split('T')[0],
        words_to_review: [],
        estimated_time: 0,
        difficulty_distribution: {
          easy: 0,
          medium: 0,
          hard: 0
        }
      };

      for (const progress of progressData) {
        const lastStudied = new Date(progress.last_studied);
        const daysSinceStudy = Math.floor((targetDate - lastStudied) / (1000 * 60 * 60 * 24));
        const requiredInterval = REVIEW_INTERVALS[progress.mastery_level] || 1;

        if (daysSinceStudy >= requiredInterval) {
          dayPlan.words_to_review.push({
            word_id: progress.word_id,
            mastery_level: progress.mastery_level,
            priority: daysSinceStudy / requiredInterval
          });

          // 估算学习时间（基于掌握级别）
          const timePerWord = progress.mastery_level >= 3 ? 30 : 60; // 秒
          dayPlan.estimated_time += timePerWord;

          // 难度分布
          if (progress.mastery_level >= 4) {
            dayPlan.difficulty_distribution.easy++;
          } else if (progress.mastery_level >= 2) {
            dayPlan.difficulty_distribution.medium++;
          } else {
            dayPlan.difficulty_distribution.hard++;
          }
        }
      }

      // 按优先级排序
      dayPlan.words_to_review.sort((a, b) => b.priority - a.priority);
      dayPlan.estimated_time = Math.ceil(dayPlan.estimated_time / 60); // 转换为分钟

      plan.push(dayPlan);
    }

    return plan;
  } catch (error) {
    console.error('生成复习计划失败:', error);
    throw error;
  }
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
    const { userId, action = 'words', limit = 50, days = 7 } = req.query;
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ 
        error: '需要用户ID' 
      });
    }

    let result;
    
    switch (action) {
      case 'words':
        // 获取需要复习的单词
        result = await getWordsForReview(userId, parseInt(limit));
        break;
        
      case 'stats':
        // 获取复习统计
        result = await getReviewStats(userId);
        break;
        
      case 'plan':
        // 生成复习计划
        result = await generateReviewPlan(userId, parseInt(days));
        break;
        
      default:
        return res.status(400).json({ 
          error: '无效的action参数，支持: words, stats, plan' 
        });
    }

    res.status(200).json({
      success: true,
      data: result,
      action: action,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('复习API错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
} 