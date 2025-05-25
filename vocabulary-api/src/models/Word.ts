import mongoose, { Document, Schema } from 'mongoose';

export interface IWord extends Document {
  spelling: string;
  pronunciation: string;
  partOfSpeech: string;
  definitions: string[];
  examples: string[];
  difficulty: number;
  tags: string[];
}

const wordSchema = new Schema<IWord>({
  spelling: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  pronunciation: { 
    type: String,
    required: true 
  },
  partOfSpeech: { 
    type: String, 
    required: true 
  },
  definitions: [{ 
    type: String, 
    required: true 
  }],
  examples: [{ 
    type: String 
  }],
  difficulty: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 5
  },
  tags: [{ 
    type: String 
  }]
});

// 添加索引以提高查询效率
wordSchema.index({ difficulty: 1 });
wordSchema.index({ tags: 1 });

export const Word = mongoose.model<IWord>('Word', wordSchema); 