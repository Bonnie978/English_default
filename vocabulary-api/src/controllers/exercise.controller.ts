import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Exercise, WrongAnswer } from '../types/supabase';

// 创建练习
export const createExercise = async (req: Request, res: Response) => {
  try {
    const { exercise_type, word_ids, score, total_questions, correct_answers, time_spent } = req.body;
    const userId = req.user.id;

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert([{
        user_id: userId,
        exercise_type,
        word_ids,
        score,
        total_questions,
        correct_answers,
        time_spent
      }])
      .select()
      .single();

    if (error) {
      console.error('创建练习错误:', error);
      return res.status(500).json({
        success: false,
        message: '创建练习失败'
      });
    }

    res.status(201).json({
      success: true,
      exercise
    });
  } catch (error) {
    console.error('创建练习错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取用户练习历史
export const getUserExercises = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      console.error('获取练习历史错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取练习历史失败'
      });
    }

    res.status(200).json({
      success: true,
      exercises: exercises || []
    });
  } catch (error) {
    console.error('获取练习历史错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 记录错误答案
export const recordWrongAnswer = async (req: Request, res: Response) => {
  try {
    const { exercise_id, word_ids, exercise_type } = req.body;
    const userId = req.user.id;

    const { data: wrongAnswer, error } = await supabase
      .from('wrong_answers')
      .insert([{
        user_id: userId,
        exercise_id,
        word_ids,
        exercise_type
      }])
      .select()
      .single();

    if (error) {
      console.error('记录错误答案错误:', error);
      return res.status(500).json({
        success: false,
        message: '记录错误答案失败'
      });
    }

    res.status(201).json({
      success: true,
      wrongAnswer
    });
  } catch (error) {
    console.error('记录错误答案错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
};

// 获取用户错误答案
export const getUserWrongAnswers = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const { data: wrongAnswers, error } = await supabase
      .from('wrong_answers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取错误答案错误:', error);
      return res.status(500).json({
        success: false,
        message: '获取错误答案失败'
      });
    }

    res.status(200).json({
      success: true,
      wrongAnswers: wrongAnswers || []
    });
  } catch (error) {
    console.error('获取错误答案错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试'
    });
  }
}; 