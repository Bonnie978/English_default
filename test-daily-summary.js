const axios = require('axios');

// 测试数据
const testLearningData = {
  totalWordsLearned: 150,
  masteredWords: 80,
  streakDays: 7,
  todayProgress: {
    learned: 8,
    total: 10
  },
  recentMistakes: 3,
  correctRate: 85
};

async function checkServerConnection() {
  try {
    console.log('🔍 检查服务器连接...');
    const response = await axios.get('http://localhost:3001/api/hello', {
      timeout: 5000
    });
    console.log('✅ 服务器连接正常:', response.status);
    return true;
  } catch (error) {
    console.error('❌ 服务器连接失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 请确保后端服务器正在运行: cd vocabulary-api && npm run dev');
    }
    return false;
  }
}

async function testDailySummaryAPI() {
  try {
    console.log('🧪 测试今日总结API...');
    console.log('测试数据:', JSON.stringify(testLearningData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/summary/daily', {
      learningData: testLearningData
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('\n✅ API调用成功!');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.summary) {
      const summary = response.data.summary;
      console.log('\n📊 生成的总结内容:');
      console.log('🏆 成就:', summary.achievement);
      console.log('📝 总结:', summary.summary);
      console.log('💪 激励:', summary.encouragement);
      console.log('💡 建议:', summary.suggestions.join(', '));
      console.log('🎯 下一目标:', summary.nextGoal);
    }
    
  } catch (error) {
    console.error('❌ API调用失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 请确保后端服务器正在运行: cd vocabulary-api && npm run dev');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 DNS解析失败，请检查URL是否正确');
    }
  }
}

// 运行测试
async function runTests() {
  const serverConnected = await checkServerConnection();
  if (serverConnected) {
    await testDailySummaryAPI();
  }
}

runTests(); 