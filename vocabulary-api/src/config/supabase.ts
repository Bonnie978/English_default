import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// 创建 Supabase 客户端（使用服务端密钥，拥有完整权限）
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  WORDS: 'words',
  USER_PROGRESS: 'user_progress',
  LEARNING_SESSIONS: 'learning_sessions',
  WORD_CATEGORIES: 'word_categories'
} as const

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

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
} 