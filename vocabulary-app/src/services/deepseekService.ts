import api from './api';

interface LearningData {
  totalWordsLearned: number;
  masteredWords: number;
  streakDays: number;
  todayProgress: {
    learned: number;
    total: number;
  };
  recentMistakes: number;
  correctRate: number;
}

interface DailySummary {
  summary: string;
  encouragement: string;
  suggestions: string[];
  achievement: string;
  nextGoal: string;
}

class DeepSeekService {
  private baseUrl = process.env.REACT_APP_API_URL || '';

  /**
   * 获取今日学习总结
   */
  async getDailySummary(learningData: LearningData): Promise<DailySummary> {
    try {
      const response = await api.post('/api/summary-daily', { learningData });
      return response.data.summary;
    } catch (error) {
      console.error('Error getting daily summary:', error);
      // 返回默认的总结内容
      return this.generateFallbackSummary(learningData);
    }
  }

  /**
   * 生成备用总结内容（当API调用失败时使用）
   */
  private generateFallbackSummary(learningData: LearningData): DailySummary {
    const { todayProgress, streakDays, correctRate, totalWordsLearned } = learningData;
    
    let summary = '';
    let encouragement = '';
    let achievement = '';
    let nextGoal = '';
    const suggestions: string[] = [];

    // 基于学习进度生成总结
    if (todayProgress.learned >= todayProgress.total) {
      summary = `🎉 恭喜！您今天完成了全部 ${todayProgress.total} 个单词的学习任务，表现出色！`;
      encouragement = '您的坚持和努力真的让人敬佩！保持这种学习节奏，您一定能达到更高的英语水平。';
      achievement = '✨ 今日学习目标达成';
    } else if (todayProgress.learned > todayProgress.total * 0.7) {
      summary = `👍 您今天学习了 ${todayProgress.learned} 个单词，完成了大部分学习任务，非常不错！`;
      encouragement = '您已经很接近今天的目标了，再加把劲就能完成全部任务！';
      achievement = '🌟 今日进步显著';
    } else if (todayProgress.learned > 0) {
      summary = `💪 您今天学习了 ${todayProgress.learned} 个单词，虽然距离目标还有距离，但每一步都是进步！`;
      encouragement = '学习是一个循序渐进的过程，不要着急，继续努力！';
      achievement = '🚀 开始学习之旅';
    } else {
      summary = '📚 今天还没有开始学习，新的一天充满了无限可能！';
      encouragement = '每一个伟大的成就都始于第一步，现在就开始您的学习之旅吧！';
      achievement = '🌅 新的开始';
    }

    // 基于连续天数生成激励
    if (streakDays >= 30) {
      encouragement += ` 您已经连续学习 ${streakDays} 天了，这种毅力真的令人钦佩！`;
    } else if (streakDays >= 7) {
      encouragement += ` 连续 ${streakDays} 天的学习，您的坚持值得称赞！`;
    }

    // 基于正确率生成建议
    if (correctRate >= 90) {
      suggestions.push('您的正确率很高，可以尝试挑战更难的词汇');
      suggestions.push('考虑增加每日学习量，加快学习进度');
    } else if (correctRate >= 70) {
      suggestions.push('保持当前的学习节奏，稳步提升');
      suggestions.push('多复习错题，巩固薄弱环节');
    } else {
      suggestions.push('建议多花时间复习之前学过的单词');
      suggestions.push('可以降低学习速度，重质量而非数量');
      suggestions.push('尝试使用联想记忆法来提高记忆效果');
    }

    // 设置下一个目标
    if (totalWordsLearned < 100) {
      nextGoal = '目标：累计学习100个单词';
    } else if (totalWordsLearned < 500) {
      nextGoal = '目标：累计学习500个单词';
    } else if (totalWordsLearned < 1000) {
      nextGoal = '目标：累计学习1000个单词';
    } else {
      nextGoal = '目标：保持学习习惯，持续提升';
    }

    return {
      summary,
      encouragement,
      suggestions,
      achievement,
      nextGoal
    };
  }

  /**
   * 获取智能学习建议
   */
  async getSmartSuggestions(learningData: LearningData): Promise<string[]> {
    try {
      const response = await api.post('/api/summary-suggestions', { learningData });
      return response.data.suggestions;
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      return this.generateFallbackSuggestions(learningData);
    }
  }

  private generateFallbackSuggestions(learningData: LearningData): string[] {
    const suggestions = [];
    const { correctRate, todayProgress, streakDays } = learningData;

    if (correctRate < 60) {
      suggestions.push('建议放慢学习节奏，重点巩固基础词汇');
    }
    
    if (todayProgress.learned === 0) {
      suggestions.push('今天还没开始学习，建议从简单的词汇开始');
    }
    
    if (streakDays === 0) {
      suggestions.push('坚持每天学习，养成良好的学习习惯');
    }

    return suggestions;
  }
}

const deepSeekService = new DeepSeekService();
export default deepSeekService; 