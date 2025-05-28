module.exports = async function handler(req, res) {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 检查认证头
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未授权访问，请登录'
      });
    }

    // 返回模拟数据
    res.status(200).json({
      success: true,
      stats: {
        totalWordsLearned: 25,
        masteredWords: 18,
        streakDays: 5,
        totalExercises: 42,
        masteryRate: 72
      },
      debug: {
        message: '使用模拟数据',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请稍后再试',
      debug: {
        error: error.message
      }
    });
  }
}; 