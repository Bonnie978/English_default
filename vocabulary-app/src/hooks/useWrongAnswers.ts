import { useState, useEffect, useCallback } from 'react';
import { WrongAnswerData } from '../components/wrong/WrongAnswerCard';
import { getWrongAnswers, markWrongAsReviewed } from '../services/wrongAnswerService';

export const useWrongAnswers = () => {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取错题列表
  const fetchWrongAnswers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWrongAnswers(1, 100, 'all'); // 获取所有错题
      setWrongAnswers(data.wrongAnswers);
    } catch (err: any) {
      setError(err.message || '获取错题列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 标记为已复习
  const markAsReviewed = useCallback(async (id: string) => {
    try {
      await markWrongAsReviewed(id);
      
      // 更新本地状态
      setWrongAnswers(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, reviewed: true } 
            : item
        )
      );
      
      return true;
    } catch (error) {
      console.error('标记为已复习失败:', error);
      return false;
    }
  }, []);

  // 删除错题（如果需要的话）
  const removeWrongAnswer = useCallback((id: string) => {
    setWrongAnswers(prev => prev.filter(item => item.id !== id));
  }, []);

  // 重新获取错题列表
  const refreshWrongAnswers = useCallback(() => {
    fetchWrongAnswers();
  }, [fetchWrongAnswers]);

  useEffect(() => {
    fetchWrongAnswers();
  }, [fetchWrongAnswers]);

  return {
    wrongAnswers,
    loading,
    error,
    markAsReviewed,
    removeWrongAnswer,
    refreshWrongAnswers
  };
}; 