const axios = require('axios');

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-a6844d61ab0542abb744366ddafc3668';

console.log('Smart Suggestions API启动，DeepSeek配置状态:', !!DEEPSEEK_API_KEY);

// 设置CORS头部
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// 生成本地智能建议作为备用
const generateLocalSuggestions = (learningData) => {
  const { correctRate, todayProgress, streakDays, totalWordsLearned } = learningData;
  const suggestions = [];

  if (correctRate < 60) {
    suggestions.push('建议放慢学习节奏，重点巩固基础词汇');
    suggestions.push('可以尝试间隔重复法，提高记忆效果');
  } else if (correctRate < 80) {
    suggestions.push('保持当前的学习节奏，稳步提升');
    suggestions.push('多复习错题，巩固薄弱环节');
  } else {
    suggestions.push('您的正确率很高，可以尝试挑战更难的词汇');
    suggestions.push('考虑增加每日学习量，加快学习进度');
  }
  
  if (todayProgress.learned === 0) {
    suggestions.push('今天还没开始学习，建议从简单的词汇开始');
  }
  
  if (streakDays === 0) {
    suggestions.push('坚持每天学习，养成良好的学习习惯');
  } else if (streakDays >= 7) {
    suggestions.push('连续学习习惯很棒，继续保持！');
  }

  if (totalWordsLearned < 100) {
    suggestions.push('建议先掌握基础高频词汇');
  }

  return suggestions.slice(0, 4); // 返回最多4条建议
};

// 调用DeepSeek API生成智能建议
const callDeepSeekAPI = async (learningData) => {
  try {
    const prompt = `作为英语学习助手，请根据以下学习数据生成3-4条个性化的学习建议：

学习数据：
- 总学习单词数：${learningData.totalWordsLearned}
- 掌握单词数：${learningData.masteredWords}
- 连续学习天数：${learningData.streakDays}
- 今日进度：${learningData.todayProgress.learned}/${learningData.todayProgress.total}
- 最近错误数：${learningData.recentMistakes}
- 正确率：${learningData.correctRate}%

请生成JSON格式的响应：
{
  "suggestions": ["建议1", "建议2", "建议3", "建议4"]
}

要求：
1. 建议要具体、可操作
2. 语言温暖、鼓励性
3. 根据数据情况给出针对性建议
4. 使用中文回复`;

    console.log('Smart Suggestions: 调用DeepSeek API...');

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 25000 // 25秒超时
    });

    console.log('Smart Suggestions: DeepSeek API响应状态:', response.status);

    if (response.data && response.data.choices && response.data.choices[0]) {
      let content = response.data.choices[0].message.content.trim();
      console.log('Smart Suggestions: DeepSeek原始回复:', content);

      // 尝试解析JSON（可能包装在markdown代码块中）
      try {
        // 移除可能的markdown代码块标记
        if (content.includes('```json')) {
          content = content.replace(/```json\n?/g, '').replace(/\n?```/g, '');
        } else if (content.includes('```')) {
          content = content.replace(/```\n?/g, '').replace(/\n?```/g, '');
        }

        const parsed = JSON.parse(content);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          console.log('Smart Suggestions: 成功解析AI建议:', parsed.suggestions);
          return {
            success: true,
            suggestions: parsed.suggestions,
            source: 'ai'
          };
        }
      } catch (parseError) {
        console.error('Smart Suggestions: JSON解析失败:', parseError);
        console.log('Smart Suggestions: 原始内容:', content);
      }
    }

    throw new Error('DeepSeek API响应格式异常');

  } catch (error) {
    console.error('Smart Suggestions: DeepSeek API调用失败:', error.message);
    if (error.response) {
      console.error('Smart Suggestions: API错误状态:', error.response.status);
      console.error('Smart Suggestions: API错误详情:', error.response.data);
    }
    throw error;
  }
};

// 主处理函数
module.exports = async (req, res) => {
  // 设置CORS头部
  setCORSHeaders(res);

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    console.log('Smart Suggestions: 处理OPTIONS预检请求');
    return res.status(200).end();
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    console.log('Smart Suggestions: 不支持的请求方法:', req.method);
    return res.status(405).json({
      success: false,
      message: '只支持POST请求'
    });
  }

  try {
    const { learningData } = req.body;

    // 验证输入数据
    if (!learningData) {
      return res.status(400).json({
        success: false,
        message: '缺少学习数据'
      });
    }

    console.log('Smart Suggestions: 接收到学习数据:', JSON.stringify(learningData, null, 2));

    let result;

    try {
      // 尝试调用DeepSeek API
      result = await callDeepSeekAPI(learningData);
      console.log('Smart Suggestions: AI建议生成成功');
    } catch (apiError) {
      console.log('Smart Suggestions: AI API失败，使用本地建议');
      // API失败时使用本地生成
      const localSuggestions = generateLocalSuggestions(learningData);
      result = {
        success: true,
        suggestions: localSuggestions,
        source: 'local'
      };
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Smart Suggestions: 服务器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
}; 