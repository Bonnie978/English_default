import { Types } from 'mongoose';

// 扩展Express的Request接口
declare global {
  namespace Express {
    interface Request {
      user: {
        _id: Types.ObjectId;
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
    _id?: string | Types.ObjectId;
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
  _id: Types.ObjectId;
  question: string;
  options?: string[];
  type: 'multiple-choice' | 'fill-blank' | 'writing';
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface IExercise {
  _id: Types.ObjectId;
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
  id: any;
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