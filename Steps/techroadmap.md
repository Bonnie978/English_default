基于您提供的背词助手应用PRD、技术文档和UI界面设计文件，我将梳理第一阶段的技术方案实现，并详细说明步骤和细节。

# 背词助手应用 - 第一阶段技术方案

## 1. 技术栈选择及理由

### 前端技术栈
- **React + TypeScript + Styled Components** (修改自原方案的Tailwind CSS)
  - React的组件化开发模式适合此类具有多页面、重复UI元素的应用
  - TypeScript提供类型安全，减少运行时错误
  - Styled Components提供组件级CSS方案，便于维护各页面相似但细节不同的UI组件

### 后端技术栈
- **Node.js + Express + MongoDB + Redis**
  - Node.js/Express适合构建轻量级API服务，前后端可共享TypeScript类型
  - MongoDB文档型存储适合单词、用户学习记录等结构灵活的数据
  - Redis用于缓存AI生成内容，减少API调用次数和成本

### AI服务集成
- **DeepSeek API** (替代原方案中的OpenAI)
  - 提供练习题生成、写作评分等AI能力
  - 成本相对较低，适合初创项目

## 2. 系统架构设计

### 整体架构
```
客户端 <--> API网关 <--> 应用服务 <--> 数据服务
                           ↓
                        AI服务
                           ↓
                        缓存服务
```

### 模块划分
1. **用户认证模块**：注册、登录、会话管理
2. **单词学习模块**：单词获取、进度跟踪、发音服务
3. **练习生成模块**：阅读、听力、写作练习题生成
4. **评分判题模块**：答案验证、写作评分、结果反馈
5. **数据分析模块**：学习统计、进度分析、错题管理

## 3. 第一阶段实现计划

### 阶段目标
实现核心用户流程：单词学习 -> 练习生成 -> 判题评分 -> 结果展示，确保基础流程闭环。

### 3.1 数据模型设计

#### User模型
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  lastLoginAt: Date;
  learningStats: {
    totalWordsLearned: number;
    correctRate: number;
    streakDays: number;
    totalExercises: number;
  };
  settings: {
    dailyWordCount: number;
    preferredExerciseTypes: string[];
    notifications: boolean;
  };
}
```

#### Word模型
```typescript
interface Word {
  id: string;
  spelling: string;
  pronunciation: string;
  partOfSpeech: string;
  definitions: string[];
  examples: string[];
  difficulty: number;
  tags: string[];
}
```

#### LearningRecord模型
```typescript
interface LearningRecord {
  id: string;
  userId: string;
  date: Date;
  wordsList: {
    wordId: string;
    mastered: boolean;
    reviewCount: number;
    lastReviewDate: Date;
  }[];
  exercises: {
    type: string; // "read", "listen", "write"
    content: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: string;
      userAnswer: string;
      isCorrect: boolean;
    }[];
    score: number;
    feedback: string;
    completedAt: Date;
  }[];
}
```

#### WrongAnswer模型
```typescript
interface WrongAnswer {
  id: string;
  userId: string;
  exerciseId: string;
  wordIds: string[];
  type: string; // "read", "listen", "write"
  question: string;
  correctAnswer: string;
  userAnswer: string;
  date: Date;
  reviewed: boolean;
  reviewedAt: Date;
}
```

### 3.2 前端页面实现

根据已有UI设计文件，我们需要实现以下页面：

1. **Home页面** - 应用入口，展示学习状态和入口
2. **Wordlist页面** - 展示今日学习单词列表
3. **Exam页面** - 展示练习题类型选择
4. **Read/Listen/Write页面** - 三种不同类型的练习页面
5. **Result页面** - 练习结果展示
6. **Wrong页面** - 错题集
7. **Profile页面** - 用户信息页面

#### 组件结构设计

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ...
│   ├── home/
│   │   ├── LearningStats.tsx
│   │   ├── ActionCard.tsx
│   │   └── ...
│   ├── wordlist/
│   │   ├── WordCard.tsx
│   │   ├── WordNav.tsx
│   │   └── ...
│   ├── exam/
│   │   ├── ExamTypeCard.tsx
│   │   ├── ExamProgress.tsx
│   │   └── ...
│   └── ...
├── pages/
│   ├── HomePage.tsx
│   ├── WordlistPage.tsx 
│   ├── ExamPage.tsx
│   ├── ReadPage.tsx
│   ├── ListenPage.tsx
│   ├── WritePage.tsx
│   ├── ResultPage.tsx
│   ├── WrongPage.tsx
│   └── ProfilePage.tsx
├── services/
│   ├── apiService.ts
│   ├── authService.ts
│   ├── wordService.ts
│   └── exerciseService.ts
├── context/
│   ├── AuthContext.tsx
│   └── LearningContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useWords.ts
│   └── useExercise.ts
└── utils/
    ├── api.ts
    ├── validation.ts
    └── formatters.ts
```

