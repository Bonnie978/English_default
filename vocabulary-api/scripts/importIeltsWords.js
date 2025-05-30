require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://yuglaystxeopuymtinfs.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1Z2xheXN0eGVvcHV5bXRpbmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MjQ4ODAsImV4cCI6MjA1MTQwMDg4MH0.z31RO3H2UhKJLWJKKCaQkqQgU5S9qgfmqWcgCTI86I8'
);

// 从GitHub获取雅思词汇
async function fetchIeltsWords() {
  try {
    console.log('正在从GitHub获取雅思词汇...');
    const response = await axios.get(
      'https://raw.githubusercontent.com/jimuyouyou/all-ielts-words/main/allKeyWords.txt'
    );
    
    // 分割单词，去除空行
    const words = response.data.split('\n').filter(word => word.trim() !== '');
    console.log(`成功获取 ${words.length} 个雅思单词`);
    return words;
  } catch (error) {
    console.error('获取雅思词汇失败:', error.message);
    return [];
  }
}

// 简单的难度级别分配函数（基于单词长度和常见程度）
function getDifficultyLevel(word) {
  // 常见单词列表（难度1-2）
  const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'];
  
  if (commonWords.includes(word.toLowerCase())) {
    return 1;
  }
  
  // 基于单词长度分配难度
  if (word.length <= 4) return 2;
  if (word.length <= 6) return 3;
  if (word.length <= 8) return 4;
  return 5;
}

// 生成示例句子（简单模板）
function generateExampleSentence(word) {
  const templates = [
    `This is a good example of ${word}.`,
    `The ${word} is very important.`,
    `We need to understand ${word} better.`,
    `${word.charAt(0).toUpperCase() + word.slice(1)} plays a key role.`,
    `Many people use ${word} in daily life.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// 批量插入单词到数据库
async function importWordsToDatabase(words) {
  const batchSize = 100;
  let imported = 0;
  let errors = 0;
  
  // 获取所有类别
  const { data: categories } = await supabase
    .from('word_categories')
    .select('*');
  
  if (!categories || categories.length === 0) {
    console.error('没有找到词汇类别，请先创建类别');
    return;
  }
  
  console.log(`开始导入 ${words.length} 个单词，每批 ${batchSize} 个...`);
  
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);
    
    // 准备批量数据
    const wordsData = batch.map(word => {
      const cleanWord = word.trim().toLowerCase();
      if (!cleanWord) return null;
      
      return {
        english: cleanWord,
        chinese: '待翻译', // 占位符，后续可以通过API翻译
        pronunciation: `/${cleanWord}/`, // 简单音标占位符
        difficulty_level: getDifficultyLevel(cleanWord),
        category_id: categories[Math.floor(Math.random() * categories.length)].id,
        example_sentence: generateExampleSentence(cleanWord),
        created_at: new Date().toISOString()
      };
    }).filter(word => word !== null);
    
    if (wordsData.length === 0) continue;
    
    try {
      const { error } = await supabase
        .from('words')
        .insert(wordsData);
      
      if (error) {
        console.error(`批次 ${Math.floor(i/batchSize) + 1} 插入失败:`, error.message);
        errors += wordsData.length;
      } else {
        imported += wordsData.length;
        console.log(`✅ 已导入 ${imported} 个单词 (批次 ${Math.floor(i/batchSize) + 1})`);
      }
    } catch (error) {
      console.error(`批次 ${Math.floor(i/batchSize) + 1} 处理失败:`, error.message);
      errors += wordsData.length;
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n导入完成！`);
  console.log(`成功导入: ${imported} 个单词`);
  console.log(`失败: ${errors} 个单词`);
}

// 主函数
async function main() {
  try {
    console.log('=== 环境变量检查 ===');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
    
    // 检查数据库连接
    console.log('\n=== 测试数据库连接 ===');
    const { data: categories, error: categoryError } = await supabase
      .from('word_categories')
      .select('*');
    
    if (categoryError) {
      console.error('数据库连接失败:');
      console.error('Error:', categoryError);
      return;
    }
    
    console.log(`✅ 数据库连接成功！找到 ${categories.length} 个词汇类别`);
    
    // 查询现有单词数量
    const { data: existingWords, error: wordsError } = await supabase
      .from('words')
      .select('id');
    
    if (wordsError) {
      console.error('查询单词失败:', wordsError);
      return;
    }
    
    console.log(`当前数据库中已有 ${existingWords.length} 个单词`);
    
    // 获取雅思词汇
    const words = await fetchIeltsWords();
    
    if (words.length === 0) {
      console.log('没有获取到任何单词，程序退出');
      return;
    }
    
    // 导入到数据库
    await importWordsToDatabase(words);
    
  } catch (error) {
    console.error('程序执行失败:', error.message);
    console.error('完整错误:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  fetchIeltsWords,
  importWordsToDatabase
}; 