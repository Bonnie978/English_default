import { realDataService } from './realDataService';
import { WrongAnswerData } from '../components/wrong/WrongAnswerCard';

// 获取错题列表 - 使用真实数据
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
    // 直接使用真实数据服务
    const result = await realDataService.getRealWrongAnswers(page, limit, type);
    return result;
  } catch (error) {
    console.error('获取错题列表失败:', error);
    // 返回空数据而不是模拟数据
    return {
      total: 0,
      page: 1,
      limit: 20,
      wrongAnswers: []
    };
  }
};

// 标记错题为已复习 - 使用真实数据
export const markWrongAsReviewed = async (wrongAnswerId: string) => {
  try {
    await realDataService.markWrongAsReviewed(wrongAnswerId);
    return { success: true };
  } catch (error) {
    console.error('标记错题失败:', error);
    throw error;
  }
}; 