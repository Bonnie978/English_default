# Supabase 集成设置指南

## 概述

本项目已成功集成 Supabase 作为后端服务，提供认证、数据库和实时功能。

## 已完成的集成

### 1. 前端集成 (vocabulary-app)
- ✅ 安装了 `@supabase/supabase-js` 客户端库
- ✅ 创建了 Supabase 配置文件 (`src/config/supabase.ts`)
- ✅ 实现了认证服务 (`src/services/authService.ts`)
- ✅ 实现了数据服务 (`src/services/dataService.ts`)

### 2. 后端集成 (vocabulary-api)
- ✅ 安装了 `@supabase/supabase-js` 服务端库
- ✅ 创建了 Supabase 配置文件 (`src/config/supabase.ts`)
- ✅ 实现了 Supabase 服务 (`src/services/supabaseService.ts`)

### 3. 数据库设计
- ✅ 创建了完整的数据库迁移脚本 (`supabase/migrations/001_initial_schema.sql`)
- ✅ 定义了以下表结构：
  - `users` - 用户信息表
  - `words` - 单词表
  - `word_categories` - 单词分类表
  - `user_progress` - 用户学习进度表
  - `learning_sessions` - 学习会话记录表

## 环境变量配置

### 前端 (vocabulary-app)
创建 `.env` 文件并添加以下变量：

```env
# Supabase 配置
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# API 配置
REACT_APP_API_URL=http://localhost:3001

# 其他配置
REACT_APP_ENVIRONMENT=development
```

### 后端 (vocabulary-api)
创建 `.env` 文件并添加以下变量：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 服务器配置
PORT=3001
NODE_ENV=development

# JWT 配置
JWT_SECRET=your_jwt_secret_key

# MongoDB 配置（如果仍需要）
MONGODB_URI=mongodb://localhost:27017/vocabulary

# Redis 配置（如果需要缓存）
REDIS_URL=redis://localhost:6379

# 日志配置
LOG_LEVEL=info
```

## Supabase 项目设置步骤

### 1. 创建 Supabase 项目
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 选择组织并填写项目信息
4. 等待项目创建完成

### 2. 获取项目凭据
1. 在项目仪表板中，点击左侧菜单的 "Settings"
2. 选择 "API" 标签
3. 复制以下信息：
   - Project URL (用于 `SUPABASE_URL`)
   - anon public key (用于 `REACT_APP_SUPABASE_ANON_KEY`)
   - service_role secret key (用于 `SUPABASE_SERVICE_ROLE_KEY`)

### 3. 运行数据库迁移
1. 在 Supabase Dashboard 中，点击左侧菜单的 "SQL Editor"
2. 创建新查询
3. 复制 `supabase/migrations/001_initial_schema.sql` 中的内容
4. 执行 SQL 脚本

### 4. 配置认证设置
1. 在 Supabase Dashboard 中，点击左侧菜单的 "Authentication"
2. 在 "Settings" 标签中配置：
   - Site URL: `http://localhost:3000` (开发环境)
   - Redirect URLs: 添加您的应用域名
3. 启用所需的认证提供商（Email、Google、GitHub 等）

## 功能特性

### 认证功能
- ✅ 用户注册/登录
- ✅ 密码重置
- ✅ 会话管理
- ✅ 自动刷新令牌

### 数据管理
- ✅ 单词 CRUD 操作
- ✅ 用户学习进度跟踪
- ✅ 学习会话记录
- ✅ 单词分类管理
- ✅ 搜索和筛选功能

### 安全特性
- ✅ 行级安全策略 (RLS)
- ✅ 用户数据隔离
- ✅ API 密钥管理
- ✅ 自动用户记录创建

## 使用示例

### 前端认证
```typescript
import { authService } from './services/authService'

// 用户登录
const { user, error } = await authService.signIn({
  email: 'user@example.com',
  password: 'password'
})

// 获取当前用户
const currentUser = await authService.getCurrentUser()
```

### 前端数据操作
```typescript
import { dataService } from './services/dataService'

// 获取单词列表
const { data: words, error } = await dataService.getWords(20, 0)

// 更新学习进度
await dataService.updateUserProgress(userId, {
  word_id: 'word-uuid',
  mastery_level: 80,
  is_correct: true
})
```

### 后端服务
```typescript
import { supabaseService } from './services/supabaseService'

// 创建单词
const { data: word, error } = await supabaseService.createWord({
  english: 'hello',
  chinese: '你好',
  difficulty_level: 1
})

// 获取用户统计
const { data: stats } = await supabaseService.getDashboardStats()
```

## 下一步

1. **配置环境变量**：根据上述说明配置前端和后端的环境变量
2. **运行数据库迁移**：在 Supabase Dashboard 中执行 SQL 迁移脚本
3. **测试连接**：启动应用并测试 Supabase 连接
4. **数据迁移**：如果有现有数据，需要从 MongoDB 迁移到 Supabase
5. **部署配置**：为生产环境配置相应的环境变量

## 故障排除

### 常见问题
1. **连接错误**：检查环境变量是否正确配置
2. **权限错误**：确认 RLS 策略是否正确设置
3. **认证失败**：检查 Supabase 认证设置

### 调试工具
- Supabase Dashboard 的实时日志
- 浏览器开发者工具的网络标签
- 后端服务的日志输出

需要我协助配置任何特定部分吗？