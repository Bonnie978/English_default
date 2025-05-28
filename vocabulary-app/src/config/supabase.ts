import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// 检查环境变量是否存在且有效
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 如果没有配置 Supabase 环境变量，使用默认配置（仅用于开发）
const defaultSupabaseUrl = 'https://placeholder.supabase.co'
const defaultSupabaseKey = 'placeholder-key'

const finalSupabaseUrl = isValidUrl(supabaseUrl) ? supabaseUrl! : defaultSupabaseUrl
const finalSupabaseKey = supabaseAnonKey && supabaseAnonKey.length > 10 ? supabaseAnonKey : defaultSupabaseKey

// 只在使用真实配置时创建客户端
let supabase: any = null

if (isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey.length > 10) {
  // 创建真实的 Supabase 客户端
  supabase = createClient(finalSupabaseUrl, finalSupabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
  console.log('✅ Supabase client initialized with real configuration')
} else {
  // 创建模拟客户端用于开发
  console.warn('⚠️ Supabase environment variables not configured, using mock client')
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    })
  }
}

export { supabase }

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  WORDS: 'words',
  USER_PROGRESS: 'user_progress',
  LEARNING_SESSIONS: 'learning_sessions',
  WORD_CATEGORIES: 'word_categories'
} as const

// Supabase 认证相关类型
export interface AuthUser {
  id: string
  email?: string
  username?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
  // 学习统计数据
  learningStats?: {
    correctRate: number
    totalWords: number
    consecutiveDays: number
  }
  // 用户设置
  settings?: {
    dailyWordCount: number
    notifications: boolean
    soundEnabled: boolean
  }
}

// 数据库表类型定义
export interface Word {
  id: string
  english: string
  chinese: string
  pronunciation?: string
  difficulty_level: number
  category_id?: string
  audio_url?: string
  example_sentence?: string
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  word_id: string
  mastery_level: number
  last_reviewed: string
  review_count: number
  correct_count: number
  created_at: string
  updated_at: string
}

export interface LearningSession {
  id: string
  user_id: string
  session_type: 'reading' | 'listening' | 'writing' | 'speaking'
  words_studied: string[]
  correct_answers: number
  total_questions: number
  duration_seconds: number
  completed_at: string
  created_at: string
}

export interface WordCategory {
  id: string
  name: string
  description?: string
  color?: string
  created_at: string
} 