### 3.3 API接口设计

#### 用户认证API

```typescript
// 用户注册
POST /api/users/register
Request: { username: string, email: string, password: string }
Response: { success: boolean, userId: string, token: string }

// 用户登录
POST /api/users/login
Request: { email: string, password: string }
Response: { success: boolean, userId: string, token: string, username: string }
```

#### 单词学习API

```typescript
// 获取每日单词列表
GET /api/words/daily
Header: Authorization: Bearer {token}
Response: {
  date: string,
  words: [
    {
      id: string,
      spelling: string,
      pronunciation: string,
      definitions: string[],
      examples: string[],
      partOfSpeech: string
    }
  ],
  progress: { learned: number, total: number }
}

// 标记单词为已掌握
POST /api/words/{wordId}/mastered
Header: Authorization: Bearer {token}
Response: { success: boolean, masteredAt: Date }
```

#### 练习题API

```typescript
// 获取练习题
POST /api/exercises/generate
Header: Authorization: Bearer {token}
Request: { type: string, wordIds: string[] }
Response: {
  id: string,
  type: string,
  content: string,
  audioUrl?: string,
  questions: [
    {
      id: string,
      question: string,
      options: string[],
      type: string
    }
  ]
}

// 提交答案
POST /api/exercises/{exerciseId}/submit
Header: Authorization: Bearer {token}
Request: { answers: [{ questionId: string, answer: string }] }
Response: {
  score: number,
  feedback: string,
  detailedResults: [
    {
      questionId: string,
      isCorrect: boolean,
      correctAnswer: string,
      explanation: string
    }
  ],
  wrongAnswersAdded: number
}

// 获取错题列表
GET /api/wrong-answers?page=1&limit=20&type=read
Header: Authorization: Bearer {token}
Response: {
  total: number,
  page: number,
  limit: number,
  wrongAnswers: [
    {
      id: string,
      type: string,
      question: string,
      correctAnswer: string,
      userAnswer: string,
      date: Date,
      relatedWords: [{ id: string, spelling: string, definition: string }]
    }
  ]
}
```

### 3.4 核心功能实现步骤

#### 1. 基础架构搭建

**前端配置**
1. 使用Create React App创建TypeScript项目
   ```bash
   npx create-react-app vocabulary-app --template typescript
   ```

2. 安装必要依赖
   ```bash
   npm install styled-components axios react-router-dom redux react-redux @reduxjs/toolkit howler
   npm install @types/styled-components @types/react-router-dom --save-dev
   ```

