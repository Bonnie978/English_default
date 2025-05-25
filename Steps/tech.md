# 修订版 - 背词助手应用开发计划

根据您的反馈，我已对开发计划进行了进一步修订，去除了后续扩展路线和人力资源分析，并增加了详细的第三方服务调用技术方案。

## 一、架构总览

### 系统架构
采用前后端分离的架构设计：
1. 前端：单页应用(SPA)，负责用户界面与交互
2. 后端：RESTful API服务，负责业务逻辑处理
3. AI服务：DeepSeek API集成，负责内容生成和评估
4. 数据层：MongoDB数据存储，Redis缓存

### 数据流向
1. 用户数据流：用户 → 前端应用 → API网关 → 后端服务 → 数据库/缓存
2. 内容生成流：后端服务 → DeepSeek API → 内容处理 → 缓存 → 前端展示
3. 学习数据流：用户学习行为 → 前端记录 → 后端存储 → 分析服务 → 学习报告生成

## 二、技术选型与方案

### 前端技术栈
**主选方案**：React + TypeScript + **Styled Components** + Redux
- **React**：组件化开发，便于实现复杂交互界面
- **TypeScript**：提供类型安全，减少运行时错误
- **Styled Components**：组件级CSS方案，便于维护组件样式
- **Redux**：集中管理应用状态，特别适合管理学习进度、用户数据等

**关键前端库**：
- **axios**：处理API请求
- **react-router**：页面路由管理
- **howler.js**：处理音频播放（听力练习）
- **draft.js**：富文本编辑器（写作练习）
- **recharts**：数据可视化（学习报告）

### 后端技术栈
**主选方案**：Node.js + Express + MongoDB + Redis
- **Node.js/Express**：高性能异步处理，适合IO密集型应用
- **MongoDB**：灵活的文档存储，适合存储不同类型的练习题和用户回答
- **Redis**：缓存AI生成内容，减少API调用，提高响应速度

**API设计原则**：
- 采用RESTful设计风格
- 统一错误处理机制
- JWT认证授权
- 请求频率限制

### AI服务集成
**已调整方案**：DeepSeek API
- 用于生成练习题、判题评分
- 建立高效的prompt工程，确保内容质量
- 实现内容缓存机制，降低API调用成本

### 存储方案
- **用户数据**：MongoDB (用户信息、学习记录)
- **单词库**：MongoDB (考虑到单词结构复杂，包含例句、发音等)
- **缓存层**：Redis (AI生成内容、热点数据)
- **媒体存储**：对象存储服务 (存储音频文件)

### 部署方案
- **容器化**：Docker + Docker Compose
- **CI/CD**：GitHub Actions
- **监控**：Prometheus + Grafana
- **日志**：ELK Stack

## 三、需求拆解与开发任务

### 基础架构搭建

#### 前端基础架构
1. **项目初始化**
   - 使用Create React App或Vite创建TypeScript项目
   - 配置ESLint和Prettier
   - 设置项目目录结构

2. **路由系统**
   - 实现React Router配置
   - 创建路由守卫(权限控制)
   - 实现页面过渡效果

3. **状态管理**
   - 配置Redux store
   - 实现用户状态管理
   - 实现学习进度状态管理

4. **UI基础组件**
   - 创建设计系统
   - 实现基础UI组件(按钮、表单、卡片等)
   - 使用Styled Components配置主题

5. **API服务**
   - 创建API请求拦截器
   - 实现统一错误处理
   - 配置API接口服务

#### 后端基础架构
1. **项目骨架**
   - 创建Express应用
   - 配置中间件
   - 设置路由结构

2. **数据库连接**
   - 配置MongoDB连接
   - 创建数据模型
   - 实现数据验证

3. **Redis缓存**
   - 配置Redis连接
   - 实现缓存策略
   - 配置缓存过期机制

4. **认证系统**
   - 实现JWT认证
   - 创建用户验证中间件
   - 设置权限控制

5. **AI服务集成**
   - 配置DeepSeek API连接
   - 创建AI服务抽象层
   - 实现提示词模板管理

### 功能模块开发

#### 用户系统模块
1. **注册功能**
   - 前端注册表单实现
   - 后端用户创建API
   - 邮箱验证机制

2. **登录功能**
   - 前端登录表单实现
   - 后端登录验证API
   - 会话管理实现

