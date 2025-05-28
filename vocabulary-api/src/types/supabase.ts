// Supabase 数据库类型定义

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
  avatar_url?: string;
  preferences?: any;
}

export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  definition: string;
  example_sentence: string;
  difficulty_level: number;
  category: string;
  created_at: string;
  updated_at: string;
  audio_url?: string;
  image_url?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface LearningRecord {
  id: string;
  user_id: string;
  word_id: string;
  mastery_level: number;
  review_count: number;
  correct_count: number;
  last_reviewed: string;
  next_review: string;
  created_at: string;
  updated_at: string;
}

export interface WrongAnswer {
  id: string;
  user_id: string;
  exercise_id: string;
  word_ids: string[];
  exercise_type: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  user_id: string;
  exercise_type: string;
  word_ids: string[];
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent: number;
  created_at: string;
}

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  WORDS: 'words',
  LEARNING_RECORDS: 'learning_records',
  WRONG_ANSWERS: 'wrong_answers',
  EXERCISES: 'exercises'
} as const; 