3. 配置基础路由
   ```typescript
   // src/App.tsx
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import HomePage from './pages/HomePage';
   import WordlistPage from './pages/WordlistPage';
   import ExamPage from './pages/ExamPage';
   import ReadPage from './pages/ReadPage';
   import ListenPage from './pages/ListenPage';
   import WritePage from './pages/WritePage';
   import ResultPage from './pages/ResultPage';
   import WrongPage from './pages/WrongPage';
   import ProfilePage from './pages/ProfilePage';
   
   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/" element={<HomePage />} />
           <Route path="/wordlist" element={<WordlistPage />} />
           <Route path="/exam" element={<ExamPage />} />
           <Route path="/exam/read" element={<ReadPage />} />
           <Route path="/exam/listen" element={<ListenPage />} />
           <Route path="/exam/write" element={<WritePage />} />
           <Route path="/result/:exerciseId" element={<ResultPage />} />
           <Route path="/wrong" element={<WrongPage />} />
           <Route path="/profile" element={<ProfilePage />} />
         </Routes>
       </BrowserRouter>
     );
   }
   ```

**后端配置**
1. 初始化Node.js项目
   ```bash
   mkdir vocabulary-api && cd vocabulary-api
   npm init -y
   npm install express mongoose redis jsonwebtoken bcrypt cors dotenv
   npm install typescript @types/express @types/node ts-node --save-dev
   ```

2. 创建MongoDB连接
   ```typescript
   // src/db/connection.ts
   import mongoose from 'mongoose';
   
   export async function connectDB() {
     try {
       await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vocabulary-app');
       console.log('MongoDB connected');
     } catch (error) {
       console.error('MongoDB connection error:', error);
       process.exit(1);
     }
   }
   ```

3. 配置Redis连接
   ```typescript
   // src/db/redis.ts
   import { createClient } from 'redis';
   
   const redisClient = createClient({
     url: process.env.REDIS_URL || 'redis://localhost:6379'
   });
   
   redisClient.on('error', (err) => console.log('Redis Client Error', err));
   
   export async function connectRedis() {
     try {
       await redisClient.connect();
       console.log('Redis connected');
     } catch (error) {
       console.error('Redis connection error:', error);
     }
   }
   
   export { redisClient };
   ```

#### 2. 用户认证功能实现

**前端实现**
1. 创建认证上下文
   ```typescript
   // src/context/AuthContext.tsx
   import React, { createContext, useState, useEffect } from 'react';
   import { login, register, checkAuthStatus } from '../services/authService';
   
   export const AuthContext = createContext<any>(null);
   
   export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
     const [user, setUser] = useState<any>(null);
     const [loading, setLoading] = useState(true);
     
     useEffect(() => {
       // 检查本地存储的token
       const checkAuth = async () => {
         const token = localStorage.getItem('token');
         if (token) {
           try {
             const userData = await checkAuthStatus(token);
             setUser(userData);
           } catch (error) {
             localStorage.removeItem('token');
           }
         }
         setLoading(false);
       };
       
       checkAuth();
     }, []);
     
     const loginUser = async (email: string, password: string) => {
       const data = await login(email, password);
       localStorage.setItem('token', data.token);
       setUser(data.user);
       return data;
     };
     
     const registerUser = async (username: string, email: string, password: string) => {
       const data = await register(username, email, password);
       localStorage.setItem('token', data.token);
       setUser(data.user);
       return data;
     };
     
     const logout = () => {
       localStorage.removeItem('token');
       setUser(null);
     };
     
     return (
       <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logout }}>
         {children}
       </AuthContext.Provider>
     );
   };
   ```

2. 创建登录和注册组件
   ```typescript
   // src/components/auth/LoginForm.tsx
   import React, { useState } from 'react';
   import { useAuth } from '../../hooks/useAuth';
   import styled from 'styled-components';
   
   const LoginForm: React.FC = () => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const { loginUser } = useAuth();
     
     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       setError('');
       
       try {
         await loginUser(email, password);
       } catch (err: any) {
         setError(err.message || '登录失败，请重试');
       }
     };
     
     return (
       <Form onSubmit={handleSubmit}>
         <h2>登录</h2>
         {error && <ErrorMessage>{error}</ErrorMessage>}
         <InputGroup>
           <label htmlFor="email">邮箱</label>
           <Input 
             id="email"
             type="email" 
             value={email} 
             onChange={(e) => setEmail(e.target.value)}
             required 
           />
         </InputGroup>
         <InputGroup>
           <label htmlFor="password">密码</label>
           <Input 
             id="password"
             type="password" 
             value={password} 
             onChange={(e) => setPassword(e.target.value)}
             required 
           />
         </InputGroup>
         <Button type="submit">登录</Button>
       </Form>
     );
   };
   
   // 样式组件定义...
   
   export default LoginForm;
   ```