3. **用户配置**
   - 用户设置界面实现
   - 用户偏好保存API
   - 学习设置调整功能

4. **数据统计**
   - 学习数据展示界面
   - 数据统计API实现
   - 学习趋势可视化

#### 单词学习模块
1. **单词库管理**
   - 数据模型实现
   - 单词导入机制
   - 单词查询API

2. **每日单词生成**
   - 算法实现(按用户进度生成)
   - 每日单词获取API
   - 单词列表重置机制

3. **单词展示页面**
   - 单词卡片组件实现
   - 单词详情展示
   - 单词遍历控制

4. **单词发音功能**
   - 音频播放组件
   - 发音API集成
   - 离线发音支持

5. **学习进度追踪**
   - 进度状态管理
   - 进度保存API
   - 进度指示器组件

#### 练习题系统
1. **练习题类型定义**
   - 数据模型设计
   - 题型选择界面
   - 题型路由管理

2. **阅读理解题**
   - DeepSeek提示词设计
   - 阅读材料生成API
   - 题目展示组件

3. **听力理解题**
   - 听力材料生成API
   - 音频转换服务
   - 听力播放控件

4. **写作练习题**
   - 写作提示生成API
   - 富文本编辑器集成
   - 单词提示功能

5. **答题界面**
   - 题目渲染组件
   - 答案收集机制
   - 提交功能实现

#### AI判题系统
1. **选择题判题**
   - 答案验证算法
   - 得分计算逻辑
   - 结果反馈组件

2. **听力题评分**
   - DeepSeek提示词设计
   - 听力答案评估API
   - 听力评分反馈

3. **写作评分**
   - 写作评估提示词设计
   - 文本分析API集成
   - 详细反馈生成

4. **综合评分**
   - 多维度评分机制
   - 评分数据存储
   - 进步分析功能

#### 错题管理系统
1. **错题收集**
   - 错误答案识别
   - 错题数据模型
   - 错题保存API

2. **错题分类**
   - 分类算法实现
   - 按类型/日期分组
   - 分类筛选界面

3. **错题展示**
   - 错题列表组件
   - 错题详情展示
   - 原题/答案对比

4. **错题复习**
   - 复习模式界面
   - 重做功能实现
   - 进步追踪机制

#### 学习分析系统
1. **数据收集**
   - 学习行为跟踪
   - 时间统计逻辑
   - 数据汇总API

2. **数据分析**
   - 正确率计算
   - 学习效率分析
   - 薄弱点识别

3. **报告生成**
   - 数据可视化组件
   - 学习报告模板
   - 建议生成算法

4. **进步展示**
   - 历史对比分析
   - 进步趋势图表
   - 成就系统实现

### 系统优化与质量保障

#### 性能优化
1. **前端优化**
   - 组件懒加载实现
   - 资源预加载策略
   - 缓存机制优化

2. **后端优化**
   - API响应优化
   - 数据库查询优化
   - 并发处理改进

3. **AI调用优化**
   - 提示词优化
   - 内容缓存策略
   - 请求合并处理

#### 用户体验改进
1. **交互优化**
   - 状态反馈增强
   - 错误处理改进
   - 加载状态设计

2. **界面美化**
   - 动画效果添加
   - 主题一致性检查
   - 视觉层次优化

3. **响应式设计**
   - 移动端适配
   - 不同设备测试
   - 触控体验优化

#### 测试与质量保障
1. **单元测试**
   - 组件测试用例
   - 服务函数测试
   - API测试

2. **集成测试**
   - 功能流程测试
   - 模块交互测试
   - 边界条件测试

3. **用户测试**
   - 测试用户招募
   - 用户反馈收集
   - 可用性改进

## 四、关键功能实现细节

### 1. 单词学习系统

