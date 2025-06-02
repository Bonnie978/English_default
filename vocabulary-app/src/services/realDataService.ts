import api from './api';
import { supabase } from '../config/supabase';

// 数据库记录类型定义
interface LearningSessionRecord {
  session_type: string;
  completed_at: string;
  words_studied: string[] | number;
}

// 真实学习统计数据接口
export interface RealLearningStats {
  totalWords: number;
  accuracy: number;
  masteredWords: number;
  studyHours: number;
  totalWordsLearned: number;
  streakDays: number;
  totalSessions: number;
  averageAccuracy: number;
}

// 真实学习进度接口
export interface RealLearningProgress {
  totalWords: number;
  masteredWords: number;
  todayLearned: number;
  remainingExercises: number;
  progressPercentage: number;
}

// 真实练习状态接口
export interface RealExerciseStatus {
  read: 'not-started' | 'completed' | 'failed';
  listen: 'not-started' | 'completed' | 'failed';
  write: 'not-started' | 'completed' | 'failed';
}

// 真实错题数据接口
export interface RealWrongAnswerData {
  id: string;
  type: 'read' | 'listen' | 'write';
  typeName: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  date: string;
  formattedDate: string;
  reviewed: boolean;
  feedback?: string;
  relatedWords: { spelling: string }[];
}

// 真实周学习数据接口
export interface RealWeeklyData {
  day: string;
  words: number;
}