**后端实现**
1. 创建用户模型
   ```typescript
   // src/models/User.ts
   import mongoose from 'mongoose';
   import bcrypt from 'bcrypt';
   
   const userSchema = new mongoose.Schema({
     username: { type: String, required: true, unique: true },
     email: { type: String, required: true, unique: true },
     passwordHash: { type: String, required: true },
     createdAt: { type: Date, default: Date.now },
     lastLoginAt: { type: Date },
     learningStats: {
       totalWordsLearned: { type: Number, default: 0 },
       correctRate: { type: Number, default: 0 },
       streakDays: { type: Number, default: 0 },
       totalExercises: { type: Number, default: 0 }
     },
     settings: {
       dailyWordCount: { type: Number, default: 10 },
       preferredExerciseTypes: [{ type: String }],
       notifications: { type: Boolean, default: true }
     }
   });
   
   // 密码验证方法
   userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
     return bcrypt.compare(password, this.passwordHash);
   };
   
   // 保存前加密密码
   userSchema.pre('save', async function(next) {
     if (this.isModified('passwordHash')) {
       this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
     }
     next();
   });
   
   export const User = mongoose.model('User', userSchema);
   ```

2. 创建认证路由
   ```typescript
   // src/routes/auth.ts
   import express from 'express';
   import jwt from 'jsonwebtoken';
   import { User } from '../models/User';
   
   const router = express.Router();
   
   // 注册
   router.post('/register', async (req, res) => {
     try {
       const { username, email, password } = req.body;
       
       // 检查用户是否已存在
       const existingUser = await User.findOne({ email });
       if (existingUser) {
         return res.status(400).json({ message: '该邮箱已被注册' });
       }
       
       // 创建新用户
       const newUser = new User({
         username,
         email,
         passwordHash: password
       });
       
       await newUser.save();
       
       // 生成token
       const token = jwt.sign(
         { userId: newUser._id },
         process.env.JWT_SECRET || 'secret',
         { expiresIn: '7d' }
       );
       
       res.status(201).json({
         success: true,
         userId: newUser._id,
         token
       });
     } catch (error) {
       console.error('注册失败:', error);
       res.status(500).json({ message: '服务器错误，请稍后重试' });
     }
   });
   
   // 登录
   router.post('/login', async (req, res) => {
     try {
       const { email, password } = req.body;
       
       // 查找用户
       const user = await User.findOne({ email });
       if (!user) {
         return res.status(401).json({ message: '邮箱或密码不正确' });
       }
       
       // 验证密码
       const isPasswordValid = await user.comparePassword(password);
       if (!isPasswordValid) {
         return res.status(401).json({ message: '邮箱或密码不正确' });
       }
       
       // 更新最后登录时间
       user.lastLoginAt = new Date();
       await user.save();
       
       // 生成token
       const token = jwt.sign(
         { userId: user._id },
         process.env.JWT_SECRET || 'secret',
         { expiresIn: '7d' }
       );
       
       res.json({
         success: true,
         userId: user._id,
         token,
         username: user.username
       });
     } catch (error) {
       console.error('登录失败:', error);
       res.status(500).json({ message: '服务器错误，请稍后重试' });
     }
   });
   
   export default router;
   ```