```javascript
// 前端获取每日单词
const fetchDailyWords = async () => {
  try {
    const response = await axios.get('/api/words/daily', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 后端实现
router.get('/words/daily', authenticate, async (req, res) => {
  try {
    // 获取用户当前进度
    const user = await User.findById(req.user.id);
    const learningRecord = await LearningRecord.findOne({
      userId: req.user.id,
      date: {$gte: startOfDay(new Date())}
    });
    
    // 如果今日没有学习记录，创建新记录
    if (!learningRecord) {
      // 根据用户设置获取单词数量
      const dailyWordCount = user.settings.dailyWordCount || 10;
      // 获取用户未学习的单词
      const words = await Word.find({
        _id: { $nin: user.learnedWordIds }
      })
      .limit(dailyWordCount);
      
      // 创建新的学习记录
      const newRecord = await LearningRecord.create({
        userId: req.user.id,
        date: new Date(),
        wordsList: words.map(word => ({
          wordId: word._id,
          mastered: false,
          reviewCount: 0
        }))
      });
      
      // 返回单词数据
      return res.json({
        date: newRecord.date,
        words: words,
        progress: {
          learned: 0,
          total: words.length
        }
      });
    }
    
    // 返回今日已有的学习记录
    const wordIds = learningRecord.wordsList.map(item => item.wordId);
    const words = await Word.find({ _id: { $in: wordIds } });
    
    return res.json({
      date: learningRecord.date,
      words: words,
      progress: {
        learned: learningRecord.wordsList.filter(w => w.mastered).length,
        total: learningRecord.wordsList.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

## 五、第三方服务调用技术方案

### 1. DeepSeek API 集成

#### 技术实现方案

```javascript
// 1. 安装与配置
// 安装DeepSeek Node.js SDK
// npm install deepseek-api

// 服务配置
const { DeepSeekClient } = require('deepseek-api');

const deepseekClient = new DeepSeekClient({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  timeout: 30000, // 30秒超时
  maxRetries: 3,   // 最大重试次数
});

