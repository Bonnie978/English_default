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

async function testDeepSeekAPI() {
  console.log('🤖 测试DeepSeek AI集成...\n');
  
  try {
    console.log('📋 发送的学习数据:');
    console.log(JSON.stringify(testLearningData, null, 2));
    console.log('\n⏳ 正在调用DeepSeek API生成智能总结...');
    console.log('   (这可能需要5-15秒，请耐心等待)\n');
    
    const startTime = Date.now();
    
    const response = await axios.post('http://localhost:3001/api/summary/daily', {
      learningData: testLearningData
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30秒超时
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ API调用成功! (耗时: ${duration}秒)`);
    console.log(`📊 响应状态: ${response.status}`);
    
    if (response.data.success && response.data.summary) {
      const summary = response.data.summary;
      
      console.log('\n🎯 DeepSeek AI生成的智能总结:');
      console.log('═'.repeat(50));
      console.log(`🏆 成就徽章: ${summary.achievement}`);
      console.log(`📝 学习总结: ${summary.summary}`);
      console.log(`💪 激励内容: ${summary.encouragement}`);
      console.log(`🎯 下一目标: ${summary.nextGoal}`);
      
      console.log('\n💡 智能建议:');
      summary.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
      
      console.log('\n🔍 响应详情:');
      console.log(`   消息: ${response.data.message}`);
      console.log(`   数据源: ${response.data.message.includes('DeepSeek') ? 'DeepSeek AI' : '本地生成'}`);
      
    } else {
      console.log('❌ 响应格式异常:', response.data);
    }
    
  } catch (error) {
    console.error('\n❌ API调用失败:');
    
    if (error.code === 'ECONNABORTED') {
      console.error('   原因: 请求超时 (>30秒)');
      console.error('   建议: 检查网络连接或DeepSeek API服务状态');
    } else if (error.response) {
      console.error(`   HTTP状态: ${error.response.status}`);
      console.error(`   错误信息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   原因: 无法连接到后端服务器');
      console.error('   建议: 请确保后端服务器正在运行');
    } else {
      console.error(`   错误: ${error.message}`);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 启动DeepSeek API测试\n');
  
  // 首先检查服务器状态
  try {
    console.log('🔍 检查服务器状态...');
    const healthResponse = await axios.get('http://localhost:3001/api/hello', { timeout: 5000 });
    console.log(`✅ 服务器运行正常`);
    console.log(`📅 服务器时间: ${healthResponse.data.timestamp}`);
    console.log(`🔑 DeepSeek配置: ${healthResponse.data.deepseekConfigured ? '✅ 已配置' : '❌ 未配置'}`);
    
    if (!healthResponse.data.deepseekConfigured) {
      console.log('\n⚠️  警告: DeepSeek API Key未配置，将使用本地生成的内容');
    }
    
    console.log('\n' + '─'.repeat(50));
    
    await testDeepSeekAPI();
    
  } catch (error) {
    console.error('❌ 服务器连接失败:', error.message);
    console.error('💡 请确保服务器正在运行: cd vocabulary-api && node test-server.js');
    return;
  }
}

// 运行测试
main().catch(console.error); 