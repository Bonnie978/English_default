import { Types } from 'mongoose';

// 扩展Express的Request接口
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        username: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}

// AI服务返回类型
export interface ReadingExerciseResult {
  article: string;
  questions: {
    question: string;
    type: string;
    options: string[];
    correctAnswer: string;
    id?: string;
  }[];
}

export interface WritingExerciseResult {
  prompt: string;
  topic: string;
  requirements: string;
  tips: string;
}

export type ExerciseResult = ReadingExerciseResult | WritingExerciseResult;

// 学习记录的练习类型
export interface IExerciseQuestion {
  id: string;
  question: string;
  options?: string[];
  type: 'multiple-choice' | 'fill-blank' | 'writing';
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface IExercise {
  id: string;
  type: 'read' | 'listen' | 'write';
  content: string;
  questions: IExerciseQuestion[];
  score?: number;
  feedback?: string;
  completedAt?: Date;
  createdAt?: Date;
}

// 响应类型
export interface ExerciseResponseBase {
  id: string;
  type: string;
  content: any;
}

export interface ReadingExerciseResponse extends ExerciseResponseBase {
  questions: any[];
  audioUrl?: string;
}

export interface WritingExerciseResponse extends ExerciseResponseBase {
  topic: string;
  requirements: string;
  tips: string;
  targetWords: string[];
}

export type ExerciseResponseOptions = ReadingExerciseResponse | WritingExerciseResponse; 