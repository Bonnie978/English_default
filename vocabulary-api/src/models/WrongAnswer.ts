import mongoose, { Document, Schema } from 'mongoose';

export interface IWrongAnswer extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  wordIds: mongoose.Types.ObjectId[];
  type: 'read' | 'listen' | 'write';
  question: string;
  correctAnswer: string;
  userAnswer: string;
  explanation?: string;
  date: Date;
  reviewed: boolean;
  reviewedAt?: Date;
}

const wrongAnswerSchema = new Schema<IWrongAnswer>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: 'LearningRecord',
    required: true
  },
  wordIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Word'
  }],
  type: { 
    type: String, 
    enum: ['read', 'listen', 'write'],
    required: true
  },
  question: { 
    type: String, 
    required: true 
  },
  correctAnswer: { 
    type: String, 
    required: true 
  },
  userAnswer: { 
    type: String, 
    required: true 
  },
  explanation: {
    type: String
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  reviewed: { 
    type: Boolean, 
    default: false 
  },
  reviewedAt: { 
    type: Date 
  }
});

// 添加索引
wrongAnswerSchema.index({ userId: 1, type: 1 });
wrongAnswerSchema.index({ userId: 1, date: -1 });
wrongAnswerSchema.index({ userId: 1, reviewed: 1 });

export const WrongAnswer = mongoose.model<IWrongAnswer>('WrongAnswer', wrongAnswerSchema); 