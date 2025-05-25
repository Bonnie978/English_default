# 背词助手应用 PRD

## 1. 功能概述

背词助手是一个网页应用，旨在帮助学生高效记忆单词并通过AI生成的练习题巩固学习。应用提供单词背诵、多类型题目练习、AI自动判题和错题收集等功能，形成完整的学习闭环。

## 2. 用户诉求与逻辑拓展

### 核心诉求
- 用户需要一个平台记忆单词
- 用户需要通过练习题巩固所学单词
- 用户需要获得即时反馈和评估
- 用户需要追踪学习进度和错题

### 逻辑拓展
- **单词来源管理**：系统提供默认单词库，后续可支持用户自定义单词列表导入
- **学习计划定制**：支持调整每日单词数量（当前固定为10个）
- **学习数据分析**：记录用户学习时间、正确率等数据，生成学习报告
- **社交学习功能**：可添加好友、比较学习进度、共享自定义单词列表
- **智能复习提醒**：基于艾宾浩斯遗忘曲线，智能安排复习计划

## 3. 流程与交互逻辑

### 整体用户流程
1. 用户进入Home页面 → 点击"开始学习"
2. 进入Wordlist页面 → 学习当日10个单词 → 点击"完成背诵"
3. 进入Exam页面 → 选择题目类型(阅读/听力/写作)
4. 完成各题型页面的作答 → AI自动判题
5. 查看Result页面的结果反馈 → 错题自动记录到Wrong页面

### 详细页面流程

#### Home页面
- 展示欢迎信息和应用简介
- 显示"开始学习"按钮
- 若用户有未完成的学习任务，显示"继续学习"按钮
- 展示学习统计数据（如已学单词数、正确率等）

#### Wordlist页面
- 展示今日需要背诵的10个单词（包含拼写、音标、释义、例句）
- 提供单词发音功能
- 提供"标记为已掌握"选项
- 提供"完成背诵"按钮，点击后进入Exam页面
- 提供"返回首页"选项

#### Exam页面
- 显示今日学习进度
- 列出三种题型（阅读理解、听力理解、写作练习）
- 每个题型旁显示对应按钮，点击后进入相应页面
- 显示已完成题目的状态（未开始/已完成/未通过）
- 提供"返回单词列表"选项

#### Read页面（阅读题）
- 显示AI基于学习单词生成的阅读短文
- 展示3-5个相关问题（单选/多选/填空）
- 提供"提交答案"按钮
- 提供"返回题目列表"选项

#### Listen页面（听力题）
- 提供AI生成的听力材料（音频播放控件）
- 显示3-5个相关问题
- 提供音频控制选项（播放/暂停/重播）
- 提供"提交答案"按钮
- 提供"返回题目列表"选项

#### Write页面（写作题）
- 显示AI生成的写作提示（基于学习的单词）
- 提供文本编辑区域
- 显示字数统计
- 要求使用已学单词（可提供单词提示）
- 提供"提交答案"按钮
- 提供"返回题目列表"选项

#### Result页面
- 显示整体得分和评价
- 展示每道题的得分明细
- 提供AI对写作题的详细点评
- 突出显示错误部分和改进建议
- 提供"查看错题"和"返回首页"按钮

#### Wrong页面
- 列出所有错题记录（按日期和题型分类）
- 提供重做功能
- 显示原题、用户答案和正确答案对比
- 提供"返回首页"选项

## 4. 技术选型与实现建议

### 前端技术栈
- **推荐方案**：React + TypeScript + Tailwind CSS
  - 优势：组件化开发高效，TypeScript提供类型安全，Tailwind提供快速样式开发
  - 考虑：易于维护和扩展，社区支持丰富

- **备选方案**：Vue.js + Vuetify
  - 优势：学习曲线平缓，内置状态管理，组件库丰富
  - 考虑：若团队更熟悉Vue生态系统

### 后端技术栈
- **推荐方案**：Node.js + Express + MongoDB
  - 优势：JavaScript全栈开发，文档型数据库适合存储变长内容如题目和答案
  - 考虑：开发效率高，适合快速迭代