// 2. 创建服务抽象层
class AIContentService {
  constructor(client, cacheService) {
    this.client = client;
    this.cache = cacheService;
    this.defaultOptions = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };
  }

  // 文本生成通用方法
  async generateContent(systemPrompt, userPrompt, options = {}) {
    const cacheKey = `ai_content:${hashString(systemPrompt + userPrompt)}`;
    
    // 检查缓存
    const cachedContent = await this.cache.get(cacheKey);
    if (cachedContent) {
      return JSON.parse(cachedContent);
    }
    
    // 合并选项
    const requestOptions = {
      ...this.defaultOptions,
      ...options
    };
    
    try {
      const response = await this.client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        ...requestOptions
      });
      
      const result = {
        content: response.choices[0].message.content,
        usage: response.usage,
        model: response.model
      };
      
      // 缓存结果
      await this.cache.set(cacheKey, JSON.stringify(result), 'EX', 86400); // 24小时过期
      
      return result;
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error(`AI内容生成失败: ${error.message}`);
    }
  }
  
  // 阅读材料生成
  async generateReadingMaterial(words, difficulty = 'intermediate') {
    const systemPrompt = `你是一个专业的英语教师，需要根据给定的单词创建一篇短文和相关问题。难度级别: ${difficulty}`;
    const userPrompt = `请根据以下单词创建一篇200字左右的短文，并提供3-5个相关问题，请确保问题多样化（包含单选、多选或填空题）: ${words.join(', ')}`;
    
    const result = await this.generateContent(systemPrompt, userPrompt, {
      temperature: 0.7
    });
    
    return this.parseReadingResponse(result.content);
  }
  
  // 听力材料生成
  async generateListeningMaterial(words, difficulty = 'intermediate') {
    const systemPrompt = `你是一个专业的英语教师，需要创建适合听力练习的对话或短文。难度级别: ${difficulty}`;
    const userPrompt = `请根据以下单词创建一段60-90秒的对话或短文，适合作为英语听力材料，并提供3-5个相关问题: ${words.join(', ')}`;
    
    const result = await this.generateContent(systemPrompt, userPrompt, {
      temperature: 0.7
    });
    
    return this.parseListeningResponse(result.content);
  }
  
  // 写作提示生成
  async generateWritingPrompt(words, difficulty = 'intermediate') {
    const systemPrompt = `你是一个专业的英语写作教师，需要创建写作提示。难度级别: ${difficulty}`;
    const userPrompt = `请根据以下单词创建一个写作提示，要求学生在写作中使用这些单词。提供明确的写作要求，包括主题、长度和结构建议: ${words.join(', ')}`;
    
    const result = await this.generateContent(systemPrompt, userPrompt, {
      temperature: 0.7
    });
    
    return this.parseWritingResponse(result.content);
  }
  
  // 写作评分
  async evaluateWriting(prompt, expectedWords, userAnswer) {
    const systemPrompt = `你是一个专业的英语写作评分系统，需要评估学生的写作并提供详细反馈。`;
    const userPrompt = `
      写作提示: ${prompt}
      期望使用的单词: ${expectedWords.join(', ')}
      学生的答案: ${userAnswer}
      
      请评估学生的写作并提供详细反馈。评分维度:
      1. 内容相关性 (20分)
      2. 单词使用情况 (30分) - 特别关注学生是否正确使用了期望的单词
      3. 语法和拼写 (20分)
      4. 结构和连贯性 (20分)
      5. 表达和词汇多样性 (10分)
      
      请给出总分(0-100)，并针对每个维度提供具体评价和改进建议。
    `;
    
    const result = await this.generateContent(systemPrompt, userPrompt, {
      temperature: 0.3,
      max_tokens: 800
    });
    
    return this.parseEvaluationResponse(result.content);
  }
  
  // 解析评分结果
  parseEvaluationResponse(content) {
    // 提取总分
    const scoreMatch = content.match(/总分[:：]?\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    
    // 解析每个维度的评分和反馈
    const dimensions = [
      { name: '内容相关性', regex: /内容相关性[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i },
      { name: '单词使用情况', regex: /单词使用情况[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i },
      { name: '语法和拼写', regex: /语法和拼写[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i },
      { name: '结构和连贯性', regex: /结构和连贯性[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i },
      { name: '表达和词汇多样性', regex: /表达和词汇多样性[^0-9]*(\d+)[^0-9]*([\s\S]+?)(?=\d+\.|$)/i }
    ];
    
    const detailedFeedback = dimensions.map(dim => {
      const match = content.match(dim.regex);
      return {
        dimension: dim.name,
        score: match ? parseInt(match[1]) : null,
        feedback: match ? match[2].trim() : null
      };
    }).filter(item => item.score !== null);
    
    // 提取总体改进建议
    const suggestionsMatch = content.match(/改进建议[：:]([\s\S]+?)(?=\d+\.|$)/i);
    const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : '';
    
    return {
      score,
      detailedFeedback,
      suggestions,
      rawFeedback: content
    };
  }
  
  // 解析阅读材料响应
  parseReadingResponse(content) {
    // 分离文章和问题
    const articleMatch = content.match(/(.+?)(?=问题|Questions:|Questions：|Questions)/s);
    const questionsMatch = content.match(/(?:问题|Questions:|Questions：|Questions)(.+)$/s);
    
    const article = articleMatch ? articleMatch[1].trim() : content;
    let questionsText = questionsMatch ? questionsMatch[1].trim() : '';
    
    // 解析问题
    const questions = this.extractQuestions(questionsText);
    
    return {
      article,
      questions
    };
  }
  
  // 解析听力材料响应
  parseListeningResponse(content) {
    return this.parseReadingResponse(content);
  }
  
  // 解析写作提示响应
  parseWritingResponse(content) {
    // 提取主题、要求和建议
    const topicMatch = content.match(/主题[：:](.*?)(?=要求|要点|Guidelines|$)/is);
    const requirementsMatch = content.match(/要求[：:](.*?)(?=建议|提示|Tips|$)/is);
    const tipsMatch = content.match(/(?:建议|提示)[：:](.*?)$/is);
    
    return {
      prompt: content,
      topic: topicMatch ? topicMatch[1].trim() : '',
      requirements: requirementsMatch ? requirementsMatch[1].trim() : '',
      tips: tipsMatch ? tipsMatch[1].trim() : ''
    };
  }
  
  // 从文本中提取问题
  extractQuestions(text) {
    if (!text) return [];
    
    // 匹配问题模式
    const questionPattern = /(\d+)[\.、]\s*([^\n]+)(?:\n((?:[A-D]\.[\s\S]+?(?=\n[A-D]\.|\n\d+\.|\n$|$))+))?/g;
    const questions = [];
    let match;
    
    while ((match = questionPattern.exec(text)) !== null) {
      const questionText = match[2].trim();
      const options = match[3] ? this.extractOptions(match[3]) : [];
      
      const questionType = options.length > 0 ? 'multiple-choice' : 'fill-blank';
      
      questions.push({
        question: questionText,
        type: questionType,
        options: options.length > 0 ? options.map(o => o.text) : [],
        correctAnswer: options.find(o => o.isCorrect)?.text || ''
      });
    }
    
    return questions;
  }
  
  // 从文本中提取选项
  extractOptions(text) {
    const optionPattern = /([A-D])\.?\s*([^\n]+)/g;
    const options = [];
    let match;
    
    while ((match = optionPattern.exec(text)) !== null) {
      options.push({
        key: match[1],
        text: match[2].trim(),
        isCorrect: text.includes(`正确答案: ${match[1]}`) || text.includes(`答案: ${match[1]}`)
      });
    }
    
    return options;
  }
}

// 实例化服务
const aiContentService = new AIContentService(deepseekClient, redisClient);

// 导出服务
module.exports = aiContentService;
```

#### 错误处理与重试机制

```javascript
// DeepSeek API调用包装器 - 实现指数退避重试
const callWithRetry = async (apiCall, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await apiCall();
    } catch (error) {
      retries++;
      
      // 如果达到最大重试次数，抛出错误
      if (retries > maxRetries) {
        throw error;
      }
      
      // 判断错误是否可重试
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // 记录重试信息
      console.warn(`DeepSeek API调用失败，${retries}/${maxRetries}次重试，延迟${delay}ms`, error.message);
      
      // 等待指定延迟后重试
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 指数增加延迟时间，加入随机抖动
      delay = Math.min(delay * 2 * (0.5 + Math.random()), 60000); // 最大延迟1分钟
    }
  }
};

// 判断错误是否可重试
const isRetryableError = (error) => {
  // 网络错误或超时可重试
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
    return true;
  }
  
  // 请求受限错误(429)可重试
  if (error.response && error.response.status === 429) {
    return true;
  }
  
  // 服务器错误(500系列)可重试
  if (error.response && error.response.status >= 500 && error.response.status < 600) {
    return true;
  }
  
  return false;
};
```

#### DeepSeek API调用例子

```javascript
// 生成阅读练习例子
router.post('/exercises/reading', authenticate, async (req, res) => {
  try {
    const { wordIds, difficulty } = req.body;
    
    // 验证请求
    if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
      return res.status(400).json({ message: '单词ID列表不能为空' });
    }
    
    // 获取单词数据
    const words = await Word.find({ _id: { $in: wordIds } });
    if (words.length === 0) {
      return res.status(404).json({ message: '未找到指定的单词' });
    }
    
    // 提取单词拼写
    const wordSpellings = words.map(word => word.spelling);
    
    // 使用AI服务生成阅读材料
    const readingMaterial = await callWithRetry(async () => {
      return await aiContentService.generateReadingMaterial(wordSpellings, difficulty || 'intermediate');
    });
    
    // 创建练习记录
    const exercise = await Exercise.create({
      userId: req.user.id,
      type: 'read',
      wordIds,
      content: readingMaterial.article,
      questions: readingMaterial.questions,
      createdAt: new Date()
    });
    
    res.status(201).json({
      id: exercise._id,
      type: 'read',
      content: readingMaterial.article,
      questions: readingMaterial.questions.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options,
        type: q.type
      }))
    });
  } catch (error) {
    console.error('生成阅读练习失败:', error);
    res.status(500).json({ message: '生成练习题失败，请稍后再试' });
  }
});
```

### 2. 语音合成服务集成

#### AWS Polly集成方案

```javascript
// 1. 安装与配置
// npm install aws-sdk

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const util = require('util');
const streamToBuffer = require('stream-to-buffer');

