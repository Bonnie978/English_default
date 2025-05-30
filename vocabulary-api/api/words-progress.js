import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * 更新用户单词学习进度
 */
async function updateWordProgress(userId, wordId, isCorrect, studyType = 'daily') {
  try {
    // 1. 查找现有进度记录
    const { data: existingProgress, error: findError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      throw findError;
    }

    const now = new Date().toISOString();
    
    if (existingProgress) {
      // 2. 更新现有记录
      const newCorrectCount = existingProgress.correct_count + (isCorrect ? 1 : 0);
      const newIncorrectCount = existingProgress.incorrect_count + (isCorrect ? 0 : 1);
      const totalAttempts = newCorrectCount + newIncorrectCount;
      const accuracy = totalAttempts > 0 ? newCorrectCount / totalAttempts : 0;
      
      // 计算新的掌握级别
      let newMasteryLevel = existingProgress.mastery_level;
      if (isCorrect) {
        // 正确回答：根据连续正确次数提升掌握级别
        if (accuracy > 0.8 && totalAttempts >= 3) {
          newMasteryLevel = Math.min(5, newMasteryLevel + 1);
        }
      } else {
        // 错误回答：降低掌握级别
        newMasteryLevel = Math.max(0, newMasteryLevel - 1);
      }

      const { error: updateError } = await supabase
        .from('user_progress')
        .update({
          correct_count: newCorrectCount,
          incorrect_count: newIncorrectCount,
          mastery_level: newMasteryLevel,
          last_studied: now,
          study_streak: isCorrect ? existingProgress.study_streak + 1 : 0,
          updated_at: now
        })
        .eq('id', existingProgress.id);

      if (updateError) throw updateError;

      return {
        mastery_level: newMasteryLevel,
        accuracy: accuracy,
        total_attempts: totalAttempts,
        is_new: false
      };
    } else {
      // 3. 创建新记录
      const { error: insertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          word_id: wordId,
          correct_count: isCorrect ? 1 : 0,
          incorrect_count: isCorrect ? 0 : 1,
          mastery_level: isCorrect ? 1 : 0,
          last_studied: now,
          study_streak: isCorrect ? 1 : 0,
          is_difficult: !isCorrect,
          created_at: now,
          updated_at: now
        });

      if (insertError) throw insertError;

      return {
        mastery_level: isCorrect ? 1 : 0,
        accuracy: isCorrect ? 1 : 0,
        total_attempts: 1,
        is_new: true
      };
    }
  } catch (error) {
    console.error('更新学习进度失败:', error);
    throw error;
  }
}

/**
 * 批量记录学习会话
 */
async function recordLearningSession(userId, words, sessionType = 'daily_study') {
  try {
    const sessionId = `${userId}_${Date.now()}`;
    const now = new Date().toISOString();
    
    // 1. 记录学习会话
    const totalWords = words.length;
    const correctWords = words.filter(w => w.isCorrect).length;
    const accuracy = totalWords > 0 ? correctWords / totalWords : 0;
    
    const { error: sessionError } = await supabase
      .from('learning_sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        session_type: sessionType,
        words_studied: totalWords,
        correct_answers: correctWords,
        accuracy: accuracy,
        duration_minutes: words.reduce((sum, w) => sum + (w.timeSpent || 10), 0) / 60, // 估算时间
        started_at: now,
        completed_at: now,
        created_at: now
      });

    if (sessionError) throw sessionError;

    // 2. 批量更新单词进度
    const progressUpdates = [];
    for (const word of words) {
      try {
        const progress = await updateWordProgress(userId, word.wordId, word.isCorrect, sessionType);
        progressUpdates.push({
          wordId: word.wordId,
          ...progress
        });
      } catch (error) {
        console.error(`更新单词${word.wordId}进度失败:`, error);
      }
    }

    return {
      session_id: sessionId,
      session_stats: {
        total_words: totalWords,
        correct_answers: correctWords,
        accuracy: accuracy
      },
      word_progress: progressUpdates
    };
  } catch (error) {
    console.error('记录学习会话失败:', error);
    throw error;
  }
}

/**
 * 获取用户学习统计
 */
async function getUserLearningStats(userId) {
  try {
    // 1. 获取总体进度
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // 2. 获取最近7天的学习会话
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentSessions, error: sessionError } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false });

    if (sessionError) throw sessionError;

    // 3. 计算统计数据
    const totalWords = progressData.length;
    const masteredWords = progressData.filter(p => p.mastery_level >= 4).length;
    const learningWords = progressData.filter(p => p.mastery_level >= 2 && p.mastery_level < 4).length;
    const difficultWords = progressData.filter(p => p.is_difficult || p.mastery_level < 2).length;

    const totalAttempts = progressData.reduce((sum, p) => sum + p.correct_count + p.incorrect_count, 0);
    const totalCorrect = progressData.reduce((sum, p) => sum + p.correct_count, 0);
    const overallAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    const todayStudied = recentSessions.filter(s => {
      const sessionDate = new Date(s.created_at).toDateString();
      const today = new Date().toDateString();
      return sessionDate === today;
    }).length;

    return {
      overview: {
        total_words_studied: totalWords,
        mastered_words: masteredWords,
        learning_words: learningWords,
        difficult_words: difficultWords,
        overall_accuracy: overallAccuracy,
        study_streak: Math.max(...progressData.map(p => p.study_streak || 0), 0)
      },
      recent_activity: {
        today_sessions: todayStudied,
        weekly_sessions: recentSessions.length,
        avg_daily_accuracy: recentSessions.length > 0 
          ? recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length 
          : 0
      },
      level_distribution: {
        level_0: progressData.filter(p => p.mastery_level === 0).length,
        level_1: progressData.filter(p => p.mastery_level === 1).length,
        level_2: progressData.filter(p => p.mastery_level === 2).length,
        level_3: progressData.filter(p => p.mastery_level === 3).length,
        level_4: progressData.filter(p => p.mastery_level === 4).length,
        level_5: progressData.filter(p => p.mastery_level === 5).length
      }
    };
  } catch (error) {
    console.error('获取学习统计失败:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { userId } = req.query;
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ 
        error: '需要用户ID' 
      });
    }

    switch (req.method) {
      case 'GET':
        // 获取学习统计
        const stats = await getUserLearningStats(userId);
        return res.status(200).json({
          success: true,
          data: stats
        });

      case 'POST':
        // 记录学习进度
        const { words, sessionType } = req.body;
        
        if (!words || !Array.isArray(words)) {
          return res.status(400).json({ 
            error: '需要提供单词学习数据' 
          });
        }

        const result = await recordLearningSession(userId, words, sessionType);
        return res.status(200).json({
          success: true,
          data: result
        });

      case 'PUT':
        // 单个单词进度更新
        const { wordId, isCorrect, studyType } = req.body;
        
        if (!wordId || typeof isCorrect !== 'boolean') {
          return res.status(400).json({ 
            error: '需要提供wordId和isCorrect参数' 
          });
        }

        const progress = await updateWordProgress(userId, wordId, isCorrect, studyType);
        return res.status(200).json({
          success: true,
          data: progress
        });

      default:
        return res.status(405).json({ error: '不支持的请求方法' });
    }
    
  } catch (error) {
    console.error('学习进度API错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: error.message 
    });
  }
} 