3. 创建验证中间件
   ```typescript
   // src/middleware/authenticate.ts
   import { Request, Response, NextFunction } from 'express';
   import jwt from 'jsonwebtoken';
   import { User } from '../models/User';
   
   interface AuthRequest extends Request {
     user?: any;
   }
   
   export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
     try {
       // 获取token
       const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res.status(401).json({ message: '未授权访问' });
       }
       
       const token = authHeader.split(' ')[1];
       
       // 验证token
       const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
       
       // 查找用户
       const user = await User.findById(decoded.userId);
       if (!user) {
         return res.status(401).json({ message: '未授权访问' });
       }
       
       // 将用户信息添加到请求对象
       req.user = user;
       next();
     } catch (error) {
       return res.status(401).json({ message: '未授权访问' });
     }
   };
   ```

#### 3. 单词学习功能实现

**前端实现**
1. 创建单词服务
   ```typescript
   // src/services/wordService.ts
   import api from '../utils/api';
   
   export const getDailyWords = async () => {
     const response = await api.get('/words/daily');
     return response.data;
   };
   
   export const markWordAsMastered = async (wordId: string) => {
     const response = await api.post(`/words/${wordId}/mastered`);
     return response.data;
   };
   ```

2. 实现单词列表页面
   ```typescript
   // src/pages/WordlistPage.tsx
   import React, { useState, useEffect } from 'react';
   import { useNavigate } from 'react-router-dom';
   import styled from 'styled-components';
   import Navbar from '../components/common/Navbar';
   import Footer from '../components/common/Footer';
   import WordCard from '../components/wordlist/WordCard';
   import { getDailyWords } from '../services/wordService';
   
   const WordlistPage: React.FC = () => {
     const [currentWordIndex, setCurrentWordIndex] = useState(0);
     const [words, setWords] = useState<any[]>([]);
     const [masteredWords, setMasteredWords] = useState<boolean[]>([]);
     const [loading, setLoading] = useState(true);
     const navigate = useNavigate();
     
     useEffect(() => {
       const fetchWords = async () => {
         try {
           const data = await getDailyWords();
           setWords(data.words);
           setMasteredWords(new Array(data.words.length).fill(false));
           setLoading(false);
         } catch (error) {
           console.error('获取单词失败:', error);
         }
       };
       
       fetchWords();
     }, []);
     
     const handlePrevWord = () => {
       if (currentWordIndex > 0) {
         setCurrentWordIndex(currentWordIndex - 1);
       }
     };
     
     const handleNextWord = () => {
       if (currentWordIndex < words.length - 1) {
         setCurrentWordIndex(currentWordIndex + 1);
       }
     };
     
     const toggleWordMastered = async () => {
       const newMasteredWords = [...masteredWords];
       newMasteredWords[currentWordIndex] = !newMasteredWords[currentWordIndex];
       setMasteredWords(newMasteredWords);
       
       try {
         await markWordAsMastered(words[currentWordIndex].id);
       } catch (error) {
         console.error('标记单词失败:', error);
         // 恢复原状态
         newMasteredWords[currentWordIndex] = !newMasteredWords[currentWordIndex];
         setMasteredWords(newMasteredWords);
       }
     };
     
     const handleComplete = () => {
       navigate('/exam');
     };
     
     if (loading) {
       return <div>加载中...</div>;
     }
     
     return (
       <Container>
         <Navbar title="今日单词" showBack />
         
         <MainContent>
           <ProgressBar>
             <ProgressText>学习进度</ProgressText>
             <ProgressCount>{currentWordIndex + 1}/{words.length}</ProgressCount>
             <ProgressTrack>
               <ProgressFill style={{ width: `${(currentWordIndex + 1) / words.length * 100}%` }} />
             </ProgressTrack>
           </ProgressBar>
           
           {words.length > 0 && (
             <WordCard
               word={words[currentWordIndex]}
               isMastered={masteredWords[currentWordIndex]}
               onToggleMastered={toggleWordMastered}
             />
           )}
           
           <NavButtons>
             <NavButton 
               onClick={handlePrevWord} 
               disabled={currentWordIndex === 0}
             >
               上一个
             </NavButton>
             <NavButton 
               onClick={handleNextWord} 
               disabled={currentWordIndex === words.length - 1}
             >
               下一个
             </NavButton>
           </NavButtons>
           
           <CompleteButton onClick={handleComplete}>
             完成背诵
           </CompleteButton>
         </MainContent>
         
         <Footer activeTab="wordlist" />
       </Container>
     );
   };
   
   // 样式组件定义...
   
   export default WordlistPage;
   ```

