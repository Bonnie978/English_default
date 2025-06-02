import api from './api';
import { realDataService } from './realDataService';

export type ExerciseType = 'read' | 'listen' | 'write';
export type ExerciseStatusType = 'not-started' | 'completed' | 'failed';

export interface ExerciseStatus {
  read: ExerciseStatusType;
  listen: ExerciseStatusType;
  write: ExerciseStatusType;
}

export interface LearningProgress {
  totalWords: number;
  masteredWords: number;
  todayLearned: number;
  remainingExercises: number;
  progressPercentage: number;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  content: string;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string;
}

// 模拟生成阅读练习
const generateMockReadingExercise = (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        exercise: {
          id: `read_${Date.now()}`,
          type: 'read',
          content: `Technology has become an indispensable part of our daily lives. From the moment we wake up to the sound of our smartphone alarms to the last email we check before bed, technology permeates every aspect of our existence.

The rapid advancement of digital technology has transformed the way we communicate, work, and entertain ourselves. Social media platforms have revolutionized how we connect with friends and family, while smartphones have made it possible to access information and stay connected regardless of geographical boundaries.

However, this constant connectivity comes with its own set of challenges. Many people find themselves struggling with information overload and digital fatigue. The concerns about privacy, mental health impacts, and the potential for technology addiction are becoming increasingly prominent in public discourse.

As we navigate this digital age, it's essential to find a balance between embracing technological innovations and maintaining our well-being. Developing healthy digital habits and being mindful of our technology consumption can help us harness the benefits while minimizing the drawbacks.`,
          questions: [
            {
              id: 'q1',
              question: 'What has technology become in our daily lives according to the passage?',
              type: 'multiple-choice',
              options: [
                'An indispensable part',
                'A minor convenience',
                'An occasional tool',
                'A luxury item'
              ]
            },
            {
              id: 'q2',
              question: 'How have smartphones transformed communication according to the text?',
              type: 'multiple-choice',
              options: [
                'By enabling connection regardless of geographical boundaries',
                'By making communication more expensive',
                'By reducing the quality of conversations',
                'By limiting communication to text only'
              ]
            },
            {
              id: 'q3',
              question: 'What concerns does the passage mention about technology use?',
              type: 'multiple-choice',
              options: [
                'Privacy, mental health impacts, and potential addiction',
                'High costs and poor quality',
                'Limited functionality and poor design',
                'Lack of innovation and slow development'
              ]
            },
            {
              id: 'q4',
              question: 'According to the passage, what is essential as we navigate the digital age?',
              type: 'fill-blank',
              options: []
            }
          ]
        }
      });
    }, 2000); // 模拟网络延迟
  });
};

// 模拟生成听力练习
const generateMockListeningExercise = (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        exercise: {
          id: `listen_${Date.now()}`,
          type: 'listen',
          content: `Good morning, Sarah. I heard you're planning to start a new fitness regime this year. That's fantastic! Regular exercise can be so beneficial for both physical and mental health.

Hi Mark! Yes, I've been thinking about it for a while now. I want to be more consistent with my workouts. I used to go to the gym occasionally, but I never really maintained a proper schedule.

That's a common challenge. What kind of activities are you considering? It's important to choose something you actually enjoy, otherwise it becomes difficult to stay motivated.

I'm thinking about joining a yoga class and maybe some cardio exercises. I've heard that yoga can really help with flexibility and stress management. As for cardio, I'm considering either running or cycling.

Those are excellent choices! Yoga is particularly good for building core strength and improving posture. And cardiovascular exercise is essential for heart health. Have you thought about setting specific goals for yourself?

Yes, I want to establish a routine where I exercise at least four times a week. I think having a structured plan will help me stay on track. What do you think is the most important thing when starting a new fitness journey?

I'd say the key is to start gradually and listen to your body. Don't try to do too much too soon, or you might get injured or burned out. Also, tracking your progress can be really motivating.`,
          audioUrl: '/api/exercises/audio/sample-listening.mp3', // 模拟音频URL
          questions: [
            {
              id: 'q1',
              question: 'What is the main topic of the conversation?',
              type: 'multiple-choice',
              options: [
                'Planning a vacation',
                'Discussing work projects',
                'Starting a fitness regime',
                'Comparing different technologies'
              ]
            },
            {
              id: 'q2',
              question: 'What types of exercise is Sarah considering?',
              type: 'multiple-choice',
              options: [
                'Swimming and tennis',
                'Yoga and cardio exercises',
                'Weightlifting and pilates',
                'Basketball and soccer'
              ]
            },
            {
              id: 'q3',
              question: 'How many times per week does Sarah want to exercise?',
              type: 'multiple-choice',
              options: [
                'Two times',
                'Three times',
                'Four times',
                'Five times'
              ]
            },
            {
              id: 'q4',
              question: 'According to Mark, what is the most important thing when starting a fitness journey?',
              type: 'fill-blank',
              options: []
            }
          ]
        }
      });
    }, 2000); // 模拟网络延迟
  });
};