- **备选方案**：Python + FastAPI + PostgreSQL
  - 优势：Python更适合AI/NLP任务，关系型数据库提供强大查询能力
  - 考虑：若系统需要复杂的数据分析和AI处理

### AI接口选型
- **推荐方案**：OpenAI API (GPT-4)
  - 优势：强大的内容生成和理解能力，API稳定，文档完善
  - 考虑：成本较高，需要合理设计提示词和缓存策略

- **备选方案**：本地部署的开源模型(如LLaMA)
  - 优势：成本低，无需联网，隐私保护更好
  - 考虑：性能和生成质量可能不如商业API，需要更多计算资源

### 存储方案
- **用户数据**：MongoDB（用户信息、学习记录、错题集）
- **单词库**：PostgreSQL或MySQL（结构化数据，易于查询和索引）
- **生成内容缓存**：Redis（减少重复AI请求，提高响应速度）

### 部署架构
- **推荐方案**：Docker容器 + Kubernetes编排
  - 优势：环境一致性，易于扩展，适合微服务架构
  - 考虑：若预期用户量大，需要考虑横向扩展

- **备选方案**：传统VPS部署
  - 优势：配置简单，成本低
  - 考虑：若是小规模应用或初创阶段

## 5. 数据结构与接口设计

### 核心数据结构

