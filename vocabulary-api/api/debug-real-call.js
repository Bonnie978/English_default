import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userId = req.query.userId;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 获取真实的word ID
    const { data: wordsData, error: wordsError } = await supabase
      .from('words')
      .select('id')
      .limit(2);
    
    if (wordsError || !wordsData || wordsData.length === 0) {
      return res.status(400).json({
        error: '无法获取测试用的word ID',
        details: wordsError?.message
      });
    }
    
    // 使用真实的word ID构建学习会话数据
    const mockLearningSession = wordsData.map((word, index) => ({
      wordId: word.id,
      isCorrect: index === 0, // 第一个正确，第二个错误
      timeSpent: 60 + index * 15
    }));

    console.log('模拟前端调用 words-progress API');
    console.log('用户ID:', userId);
    console.log('发送数据:', mockLearningSession);

    // 调用真实的 words-progress API
    const response = await fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/words-progress?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        words: mockLearningSession,
        sessionType: 'reading'
      })
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawResponse: responseText };
    }

    return res.status(200).json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseData,
      mockData: {
        userId,
        sentWords: mockLearningSession
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
} 