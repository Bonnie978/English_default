require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 测试用户ID
const TEST_USER_ID = 'test-user-' + Date.now();

/**
 * 创建测试用户学习数据
 */
async function createTestUserData() {
  console.log('🧪 创建测试用户学习数据...');
  
  // 获取一些单词用于测试
  const { data: words } = await supabase
    .from('words')
    .select('*')
    .limit(50);
  
  if (!words || words.length === 0) {
    throw new Error('没有找到单词数据');
  }
  
  const testProgress = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const word = words[i];
    const daysAgo = Math.floor(Math.random() * 30); // 随机0-30天前学习
    const masteryLevel = Math.floor(Math.random() * 6); // 随机掌握级别0-5
    const correctCount = Math.floor(Math.random() * 10) + 1;
    const incorrectCount = Math.floor(Math.random() * 5);
    
    const lastStudied = new Date(now);
    lastStudied.setDate(now.getDate() - daysAgo);
    
    testProgress.push({
      user_id: TEST_USER_ID,
      word_id: word.id,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      mastery_level: masteryLevel,
      last_studied: lastStudied.toISOString(),
      study_streak: Math.floor(Math.random() * 5),
      is_difficult: Math.random() > 0.7,
      created_at: lastStudied.toISOString(),
      updated_at: now.toISOString()
    });
  }
  
  // 插入测试数据
  const { error } = await supabase
    .from('user_progress')
    .insert(testProgress);
  
  if (error) throw error;
  
  console.log(`✅ 成功创建 ${testProgress.length} 条测试学习记录`);
  return testProgress;
}

/**
 * 测试智能推荐API
 */
async function testSmartRecommendation() {
  console.log('\n🤖 测试智能推荐算法...');
  
  try {
    // 模拟API调用
    const response = await fetch(`http://localhost:3001/api/words-daily?userId=${TEST_USER_ID}&limit=20`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`API错误: ${result.error}`);
    }
    
    console.log('📊 推荐结果统计:');
    console.log(`- 总单词数: ${result.data.length}`);
    console.log(`- 用户级别: ${result.stats.user_level}`);
    console.log(`- 已学单词: ${result.stats.total_studied}`);
    console.log(`- 新单词: ${result.stats.new_count}`);
    console.log(`- 复习单词: ${result.stats.review_count}`);
    console.log(`- 困难单词: ${result.stats.difficult_count}`);
    
    console.log('\n📝 推荐单词类型分布:');
    const typeCount = {};
    result.data.forEach(word => {
      typeCount[word.type] = (typeCount[word.type] || 0) + 1;
    });
    console.log(typeCount);
    
    return result;
  } catch (error) {
    console.error('智能推荐测试失败:', error.message);
    throw error;
  }
}

/**
 * 测试复习推荐API
 */
async function testReviewRecommendation() {
  console.log('\n📚 测试复习推荐算法...');
  
  try {
    // 测试获取复习单词
    const wordsResponse = await fetch(`http://localhost:3001/api/words-review?userId=${TEST_USER_ID}&action=words&limit=10`);
    const wordsResult = await wordsResponse.json();
    
    console.log('📊 复习单词推荐:');
    console.log(`- 需要复习的单词数: ${wordsResult.data.length}`);
    
    if (wordsResult.data.length > 0) {
      console.log('\n📝 复习单词详情:');
      wordsResult.data.slice(0, 3).forEach((word, index) => {
        console.log(`${index + 1}. ${word.english} (${word.chinese})`);
        console.log(`   - 掌握级别: ${word.progress.mastery_level}`);
        console.log(`   - 距上次学习: ${word.review_info.days_since_study}天`);
        console.log(`   - 应复习间隔: ${word.review_info.required_interval}天`);
        console.log(`   - 逾期: ${word.review_info.overdue_days}天`);
      });
    }
    
    // 测试复习统计
    const statsResponse = await fetch(`http://localhost:3001/api/words-review?userId=${TEST_USER_ID}&action=stats`);
    const statsResult = await statsResponse.json();
    
    console.log('\n📈 复习统计:');
    console.log(`- 总学习单词: ${statsResult.data.total_words}`);
    console.log(`- 今日到期: ${statsResult.data.due_today}`);
    console.log(`- 已逾期: ${statsResult.data.overdue}`);
    console.log(`- 3天内到期: ${statsResult.data.upcoming_3_days}`);
    console.log('- 掌握级别分布:', statsResult.data.by_level);
    
    return { wordsResult, statsResult };
  } catch (error) {
    console.error('复习推荐测试失败:', error.message);
    throw error;
  }
}

/**
 * 测试访客模式推荐
 */
async function testGuestRecommendation() {
  console.log('\n👤 测试访客模式推荐...');
  
  try {
    const response = await fetch('http://localhost:3001/api/words-daily?limit=20');
    const result = await response.json();
    
    console.log('📊 访客推荐结果:');
    console.log(`- 单词数: ${result.data.length}`);
    console.log(`- 访客模式: ${result.stats.guest_mode}`);
    console.log(`- 用户级别: ${result.stats.user_level}`);
    console.log(`- 新单词数: ${result.stats.new_count}`);
    
    console.log('\n📝 推荐单词示例:');
    result.data.slice(0, 3).forEach((word, index) => {
      console.log(`${index + 1}. ${word.english} - ${word.chinese} (难度${word.difficulty_level})`);
    });
    
    return result;
  } catch (error) {
    console.error('访客模式测试失败:', error.message);
    throw error;
  }
}

/**
 * 测试日期一致性（同一天应该返回相同结果）
 */
async function testDateConsistency() {
  console.log('\n📅 测试日期一致性...');
  
  try {
    const response1 = await fetch(`http://localhost:3001/api/words-daily?userId=${TEST_USER_ID}&limit=20`);
    const result1 = await response1.json();
    
    // 稍等一下再请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response2 = await fetch(`http://localhost:3001/api/words-daily?userId=${TEST_USER_ID}&limit=20`);
    const result2 = await response2.json();
    
    // 比较两次结果是否相同
    const words1 = result1.data.map(w => w.id).sort();
    const words2 = result2.data.map(w => w.id).sort();
    
    const isConsistent = JSON.stringify(words1) === JSON.stringify(words2);
    
    console.log(`✅ 日期一致性测试: ${isConsistent ? '通过' : '失败'}`);
    console.log(`- 第一次请求: ${words1.length}个单词`);
    console.log(`- 第二次请求: ${words2.length}个单词`);
    console.log(`- 单词ID一致: ${isConsistent}`);
    
    return isConsistent;
  } catch (error) {
    console.error('日期一致性测试失败:', error.message);
    throw error;
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData() {
  console.log('\n🧹 清理测试数据...');
  
  try {
    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', TEST_USER_ID);
    
    if (error) throw error;
    
    console.log('✅ 测试数据清理完成');
  } catch (error) {
    console.error('清理测试数据失败:', error.message);
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始智能推荐系统测试...\n');
  
  try {
    // 1. 创建测试数据
    await createTestUserData();
    
    // 等待API服务启动（如果需要）
    console.log('⏳ 等待API服务...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. 测试各种推荐功能
    await testSmartRecommendation();
    await testReviewRecommendation();
    await testGuestRecommendation();
    await testDateConsistency();
    
    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  } finally {
    // 清理测试数据
    await cleanupTestData();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  createTestUserData,
  testSmartRecommendation,
  cleanupTestData
}; 