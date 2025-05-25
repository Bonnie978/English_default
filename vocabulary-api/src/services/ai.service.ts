import axios from 'axios';
import { redisClient } from '../config/redis';
import { config } from '../config/env';
import { ReadingExerciseResult, WritingExerciseResult } from '../types';

// DeepSeek API服务
class AIService {
  private apiKey: string;
  private baseURL: string;
  private cacheEnabled: boolean;
  private cacheExpiration: number; // 缓存过期时间（秒）

  constructor() {
    this.apiKey = config.DEEPSEEK_API_KEY;
    this.baseURL = config.DEEPSEEK_API_URL;
    this.cacheEnabled = true; // 默认启用缓存
    this.cacheExpiration = 24 * 60 * 60; // 默认24小时
  }

  // 生成内容的通用方法
  async generateContent(
    systemPrompt: string,
    userPrompt: string,
    options: any = {}
  ) {
    try {
      // 生成缓存键
      const cacheKey = `ai:${this.hashString(systemPrompt + userPrompt)}`;

      // 检查缓存
      if (this.cacheEnabled) {
        const cachedContent = await redisClient.get(cacheKey);
        if (cachedContent) {
          console.log('使用缓存的AI响应');
          return JSON.parse(cachedContent);
        }
      }

      // 默认参数
      const defaultOptions = {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };

      // 合并选项
      const requestOptions = {
        ...defaultOptions,
        ...options,
      };

      // 调用DeepSeek API
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          ...requestOptions,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const result = {
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model,
      };

      // 缓存结果
      if (this.cacheEnabled) {
        await redisClient.set(
          cacheKey,
          JSON.stringify(result),
          { EX: this.cacheExpiration }
        );
      }

      return result;
    } catch (error: any) {
      console.error('AI内容生成错误:', error);
      throw new Error(`AI内容生成失败: ${error.message}`);
    }
  }

  // 生成阅读练习
  async generateReadingExercise(words: string[], difficulty: string = 'intermediate'): Promise<ReadingExerciseResult> {
    const systemPrompt = `你是一个专业的英语教师，需要根据给定的单词创建一篇短文和相关问题。难度级别: ${difficulty}`;
    const userPrompt = `请根据以下单词创建一篇200字左右的短文，并提供3-5个相关问题，请确保问题多样化（包含单选、多选或填空题）。每个问题都必须包含正确答案，如果是选择题，请明确标注正确选项: ${words.join(', ')}`;

    const result = await this.generateContent(systemPrompt, userPrompt, {
      temperature: 0.7,
    });

    return this.parseReadingResponse(result.content);
  }

  // 生成听力练习
  async generateListeningExercise(words: string[], difficulty: string = 'intermediate'): Promise<ReadingExerciseResult> {
    const systemPrompt = `你是一个专业的英语教师，需要创建适合听力练习的对话或短文。难度级别: ${difficulty}`;
    const userPrompt = `请根据以下单词创建一段60-90秒的对话或短文，适合作为英语听力材料，并提供3-5个相关问题。每个问题都必须包含正确答案，如果是选择题，请明确标注正确选项: ${words.join(', ')}`;

    const result = await this.generateContent(systemPrompt, userPrompt, {
      temperature: 0.7,
    });

    return this.parseListeningResponse(result.content);
  }

  // 生成写作练习
  async generateWritingExercise(words: string[], difficulty: string = 'intermediate'): Promise<WritingExerciseResult> {
    const systemPrompt = `你是一个专业的英语写作教师，需要创建写作提示。难度级别: ${difficulty}`;
    const userPrompt = `请根据以下单词创建一个写作提示，要求学生在写作中使用这些单词。提供明确的写作要求，包括主题、长度和结构建议: ${words.join(', ')}`;

    const result = await this.generateContent(systemPrompt, userPrompt, {
      temperature: 0.7,
    });

    return this.parseWritingPrompt(result.content);
  }

  // 评估写作练习
  async evaluateWriting(prompt: string, expectedWords: string[], userAnswer: string) {
    const systemPrompt = `你是一个专业的英语写作评分系统，需要评估学生的写作并提供详细反馈。`;
    const userPrompt = `
      写作提示: ${prompt}
      期望使用的单词: ${expectedWords.join(', ')}
      学生的答案: ${userAnswer}
      
      请评估学生的写作并提供详细反馈。评分维度:
      1. 内容相关性 (20分)
      2. 单词使用情况 (30分) - 特别关注学生是否正确使用了期望的单词
      3. 语法和拼写 (20分)
      4. 结构和连贯性 (20分)
      5. 表达和词汇多样性 (10分)
      
      请给出总分(0-100)，并针对每个维度提供具体评价和改进建议。
    `;

    const result = await this.generateContent(systemPrompt, userPrompt, {
      temperature: 0.3,
      max_tokens: 800,
    });

    return this.parseEvaluationResponse(result.content);
  }

