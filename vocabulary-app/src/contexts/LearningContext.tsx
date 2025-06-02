import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../config/supabase';

interface Word {
  id: string;
  spelling: string;
  pronunciation: string;
  partOfSpeech: string;
  definitions: string[];
  examples: string[];
}

interface LearningSession {
  wordId: string;
  isCorrect: boolean;
  timeSpent?: number;
}

interface LearningContextType {
  dailyWords: Word[];
  loading: boolean;
  error: string | null;
  progress: {
    learned: number;
    total: number;
  };
  fetchDailyWords: () => Promise<void>;
  markWordAsMastered: (wordId: string) => Promise<void>;
  recordLearningSession: (words: LearningSession[]) => Promise<void>;
  syncProgress: () => Promise<void>;
  masteredWordIds: string[];
}

export const LearningContext = createContext<LearningContextType>({
  dailyWords: [],
  loading: false,
  error: null,
  progress: { learned: 0, total: 0 },
  fetchDailyWords: async () => {},
  markWordAsMastered: async () => {},
  recordLearningSession: async () => {},
  syncProgress: async () => {},
  masteredWordIds: []
});

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyWords, setDailyWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ learned: number; total: number }>({ learned: 0, total: 0 });
  const [masteredWordIds, setMasteredWordIds] = useState<string[]>([]);

  // 获取用户ID的辅助函数
  const getCurrentUserId = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id || null;
    } catch (error) {
      console.error('获取用户ID失败:', error);
      return null;
    }
  };

  // 检查并同步进度数据
  const syncProgress = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;

      console.log('同步进度数据...');
      
      // 重新获取用户进度数据
      const response = await api.get('/api/words-daily');
      if (response.data.success) {
        const stats = response.data.stats;
        const newProgress = {
          learned: stats.total_studied || 0,
          total: (stats.total_studied || 0) + (response.data.data?.length || 0)
        };
        
        console.log('同步后的进度:', newProgress);
        setProgress(newProgress);
        
        // 更新已掌握单词
        const mastered = response.data.data
          ?.filter((word: any) => word.mastered)
          ?.map((word: any) => word.id) || [];
        setMasteredWordIds(mastered);
      }
    } catch (error) {
      console.error('同步进度失败:', error);
    }
  }, []);

  // 获取每日单词 - 使用 useCallback 包装
  const fetchDailyWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 检查用户登录状态
      const userId = await getCurrentUserId();
      console.log('fetchDailyWords - 用户ID:', userId);
      
      if (!userId) {
        // 访客模式 - 设置空状态
        console.log('访客模式: 设置空的学习数据');
        setDailyWords([]);
        setProgress({ learned: 0, total: 0 });
        setMasteredWordIds([]);
        setError('请登录以保存学习进度');
        return;
      }
      
      const response = await api.get('/api/words-daily');
      console.log('API响应:', response.data);
      
      if (response.data.success) {
        setDailyWords(response.data.data);
        
        // 修改：从stats构建progress对象
        const stats = response.data.stats;
        const newProgress = {
          learned: stats.total_studied || 0,
          total: (stats.total_studied || 0) + (response.data.data?.length || 0)
        };
        console.log('设置新进度:', newProgress);
        setProgress(newProgress);
        
        // 获取已掌握的单词ID
        const mastered = response.data.data
          ?.filter((word: any) => word.mastered)
          ?.map((word: any) => word.id) || [];
        
        console.log('已掌握单词:', mastered.length);
        setMasteredWordIds(mastered);
      }
    } catch (err: any) {
      console.error('获取单词失败:', err);
      setError(err.response?.data?.message || '获取单词失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  // 记录学习会话 - 新增功能
  const recordLearningSession = useCallback(async (words: LearningSession[]) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.log('访客模式，无法保存学习记录');
        setError('请登录以保存学习进度');
        throw new Error('用户未登录');
      }

      console.log('开始记录学习会话:', { userId, wordCount: words.length });
      
      const response = await api.post(`/api/words-progress?userId=${userId}`, {
        words: words,
        sessionType: 'reading'
      });

      console.log('学习会话API响应:', response.data);

      if (response.data.success) {
        console.log('学习会话记录成功:', response.data.data);
        
        // 更新本地进度状态
        const sessionStats = response.data.data.session_stats;
        if (sessionStats) {
          setProgress(prev => {
            const newProgress = {
              learned: prev.learned + (sessionStats.correct_answers || 0),
              total: prev.total
            };
            console.log('更新本地进度:', prev, '->', newProgress);
            return newProgress;
          });
        }

        // 重新获取最新的学习数据以确保同步
        console.log('重新获取学习数据以确保同步');
        await fetchDailyWords();
        
        // 额外触发一次进度同步，确保数据一致性
        setTimeout(() => {
          syncProgress();
        }, 1000);
      } else {
        throw new Error(response.data.message || '记录学习进度失败');
      }
    } catch (err: any) {
      console.error('记录学习会话失败 - 详细错误:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || '记录学习进度失败';
      setError(errorMessage);
      throw err;
    }
  }, [fetchDailyWords]);

  // 标记单词为已掌握 - 使用 useCallback 包装
  const markWordAsMastered = useCallback(async (wordId: string) => {
    try {
      const response = await api.post(`/api/words/${wordId}/mastered`);
      
      // IMPORTANT: Re-sync local state with the actual server response
      // This corrects the optimistic update if the API call failed
      // or if the server state was different.
      if (response.data.success) {
        const serverMastered = response.data.mastered;
        
        if (serverMastered) {
          // Server says mastered, local was not -> Add to local
          setMasteredWordIds(prev => [...prev, wordId]);
          setProgress(prev => ({ ...prev, learned: prev.learned + 1 }));
        } else {
          // Server says not mastered, local was -> Remove from local
          setMasteredWordIds(prev => prev.filter(id => id !== wordId));
          setProgress(prev => ({ 
            ...prev, 
            learned: Math.max(0, prev.learned - 1) 
          }));
        }
      } else {
          // API call failed (but didn't throw an error? unlikely with axios defaults)
          // Rollback optimistic update if implemented
          throw new Error(response.data.message || '服务器响应失败');
      }

    } catch (err: any) {
      console.error("Mark mastered API error:", err);
      setError(err.response?.data?.message || '操作失败，请重试');
      
      // Rollback Optimistic UI Update if implemented
      // if (isLocallyMastered) { // If it failed, revert to mastered
      //   setMasteredWordIds(prev => [...prev, wordId]);
      //   setProgress(prev => ({ ...prev, learned: prev.learned + 1 }));
      // } else { // If it failed, revert to not mastered
      //   setMasteredWordIds(prev => prev.filter(id => id !== wordId));
      //   setProgress(prev => ({ ...prev, learned: Math.max(0, prev.learned - 1) }));
      // }

      throw err; // Re-throw error so the calling component knows it failed
    }
  }, []);

  useEffect(() => {
    const handleAuthStateChange = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        await syncProgress();
      } else {
        setDailyWords([]);
        setProgress({ learned: 0, total: 0 });
        setMasteredWordIds([]);
        setError('请登录以保存学习进度');
      }
    };

    handleAuthStateChange();

    const unsubscribe = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await handleAuthStateChange();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [syncProgress]);

  return (
    <LearningContext.Provider
      value={{
        dailyWords,
        loading,
        error,
        progress,
        fetchDailyWords,
        markWordAsMastered,
        recordLearningSession,
        syncProgress,
        masteredWordIds
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}; 