import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  lastLoginAt: Date;
  learningStats: {
    totalWordsLearned: number;
    correctRate: number;
    streakDays: number;
    totalExercises: number;
  };
  settings: {
    dailyWordCount: number;
    preferredExerciseTypes: string[];
    notifications: boolean;
    soundEnabled: boolean;
  };
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLoginAt: { 
    type: Date 
  },
  learningStats: {
    totalWordsLearned: { type: Number, default: 0 },
    correctRate: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    totalExercises: { type: Number, default: 0 }
  },
  settings: {
    dailyWordCount: { type: Number, default: 10 },
    preferredExerciseTypes: [{ type: String }],
    notifications: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true }
  }
});

// 密码比对方法
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

// 保存前加密密码
userSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

export const User = mongoose.model<IUser>('User', userSchema); 