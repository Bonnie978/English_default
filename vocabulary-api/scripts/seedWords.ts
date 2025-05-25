import mongoose from 'mongoose';
import { connectMongoDB } from '../src/config/database';
import { Word } from '../src/models/Word';
import { config } from '../src/config/env';

// 示例单词数据
const sampleWords = [
  {
    spelling: "diligent",
    pronunciation: "/ˈdɪlɪdʒənt/",
    partOfSpeech: "adj.",
    definitions: ["勤勉的，勤奋的"],
    examples: ["She is a diligent student who always completes her homework."],
    difficulty: 3,
    tags: ["personality"]
  },
  {
    spelling: "collaborate",
    pronunciation: "/kəˈlæbəreɪt/",
    partOfSpeech: "v.",
    definitions: ["合作，协作"],
    examples: ["Our teams will collaborate on this project to ensure its success."],
    difficulty: 3,
    tags: ["work"]
  },
  {
    spelling: "perseverance",
    pronunciation: "/ˌpɜːsɪˈvɪərəns/",
    partOfSpeech: "n.",
    definitions: ["毅力，坚持不懈"],
    examples: ["His perseverance in the face of obstacles was admirable."],
    difficulty: 4,
    tags: ["personality"]
  },
  {
    spelling: "implement",
    pronunciation: "/ˈɪmplɪment/",
    partOfSpeech: "v.",
    definitions: ["实施，执行"],
    examples: ["We need to implement the new policy by next month."],
    difficulty: 3,
    tags: ["work"]
  },
  {
    spelling: "perspective",
    pronunciation: "/pəˈspektɪv/",
    partOfSpeech: "n.",
    definitions: ["观点，看法"],
    examples: ["From my perspective, this solution seems the most effective."],
    difficulty: 3,
    tags: ["abstract"]
  },
  {
    spelling: "accomplish",
    pronunciation: "/əˈkʌmplɪʃ/",
    partOfSpeech: "v.",
    definitions: ["完成，实现"],
    examples: ["She accomplished all her goals before the deadline."],
    difficulty: 3,
    tags: ["achievement"]
  },
  {
    spelling: "innovative",
    pronunciation: "/ˈɪnəveɪtɪv/",
    partOfSpeech: "adj.",
    definitions: ["创新的，革新的"],
    examples: ["The company is known for its innovative approach to problem-solving."],
    difficulty: 3,
    tags: ["technology"]
  },
  {
    spelling: "resilient",
    pronunciation: "/rɪˈzɪliənt/",
    partOfSpeech: "adj.",
    definitions: ["有弹性的，能恢复的"],
    examples: ["Children are often more resilient than adults when facing challenges."],
    difficulty: 4,
    tags: ["personality"]
  },
  {
    spelling: "enhance",
    pronunciation: "/ɪnˈhɑːns/",
    partOfSpeech: "v.",
    definitions: ["提高，增强"],
    examples: ["Regular exercise can enhance your overall well-being."],
    difficulty: 3,
    tags: ["improvement"]
  },
  {
    spelling: "substantial",
    pronunciation: "/səbˈstænʃəl/",
    partOfSpeech: "adj.",
    definitions: ["大量的，实质性的"],
    examples: ["The project requires a substantial investment of time and resources."],
    difficulty: 3,
    tags: ["quantity"]
  }
];

// 填充数据函数
const seedWords = async () => {
  try {
    // 连接数据库
    await connectMongoDB();
    
    // 清空现有单词集合（谨慎使用！仅用于开发）
    await Word.deleteMany({});
    console.log('已清空单词集合');
    
    // 插入示例单词
    await Word.insertMany(sampleWords);
    console.log(`已插入 ${sampleWords.length} 个单词`);
    
    // 断开连接
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
    
    process.exit(0);
  } catch (error) {
    console.error('填充数据错误:', error);
    process.exit(1);
  }
};

// 执行填充
seedWords(); 