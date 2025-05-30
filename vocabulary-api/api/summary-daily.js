const axios = require('axios');

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-a6844d61ab0542abb744366ddafc3668';

console.log('API启动，DeepSeek配置状态:', !!DEEPSEEK_API_KEY);

// 生成今日总结的提示词模板
function generatePrompt(learningData) {
  const { totalWordsLearned, masteredWords, streakDays, todayProgress, recentMistakes, correctRate } = learningData;
  
  return `你是一个专业的英语学习助手，请根据用户的学习数据生成一份温暖、激励且实用的今日学习总结。

学习数据：
- 累计学习单词：${totalWordsLearned}个
- 已掌握单词：${masteredWords}个
- 连续学习天数：${streakDays}天
- 今日学习进度：${todayProgress.learned}/${todayProgress.total}个单词
- 近期错题数量：${recentMistakes}题
- 正确率：${correctRate}%

请以JSON格式回复，包含以下字段：
{
  "summary": "对今日学习情况的简洁总结（50-80字）",
  "encouragement": "根据学习情况的个性化激励内容（80-120字）",
  "suggestions": ["具体的学习建议1", "具体的学习建议2", "具体的学习建议3"],
  "achievement": "今日成就徽章描述（15字以内）",
  "nextGoal": "下一阶段学习目标（30字以内）"
}

要求：
1. 语言要温暖、正面、具有激励性
2. 建议要具体可执行
3. 根据实际数据个性化内容
4. 使用适当的emoji让内容更生动
5. 避免过于夸张的表达`;
}

// 生成备用总结内容
function generateFallbackSummary(learningData) {
  const { todayProgress, streakDays, correctRate, totalWordsLearned } = learningData;
  
  let summary = '';
  let encouragement = '';
  let achievement = '';
  let nextGoal = '';
  const suggestions = [];

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
    suggestions.push('可以开始学习词汇的高级用法和搭配');
  } else if (correctRate >= 70) {
    suggestions.push('保持当前的学习节奏，稳步提升');
    suggestions.push('多复习错题，巩固薄弱环节');
    suggestions.push('尝试在句子中运用新学的单词');
  } else {
    suggestions.push('建议多花时间复习之前学过的单词');
    suggestions.push('可以降低学习速度，重质量而非数量');
    suggestions.push('尝试使用联想记忆法来提高记忆效果');
  }

  // 设置下一个目标
  if (totalWordsLearned < 100) {
    nextGoal = '目标：累计学习100个单词 🎯';
  } else if (totalWordsLearned < 500) {
    nextGoal = '目标：累计学习500个单词 🎯';
  } else if (totalWordsLearned < 1000) {
    nextGoal = '目标：累计学习1000个单词 🎯';
  } else {
    nextGoal = '目标：保持学习习惯，持续提升 📈';
  }

  return {
    summary,
    encouragement,
    suggestions,
    achievement,
    nextGoal,
    isAIGenerated: false
  };
}

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: '只支持POST请求' 
    });
  }

  try {
    const { learningData } = req.body;

    if (!learningData) {
      return res.status(400).json({
        success: false,
        message: '缺少学习数据'
      });
    }

    // 验证必要的数据字段
    const requiredFields = ['totalWordsLearned', 'masteredWords', 'streakDays', 'todayProgress', 'correctRate'];
    for (const field of requiredFields) {
      if (learningData[field] === undefined) {
        console.log(`缺少必要字段: ${field}`);
        return res.status(400).json({
          success: false,
          message: `缺少必要字段: ${field}`
        });
      }
    }

    let summary;

    // 如果配置了DeepSeek API，尝试调用
    if (DEEPSEEK_API_KEY) {
      try {
        console.log('正在调用DeepSeek API生成总结...');
        console.log('API Key前缀:', DEEPSEEK_API_KEY.substring(0, 10) + '...');
        
        const prompt = generatePrompt(learningData);
        console.log('发送的提示词长度:', prompt.length);
        
        const response = await axios.post(DEEPSEEK_API_URL, {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }, {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 增加到30秒超时
        });

        console.log('DeepSeek API响应状态:', response.status);
        const aiResponse = response.data.choices[0].message.content;
        console.log('AI响应内容长度:', aiResponse.length);
        
        try {
          // 处理markdown格式的JSON响应
          let jsonContent = aiResponse;
          
          // 如果响应包含markdown代码块，提取JSON内容
          if (jsonContent.includes('```json')) {
            const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              jsonContent = jsonMatch[1].trim();
              console.log('从markdown代码块中提取JSON内容');
            }
          } else if (jsonContent.includes('```')) {
            // 处理普通代码块
            const codeMatch = jsonContent.match(/```\s*([\s\S]*?)\s*```/);
            if (codeMatch && codeMatch[1]) {
              jsonContent = codeMatch[1].trim();
              console.log('从代码块中提取JSON内容');
            }
          }
          
          // 尝试解析AI返回的JSON
          summary = JSON.parse(jsonContent);
          summary.isAIGenerated = true; // 标记为AI生成
          console.log('✅ DeepSeek API调用成功，使用AI生成的内容');
        } catch (parseError) {
          console.error('解析AI响应失败:', parseError.message);
          console.error('AI原始响应:', aiResponse);
          throw new Error('AI响应格式错误');
        }
        
      } catch (apiError) {
        console.error('❌ DeepSeek API调用失败:', apiError.message);
        if (apiError.response) {
          console.error('HTTP状态:', apiError.response.status);
          console.error('错误详情:', apiError.response.data);
        }
        if (apiError.code) {
          console.error('错误代码:', apiError.code);
        }
        // API调用失败时使用备用方案
        console.log('🔄 使用备用方案生成总结');
        summary = generateFallbackSummary(learningData);
      }
    } else {
      console.log('未配置DeepSeek API Key，使用备用方案');
      // 未配置API Key时使用备用方案
      summary = generateFallbackSummary(learningData);
    }

    return res.status(200).json({
      success: true,
      summary: summary,
      message: summary.isAIGenerated ? 'DeepSeek AI生成总结成功' : '今日总结生成成功'
    });

  } catch (error) {
    console.error('生成今日总结时发生错误:', error);
    
    // 发生错误时返回备用总结
    const fallbackSummary = generateFallbackSummary(req.body.learningData || {
      totalWordsLearned: 0,
      masteredWords: 0,
      streakDays: 0,
      todayProgress: { learned: 0, total: 10 },
      recentMistakes: 0,
      correctRate: 0
    });

    return res.status(200).json({
      success: true,
      summary: fallbackSummary,
      message: '使用备用方案生成总结'
    });
  }
}; 