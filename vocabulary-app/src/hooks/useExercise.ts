import { useState, useCallback } from 'react';
import { generateExercise } from '../services/exerciseService';
import { useLearning } from './useLearning';

export interface Exercise {
  id: string;
  type: 'read' | 'listen' | 'write';
  content?: string;
  audioUrl?: string;
  questions?: Array<{
    id: string;
    question: string;
    type: 'multiple-choice' | 'fill-blank';
    options?: string[];
  }>;
  // 写作练习特有属性
  prompt?: {
    topic: string;
    requirements: string;
    wordCount: string;
    instructions: string;
  };
  targetWords?: string[];
  requirements?: {
    minWords: number;
    maxWords: number;
    minTargetWords: number;
  };
}

export const useExercise = () => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { dailyWords } = useLearning();

  // 生成练习
  const generateNewExercise = useCallback(async (type: 'read' | 'listen' | 'write') => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取今日单词的ID
      const wordIds = dailyWords.map(word => word.id);
      
      // 如果没有今日单词，使用模拟数据或直接生成练习
      if (wordIds.length === 0) {
        console.log('没有今日单词，使用模拟练习');
        // 对于阅读理解和听力理解，我们可以直接生成练习而不依赖特定单词
        if (type === 'read' || type === 'listen') {
          const response = await generateExercise(type, ['mock-word-1', 'mock-word-2']);
          if (response.success) {
            setExercise(response.exercise);
            setAnswers({});
          } else {
            throw new Error(response.message || '生成练习失败');
          }
          return;
        } else {
          throw new Error('请先完成单词学习，然后再进行练习');
        }
      }
      
      const response = await generateExercise(type, wordIds);
      
      if (response.success) {
        setExercise(response.exercise);
        setAnswers({});
      } else {
        throw new Error(response.message || '生成练习失败');
      }
    } catch (err: any) {
      setError(err.message || '生成练习时发生错误');
      console.error('生成练习错误:', err);
    } finally {
      setLoading(false);
    }
  }, [dailyWords]);

  // 更新答案
  const updateAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  // 提交答案
  const submitAnswers = useCallback(async () => {
    if (!exercise) return null;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // 这里应该调用API提交答案
      // const response = await api.post(`/exercises/${exercise.id}/submit`, {
      //   answers: exercise.questions.map(question => ({
      //     questionId: question.id,
      //     answer: answers[question.id] || ''
      //   }))
      // });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟返回结果
      return {
        success: true,
        score: 85,
        feedback: '做得很好！你对这些单词的理解相当不错。',
        results: exercise.questions?.map((question, index) => ({
          questionId: question.id,
          isCorrect: Math.random() > 0.3, // 随机结果，实际应该来自后端
          correctAnswer: question.options?.[0] || '示例答案',
          explanation: `这是第${index + 1}题的解释。`
        })) || []
      };
    } catch (err: any) {
      setError(err.message || '提交答案时发生错误');
      console.error('提交答案错误:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [exercise, answers]);

  // 检查是否所有问题都已回答
  const isAllAnswered = useCallback(() => {
    if (!exercise) return false;
    return exercise.questions?.every(question => 
      answers[question.id] && answers[question.id].trim() !== ''
    ) || false;
  }, [exercise, answers]);

  return {
    exercise,
    answers,
    loading,
    submitting,
    error,
    generateNewExercise,
    updateAnswer,
    submitAnswers,
    isAllAnswered
  };
}; 