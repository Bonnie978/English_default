import api from './api';
import { WrongAnswerData } from '../components/wrong/WrongAnswerCard';

// 获取错题列表
export const getWrongAnswers = async (
  page: number = 1,
  limit: number = 20,
  type?: string
): Promise<{
  total: number;
  page: number;
  limit: number;
  wrongAnswers: WrongAnswerData[];
}> => {
  try {
    const params: any = { page, limit };
    if (type && type !== 'all') {
      params.type = type;
    }
    
    const response = await api.get('/exercises/wrong-answers', { params });
    return response.data;
  } catch (error) {
    console.error('获取错题列表失败:', error);
    throw error;
  }
};

// 标记错题为已复习
export const markWrongAsReviewed = async (wrongAnswerId: string) => {
  try {
    const response = await api.post(`/exercises/wrong-answers/${wrongAnswerId}/review`);
    return response.data;
  } catch (error) {
    console.error('标记错题失败:', error);
    throw error;
  }
};

// 模拟获取错题列表（开发阶段使用）
export const getMockWrongAnswers = (): Promise<{
  total: number;
  page: number;
  limit: number;
  wrongAnswers: WrongAnswerData[];
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: WrongAnswerData[] = [
        {
          id: '1',
          type: 'read',
          typeName: '阅读理解',
          question: 'What concerns does the passage mention about technology use?',
          correctAnswer: 'Sleep disturbances and reduced attention spans',
          userAnswer: 'Rising costs of devices',
          date: '2023-05-15',
          formattedDate: '2023年5月15日',
          reviewed: false,
          relatedWords: [
            { spelling: 'concerns' },
            { spelling: 'disturbances' },
            { spelling: 'attention' }
          ]
        },
        {
          id: '2',
          type: 'read',
          typeName: '阅读理解',
          question: 'According to the passage, what is essential as we navigate the digital age?',
          correctAnswer: 'Finding a balance and developing healthy digital habits',
          userAnswer: 'Focusing only on educational technology',
          date: '2023-05-15',
          formattedDate: '2023年5月15日',
          reviewed: false,
          relatedWords: [
            { spelling: 'essential' },
            { spelling: 'navigate' },
            { spelling: 'balance' }
          ]
        },
        {
          id: '3',
          type: 'listen',
          typeName: '听力理解',
          question: 'What does the speaker suggest about learning a new language?',
          correctAnswer: 'It requires consistent practice and immersion',
          userAnswer: 'It can be mastered in a few months with proper tools',
          date: '2023-05-12',
          formattedDate: '2023年5月12日',
          reviewed: true,
          relatedWords: [
            { spelling: 'consistent' },
            { spelling: 'immersion' },
            { spelling: 'mastered' }
          ]
        },
        {
          id: '4',
          type: 'write',
          typeName: '写作练习',
          question: 'Write a paragraph about the benefits of exercise using at least 3 of the target vocabulary words.',
          correctAnswer: 'N/A (Writing exercise)',
          userAnswer: 'Exercise offers numerous physical and mental advantages.',
          date: '2023-05-10',
          formattedDate: '2023年5月10日',
          reviewed: false,
          feedback: '使用目标词汇不足。缺少 \'beneficial\'、\'consistent\' 和 \'regime\' 这些目标词汇的使用。',
          relatedWords: [
            { spelling: 'beneficial' },
            { spelling: 'consistent' },
            { spelling: 'regime' }
          ]
        },
        {
          id: '5',
          type: 'listen',
          typeName: '听力理解',
          question: 'What is the main purpose of the presentation according to the introduction?',
          correctAnswer: 'To illustrate how technology has transformed modern workplaces',
          userAnswer: 'To compare different technological tools for productivity',
          date: '2023-05-08',
          formattedDate: '2023年5月8日',
          reviewed: true,
          relatedWords: [
            { spelling: 'illustrate' },
            { spelling: 'transformed' },
            { spelling: 'modern' }
          ]
        }
      ];

      resolve({
        total: mockData.length,
        page: 1,
        limit: 20,
        wrongAnswers: mockData
      });
    }, 1000);
  });
}; 