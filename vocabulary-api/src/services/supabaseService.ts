import { supabase, TABLES } from '../config/supabase'
import type { Word, UserProgress, LearningSession, WordCategory, User } from '../config/supabase'

export interface CreateWordData {
  english: string
  chinese: string
  pronunciation?: string
  difficulty_level: number
  category_id?: string
  audio_url?: string
  example_sentence?: string
}

export interface BulkCreateWordsData {
  words: CreateWordData[]
}

class SupabaseService {
  // 用户管理
  async createUser(userData: Partial<User>): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert(userData)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as User, error: null }
    } catch (error) {
      return { data: null, error: '创建用户失败' }
    }
  }

  async getUserById(userId: string): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as User, error: null }
    } catch (error) {
      return { data: null, error: '获取用户信息失败' }
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({ ...userData, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: '更新用户信息失败' }
    }
  }

  // 单词管理
  async createWord(wordData: CreateWordData): Promise<{ data: Word | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WORDS)
        .insert(wordData)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as Word, error: null }
    } catch (error) {
      return { data: null, error: '创建单词失败' }
    }
  }

  async bulkCreateWords(wordsData: BulkCreateWordsData): Promise<{ data: Word[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WORDS)
        .insert(wordsData.words)
        .select()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as Word[], error: null }
    } catch (error) {
      return { data: null, error: '批量创建单词失败' }
    }
  }

  async updateWord(wordId: string, wordData: Partial<CreateWordData>): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from(TABLES.WORDS)
        .update({ ...wordData, updated_at: new Date().toISOString() })
        .eq('id', wordId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: '更新单词失败' }
    }
  }

  async deleteWord(wordId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from(TABLES.WORDS)
        .delete()
        .eq('id', wordId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: '删除单词失败' }
    }
  }

  async getWords(filters?: {
    category_id?: string
    difficulty_level?: number
    limit?: number
    offset?: number
  }): Promise<{ data: Word[] | null; error: string | null }> {
    try {
      let query = supabase
        .from(TABLES.WORDS)
        .select('*')

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      if (filters?.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level)
      }

      if (filters?.limit) {
        const offset = filters.offset || 0
        query = query.range(offset, offset + filters.limit - 1)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as Word[], error: null }
    } catch (error) {
      return { data: null, error: '获取单词列表失败' }
    }
  }

  // 分类管理
  async createCategory(categoryData: Omit<WordCategory, 'id' | 'created_at'>): Promise<{ data: WordCategory | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.WORD_CATEGORIES)
        .insert(categoryData)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as WordCategory, error: null }
    } catch (error) {
      return { data: null, error: '创建分类失败' }
    }
  }

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

  // 用户进度管理
  async getUserProgress(userId: string, wordId?: string): Promise<{ data: UserProgress[] | null; error: string | null }> {
    try {
      let query = supabase
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

      if (wordId) {
        query = query.eq('word_id', wordId)
      }

      const { data, error } = await query.order('last_reviewed', { ascending: false })

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as UserProgress[], error: null }
    } catch (error) {
      return { data: null, error: '获取用户进度失败' }
    }
  }

  // 学习会话管理
  async createLearningSession(sessionData: Omit<LearningSession, 'id' | 'created_at'>): Promise<{ data: LearningSession | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from(TABLES.LEARNING_SESSIONS)
        .insert(sessionData)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as LearningSession, error: null }
    } catch (error) {
      return { data: null, error: '创建学习会话失败' }
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
      return { data: null, error: '获取用户会话失败' }
    }
  }

  // 统计数据
  async getDashboardStats(): Promise<{
    data: {
      totalUsers: number
      totalWords: number
      totalSessions: number
      activeUsers: number
    } | null
    error: string | null
  }> {
    try {
      // 获取总用户数
      const { count: totalUsers, error: usersError } = await supabase
        .from(TABLES.USERS)
        .select('*', { count: 'exact', head: true })

      if (usersError) {
        return { data: null, error: usersError.message }
      }

      // 获取总单词数
      const { count: totalWords, error: wordsError } = await supabase
        .from(TABLES.WORDS)
        .select('*', { count: 'exact', head: true })

      if (wordsError) {
        return { data: null, error: wordsError.message }
      }

      // 获取总会话数
      const { count: totalSessions, error: sessionsError } = await supabase
        .from(TABLES.LEARNING_SESSIONS)
        .select('*', { count: 'exact', head: true })

      if (sessionsError) {
        return { data: null, error: sessionsError.message }
      }

      // 获取活跃用户数（最近7天有学习记录）
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: activeSessions, error: activeError } = await supabase
        .from(TABLES.LEARNING_SESSIONS)
        .select('user_id')
        .gte('completed_at', sevenDaysAgo.toISOString())

      if (activeError) {
        return { data: null, error: activeError.message }
      }

      const activeUsers = new Set(activeSessions?.map(session => session.user_id)).size

      return {
        data: {
          totalUsers: totalUsers || 0,
          totalWords: totalWords || 0,
          totalSessions: totalSessions || 0,
          activeUsers
        },
        error: null
      }
    } catch (error) {
      return { data: null, error: '获取统计数据失败' }
    }
  }

  // 数据库健康检查
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(TABLES.WORDS)
        .select('id')
        .limit(1)

      if (error) {
        return { healthy: false, error: error.message }
      }

      return { healthy: true }
    } catch (error) {
      return { healthy: false, error: '数据库连接失败' }
    }
  }
}

export const supabaseService = new SupabaseService() 