#### User模型
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "passwordHash": "string",
  "createdAt": "date",
  "lastLoginAt": "date",
  "learningStats": {
    "totalWordsLearned": "number",
    "correctRate": "number",
    "streakDays": "number",
    "totalExercises": "number"
  },
  "settings": {
    "dailyWordCount": "number",
    "preferredExerciseTypes": ["string"],
    "notifications": "boolean"
  }
}
```

#### Word模型
```json
{
  "id": "string",
  "spelling": "string",
  "pronunciation": "string",
  "partOfSpeech": "string",
  "definitions": ["string"],
  "examples": ["string"],
  "difficulty": "number",
  "tags": ["string"]
}
```

#### LearningRecord模型
```json
{
  "id": "string",
  "userId": "string",
  "date": "date",
  "wordsList": [{
    "wordId": "string",
    "mastered": "boolean",
    "reviewCount": "number",
    "lastReviewDate": "date"
  }],
  "exercises": [{
    "type": "string", // "read", "listen", "write"
    "content": "string",
    "questions": [{
      "question": "string",
      "options": ["string"], // 针对选择题
      "correctAnswer": "string",
      "userAnswer": "string",
      "isCorrect": "boolean"
    }],
    "score": "number",
    "feedback": "string",
    "completedAt": "date"
  }]
}
```

#### WrongAnswer模型
```json
{
  "id": "string",
  "userId": "string",
  "exerciseId": "string",
  "wordIds": ["string"],
  "type": "string", // "read", "listen", "write"
  "question": "string",
  "correctAnswer": "string",
  "userAnswer": "string",
  "date": "date",
  "reviewed": "boolean",
  "reviewedAt": "date"
}
```

### API接口设计

#### 用户相关接口

##### 用户注册
- 路径: `/api/users/register`
- 方法: `POST`
- 请求体:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- 响应:
```json
{
  "success": true,
  "userId": "string",
  "token": "string"
}
```

##### 用户登录
- 路径: `/api/users/login`
- 方法: `POST`
- 请求体:
```json
{
  "email": "string",
  "password": "string"
}
```
- 响应:
```json
{
  "success": true,
  "userId": "string",
  "token": "string",
  "username": "string"
}
```

#### 学习相关接口

##### 获取每日单词列表
- 路径: `/api/words/daily`
- 方法: `GET`
- 请求头: `Authorization: Bearer {token}`
- 响应:
```json
{
  "date": "string",
  "words": [{
    "id": "string",
    "spelling": "string",
    "pronunciation": "string",
    "definitions": ["string"],
    "examples": ["string"],
    "partOfSpeech": "string"
  }],
  "progress": {
    "learned": "number",
    "total": "number"
  }
}
```

##### 标记单词为已掌握
- 路径: `/api/words/{wordId}/mastered`
- 方法: `POST`
- 请求头: `Authorization: Bearer {token}`
- 响应:
```json
{
  "success": true,
  "masteredAt": "date"
}
```

##### 获取练习题
- 路径: `/api/exercises/generate`
- 方法: `POST`
- 请求头: `Authorization: Bearer {token}`
- 请求体:
```json
{
  "type": "string", // "read", "listen", or "write"
  "wordIds": ["string"] // 今日学习的单词ID
}
```
- 响应:
```json
{
  "id": "string",
  "type": "string",
  "content": "string", // 阅读文本或听力文本或写作提示
  "audioUrl": "string", // 仅听力题提供
  "questions": [{
    "id": "string",
    "question": "string",
    "options": ["string"], // 选择题选项
    "type": "string" // "multiple-choice", "fill-blank", etc.
  }]
}
```

##### 提交答案
- 路径: `/api/exercises/{exerciseId}/submit`
- 方法: `POST`
- 请求头: `Authorization: Bearer {token}`
- 请求体:
```json
{
  "answers": [{
    "questionId": "string",
    "answer": "string"
  }]
}
```
- 响应:
```json
{
  "score": "number",
  "feedback": "string",
  "detailedResults": [{
    "questionId": "string",
    "isCorrect": "boolean",
    "correctAnswer": "string",
    "explanation": "string"
  }],
  "wrongAnswersAdded": "number"
}
```

##### 获取错题列表
- 路径: `/api/wrong-answers`
- 方法: `GET`
- 请求头: `Authorization: Bearer {token}`
- 查询参数: `?page=1&limit=20&type=read`
- 响应:
```json
{
  "total": "number",
  "page": "number",
  "limit": "number",
  "wrongAnswers": [{
    "id": "string",
    "type": "string",
    "question": "string",
    "correctAnswer": "string",
    "userAnswer": "string",
    "date": "date",
    "relatedWords": [{
      "id": "string",
      "spelling": "string",
      "definition": "string"
    }]
  }]
}
```

## 6. 外部资源调用

### AI服务接口

#### OpenAI API调用

##### 生成阅读题
- 端点: `https://api.openai.com/v1/chat/completions`
- 方法: `POST`
- 认证: API密钥
- 请求体:
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "你是一个专业的英语教师，需要根据给定的单词创建一篇短文和相关问题。"
    },
    {
      "role": "user",
      "content": "请根据以下单词创建一篇200字左右的短文，并提供3-5个相关问题: {单词列表}"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

##### 生成听力题
- 端点: `https://api.openai.com/v1/chat/completions`
- 请求体类似阅读题，但提示词调整为听力内容生成

##### 生成写作题
- 端点: `https://api.openai.com/v1/chat/completions`
- 请求体类似阅读题，但提示词调整为写作提示生成

##### AI判题
- 端点: `https://api.openai.com/v1/chat/completions`
- 方法: `POST`
- 请求体:
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "你是一个专业的英语评分系统，请根据标准答案评价用户的回答。"
    },
    {
      "role": "user",
      "content": "问题: {问题}\n标准答案: {标准答案}\n用户答案: {用户答案}\n请评分并给出详细反馈。"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 500
}
```

#### 语音合成API (用于听力题)
- 推荐: Google Cloud Text-to-Speech 或 Amazon Polly
- 备选: 本地TTS库或开源方案如Mozilla TTS

### 数据库调用

#### MongoDB操作
- 连接字符串: `mongodb://<username>:<password>@<host>:<port>/<database>`
- 主要集合: `users`, `learningRecords`, `wrongAnswers`

#### Redis缓存
- 连接字符串: `redis://<username>:<password>@<host>:<port>`
- 主要用途: 
  - 缓存AI生成的题目 (Key: `exercise:{type}:{wordIds}`, TTL: 24小时)
  - 用户会话管理 (Key: `session:{userId}`, TTL: 7天)
  - 访问频率限制 (Key: `ratelimit:{userId}:{endpoint}`, TTL: 1分钟)

