const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 缺少 Supabase 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 雅思核心词汇数据 - 按难度分级
const ieltsVocabulary = [
  // 难度等级 1 - 基础词汇
  {
    english: 'academic',
    chinese: '学术的，学院的',
    pronunciation: '/ˌækəˈdemɪk/',
    difficulty_level: 1,
    example_sentence: 'He has an excellent academic record.',
    category: '基础词汇'
  },
  {
    english: 'achieve',
    chinese: '实现，达到',
    pronunciation: '/əˈtʃiːv/',
    difficulty_level: 1,
    example_sentence: 'She worked hard to achieve her goals.',
    category: '基础词汇'
  },
  {
    english: 'analysis',
    chinese: '分析',
    pronunciation: '/əˈnæləsɪs/',
    difficulty_level: 1,
    example_sentence: 'The data analysis showed interesting patterns.',
    category: '学术词汇'
  },
  {
    english: 'approach',
    chinese: '方法，途径',
    pronunciation: '/əˈproʊtʃ/',
    difficulty_level: 1,
    example_sentence: 'We need a new approach to solve this problem.',
    category: '基础词汇'
  },
  {
    english: 'available',
    chinese: '可获得的，可利用的',
    pronunciation: '/əˈveɪləbl/',
    difficulty_level: 1,
    example_sentence: 'The information is available online.',
    category: '基础词汇'
  },

  // 难度等级 2 - 中级词汇
  {
    english: 'benefit',
    chinese: '好处，利益',
    pronunciation: '/ˈbenɪfɪt/',
    difficulty_level: 2,
    example_sentence: 'Exercise has many health benefits.',
    category: '基础词汇'
  },
  {
    english: 'community',
    chinese: '社区，社会',
    pronunciation: '/kəˈmjuːnəti/',
    difficulty_level: 2,
    example_sentence: 'The local community organized a festival.',
    category: '基础词汇'
  },
  {
    english: 'concept',
    chinese: '概念，观念',
    pronunciation: '/ˈkɑːnsept/',
    difficulty_level: 2,
    example_sentence: 'This is a difficult concept to understand.',
    category: '学术词汇'
  },
  {
    english: 'consist',
    chinese: '组成，构成',
    pronunciation: '/kənˈsɪst/',
    difficulty_level: 2,
    example_sentence: 'The team consists of five members.',
    category: '基础词汇'
  },
  {
    english: 'create',
    chinese: '创造，创建',
    pronunciation: '/kriˈeɪt/',
    difficulty_level: 2,
    example_sentence: 'Artists create beautiful works of art.',
    category: '基础词汇'
  },

  // 难度等级 3 - 中高级词汇
  {
    english: 'derive',
    chinese: '获得，取得',
    pronunciation: '/dɪˈraɪv/',
    difficulty_level: 3,
    example_sentence: 'Many medicines are derived from plants.',
    category: '学术词汇'
  },
  {
    english: 'distribute',
    chinese: '分发，分配',
    pronunciation: '/dɪˈstrɪbjuːt/',
    difficulty_level: 3,
    example_sentence: 'Food was distributed to the refugees.',
    category: '基础词汇'
  },
  {
    english: 'economy',
    chinese: '经济',
    pronunciation: '/ɪˈkɑːnəmi/',
    difficulty_level: 3,
    example_sentence: 'The global economy is slowly recovering.',
    category: '商务英语'
  },
  {
    english: 'establish',
    chinese: '建立，确立',
    pronunciation: '/ɪˈstæblɪʃ/',
    difficulty_level: 3,
    example_sentence: 'The company was established in 1990.',
    category: '商务英语'
  },
  {
    english: 'evidence',
    chinese: '证据，证明',
    pronunciation: '/ˈevɪdəns/',
    difficulty_level: 3,
    example_sentence: 'There is clear evidence of climate change.',
    category: '学术词汇'
  },

  // 难度等级 4 - 高级词汇
  {
    english: 'fundamental',
    chinese: '基本的，根本的',
    pronunciation: '/ˌfʌndəˈmentl/',
    difficulty_level: 4,
    example_sentence: 'Education is a fundamental human right.',
    category: '学术词汇'
  },
  {
    english: 'generate',
    chinese: '产生，引起',
    pronunciation: '/ˈdʒenəreɪt/',
    difficulty_level: 4,
    example_sentence: 'Solar panels generate electricity from sunlight.',
    category: '科技词汇'
  },
  {
    english: 'hypothesis',
    chinese: '假设，假说',
    pronunciation: '/haɪˈpɑːθəsɪs/',
    difficulty_level: 4,
    example_sentence: 'Scientists tested their hypothesis in the lab.',
    category: '学术词汇'
  },
  {
    english: 'implement',
    chinese: '实施，执行',
    pronunciation: '/ˈɪmplɪment/',
    difficulty_level: 4,
    example_sentence: 'The government will implement new policies.',
    category: '商务英语'
  },
  {
    english: 'interpret',
    chinese: '解释，理解',
    pronunciation: '/ɪnˈtɜːrprɪt/',
    difficulty_level: 4,
    example_sentence: 'It is difficult to interpret the data.',
    category: '学术词汇'
  },

  // 难度等级 5 - 最高级词汇
  {
    english: 'nonetheless',
    chinese: '尽管如此，然而',
    pronunciation: '/ˌnʌnðəˈles/',
    difficulty_level: 5,
    example_sentence: 'The task was difficult; nonetheless, we completed it.',
    category: '学术词汇'
  },
  {
    english: 'phenomenon',
    chinese: '现象',
    pronunciation: '/fəˈnɑːmɪnən/',
    difficulty_level: 5,
    example_sentence: 'Global warming is a complex phenomenon.',
    category: '学术词汇'
  },
  {
    english: 'predominant',
    chinese: '主要的，占主导地位的',
    pronunciation: '/prɪˈdɑːmɪnənt/',
    difficulty_level: 5,
    example_sentence: 'English is the predominant language in business.',
    category: '学术词汇'
  },
  {
    english: 'subsequent',
    chinese: '随后的，后来的',
    pronunciation: '/ˈsʌbsɪkwənt/',
    difficulty_level: 5,
    example_sentence: 'The initial success led to subsequent investments.',
    category: '学术词汇'
  },
  {
    english: 'sophisticated',
    chinese: '复杂的，精密的',
    pronunciation: '/səˈfɪstɪkeɪtɪd/',
    difficulty_level: 5,
    example_sentence: 'The software uses sophisticated algorithms.',
    category: '科技词汇'
  },

  // 更多基础和实用词汇
  {
    english: 'environment',
    chinese: '环境',
    pronunciation: '/ɪnˈvaɪrənmənt/',
    difficulty_level: 2,
    example_sentence: 'We must protect our environment.',
    category: '基础词汇'
  },
  {
    english: 'technology',
    chinese: '技术，科技',
    pronunciation: '/tekˈnɑːlədʒi/',
    difficulty_level: 2,
    example_sentence: 'Technology has changed our daily lives.',
    category: '科技词汇'
  },
  {
    english: 'education',
    chinese: '教育',
    pronunciation: '/ˌedʒuˈkeɪʃn/',
    difficulty_level: 2,
    example_sentence: 'Education is the key to success.',
    category: '基础词汇'
  },
  {
    english: 'culture',
    chinese: '文化',
    pronunciation: '/ˈkʌltʃər/',
    difficulty_level: 2,
    example_sentence: 'Each country has its own unique culture.',
    category: '基础词汇'
  },
  {
    english: 'society',
    chinese: '社会',
    pronunciation: '/səˈsaɪəti/',
    difficulty_level: 2,
    example_sentence: 'Modern society faces many challenges.',
    category: '基础词汇'
  }
];