// 配置AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// 创建Polly服务
const polly = new AWS.Polly();
const s3 = new AWS.S3();

// 2. 封装语音合成服务
class SpeechService {
  constructor(pollyClient, s3Client, bucketName) {
    this.polly = pollyClient;
    this.s3 = s3Client;
    this.bucketName = bucketName;
    this.streamToBufferAsync = util.promisify(streamToBuffer);
  }
  
// 合成语音并上传到S3
  async synthesizeSpeech(text, options = {}) {
    // 默认参数
    const params = {
      Text: text,
      OutputFormat: options.format || 'mp3',
      VoiceId: options.voice || 'Matthew',
      LanguageCode: options.language || 'en-US',
      Engine: options.engine || 'neural'
    };
    
    try {
      // 1. 生成唯一的文件名
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${params.OutputFormat}`;
      const s3Key = `audio/${filename}`;
      
      // 2. 检查缓存
      const cacheKey = `speech:${Buffer.from(text).toString('base64')}:${params.VoiceId}:${params.Engine}`;
      const cachedUrl = await redisClient.get(cacheKey);
      
      if (cachedUrl) {
        return { url: cachedUrl, fromCache: true };
      }
      
      // 3. 调用Polly API合成语音
      const pollyResponse = await this.polly.synthesizeSpeech(params).promise();
      
      // 4. 上传到S3
      const uploadParams = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: pollyResponse.AudioStream,
        ContentType: `audio/${params.OutputFormat}`
      };
      
      await this.s3.upload(uploadParams).promise();
      
      // 5. 生成访问URL
      const audioUrl = `https://${this.bucketName}.s3.amazonaws.com/${s3Key}`;
      
      // 6. 缓存URL (24小时过期)
      await redisClient.set(cacheKey, audioUrl, 'EX', 86400);
      
      return { url: audioUrl, fromCache: false };
    } catch (error) {
      console.error('语音合成失败:', error);
      throw new Error(`语音合成失败: ${error.message}`);
    }
  }
  
