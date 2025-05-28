import { supabase, TABLES } from '../config/supabase'
import type { Word, UserProgress, LearningSession, WordCategory } from '../config/supabase'

export interface CreateWordData {
  english: string
  chinese: string
  pronunciation?: string
  difficulty_level: number
  category_id?: string
  audio_url?: string
  example_sentence?: string
}

export interface UpdateProgressData {
  word_id: string
  mastery_level: number
  is_correct: boolean
}

export interface CreateSessionData {
  session_type: 'reading' | 'listening' | 'writing' | 'speaking'
  words_studied: string[]
  correct_answers: number
  total_questions: number
  duration_seconds: number
}

class DataService {
  // 单词相关操作
  async getWords(limit = 50, offset = 0): Promise<{ data: Word[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WORDS)
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as Word[], error: null }
    } catch (error) {
      return { data: null, error: '获取单词列表失败' }
    }
  }

  async getWordsByCategory(categoryId: string): Promise<{ data: Word[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WORDS)
        .select('*')
        .eq('category_id', categoryId)
        .order('difficulty_level', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as Word[], error: null }
    } catch (error) {
      return { data: null, error: '获取分类单词失败' }
    }
  }

  async getWordsByDifficulty(level: number): Promise<{ data: Word[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WORDS)
        .select('*')
        .eq('difficulty_level', level)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as Word[], error: null }
    } catch (error) {
      return { data: null, error: '获取难度单词失败' }
    }
  }

  async searchWords(query: string): Promise<{ data: Word[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WORDS)
        .select('*')
        .or(`english.ilike.%${query}%,chinese.ilike.%${query}%`)
        .limit(20)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as Word[], error: null }
    } catch (error) {
      return { data: null, error: '搜索单词失败' }
    }
  }

  // 用户进度相关操作
  async getUserProgress(userId: string): Promise<{ data: UserProgress[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_PROGRESS)
        .select(`
          *,
          words:word_id (
            english,
            chinese,
            difficulty_level
          )
        `)
        .eq('user_id', userId)
        .order('last_reviewed', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as UserProgress[], error: null }
    } catch (error) {
      return { data: null, error: '获取学习进度失败' }
    }
  }

  async updateUserProgress(userId: string, progressData: UpdateProgressData): Promise<{ error: string | null }> {
    try {
      // 检查是否已存在进度记录
      const { data: existing } = await supabase
        .from(TABLES.USER_PROGRESS)
        .select('*')
        .eq('user_id', userId)
        .eq('word_id', progressData.word_id)
        .single()

      if (existing) {
        // 更新现有记录
        const { error } = await supabase
          .from(TABLES.USER_PROGRESS)
          .update({
            mastery_level: progressData.mastery_level,
            last_reviewed: new Date().toISOString(),
            review_count: existing.review_count + 1,
            correct_count: existing.correct_count + (progressData.is_correct ? 1 : 0),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        if (error) {
          return { error: error.message }
        }
      } else {
        // 创建新记录
        const { error } = await supabase
          .from(TABLES.USER_PROGRESS)
          .insert({
            user_id: userId,
            word_id: progressData.word_id,
            mastery_level: progressData.mastery_level,
            last_reviewed: new Date().toISOString(),
            review_count: 1,
            correct_count: progressData.is_correct ? 1 : 0
          })

        if (error) {
          return { error: error.message }
        }
      }

      return { error: null }
    } catch (error) {
      return { error: '更新学习进度失败' }
    }
  }

  // 学习会话相关操作
  async createLearningSession(userId: string, sessionData: CreateSessionData): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from(TABLES.LEARNING_SESSIONS)
        .insert({
          user_id: userId,
          session_type: sessionData.session_type,
          words_studied: sessionData.words_studied,
          correct_answers: sessionData.correct_answers,
          total_questions: sessionData.total_questions,
          duration_seconds: sessionData.duration_seconds,
          completed_at: new Date().toISOString()
        })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: '保存学习会话失败' }
    }
  }

  async getUserSessions(userId: string, limit = 10): Promise<{ data: LearningSession[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LEARNING_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as LearningSession[], error: null }
    } catch (error) {
      return { data: null, error: '获取学习记录失败' }
    }
  }

  // 分类相关操作
  async getCategories(): Promise<{ data: WordCategory[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WORD_CATEGORIES)
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as WordCategory[], error: null }
    } catch (error) {
      return { data: null, error: '获取分类列表失败' }
    }
  }

  // 统计相关操作
  async getUserStats(userId: string): Promise<{ 
    data: {
      totalWords: number
      masteredWords: number
      totalSessions: number
      averageAccuracy: number
    } | null
    error: string | null 
  }> {
    try {
      // 获取总单词数和掌握单词数
      const { data: progressData, error: progressError } = await supabase
        .from(TABLES.USER_PROGRESS)
        .select('mastery_level')
        .eq('user_id', userId)

      if (progressError) {
        return { data: null, error: progressError.message }
      }

      // 获取学习会话统计
      const { data: sessionData, error: sessionError } = await supabase
        .from(TABLES.LEARNING_SESSIONS)
        .select('correct_answers, total_questions')
        .eq('user_id', userId)

      if (sessionError) {
        return { data: null, error: sessionError.message }
      }

      const totalWords = progressData?.length || 0
      const masteredWords = progressData?.filter((p: any) => p.mastery_level >= 80).length || 0
      const totalSessions = sessionData?.length || 0
      
      let averageAccuracy = 0
      if (sessionData && sessionData.length > 0) {
        const totalCorrect = sessionData.reduce((sum: number, session: any) => sum + session.correct_answers, 0)
        const totalQuestions = sessionData.reduce((sum: number, session: any) => sum + session.total_questions, 0)
        averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
      }

      return {
        data: {
          totalWords,
          masteredWords,
          totalSessions,
          averageAccuracy: Math.round(averageAccuracy * 100) / 100
        },
        error: null
      }
    } catch (error) {
      return { data: null, error: '获取统计数据失败' }
    }
  }
}

export const dataService = new DataService() 