async function addIeltsVocabulary() {
  console.log('📚 开始添加雅思词汇表...\n');
  
  try {
    // 1. 获取所有分类
    const { data: categories, error: categoryError } = await supabase
      .from('word_categories')
      .select('id, name');
    
    if (categoryError) {
      console.log('❌ 获取分类失败:', categoryError.message);
      return;
    }
    
    console.log('📂 找到分类:', categories.map(c => c.name).join(', '));
    
    // 创建分类映射
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // 2. 准备要插入的单词数据
    const wordsToInsert = ieltsVocabulary.map(word => ({
      english: word.english,
      chinese: word.chinese,
      pronunciation: word.pronunciation,
      difficulty_level: word.difficulty_level,
      category_id: categoryMap[word.category] || null,
      example_sentence: word.example_sentence,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // 3. 批量插入单词
    console.log(`📝 准备插入 ${wordsToInsert.length} 个雅思词汇...\n`);
    
    const { data: insertedWords, error: insertError } = await supabase
      .from('words')
      .insert(wordsToInsert)
      .select();
    
    if (insertError) {
      console.log('❌ 插入失败:', insertError.message);
      return;
    }
    
    console.log('✅ 成功添加雅思词汇!');
    console.log(`📊 插入了 ${insertedWords.length} 个单词\n`);
    
    // 4. 显示统计信息
    const { data: allWords } = await supabase
      .from('words')
      .select('difficulty_level')
      .order('difficulty_level');
    
    console.log('📈 难度分布统计:');
    for (let level = 1; level <= 5; level++) {
      const count = allWords.filter(w => w.difficulty_level === level).length;
      console.log(`   难度${level}: ${count} 个单词`);
    }
    
    console.log(`\n🎯 数据库中现在总共有 ${allWords.length} 个单词`);
    console.log('✨ 雅思词汇表添加完成！');
    
    // 5. 显示一些添加的单词示例
    console.log('\n📝 添加的词汇示例:');
    insertedWords.slice(0, 5).forEach((word, index) => {
      console.log(`   ${index + 1}. ${word.english} - ${word.chinese} (难度${word.difficulty_level})`);
    });
    
  } catch (err) {
    console.error('❌ 添加过程出错:', err.message);
  }
}

// 检查是否已有单词数据
async function checkExistingWords() {
  const { data: existingWords } = await supabase
    .from('words')
    .select('count');
    
  return existingWords ? existingWords.length : 0;
}

async function main() {
  const existingCount = await checkExistingWords();
  
  if (existingCount > 0) {
    console.log(`⚠️  数据库中已有 ${existingCount} 个单词`);
    console.log('是否要继续添加更多词汇？正在继续...\n');
  }
  
  await addIeltsVocabulary();
}

main(); 