  // 解析阅读材料响应
  private parseReadingResponse(content: string): ReadingExerciseResult {
    try {
      // 分离文章和问题
      const articleMatch = content.match(/(.+?)(?=问题|Questions:|Questions：|Questions)/s);
      const questionsMatch = content.match(/(?:问题|Questions:|Questions：|Questions)(.+)$/s);
      
      const article = articleMatch ? articleMatch[1].trim() : content;
      let questionsText = questionsMatch ? questionsMatch[1].trim() : '';
      
      // 解析问题
      const questions = this.extractQuestions(questionsText);
      
      return {
        article,
        questions
      };
    } catch (error) {
      console.error('解析阅读响应错误:', error);
      return {
        article: content,
        questions: []
      };
    }
  }

  // 解析听力材料响应（结构与阅读类似）
  private parseListeningResponse(content: string): ReadingExerciseResult {
    return this.parseReadingResponse(content);
  }

  // 解析写作提示响应
  private parseWritingPrompt(content: string): WritingExerciseResult {
    try {
      // 提取主题、要求和建议
      const topicMatch = content.match(/主题[：:](.*?)(?=要求|要点|Guidelines|$)/is);
      const requirementsMatch = content.match(/要求[：:](.*?)(?=建议|提示|Tips|$)/is);
      const tipsMatch = content.match(/(?:建议|提示)[：:](.*?)$/is);
      
      return {
        prompt: content,
        topic: topicMatch ? topicMatch[1].trim() : '',
        requirements: requirementsMatch ? requirementsMatch[1].trim() : '',
        tips: tipsMatch ? tipsMatch[1].trim() : ''
      };
    } catch (error) {
      console.error('解析写作提示错误:', error);
      return {
        prompt: content,
        topic: '',
        requirements: '',
        tips: ''
      };
    }
  }

  // 解析评分响应
  private parseEvaluationResponse(content: string) {
    try {
      // 提取总分
      const scoreMatch = content.match(/总分[:：]?\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      
      // 解析每个维度的评分和反馈
      const dimensions = [
        { name: '内容相关性', regex: /内容相关性[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i },
        { name: '单词使用情况', regex: /单词使用情况[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i },
        { name: '语法和拼写', regex: /语法和拼写[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i },
        { name: '结构和连贯性', regex: /结构和连贯性[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i },
        { name: '表达和词汇多样性', regex: /表达和词汇多样性[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i }
      ];
      
      const detailedFeedback = dimensions.map(dim => {
        const match = content.match(dim.regex);
        return {
          dimension: dim.name,
          score: match ? parseInt(match[1]) : null,
          feedback: match ? match[2].trim() : null
        };
      }).filter(item => item.score !== null);
      
      // 提取总体改进建议
      const suggestionsMatch = content.match(/改进建议[：:]([\s\S]+?)(?=\d+\.|$)/i);
      const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : '';
      
      return {
        score,
        detailedFeedback,
        suggestions,
        rawFeedback: content
      };
    } catch (error) {
      console.error('解析评分响应错误:', error);
      return {
        score: 0,
        detailedFeedback: [],
        suggestions: '',
        rawFeedback: content
      };
    }
  }

  // 从文本中提取问题
  private extractQuestions(text: string) {
    if (!text) return [];
    
    // 匹配问题模式
    const questionPattern = /(\d+)[\.、]\s*([^\n]+)(?:\n((?:[A-D]\.[\s\S]+?(?=\n[A-D]\.|\n\d+\.|\n$|$))+))?/g;
    const questions = [];
    let match;
    
    while ((match = questionPattern.exec(text)) !== null) {
      const questionText = match[2].trim();
      const options = match[3] ? this.extractOptions(match[3]) : [];
      
      // 确定问题类型
      const questionType = options.length > 0 ? 'multiple-choice' : 'fill-blank';
      
      // 找出正确答案
      let correctAnswer = '';
      if (questionType === 'multiple-choice') {
        const correctOption = options.find(o => o.isCorrect);
        correctAnswer = correctOption ? correctOption.text : '';
      } else {
        // 为填空题尝试从文本中提取答案
        const answerMatch = text.match(new RegExp(`${questionText.replace(/\?/, '\\?')}[^]*?答案[:：]\\s*(.+?)(?=\\n|$)`, 'i'));
        correctAnswer = answerMatch ? answerMatch[1].trim() : '';
      }
      
      questions.push({
        question: questionText,
        type: questionType,
        options: options.map(o => o.text),
        correctAnswer
      });
    }
    
    return questions;
  }

  // 从文本中提取选项
  private extractOptions(text: string) {
    const optionPattern = /([A-D])\.?\s*([^\n]+)/g;
    const options = [];
    let match;
    
    // 找出选项
    while ((match = optionPattern.exec(text)) !== null) {
      options.push({
        key: match[1],
        text: match[2].trim(),
        isCorrect: false
      });
    }
    
    // 找出正确答案标记
    const correctAnswerMatch = text.match(/正确答案[:：]?\s*([A-D])/i) || 
                              text.match(/答案[:：]?\s*([A-D])/i);
    
    if (correctAnswerMatch) {
      const correctKey = correctAnswerMatch[1];
      const correctOption = options.find(o => o.key === correctKey);
      if (correctOption) {
        correctOption.isCorrect = true;
      }
    }
    
    return options;
  }

  // 简单的字符串哈希函数，用于缓存键
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(36); // 转换为基数为36的字符串
  }
}

export const aiService = new AIService(); 