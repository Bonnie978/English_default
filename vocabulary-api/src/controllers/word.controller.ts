import { Request, Response } from 'express';
import { Word } from '../models/Word';
import { LearningRecord } from '../models/LearningRecord';
import { User, IUser } from '../models/User';

// 获取每日学习单词
export const getDailyWords = async (req: Request, res: Response) => {
  try {
    // 确保用户已认证
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请登录'
      });
    }
    
    // 获取今天的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 查找用户今日的学习记录
    let learningRecord = await LearningRecord.findOne({
      userId: req.user!._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // 如果今天没有学习记录，创建新的
    if (!learningRecord) {
      // 获取用户设置
      const user = await User.findById(req.user!._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      const dailyWordCount = user.settings.dailyWordCount || 10;
      
      // 获取用户已学过的所有单词ID
      const pastRecords = await LearningRecord.find({ userId: req.user!._id });
      const learnedWordIds = new Set();
      
      pastRecords.forEach(record => {
        record.wordsList.forEach(word => {
          learnedWordIds.add(word.wordId.toString());
        });
      });
      
      // 获取新单词
      const newWords = await Word.find({
        _id: { $nin: Array.from(learnedWordIds) }
      }).limit(dailyWordCount);
      
      // 如果没有足够的新单词，可以从已学习但未掌握的单词中选择
      if (newWords.length < dailyWordCount) {
        console.log(`只找到${newWords.length}个新单词，少于每日目标${dailyWordCount}个`);
        // 在实际应用中可以添加逻辑来处理这种情况
      }
      
      // 创建新的学习记录
      learningRecord = new LearningRecord({
        userId: req.user!._id,
        date: new Date(),
        wordsList: newWords.map(word => ({
          wordId: word._id,
          mastered: false,
          reviewCount: 0,
          lastReviewDate: null
        }))
      });
      
      await learningRecord.save();
      
      res.status(200).json({
        success: true,
        date: learningRecord.date,
        words: newWords,
        progress: {
          learned: 0,
          total: newWords.length
        }
      });
    } else {
      // 返回今天已有的学习记录
      const wordIds = learningRecord.wordsList.map(word => word.wordId);
      const words = await Word.find({ _id: { $in: wordIds } });
      
      // 计算已掌握单词数量
      const masteredCount = learningRecord.wordsList.filter(word => word.mastered).length;
      
      res.status(200).json({
        success: true,
        date: learningRecord.date,
        words: words,
        progress: {
          learned: masteredCount,
          total: words.length
        }
      });
    }
  } catch (error) {
    console.error('获取每日单词错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 标记单词为已掌握
export const markWordAsMastered = async (req: Request, res: Response) => {
  try {
    // 确保用户已认证
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请登录'
      });
    }
    
    const { wordId } = req.params;
    
    // 获取今天的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 查找用户今日的学习记录
    const learningRecord = await LearningRecord.findOne({
      userId: req.user!._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (!learningRecord) {
      return res.status(404).json({
        success: false,
        message: '未找到今日学习记录'
      });
    }
    
    // 查找并更新单词状态
    const wordEntry = learningRecord.wordsList.find(
      word => word.wordId.toString() === wordId
    );
    
    if (!wordEntry) {
      return res.status(404).json({
        success: false,
        message: '该单词不在今日学习列表中'
      });
    }
    
    // 切换已掌握状态
    wordEntry.mastered = !wordEntry.mastered;
    wordEntry.lastReviewDate = new Date();
    wordEntry.reviewCount += 1;
    
    await learningRecord.save();
    
    res.status(200).json({
      success: true,
      message: wordEntry.mastered ? '单词已标记为已掌握' : '单词已标记为未掌握',
      mastered: wordEntry.mastered,
      masteredAt: wordEntry.lastReviewDate
    });
  } catch (error) {
    console.error('标记单词错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取学习统计信息
export const getLearningStats = async (req: Request, res: Response) => {
  try {
    // 确保用户已认证
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请登录'
      });
    }
    
    // 计算总学习单词数
    const allRecords = await LearningRecord.find({ userId: req.user!._id });
    
    // 统计所有学过的单词，防止重复计算
    const allLearnedWordIds = new Set();
    const masteredWordIds = new Set();
    
    allRecords.forEach(record => {
      record.wordsList.forEach(word => {
        allLearnedWordIds.add(word.wordId.toString());
        if (word.mastered) {
          masteredWordIds.add(word.wordId.toString());
        }
      });
    });
    
    // 计算连续学习天数
    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 排序记录，最近的在前
    const sortedRecords = [...allRecords].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // 如果今天有记录，开始计算连续天数
    const todayRecord = sortedRecords.find(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });
    
    if (todayRecord) {
      streakDays = 1;
      let checkDate = new Date(today);
      
      // 向前检查每一天是否有记录
      for (let i = 1; i <= 365; i++) { // 最多检查一年
        checkDate.setDate(checkDate.getDate() - 1);
        
        const hasRecord = sortedRecords.some(record => {
          const recordDate = new Date(record.date);
          recordDate.setHours(0, 0, 0, 0);
          return recordDate.getTime() === checkDate.getTime();
        });
        
        if (hasRecord) {
          streakDays++;
        } else {
          break;
        }
      }
    }
    
    // 更新用户统计信息
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    user.learningStats.totalWordsLearned = allLearnedWordIds.size;
    user.learningStats.streakDays = streakDays;
    await user.save();
    
    res.status(200).json({
      success: true,
      stats: {
        totalWordsLearned: allLearnedWordIds.size,
        masteredWords: masteredWordIds.size,
        streakDays: streakDays,
        totalExercises: user.learningStats.totalExercises
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