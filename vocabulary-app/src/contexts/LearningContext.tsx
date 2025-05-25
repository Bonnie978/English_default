import React, { createContext, useState, useCallback } from 'react';
import api from '../services/api';

interface Word {
  id: string;
  spelling: string;
  pronunciation: string;
  partOfSpeech: string;
  definitions: string[];
  examples: string[];
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
  masteredWordIds: string[];
}

export const LearningContext = createContext<LearningContextType>({
  dailyWords: [],
  loading: false,
  error: null,
  progress: { learned: 0, total: 0 },
  fetchDailyWords: async () => {},
  markWordAsMastered: async () => {},
  masteredWordIds: []
});

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyWords, setDailyWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ learned: number; total: number }>({ learned: 0, total: 0 });
  const [masteredWordIds, setMasteredWordIds] = useState<string[]>([]);

  // 获取每日单词 - 使用 useCallback 包装
  const fetchDailyWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/words/daily');
      
      if (response.data.success) {
        setDailyWords(response.data.words);
        setProgress(response.data.progress);
        
        // 获取已掌握的单词ID
        const mastered = response.data.words
          .filter((word: any, index: number) => {
            return word.mastered || (index < response.data.progress.learned);
          })
          .map((word: any) => word.id);
        
        setMasteredWordIds(mastered);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '获取单词失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []); // 空依赖数组，因为 fetchDailyWords 不依赖于 Provider 内部的其他 state 或 props

  // 标记单词为已掌握/未掌握 - 也应该用 useCallback 包装
  const markWordAsMastered = useCallback(async (wordId: string) => {
    // Check if word is currently in the local mastered list
    const isLocallyMastered = masteredWordIds.includes(wordId);
    
    try {
      setError(null);
      
      // Call the API
      const response = await api.post(`/words/${wordId}/mastered`);
      
      // IMPORTANT: Re-sync local state with the actual server response
      // This corrects the optimistic update if the API call failed
      // or if the server state was different.
      if (response.data.success) {
        const serverMastered = response.data.mastered;
        
        if (serverMastered && !isLocallyMastered) {
          // Server says mastered, local was not -> Add to local
          setMasteredWordIds(prev => [...prev, wordId]);
          setProgress(prev => ({ ...prev, learned: prev.learned + 1 }));
        } else if (!serverMastered && isLocallyMastered) {
          // Server says not mastered, local was -> Remove from local
          setMasteredWordIds(prev => prev.filter(id => id !== wordId));
          setProgress(prev => ({ 
            ...prev, 
            learned: Math.max(0, prev.learned - 1) 
          }));
        } else {
          // Local state already matched server state, or an unexpected case.
          // May need to refresh progress count based on server if needed.
          // Example: fetch updated progress if counts don't match?
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
  }, [masteredWordIds]);

  return (
    <LearningContext.Provider
      value={{
        dailyWords,
        loading,
        error,
        progress,
        fetchDailyWords,
        markWordAsMastered,
        masteredWordIds
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}; 