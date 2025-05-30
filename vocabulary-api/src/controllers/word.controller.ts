import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Word, LearningRecord } from '../types/supabase';

// 获取单词列表
export const getWords = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, difficulty, category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('words')
      .select('*')
      .range(offset, offset + Number(limit) - 1);

    if (difficulty) {
      query = query.eq('difficulty_level', Number(difficulty));
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: words, error } = await query;

    if (error) {
      console.error('获取单词列表错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取单词列表失败'
      });
    }
    
    res.status(200).json({
      success: true,
      words: words || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: words?.length || 0
      }
    });
  } catch (error) {
    console.error('获取单词列表错误:', error);
    res.status(500).json({
          success: false,
      message: '服务器错误，请稍后再试'
        });
      }
};
      
// 获取用户学习记录
export const getUserLearningRecord = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const { data: records, error } = await supabase
      .from('learning_records')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('获取学习记录错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取学习记录失败'
      });
    }
      
      res.status(200).json({
        success: true,
      learningRecord: records || []
    });
  } catch (error) {
    console.error('获取学习记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 更新单词掌握状态
export const updateWordMastery = async (req: Request, res: Response) => {
  try {
    const { wordId } = req.params;
    const { mastered } = req.body;
    const userId = req.user.id;

    // 查找现有记录
    const { data: existingRecord } = await supabase
      .from('learning_records')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();

    if (existingRecord) {
      // 更新现有记录
      const { error } = await supabase
        .from('learning_records')
        .update({
          mastery_level: mastered ? 5 : 1,
          last_reviewed: new Date().toISOString(),
          review_count: existingRecord.review_count + 1,
          correct_count: mastered ? existingRecord.correct_count + 1 : existingRecord.correct_count
        })
        .eq('id', existingRecord.id);

      if (error) {
        console.error('更新学习记录错误:', error);
        return res.status(500).json({
          success: false,
          message: '更新学习记录失败'
        });
      }
    } else {
      // 创建新记录
      const { error } = await supabase
        .from('learning_records')
        .insert([{
          user_id: userId,
          word_id: wordId,
          mastery_level: mastered ? 5 : 1,
          last_reviewed: new Date().toISOString(),
          review_count: 1,
          correct_count: mastered ? 1 : 0
        }]);
    
      if (error) {
        console.error('创建学习记录错误:', error);
        return res.status(500).json({
        success: false,
          message: '创建学习记录失败'
      });
    }
    }
    
    res.status(200).json({
      success: true,
      message: '单词掌握状态更新成功'
    });
  } catch (error) {
    console.error('更新单词掌握状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取学习统计
export const getLearningStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const { data: records, error } = await supabase
      .from('learning_records')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('获取学习统计错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取学习统计失败'
      });
    }
    
    const totalWords = records?.length || 0;
    const masteredWords = records?.filter(r => r.mastery_level >= 4).length || 0;
    const reviewingWords = records?.filter(r => r.mastery_level >= 2 && r.mastery_level < 4).length || 0;
    const learningWords = records?.filter(r => r.mastery_level < 2).length || 0;
    
    res.status(200).json({
      success: true,
      stats: {
        totalWords,
        masteredWords,
        reviewingWords,
        learningWords,
        masteryRate: totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0
      }
    });
  } catch (error) {
    console.error('获取学习统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
}; 