## 7. 边界与异常处理

### 用户认证异常
- **未登录访问**: 重定向至登录页面，保存用户意图，登录后恢复
- **登录凭证过期**: 返回401状态码，前端提示重新登录
- **无权限操作**: 返回403状态码，前端显示权限不足提示

### 网络异常
- **API请求超时**: 设置5秒超时，超时后重试1次，仍失败则提示用户网络问题
- **断网情况**: 实现离线模式，缓存部分学习内容，恢复网络后同步

### AI服务异常
- **生成失败**: 使用预先准备的备用题库
- **生成内容不合适**: 设置内容过滤规则，不合规内容触发重新生成
- **API额度限制**: 实现请求队列和退避策略，高峰期限制非关键AI请求

### 数据异常
- **单词数据不完整**: 显示可用信息，标记缺失部分，提供反馈入口
- **用户答案未保存**: 实现自动保存，恢复机制，防止提交失败导致答案丢失
- **学习进度异常**: 定期验证和修复进度数据，确保统计准确性

### 用户操作异常
- **重复提交**: 防抖处理，避免多次记录
- **跳过学习流程**: 强制流程完整性，必要环节不可跳过
- **长时间不活动**: 自动保存状态，提供恢复选项
- **频繁切换页面**: 保存中间状态，确保数据不丢失

## 8. 验收标准

### 功能验收标准
1. **用户认证**
   - 用户可成功注册新账号
   - 用户可成功登录和登出
   - 密码重置功能正常工作

2. **单词学习**
   - 每日准确展示10个新单词
   - 单词发音功能正常
   - "已掌握"标记功能正常工作
   - 学习进度正确记录

3. **练习题生成**
   - AI能根据学习单词生成相关的三种类型题目
   - 生成内容相关度>90%
   - 生成耗时<5秒
   - 内容难度适中，无明显错误

4. **答题功能**
   - 用户可在各题型页面正常作答
   - 所有交互元素响应正常
   - 听力播放控制功能正常
   - 写作题编辑器功能完整

5. **AI判题**
   - 选择题判题准确率100%
   - 听力题判题准确率>95%
   - 写作题评分合理，提供有效反馈
   - 判题耗时<3秒

6. **错题管理**
   - 错题自动添加到Wrong页面
   - 错题分类和筛选功能正常
   - 重做功能正常工作
   - 错题统计数据准确

### 性能验收标准
1. **响应时间**
   - 页面初始加载时间<2秒
   - 页面切换时间<0.5秒
   - API响应时间<1秒（不含AI生成时间）
   - AI相关操作响应时间<5秒

2. **并发处理**
   - 支持100用户同时使用无性能下降
   - 峰值流量下服务稳定性保持>99.9%

3. **设备兼容性**
   - 支持主流桌面浏览器(Chrome, Firefox, Safari, Edge)
   - 支持主流移动设备(iOS, Android)上的响应式布局
   - 在不同分辨率下布局合理

### 安全验收标准
1. **数据安全**
   - 用户密码采用安全哈希算法存储
   - 所有API请求使用HTTPS加密
   - 敏感操作需二次验证

2. **防攻击措施**
   - 实现API请求频率限制
   - 防止SQL注入和XSS攻击
   - CSRF保护措施有效

### 用户体验验收标准
1. **界面美观度**
   - 遵循现代UI设计规范
   - 色彩搭配和谐，元素布局合理
   - 动效流畅自然

2. **学习体验**
   - 学习路径清晰明确
   - 反馈及时有效
   - 提供适当的激励机制
   - 用户调研满意度>85%

3. **辅助功能**
   - 符合WCAG 2.1 AA级无障碍标准
   - 支持键盘导航
   - 适当的文本对比度和字体大小

通过这份PRD，开发团队应能够充分理解产品需求，并高效地实现背词助手应用的各项功能。如有任何疑问或需要进一步说明，请随时提出。