**后端实现**
1. 创建Word模型
   ```typescript
   // src/models/Word.ts
   import mongoose from 'mongoose';
   
   const wordSchema = new mongoose.Schema({
     spelling: { type: String, required: true },
     pronunciation: { type: String, required: true },
     partOfSpeech: { type: String, required: true },
     definitions: [{ type: String, required: true }],
     examples: [{ type: String }],
     difficulty: { type: Number, default: 1 },
     tags: [{ type: String }]
   });
   
   export const Word = mongoose.model('Word', wordSchema);
   ```

2. 创建LearningRecord模型
   ```typescript
   // src/models/LearningRecord.ts
   import mongoose from 'mongoose';
   
   const learningRecordSchema = new mongoose.Schema({
     userId: { 
       type: mongoose.Schema.Types.ObjectId, 
       ref: 'User', 
       required: true 
     },
     date: { type: Date, default: Date.now },
     wordsList: [{
       wordId: { 
         type: mongoose.Schema.Types.ObjectId, 
         ref: 'Word', 
         required: true 
       },
       mastered: { type: Boolean, default: false },
       reviewCount: { type: Number, default: 0 },
       lastReviewDate: { type: Date }
     }],
     exercises: [{
       type: { type: String, enum: ['read', 'listen', 'write'] },
       content: { type: String },
       questions: [{
         question: { type: String, required: true },
         options: [{ type: String }],
         correctAnswer: { type: String, required: true },
         userAnswer: { type: String },
         isCorrect: { type: Boolean }
       }],
       score: { type: Number },
       feedback: { type: String },
       completedAt: { type: Date }
     }]
   });
   
   export const LearningRecord = mongoose.model('LearningRecord', learningRecordSchema);
   ```

3. 创建单词相关路由
   ```typescript
   // src/routes/word.ts
   import express from 'express';
   import { authenticate } from '../middleware/authenticate';
   import { Word } from '../models/Word';
   import { LearningRecord } from '../models/LearningRecord';
   import { User } from '../models/User';
   
   const router = express.Router();
   
   // 获取每日单词
   router.get('/daily', authenticate, async (req: any, res) => {
     try {
       // 检查今日是否已有学习记录
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       
       let learningRecord = await LearningRecord.findOne({
         userId: req.user._id,
         date: {
           $gte: today,
           $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
         }
       });
       
       // 如果没有今日记录，创建新记录
       if (!learningRecord) {
         // 获取用户已学过的单词ID
         const user = await User.findById(req.user._id);
         const pastRecords = await LearningRecord.find({ userId: req.user._id });
         const learnedWordIds = new Set();
         
         pastRecords.forEach(record => {
           record.wordsList.forEach(wordItem => {
             learnedWordIds.add(wordItem.wordId.toString());
           });
         });
         
         // 获取新单词
         const dailyWordCount = user.settings.dailyWordCount || 10;
         const newWords = await Word.find({
           _id: { $nin: Array.from(learnedWordIds) }
         }).limit(dailyWordCount);
         
         // 创建学习记录
         learningRecord = new LearningRecord({
           userId: req.user._id,
           date: new Date(),
           wordsList: newWords.map(word => ({
             wordId: word._id,
             mastered: false,
             reviewCount: 0
           }))
         });
         
         await learningRecord.save();
         
         // 更新用户统计
         user.learningStats.totalWordsLearned += newWords.length;
         await user.save();
         
         return res.json({
           date: learningRecord.date,
           words: newWords,
           progress: {
             learned: 0,
             total: newWords.length
           }
         });
       }
       
       // 返回今日的单词
       const wordIds = learningRecord.wordsList.map(item => item.wordId);
       const words = await Word.find({ _id: {