  // 批量处理文本
  async batchSynthesize(textSegments, options = {}) {
    // 按规定长度分割较长的文本
    const preparedSegments = this.prepareTextSegments(textSegments);
    
    // 并发处理所有片段
    const results = await Promise.all(
      preparedSegments.map(segment => this.synthesizeSpeech(segment, options))
    );
    
    return results;
  }
  
  // 准备文本片段 (Polly有字数限制)
  prepareTextSegments(textInput) {
    // 如果是字符串，分割成句子
    if (typeof textInput === 'string') {
      return this.splitTextIntoChunks(textInput);
    }
    
    // 如果已经是数组，确保每一项都在限制内
    if (Array.isArray(textInput)) {
      const result = [];
      for (const text of textInput) {
        if (text.length <= 3000) {
          result.push(text);
        } else {
          result.push(...this.splitTextIntoChunks(text));
        }
      }
      return result;
    }
    
    return [];
  }
  
  // 将长文本分割成小片段
  splitTextIntoChunks(text, maxLength = 3000) {
    if (text.length <= maxLength) return [text];
    
    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    let currentChunk = '';
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        // 如果单个句子超过最大长度，需要进一步分割
        if (sentence.length > maxLength) {
          const subChunks = this.splitTextByWords(sentence, maxLength);
          chunks.push(...subChunks);
        } else {
          currentChunk = sentence;
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
  
  // 按词分割超长句子
  splitTextByWords(text, maxLength) {
    const chunks = [];
    const words = text.split(/\s+/);
    
    let currentChunk = '';
    for (const word of words) {
      if (currentChunk.length + word.length + 1 <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + word;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = word;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
  
  // 获取单词发音
  async getWordPronunciation(word, options = {}) {
    // 针对单词的特殊处理
    const params = {
      Text: `<speak><prosody rate="slow">${word}</prosody></speak>`,
      TextType: 'ssml',
      OutputFormat: options.format || 'mp3',
      VoiceId: options.voice || 'Joanna',
      LanguageCode: options.language || 'en-US',
      Engine: options.engine || 'neural'
    };
    
    try {
      // 检查缓存
      const cacheKey = `word:${word}:${params.VoiceId}:${params.Engine}`;
      const cachedUrl = await redisClient.get(cacheKey);
      
      if (cachedUrl) {
        return { url: cachedUrl, fromCache: true };
      }
      
      const result = await this.polly.synthesizeSpeech(params).promise();
      
      // 上传到S3
      const s3Key = `words/${word.toLowerCase()}_${params.VoiceId}.${params.OutputFormat}`;
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: result.AudioStream,
        ContentType: `audio/${params.OutputFormat}`
      };
      
      await this.s3.upload(uploadParams).promise();
      
      // 生成访问URL
      const audioUrl = `https://${this.bucketName}.s3.amazonaws.com/${s3Key}`;
      
      // 缓存URL (7天过期，单词发音可以缓存更久)
      await redisClient.set(cacheKey, audioUrl, 'EX', 7 * 86400);
      
      return { url: audioUrl, fromCache: false };
    } catch (error) {
      console.error(`单词"${word}"发音生成失败:`, error);
      throw new Error(`单词发音生成失败: ${error.message}`);
    }
  }
}

// 3. 初始化服务
const speechService = new SpeechService(
  polly, 
  s3,
  process.env.AWS_S3_BUCKET_NAME
);

// 4. 导出服务
module.exports = speechService;