class RealDataService {
  // 获取用户ID的辅助函数
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id || null;
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return null;
    }
  }

  // 获取真实学习统计数据
  async getRealLearningStats(): Promise<RealLearningStats> {
    try {
      const response = await api.get('/api/words-stats');
      if (response.data.success) {
        const stats = response.data.stats;
        return {
          totalWords: stats.totalWords || 0,
          accuracy: Math.round(stats.averageAccuracy || 0),
          masteredWords: stats.masteredWords || 0,
          studyHours: Math.round((stats.totalSessions || 0) * 0.5), // 估算：每次练习30分钟
          totalWordsLearned: stats.totalWords || 0,
          streakDays: stats.streakDays || 0,
          totalSessions: stats.totalSessions || 0,
          averageAccuracy: stats.averageAccuracy || 0
        };
      }
      throw new Error('获取统计数据失败');
    } catch (error) {
      console.error('获取真实学习统计数据失败:', error);
      // 返回默认空数据而不是模拟数据
      return {
        totalWords: 0,
        accuracy: 0,
        masteredWords: 0,
        studyHours: 0,
        totalWordsLearned: 0,
        streakDays: 0,
        totalSessions: 0,
        averageAccuracy: 0
      };
    }
  }

  // 获取真实学习进度数据
  async getRealLearningProgress(): Promise<RealLearningProgress> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        // 访客模式：返回空进度
        return {
          totalWords: 0,
          masteredWords: 0,
          todayLearned: 0,
          remainingExercises: 0,
          progressPercentage: 0
        };
      }

      // 获取今日单词和进度数据
      const dailyResponse = await api.get('/api/words-daily');
      if (dailyResponse.data.success) {
        const stats = dailyResponse.data.stats;
        const todayLearned = stats.total_studied || 0;
        const totalWords = (stats.total_studied || 0) + (dailyResponse.data.data?.length || 0);
        const masteredWords = dailyResponse.data.data?.filter((word: any) => word.mastered)?.length || 0;
        
        return {
          totalWords,
          masteredWords: masteredWords + todayLearned,
          todayLearned,
          remainingExercises: Math.max(0, 3 - (stats.sessions_today || 0)), // 假设每天3次练习
          progressPercentage: totalWords > 0 ? Math.round((todayLearned / totalWords) * 100) : 0
        };
      }
      
      throw new Error('获取进度数据失败');
    } catch (error) {
      console.error('获取真实学习进度数据失败:', error);
      return {
        totalWords: 0,
        masteredWords: 0,
        todayLearned: 0,
        remainingExercises: 0,
        progressPercentage: 0
      };
    }
  }

  // 获取真实练习状态
  async getRealExerciseStatus(): Promise<RealExerciseStatus> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        // 访客模式：所有练习都未开始
        return {
          read: 'not-started',
          listen: 'not-started',
          write: 'not-started'
        };
      }

      // 从数据库获取今日练习完成状态
      const { data: sessions, error } = await supabase
        .from('learning_sessions')
        .select('session_type')
        .eq('user_id', userId)
        .gte('completed_at', new Date().toISOString().split('T')[0]); // 今天的记录

      if (error) {
        console.error('获取练习状态失败:', error);
        // 返回默认状态
        return {
          read: 'not-started',
          listen: 'not-started',
          write: 'not-started'
        };
      }

      const completedTypes = sessions?.map((s: { session_type: string }) => s.session_type) || [];
      
      return {
        read: completedTypes.includes('reading') ? 'completed' : 'not-started',
        listen: completedTypes.includes('listening') ? 'completed' : 'not-started',
        write: completedTypes.includes('writing') ? 'completed' : 'not-started'
      };
    } catch (error) {
      console.error('获取真实练习状态失败:', error);
      return {
        read: 'not-started',
        listen: 'not-started',
        write: 'not-started'
      };
    }
  }

  // 获取真实错题数据
  async getRealWrongAnswers(
    page: number = 1,
    limit: number = 20,
    type?: string
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    wrongAnswers: RealWrongAnswerData[];
  }> {
    try {
      const params: any = { page, limit };
      if (type && type !== 'all') {
        params.type = type;
      }
      
      const response = await api.get('/api/exercises/wrong-answers', { params });
      if (response.data.success) {
        return {
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || 20,
          wrongAnswers: response.data.wrongAnswers || []
        };
      }
      
      throw new Error('获取错题数据失败');
    } catch (error) {
      console.error('获取真实错题数据失败:', error);
      // 返回空数据而不是模拟数据
      return {
        total: 0,
        page: 1,
        limit: 20,
        wrongAnswers: []
      };
    }
  }

  // 获取真实周学习数据
  async getRealWeeklyData(): Promise<RealWeeklyData[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        // 访客模式：返回空数据
        return [];
      }

      // 计算过去7天的日期
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // 获取过去7天的学习会话数据
      const { data: sessions, error } = await supabase
        .from('learning_sessions')
        .select('completed_at, words_studied')
        .eq('user_id', userId)
        .gte('completed_at', dates[0])
        .lte('completed_at', dates[6] + 'T23:59:59');

      if (error) {
        console.error('获取周学习数据失败:', error);
        return [];
      }

      // 按日期汇总学习单词数
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      return dates.map(date => {
        const dayIndex = new Date(date).getDay();
        const dayName = weekDays[dayIndex];
        
        const daySessions = sessions?.filter((s: LearningSessionRecord) => 
          s.completed_at?.startsWith(date)
        ) || [];
        
        const wordsCount = daySessions.reduce((sum: number, session: LearningSessionRecord) => {
          const wordsStudied = Array.isArray(session.words_studied) 
            ? session.words_studied.length 
            : 0;
          return sum + wordsStudied;
        }, 0);

        return {
          day: dayName,
          words: wordsCount
        };
      });
    } catch (error) {
      console.error('获取真实周学习数据失败:', error);
      return [];
    }
  }

  // 标记错题为已复习
  async markWrongAsReviewed(wrongAnswerId: string): Promise<void> {
    try {
      const response = await api.post(`/api/exercises/wrong-answers/${wrongAnswerId}/review`);
      if (!response.data.success) {
        throw new Error('标记错题失败');
      }
    } catch (error) {
      console.error('标记错题为已复习失败:', error);
      throw error;
    }
  }
}

export const realDataService = new RealDataService(); 