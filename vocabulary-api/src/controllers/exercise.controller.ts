import { Request, Response } from 'express';
import { LearningRecord, IExercise as ILearningRecordExercise, IExerciseQuestion as ILearningRecordExerciseQuestion } from '../models/LearningRecord';
import { Word } from '../models/Word';
import { WrongAnswer } from '../models/WrongAnswer';
import { User } from '../models/User';
import { aiService } from '../services/ai.service';
import { 
  ExerciseResult, 
  ReadingExerciseResult, 
  WritingExerciseResult, 
  ExerciseResponseOptions,
  ReadingExerciseResponse,
  WritingExerciseResponse,
  IExercise,
  IExerciseQuestion
} from '../types';

// 生成练习题
export const generateExercise = async (req: Request, res: Response) => {
  try {
    const { type, wordIds } = req.body;
    
    // 验证输入
    if (!type || !['read', 'listen', 'write'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '无效的练习类型'
      });
    }
    
    if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '无效的单词ID列表'
      });
    }
    
    // 验证用户身份
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    // 获取单词详情
    const words = await Word.find({ _id: { $in: wordIds } });
    
    if (words.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的单词'
      });
    }
    
    // 提取单词拼写
    const wordSpellings = words.map(word => word.spelling);
    
    let exercise: ExerciseResult;
    
    // 根据类型生成不同练习
    switch (type) {
      case 'read':
        exercise = await aiService.generateReadingExercise(wordSpellings);
        break;
      case 'listen':
        exercise = await aiService.generateListeningExercise(wordSpellings);
        break;
      case 'write':
        exercise = await aiService.generateWritingExercise(wordSpellings);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: '不支持的练习类型'
        });
    }
    
    // 获取今天的学习记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let learningRecord = await LearningRecord.findOne({
      userId: req.user._id,
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
    
    // 将练习添加到学习记录中
    if ((type === 'read' || type === 'listen') && 'article' in exercise && 'questions' in exercise) {
      learningRecord.exercises.push({
        type,
        content: exercise.article,
        questions: exercise.questions.map(q => ({
          question: q.question,
          options: q.options,
          type: q.type as 'multiple-choice' | 'fill-blank',
          correctAnswer: q.correctAnswer
        }))
      });
    } else if (type === 'write' && 'prompt' in exercise && 'topic' in exercise) {
      learningRecord.exercises.push({
        type,
        content: exercise.prompt,
        questions: [{
          question: exercise.topic,
          type: 'writing',
          correctAnswer: wordSpellings.join(',') // 以逗号分隔的目标单词作为"正确答案"
        }]
      });
    }
    
    await learningRecord.save();
    
    // 获取刚添加的练习ID
    const savedExercises = learningRecord.exercises as unknown as IExercise[];
    const exerciseId = savedExercises[savedExercises.length - 1]._id;
    
    // 根据练习类型构建响应
    let response: ExerciseResponseOptions;
    
    if ((type === 'read' || type === 'listen') && 'article' in exercise && 'questions' in exercise) {
      const readingResponse: ReadingExerciseResponse = {
        id: exerciseId,
        type: type,
        content: exercise.article,
        questions: (exercise as ReadingExerciseResult).questions.map((q: any) => ({
          id: q._id || Math.random().toString(36).substring(2, 15),
          question: q.question,
          options: q.options,
          type: q.type
        }))
      };
      
      if (type === 'listen') {
        readingResponse.audioUrl = '/api/exercises/audio/' + exerciseId;
      }
      
      response = readingResponse;
    } else if ('prompt' in exercise && 'topic' in exercise) {
      response = {
        id: exerciseId,
        type: 'write',
        content: exercise.prompt,
        topic: exercise.topic,
        requirements: exercise.requirements,
        tips: exercise.tips,
        targetWords: wordSpellings
      };
    } else {
      response = {
        id: exerciseId,
        type,
        content: '',
        questions: []
      };
    }
    
    res.status(201).json({
      success: true,
      exercise: response
    });
  } catch (error) {
    console.error('生成练习错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 提交练习答案
export const submitExerciseAnswer = async (req: Request, res: Response) => {
  try {
    const { exerciseId } = req.params;
    const { answers } = req.body;
    
    if (!exerciseId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: '无效的请求数据'
      });
    }
    
    // 验证用户身份
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    // 获取学习记录
    const learningRecord = await LearningRecord.findOne({
      userId: req.user._id,
      'exercises._id': exerciseId
    });
    
    if (!learningRecord) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的练习'
      });
    }
    
    // 找到指定的练习
    const exercise = (learningRecord.exercises as unknown as IExercise[]).find(
      ex => ex._id.toString() === exerciseId
    );
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的练习'
      });
    }
    
    // 判断答案是否正确并计算得分
    let score = 0;
    let totalQuestions = exercise.questions.length;
    let wrongAnswersAdded = 0;
    
    // 根据不同类型的练习处理答案
    if (exercise.type === 'read' || exercise.type === 'listen') {
      // 处理选择题和填空题
      const detailedResults = [];
      
      for (let i = 0; i < exercise.questions.length; i++) {
        const question = exercise.questions[i] as IExerciseQuestion;
        const answer = answers.find(a => a.questionId === question._id.toString());
        
        if (!answer) continue;
        
        // 更新用户答案
        question.userAnswer = answer.answer;
        
        // 判断是否正确
        const isCorrect = question.correctAnswer.trim().toLowerCase() === 
                         answer.answer.trim().toLowerCase();
        
        question.isCorrect = isCorrect;
        
        if (isCorrect) {
          score++;
        } else {
          // 添加到错题集
          try {
            await WrongAnswer.create({
              userId: req.user._id,
              type: exercise.type,
              question: question.question,
              correctAnswer: question.correctAnswer,
              userAnswer: answer.answer,
              wordIds: learningRecord.wordsList.map(w => w.wordId),
              questionId: question._id,
              exerciseId: exercise._id
            });
            wrongAnswersAdded++;
          } catch (error) {
            console.error('添加错题错误:', error);
          }
        }
        
        detailedResults.push({
          questionId: question._id,
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: isCorrect ? '回答正确！' : `正确答案是: ${question.correctAnswer}`
        });
      }
      
      // 计算百分比得分
      const percentageScore = Math.round((score / totalQuestions) * 100);
      exercise.score = percentageScore;
      exercise.completedAt = new Date();
      
      // 生成反馈
      const feedback = generateFeedback(percentageScore);
      exercise.feedback = feedback;
      
      await learningRecord.save();
      
      // 更新用户统计信息
      const user = await User.findById(req.user._id);
      if (user) {
        user.learningStats.totalExercises += 1;
        await user.save();
      }
      
      return res.status(200).json({
        success: true,
        score: percentageScore,
        feedback,
        detailedResults,
        wrongAnswersAdded
      });
    } else if (exercise.type === 'write') {
      // 处理写作题
      const { answer } = answers[0];
      const targetWords = exercise.questions[0].correctAnswer.split(',');
      
      // 更新用户答案
      exercise.questions[0].userAnswer = answer;
      
      // 评估写作
      const evaluation = await aiService.evaluateWriting(
        exercise.content,
        targetWords,
        answer
      );
      
      exercise.score = evaluation.score;
      exercise.feedback = evaluation.rawFeedback;
      exercise.completedAt = new Date();
      
      await learningRecord.save();
      
      // 更新用户统计信息
      const user = await User.findById(req.user._id);
      if (user) {
        user.learningStats.totalExercises += 1;
        await user.save();
      }
      
      return res.status(200).json({
        success: true,
        score: evaluation.score,
        feedback: evaluation.rawFeedback,
        detailedFeedback: evaluation.detailedFeedback,
        suggestions: evaluation.suggestions
      });
    }
    
    res.status(400).json({
      success: false,
      message: '不支持的练习类型'
    });
  } catch (error) {
    console.error('提交答案错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 生成反馈的辅助方法
const generateFeedback = (score: number): string => {
  if (score >= 90) {
    return '太棒了！你的表现非常出色，几乎所有问题都答对了。继续保持！';
  } else if (score >= 80) {
    return '做得很好！你对这些单词的掌握已经相当不错了。';
  } else if (score >= 70) {
    return '表现良好！虽然有一些错误，但你已经在正确的道路上了。';
  } else if (score >= 60) {
    return '合格的表现。建议你重新复习一下这些单词，特别是错误的部分。';
  } else {
    return '看起来这些单词还需要更多的练习。建议你回去复习，然后再尝试一次。';
  }
}

// 获取错题列表
export const getWrongAnswers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    // 验证用户身份
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    // 构建查询条件
    const query: any = { userId: req.user._id };
    
    if (type && ['read', 'listen', 'write'].includes(type as string)) {
      query.type = type;
    }
    
    // 计算分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // 获取错题总数
    const total = await WrongAnswer.countDocuments(query);
    
    // 获取错题列表
    const wrongAnswers = await WrongAnswer.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('wordIds', 'spelling definitions');
    
    // 格式化响应数据
    const formattedWrongAnswers = wrongAnswers.map(wrong => {
      return {
        id: wrong._id,
        type: wrong.type,
        typeName: getTypeName(wrong.type),
        question: wrong.question,
        correctAnswer: wrong.correctAnswer,
        userAnswer: wrong.userAnswer,
        date: wrong.date,
        formattedDate: formatDate(wrong.date),
        reviewed: wrong.reviewed,
        relatedWords: wrong.wordIds.map((word: any) => ({
          id: word._id,
          spelling: word.spelling,
          definition: word.definitions[0]
        }))
      };
    });
    
    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      wrongAnswers: formattedWrongAnswers
    });
  } catch (error) {
    console.error('获取错题列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 标记错题为已复习
export const markWrongAsReviewed = async (req: Request, res: Response) => {
  try {
    const { wrongAnswerId } = req.params;
    
    // 验证用户身份
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    const wrongAnswer = await WrongAnswer.findOne({
      _id: wrongAnswerId,
      userId: req.user._id
    });
    
    if (!wrongAnswer) {
      return res.status(404).json({
        success: false,
        message: '未找到指定的错题'
      });
    }
    
    wrongAnswer.reviewed = true;
    wrongAnswer.reviewedAt = new Date();
    
    await wrongAnswer.save();
    
    res.status(200).json({
      success: true,
      message: '已标记为已复习',
      reviewed: true,
      reviewedAt: wrongAnswer.reviewedAt
    });
  } catch (error) {
    console.error('标记错题错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取练习类型名称
const getTypeName = (type: string): string => {
  switch (type) {
    case 'read': return '阅读理解';
    case 'listen': return '听力理解';
    case 'write': return '写作练习';
    default: return '未知类型';
  }
}

// 格式化日期
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '年') + '日';
} 