// 模拟生成写作练习
const generateMockWritingExercise = (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        exercise: {
          id: `write_${Date.now()}`,
          type: 'write',
          prompt: {
            topic: "The Importance of Persistence in Achieving Goals",
            requirements: "Write a short essay about the importance of persistence in achieving personal or professional goals. Discuss how qualities like diligence and resilience contribute to success.",
            wordCount: "150-200 words",
            instructions: "Use at least 5 of the target vocabulary words in your essay. Be sure to use them correctly in context."
          },
          targetWords: [
            "diligent", "collaborate", "perseverance", "implement", "perspective",
            "accomplish", "innovative", "resilient", "enhance", "substantial"
          ],
          requirements: {
            minWords: 150,
            maxWords: 200,
            minTargetWords: 5
          }
        }
      });
    }, 2000); // 模拟网络延迟
  });
};

// 新的generateExercise函数
export const generateExercise = async (type: 'read' | 'listen' | 'write', wordIds: string[]) => {
  try {
    if (type === 'read') {
      return await generateMockReadingExercise();
    } else if (type === 'listen') {
      return await generateMockListeningExercise();
    } else if (type === 'write') {
      return await generateMockWritingExercise();
    }
    
    throw new Error(`${type} 练习类型尚未实现`);
  } catch (error) {
    console.error(`生成${type}练习失败:`, error);
    throw error;
  }
};

// 模拟写作评分
export const evaluateWriting = async (exerciseId: string, content: string, targetWords: string[]): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 简单的评分逻辑
      const wordCount = content.trim().split(/\s+/).length;
      const usedTargetWords = targetWords.filter(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(content);
      });

      const contentScore = Math.min(20, Math.max(12, wordCount / 10)); // 基于字数
      const vocabularyScore = Math.min(30, usedTargetWords.length * 5); // 基于词汇使用
      const grammarScore = Math.random() * 8 + 15; // 模拟语法分数
      const structureScore = Math.random() * 5 + 16; // 模拟结构分数
      const expressionScore = Math.random() * 3 + 7; // 模拟表达分数

      const totalScore = Math.round(contentScore + vocabularyScore + grammarScore + structureScore + expressionScore);

      resolve({
        success: true,
        score: totalScore,
        feedback: `总体表现${totalScore >= 80 ? '优秀' : totalScore >= 70 ? '良好' : '尚可'}，继续保持！`,
        results: [
          {
            dimension: '内容相关性',
            score: Math.round(contentScore),
            maxScore: 20,
            comment: wordCount >= 150 ? '内容丰富，紧扣主题' : '内容较少，可进一步扩展'
          },
          {
            dimension: '词汇使用',
            score: Math.round(vocabularyScore),
            maxScore: 30,
            comment: `正确使用了${usedTargetWords.length}个目标词汇${usedTargetWords.length >= 5 ? '，表现优秀' : '，建议增加使用'}`
          },
          {
            dimension: '语法和拼写',
            score: Math.round(grammarScore),
            maxScore: 20,
            comment: '语法基本正确，注意时态一致性'
          },
          {
            dimension: '结构和连贯性',
            score: Math.round(structureScore),
            maxScore: 20,
            comment: '段落组织合理，逻辑清晰'
          },
          {
            dimension: '表达多样性',
            score: Math.round(expressionScore),
            maxScore: 10,
            comment: '表达较为丰富，可进一步提升'
          }
        ],
        improvements: [
          '建议在写作中更自然地融入目标词汇',
          '注意段落之间的过渡和连接',
          '可以增加一些具体的例子来支持观点'
        ],
        usedTargetWords: usedTargetWords
      });
    }, 3000); // 模拟AI评分延迟
  });
};

class ExerciseService {
  // 获取练习状态 - 使用真实数据
  async getExerciseStatus(): Promise<ExerciseStatus> {
    try {
      // 使用真实数据服务获取练习状态
      const realStatus = await realDataService.getRealExerciseStatus();
      return realStatus;
    } catch (error) {
      console.error('获取练习状态失败:', error);
      // 返回默认状态而不是模拟数据
      return {
        read: 'not-started',
        listen: 'not-started',
        write: 'not-started'
      };
    }
  }

  // 获取学习进度 - 使用真实数据
  async getLearningProgress(): Promise<LearningProgress> {
    try {
      // 使用真实数据服务获取学习进度
      const realProgress = await realDataService.getRealLearningProgress();
      return realProgress;
    } catch (error) {
      console.error('获取学习进度失败:', error);
      // 返回默认空数据而不是模拟数据
      return {
        totalWords: 0,
        masteredWords: 0,
        todayLearned: 0,
        remainingExercises: 0,
        progressPercentage: 0
      };
    }
  }

  // 生成练习
  async generateExercise(type: ExerciseType): Promise<Exercise> {
    try {
      const response = await api.post('/exercise/generate', { type });
      return response.data;
    } catch (error) {
      console.error('生成练习失败:', error);
      throw new Error('生成练习失败，请稍后重试');
    }
  }

  // 提交练习答案
  async submitExercise(exerciseId: string, answers: Record<string, string>): Promise<any> {
    try {
      const response = await api.post(`/exercise/${exerciseId}/submit`, { answers });
      return response.data;
    } catch (error) {
      console.error('提交练习失败:', error);
      throw new Error('提交练习失败，请稍后重试');
    }
  }
}

export const exerciseService = new ExerciseService(); 