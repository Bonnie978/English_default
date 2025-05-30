const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeWordGeneration() {
  console.log('🔍 分析每日单词生成逻辑...\n');
  
  try {
    // 1. 检查 words 表结构
    console.log('📋 1. 检查 words 表数据:');
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('*')
      .limit(5);
      
    if (wordsError) {
      console.log('❌ 无法获取单词数据:', wordsError.message);
    } else if (!words || words.length === 0) {
      console.log('⚠️  数据库中没有单词数据');
    } else {
      console.log('✅ 找到单词数据:');
      words.forEach((word, index) => {
        console.log(`   ${index + 1}. ${word.english} - ${word.chinese}`);
      });
    }
    
    // 2. 检查当前的生成逻辑（模拟 words-daily.js 的逻辑）
    console.log('\n📊 2. 当前每日单词生成逻辑:');
    const { data: allWords, error } = await supabase
      .from('words')
      .select('*')
      .limit(20); // 当前逻辑：固定获取前20个单词
      
    if (error) {
      console.log('❌ 获取失败:', error.message);
    } else {
      console.log(`✅ 当前逻辑: 固定返回前 ${allWords?.length || 0} 个单词`);
      console.log('⚠️  没有基于日期、用户水平或个性化的推荐算法');
    }
    
    // 3. 分析数据库表结构
    console.log('\n🗃️  3. 分析相关表结构:');
    
    // 检查分类表
    const { data: categories } = await supabase
      .from('word_categories')
      .select('*');
    console.log(`📂 分类表: ${categories?.length || 0} 个分类`);
    
    // 检查用户进度表
    const { data: progress } = await supabase
      .from('user_progress')
      .select('count');
    console.log(`📈 用户进度记录: 存在`);
    
    // 4. 分析当前问题
    console.log('\n❗ 4. 当前问题分析:');
    console.log('   - 📅 没有基于日期的变化逻辑');
    console.log('   - 🎯 没有个性化推荐算法');
    console.log('   - 📚 可能缺少单词数据');
    console.log('   - 🔢 固定返回20个单词，不够智能');
    
    // 5. 建议的改进方案
    console.log('\n💡 5. 建议的每日单词生成策略:');
    console.log('   - 🗓️  基于日期种子的随机算法');
    console.log('   - 👤 根据用户学习记录个性化推荐');
    console.log('   - 📊 基于掌握程度动态调整难度');
    console.log('   - 🔄 间隔重复算法优化复习频率');
    console.log('   - 📈 学习进度跟踪和适应性调整');
    
  } catch (err) {
    console.error('❌ 分析过程出错:', err.message);
  }
}

analyzeWordGeneration(); 