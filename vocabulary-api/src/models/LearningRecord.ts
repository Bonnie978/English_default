import mongoose, { Document, Schema } from 'mongoose';

export interface IWordLearningStatus {
  wordId: mongoose.Types.ObjectId;
  mastered: boolean;
  reviewCount: number;
  lastReviewDate: Date;
}

export interface IExerciseQuestion {
  question: string;
  options?: string[];
  type: 'multiple-choice' | 'fill-blank' | 'writing';
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface IExercise {
  type: 'read' | 'listen' | 'write';
  content: string;
  audioUrl?: string;
  questions: IExerciseQuestion[];
  score?: number;
  feedback?: string;
  completedAt?: Date;
}

export interface ILearningRecord extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  wordsList: IWordLearningStatus[];
  exercises: IExercise[];
}

const learningRecordSchema = new Schema<ILearningRecord>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  wordsList: [{
    wordId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Word', 
      required: true 
    },
    mastered: { 
      type: Boolean, 
      default: false 
    },
    reviewCount: { 
      type: Number, 
      default: 0 
    },
    lastReviewDate: { 
      type: Date 
    }
  }],
  exercises: [{
    type: { 
      type: String, 
      enum: ['read', 'listen', 'write'],
      required: true
    },
    content: { 
      type: String,
      required: true
    },
    audioUrl: {
      type: String
    },
    questions: [{
      question: { 
        type: String, 
        required: true 
      },
      options: [{ 
        type: String 
      }],
      type: {
        type: String,
        enum: ['multiple-choice', 'fill-blank', 'writing'],
        required: true
      },
      correctAnswer: { 
        type: String, 
        required: true 
      },
      userAnswer: { 
        type: String 
      },
      isCorrect: { 
        type: Boolean 
      }
    }],
    score: { 
      type: Number 
    },
    feedback: { 
      type: String 
    },
    completedAt: { 
      type: Date 
    }
  }]
});

// 添加复合索引以提高查询效率
learningRecordSchema.index({ userId: 1, date: -1 });

export const LearningRecord = mongoose.model<ILearningRecord>('LearningRecord', learningRecordSchema); 